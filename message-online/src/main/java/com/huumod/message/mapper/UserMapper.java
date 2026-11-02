package com.huumod.message.mapper;

import com.huumod.message.dto.request.user.UserCreationRequest;
import com.huumod.message.dto.request.user.UserUpdateRequest;
import com.huumod.message.dto.response.user.UserResponse;
import com.huumod.message.entity.auth.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(UserCreationRequest request);

    UserResponse toUserResponse(User user);

    void updateUser(@MappingTarget User user, UserUpdateRequest request);
}
