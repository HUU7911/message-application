package com.huumod.message.controller.notify;

import com.huumod.message.dto.ApiResponse;
import com.huumod.message.dto.request.notify.SendEmailRequest;
import com.huumod.message.dto.response.notify.EmailResponse;
import com.huumod.message.service.notifyservice.EmailService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/send")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmailController {

    EmailService emailService;

    @PostMapping("/email")
    ApiResponse<EmailResponse> sendEmail(@RequestBody SendEmailRequest request) {
        return ApiResponse.<EmailResponse>builder()
                .results(emailService.sendEmail(request))
                .build();
    }
}
