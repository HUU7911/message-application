package com.huumod.message.configuration;

import com.huumod.message.constants.RoleDefine;
import com.huumod.message.entity.auth.Role;
import com.huumod.message.entity.auth.User;
import com.huumod.message.repository.mysql.RoleRepository;
import com.huumod.message.repository.mysql.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.HashSet;

@Slf4j
@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ApplicationInitConfig {

    PasswordEncoder passwordEncoder;

    @NonFinal
    static final String ADMIN_USER_NAME = "admin";

    @NonFinal
    static final String ADMIN_PASSWORD = "admin";

    @Bean
    ApplicationRunner applicationRunner (UserRepository userRepository,
                                         RoleRepository roleRepository) {
        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()) {
                roleRepository.save(Role.builder()
                        .name(RoleDefine.USER.name())
                        .description("User role")
                        .build());

                Role adminrole = roleRepository.save(Role.builder()
                                .name(RoleDefine.ADMIN.name())
                                .description("admin role")
                        .build()
                );

                var roles = new HashSet<Role>();
                roles.add(adminrole);
                User user = User.builder()
                        .username(ADMIN_USER_NAME)
                        .password(passwordEncoder.encode(ADMIN_PASSWORD))
                        .email("trihuutran4@gmail.com")
                        .roles(roles)
                        .createdAt(Instant.now())
                        .build();

                userRepository.save(user);
                log.warn("admin user has been created with defaults password: admin, please change it");
            }
            log.info("Application initialization completed...");
        };
    }
}