package com.huumod.message.entity.chat;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ParticipantInfo {
    String id;
    String username;
    String avatar;
}
