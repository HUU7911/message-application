package com.huumod.message.mapper;

import com.huumod.message.dto.FileInfor;
import com.huumod.message.entity.file.File;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FileMapper {

    @Mapping(target = "id", source = "name")
    File toFile(FileInfor infor);
}
