package com.huumod.message.dto.response.chatresponse;

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
public class ChatMessageResponse {

    String id;
    String conversationId;
    boolean me;
    String message;
    ParticipantInfo sender;
    Instant createdAt;
}
