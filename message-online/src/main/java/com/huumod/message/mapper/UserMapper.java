package com.huumod.message.mapper;

import com.huumod.message.dto.request.userrequest.UserCreationRequest;
import com.huumod.message.dto.request.userrequest.UserUpdateRequest;
import com.huumod.message.dto.response.userresponse.UserResponse;
import com.huumod.message.entity.auth.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(UserCreationRequest request);

    UserResponse toUserResponse(User user);

    void updateUser(@MappingTarget User user, UserUpdateRequest request);
}
