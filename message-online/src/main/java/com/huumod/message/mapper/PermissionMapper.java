package com.huumod.message.mapper;

import com.huumod.message.dto.request.auth.PermissionRequest;
import com.huumod.message.dto.response.auth.PermissionResponse;
import com.huumod.message.entity.auth.Permission;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toPermission(PermissionRequest request);
    PermissionResponse toPermissionResponse(Permission permission);
}
