package com.huumod.message.entity.auth;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "permission")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Permission {

    @Id
    String name;

    String description;
}
