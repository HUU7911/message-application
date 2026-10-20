package com.huumod.message.service.chatservice;

import com.corundumstudio.socketio.SocketIOServer;
import tools.jackson.core.type.TypeReference;
import com.huumod.message.dto.request.chatrequest.ChatMessageRequest;
import com.huumod.message.dto.response.chatresponse.ChatMessageResponse;
import com.huumod.message.entity.chat.ChatMessage;
import com.huumod.message.entity.chat.ParticipantInfo;
import com.huumod.message.exception.AppException;
import com.huumod.message.exception.ErrorCode;
import com.huumod.message.mapper.ChatMapper;
import com.huumod.message.repository.mongodb.ChatMessageRepository;
import com.huumod.message.repository.mongodb.ConversationRepository;
import com.huumod.message.repository.mysql.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatService {
    SocketIOServer socketIOServer;
    ChatMessageRepository chatMessageRepository;
    ConversationRepository conversationRepository;
    ObjectMapper objectMapper;
    ChatMapper chatMapper;
    UserRepository userRepository;

    public List<ChatMessageResponse> getMessages(String conversationId) {
        // Validate conversationId
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        conversationRepository
                .findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND))
                .getParticipants()
                .stream()
                .filter(participantInfo -> userId.equals(participantInfo.getId()))
                .findAny()
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        var messages = chatMessageRepository
                .findAllByConversationIdOrderByCreatedAtDesc(conversationId);

        return messages.stream()
                .map(this::toChatMessageResponse)
                .toList();
    }

    public ChatMessageResponse create(ChatMessageRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        // Validate conversationId
        conversationRepository
                .findById(request.getConversationId())
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND))
                .getParticipants()
                .stream()
                .filter(participantInfo -> userId.equals(participantInfo.getId()))
                .findAny()
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        // Get UserInfo from ProfileService
        var userInfo = userRepository.findById(userId);

        // Build Chat message Info
        ChatMessage chatMessage = chatMapper.toChatMessage(request);
        chatMessage.setSender(ParticipantInfo.builder()
                .id(userInfo.get().getId())
                .username(userInfo.get().getUsername())
                .avatar(userInfo.get().getAvatar())
                .build());
        chatMessage.setCreatedAt(Instant.now());

        // Create chat message
        chatMessage = chatMessageRepository.save(chatMessage);

        // Publish socket event to clients
        ChatMessageResponse response = toChatMessageResponse(chatMessage);

        // Dùng ObjectMapper của Spring để Instant thành chuỗi ISO (VD "2026-10-19T14:30:00Z")
        Map<String, Object> payload = objectMapper.convertValue(response, new TypeReference<>() {});

        socketIOServer.getRoomOperations(request.getConversationId())
                .sendEvent("message", payload);

        return response;
    }

    private ChatMessageResponse toChatMessageResponse(ChatMessage chatMessage) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        var chatMessageResponse = chatMapper.toChatMessageResponse(chatMessage);

        chatMessageResponse.setMe(userId.equals(chatMessage.getSender().getId()));

        return chatMessageResponse;
    }
}