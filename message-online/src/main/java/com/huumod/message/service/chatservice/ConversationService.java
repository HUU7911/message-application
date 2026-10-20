package com.huumod.message.service.chatservice;

import com.corundumstudio.socketio.SocketIOServer;
import com.huumod.message.dto.request.chatrequest.ConversationRequest;
import com.huumod.message.dto.response.chatresponse.ConversationResponse;
import com.huumod.message.entity.chat.Conversation;
import com.huumod.message.entity.chat.ParticipantInfo;
import com.huumod.message.mapper.ConversationMapper;
import com.huumod.message.repository.mongodb.ConversationRepository;
import com.huumod.message.repository.mysql.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConversationService {

    ConversationMapper conversationMapper;
    ConversationRepository conversationRepository;
    UserRepository userRepository;
    SocketIOServer socketIOServer;

    public List<ConversationResponse> myConversation() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Conversation> conversations = conversationRepository.findByParticipantIdsContains(userId);
        return conversations.stream().map(this::toConversationResponse).toList();
    }

    public ConversationResponse create(ConversationRequest request) {
        // Fetch user infos
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        var userInfo = userRepository.findById(userId);
        var participantInfo = userRepository.findById(request.getParticipantIds().getFirst());

        List<String> userIds = new ArrayList<>();
        userIds.add(userId);
        userIds.add(participantInfo.get().getId());

        var sortedIds = userIds.stream().sorted().toList();
        String userIdHash = generateParticipantHash(sortedIds);

        var conversation = conversationRepository
                .findByParticipantHash(userIdHash)
                .orElseGet(() -> {
                    List<ParticipantInfo> participantInfos = List.of(
                            ParticipantInfo.builder()
                                    .id(userInfo.get().getId())
                                    .username(userInfo.get().getUsername())
                                    .avatar(userInfo.get().getAvatar())
                                    .build(),

                            ParticipantInfo.builder()
                                    .id(participantInfo.get().getId())
                                    .username(participantInfo.get().getUsername())
                                    .avatar(participantInfo.get().getAvatar())
                                    .build());

                    // Build conversation info
                    Conversation newConversation = Conversation.builder()
                            .type(request.getType())
                            .participantHash(userIdHash)
                            .createdAt(Instant.now())
                            .modifiedAt(Instant.now())
                            .participants(participantInfos)
                            .build();

                    return conversationRepository.save(newConversation);
                });

        joinParticipantsToRoom(conversation);

        return toConversationResponse(conversation);
    }

    private String generateParticipantHash(List<String> ids) {
        StringJoiner stringJoiner = new StringJoiner("_");
        ids.forEach(stringJoiner::add);
        return stringJoiner.toString();
    }

    private ConversationResponse toConversationResponse(Conversation conversation) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        ConversationResponse conversationResponse = conversationMapper.toConversationResponse(conversation);

        conversation.getParticipants().stream()
                .filter(participantInfo -> !participantInfo.getId().equals(userId))
                .findFirst().ifPresent(participantInfo -> {
                    conversationResponse.setConversationName(participantInfo.getUsername());
                    conversationResponse.setConversationAvatar(participantInfo.getAvatar());
                });

        return conversationResponse;
    }

    private void joinParticipantsToRoom(Conversation conversation) {
        Set<String> participantIds = conversation.getParticipants().stream()
                .map(ParticipantInfo::getId)
                .collect(Collectors.toSet());

        socketIOServer.getAllClients().forEach(client -> {
            String uid = client.get("userId");
            if (uid != null && participantIds.contains(uid)) {
                client.joinRoom(conversation.getId());
            }
        });
    }
}