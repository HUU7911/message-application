package com.huumod.message.dto.request.userrequest;

import com.huumod.message.entity.auth.Role;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserCreationRequest {

    String id;

    String username;
    String password;
    String email;

    Instant createdAt;

    @ManyToMany(fetch = FetchType.EAGER)
    Set<Role> roles;
}
