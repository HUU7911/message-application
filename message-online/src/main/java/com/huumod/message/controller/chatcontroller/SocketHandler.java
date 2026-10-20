package com.huumod.message.controller.chatcontroller;

import com.huumod.message.dto.request.auth.IntrospectRequest;
import com.huumod.message.repository.mongodb.ConversationRepository;
import com.huumod.message.service.identityservice.AuthenticationService;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Component;
import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.nimbusds.jwt.SignedJWT;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SocketHandler {
    SocketIOServer server;
    AuthenticationService authenticationService;
    ConversationRepository conversationRepository;

    @OnConnect
    public void clientConnected(SocketIOClient client) {
        String token = client.getHandshakeData().getSingleUrlParam("token");

        if (token == null || token.isBlank()) {
            log.warn("Socket connection rejected: missing token");
            client.disconnect();
            return;
        }

        try {
            var response = authenticationService.introspect(IntrospectRequest.builder()
                            .token(token)
                    .build());

            if (response == null || !response.isValid()) {
                log.warn("Socket connection rejected: invalid token");
                client.disconnect();
                return;
            }

            // userId chính là claim "sub" của JWT
            String userId = SignedJWT.parse(token).getJWTClaimsSet().getSubject();
            client.set("userId", userId);

            // Cho client vào room của tất cả conversation mà user tham gia
            conversationRepository
                    .findByParticipantIdsContains(userId)
                    .forEach(conversation -> client.joinRoom(conversation.getId()));

            log.info("Client connected: {} (user {})", client.getSessionId(), userId);
        } catch (Exception e) {
            log.error("Socket authentication failed", e);
            client.disconnect();
        }
    }

    @OnDisconnect
    public void clientDisconnected(SocketIOClient client) {
        log.info("Client disConnected: {}", client.getSessionId());
    }

    @PostConstruct
    public void startServer() {
        server.addListeners(this);
        server.start();
        log.info("Socket.IO server started on port 8099");
    }

    @PreDestroy
    public void stopServer() {
        server.stop();
        log.info("Socket server stoped");
    }
}
