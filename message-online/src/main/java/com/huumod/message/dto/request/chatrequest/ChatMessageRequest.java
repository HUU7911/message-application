package com.huumod.message.dto.request.chatrequest;

import com.huumod.message.entity.chat.ParticipantInfo;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessageRequest {

    String id;

    String conversationId;

    String message;

    ParticipantInfo sender;

    Instant createdAt;
}
