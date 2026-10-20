package com.huumod.message.repository.filerepository;

import com.huumod.message.dto.FileInfor;
import com.huumod.message.entity.file.File;
import lombok.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Repository;
import org.springframework.util.DigestUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Repository
public class FileRepository {

    @NonNull
    @Value("${app.config.store-located}")
    private String storedLocation;

    @NonNull
    @Value("${app.config.url-prefix}")
    private String URL_PREFIX;

    public FileInfor store(MultipartFile file) throws IOException {
        Path folder = Paths.get(this.storedLocation);
        if (!Files.exists(folder)) {
            Files.createDirectories(folder);
        }
        String fileNameExtension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        String fileName = Objects.isNull(fileNameExtension)
                ? UUID.randomUUID().toString()
                : UUID.randomUUID() + "." + fileNameExtension;
        Path filePath = folder.resolve(fileName).normalize().toAbsolutePath();
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        return FileInfor.builder()
                .name(fileName)
                .size(file.getSize())
                .contentType(file.getContentType())
                .md5Checksum(DigestUtils.md5DigestAsHex(file.getInputStream()))
                .path(filePath.toString())
                .url(this.URL_PREFIX + fileName)
                .build();
    }

    public Resource read(File file) throws IOException {
        var data = Files.readAllBytes(Path.of(file.getPath()));

        return new ByteArrayResource(data);
    }

}
