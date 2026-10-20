package com.huumod.message.dto.response.chatresponse;

import com.huumod.message.entity.chat.ParticipantInfo;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConversationResponse {
    String id;
    String type;
    String conversationAvatar;
    String conversationName;
    List<ParticipantInfo> participants;
    Instant createdAt;
    Instant modifiedAt;
}
