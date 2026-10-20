package com.huumod.message.service.fileservice;

import com.huumod.message.dto.response.file.FileData;
import com.huumod.message.dto.response.file.FileResponse;
import com.huumod.message.exception.AppException;
import com.huumod.message.exception.ErrorCode;
import com.huumod.message.mapper.FileMapper;
import com.huumod.message.repository.filerepository.FileMgmtRepository;
import com.huumod.message.repository.filerepository.FileRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileService {

    FileRepository fileRepository;
    FileMgmtRepository fileMgmtRepository;
    FileMapper fileMapper;

    public FileResponse uploadFile(MultipartFile file) throws IOException {

        var fileInfor = fileRepository.store(file);

        var fileStore = fileMapper.toFile(fileInfor);
        String ownerId = SecurityContextHolder.getContext().getAuthentication().getName();

        fileStore.setOwnerId(ownerId);
        fileStore = fileMgmtRepository.save(fileStore);

        return FileResponse.builder()
                .originalFilename(file.getOriginalFilename())
                .url(fileInfor.getUrl())
                .build();
    }

    public FileData download(String filename) throws IOException {
        var file = fileMgmtRepository.findById(filename).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_FOUND));

        var resource = fileRepository.read(file);

        return new FileData(file.getContentType(), resource);
    }
}
