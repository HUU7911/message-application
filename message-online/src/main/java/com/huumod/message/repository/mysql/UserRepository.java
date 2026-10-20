package com.huumod.message.repository.mysql;

import com.huumod.message.entity.auth.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    boolean existsByUsername(String username);
    Optional<User> findByUsername(String username);
    List<User> findAllByUsernameContainingIgnoreCase(String username);
}
