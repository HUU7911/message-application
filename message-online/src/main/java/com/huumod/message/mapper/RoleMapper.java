package com.huumod.message.mapper;

import com.huumod.message.dto.request.auth.RoleRequest;
import com.huumod.message.dto.response.auth.RoleResponse;
import com.huumod.message.entity.auth.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleRequest request);
    RoleResponse toRoleResponse(Role role);
}
