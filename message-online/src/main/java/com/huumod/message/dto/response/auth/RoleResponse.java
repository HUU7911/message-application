package com.huumod.message.dto.response.auth;

import com.huumod.message.entity.auth.Permission;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleResponse {

    String name;

    String description;

    Set<Permission> permissions;
}
