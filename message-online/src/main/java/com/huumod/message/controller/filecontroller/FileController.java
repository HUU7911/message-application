package com.huumod.message.controller.filecontroller;

import com.huumod.message.dto.ApiResponse;
import com.huumod.message.dto.response.file.FileData;
import com.huumod.message.dto.response.file.FileResponse;
import com.huumod.message.service.fileservice.FileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/media")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileController {

    FileService fileService;

    @PostMapping("/upload")
    ApiResponse<FileResponse> upload(@RequestPart("file") MultipartFile file) throws IOException {
        return ApiResponse.<FileResponse>builder()
                .message("File uploaded successfully!")
                .results(fileService.uploadFile(file))
                .build();
    }

    @GetMapping("/download/{filename}")
    ResponseEntity<Resource> download(@PathVariable("filename") String filename) throws IOException {
        FileData fileData = fileService.download(filename);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, fileData.contentType())
                .body(fileData.resource());
    }
}
