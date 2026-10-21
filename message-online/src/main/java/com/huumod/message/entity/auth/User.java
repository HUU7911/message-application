package com.huumod.message.entity.auth;

import com.huumod.message.convert.EncryptConverter;
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

    @Convert(converter = EncryptConverter.class)
    String username;

    String password;

    @Convert(converter = EncryptConverter.class)
    String email;

    @Convert(converter = EncryptConverter.class)
    String avatar;

    @Column(name = "create_at")
    Instant createdAt;

    @ManyToMany(fetch = FetchType.EAGER)
    Set<Role> roles;
}
