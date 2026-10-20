package com.huumod.message.dto.response.userresponse;

import com.huumod.message.entity.auth.Role;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToMany;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {

    String id;

    String username;
    String password;
    String email;

    String avatar;

    Instant createdAt;

    @ManyToMany(fetch = FetchType.EAGER)
    Set<Role> roles;
}
