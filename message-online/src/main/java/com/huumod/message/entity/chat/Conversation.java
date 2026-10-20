package com.huumod.message.entity.chat;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "conversation")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Conversation {
    @MongoId
    String id;

    String type;

    @Indexed(unique = true)
    String participantHash;

    List<ParticipantInfo> participants;

    Instant createdAt;
    Instant modifiedAt;
}
