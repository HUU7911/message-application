package com.huumod.message.controller.identity;

import com.huumod.message.dto.ApiResponse;
import com.huumod.message.dto.request.userrequest.SearchUserRequest;
import com.huumod.message.dto.request.userrequest.UserCreationRequest;
import com.huumod.message.dto.request.userrequest.UserUpdateRequest;
import com.huumod.message.dto.response.userresponse.UserResponse;
import com.huumod.message.service.identityservice.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {

    UserService userService;

    @PostMapping("/create")
    ApiResponse<UserResponse> createUser(@RequestBody @Valid UserCreationRequest request) {
        return ApiResponse.<UserResponse>builder()
                .results(userService.createUser(request))
                .build();
    }

    @GetMapping
    ApiResponse<List<UserResponse>> getUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        log.info("Username: {}", authentication.getName());
        authentication.getAuthorities().forEach(grantedAuthority -> log.info(grantedAuthority.getAuthority()));

        return ApiResponse.<List<UserResponse>>builder()
                .results(userService.getAllUsers())
                .build();
    }

    @GetMapping("/{userId}")
    ApiResponse<UserResponse> getUser(@PathVariable("userId") String userId) {
        return ApiResponse.<UserResponse>builder()
                .results(userService.getUserById(userId))
                .build();
    }

    @DeleteMapping("/{userId}")
    ApiResponse<String> deleteUser(@PathVariable String userId) {
        userService.deleteUserById(userId);
        return ApiResponse.<String>builder()
                .results("delete has successful")
                .build();
    }

    @GetMapping("/myInfor")
    ApiResponse<UserResponse> getMyInfor() {
        return ApiResponse.<UserResponse>builder()
                .results(userService.getMyInfor())
                .build();
    }

    @PostMapping("/search")
    ApiResponse<List<UserResponse>> getSearchUser(@RequestBody SearchUserRequest request) {
        return ApiResponse.<List<UserResponse>>builder()
                .results(userService.searchUser(request))
                .build();
    }

    @PutMapping("/update")
    ApiResponse<UserResponse> updateUser(@RequestBody @Valid UserUpdateRequest request) {
        return ApiResponse.<UserResponse>builder()
                .results(userService.updateUser(request))
                .build();
    }

    @PutMapping("/avatar")
    ApiResponse<UserResponse> updateUserAvatar(@RequestParam("file") MultipartFile file)
            throws IOException {
        return ApiResponse.<UserResponse>builder()
                .results(userService.updateAvatar(file))
                .build();
    }
}
