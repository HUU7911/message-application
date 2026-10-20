package com.huumod.message.entity.auth;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.Set;

@Entity
@Getter
@Setter
@Builder
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    String username;
    String password;
    String email;

    String avatar;

    @Column(name = "create_at")
    Instant createdAt;

    @ManyToMany(fetch = FetchType.EAGER)
    Set<Role> roles;
}
