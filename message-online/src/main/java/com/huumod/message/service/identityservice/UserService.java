package com.huumod.message.service.identityservice;

import com.huumod.message.dto.request.userrequest.UserUpdateRequest;
import com.huumod.event.dto.NotificationEvent;
import com.huumod.message.constants.RoleDefine;
import com.huumod.message.dto.request.userrequest.SearchUserRequest;
import com.huumod.message.dto.request.userrequest.UserCreationRequest;
import com.huumod.message.dto.response.userresponse.UserResponse;
import com.huumod.message.entity.auth.Role;
import com.huumod.message.entity.auth.User;
import com.huumod.message.exception.AppException;
import com.huumod.message.exception.ErrorCode;
import com.huumod.message.mapper.UserMapper;
import com.huumod.message.repository.mysql.RoleRepository;
import com.huumod.message.repository.mysql.UserRepository;
import com.huumod.message.service.fileservice.FileService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {

    UserMapper userMapper;
    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    RoleRepository roleRepository;
    KafkaTemplate<String, NotificationEvent> kafkaTemplate;
    FileService fileService;

    @Transactional
    public UserResponse createUser(UserCreationRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXITED);
        }

        User user = userMapper.toUser(request);
        user.setCreatedAt(Instant.now());
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        Set<Role> roles = new HashSet<>();

        NotificationEvent notificationEvent = NotificationEvent.builder()
                .channel("EMAIL")
                .receiver(request.getEmail())
                .subject("Welcome to chat message online")
                .body("hello: " + request.getUsername())
                .build();

        try {
            kafkaTemplate.send("Created-user", notificationEvent);
        }catch (Exception e){
            log.info("Error sending notification event");
            throw new AppException(ErrorCode.USER_EXITED);
        }
        log.info(notificationEvent.toString());

        roleRepository.findById(RoleDefine.USER.name()).ifPresent(roles::add);
        user.setRoles(roles);

        return userMapper.toUserResponse(userRepository.save(user));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    public UserResponse getUserById(String id) {
        return userMapper.toUserResponse(userRepository.
                findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND)));
    }

    public UserResponse getMyInfor() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return userMapper.toUserResponse(user);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().
                stream().map(userMapper::toUserResponse).toList();
    }

    public void deleteUserById(String id) {
        userRepository.deleteById(id);
    }

    public List<UserResponse> searchUser(SearchUserRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        List<User> userProfiles = userRepository.findAllByUsernameContainingIgnoreCase(request.getKeyword());
        return userProfiles.stream()
                .filter(userProfile -> !userId.equals(userProfile.getId()))
                .map(userMapper::toUserResponse)
                .toList();
    }

    public UserResponse updateUser(UserUpdateRequest request) {
        String id = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        userMapper.updateUser(user, request);

        return userMapper.toUserResponse(user);
    }

    public UserResponse updateAvatar(MultipartFile file) throws IOException {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        var profile = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        var response = fileService.uploadFile(file);

        profile.setAvatar(response.getUrl());

        return userMapper.toUserResponse(userRepository.save(profile));
    }
}
