package com.huumod.message.entity.chat;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "chat-message")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessage {

    @MongoId
    String id;

    @Indexed
    String conversationId;

    String message;

    ParticipantInfo sender;

    @Indexed
    Instant createdAt;
}
