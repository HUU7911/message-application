package com.huumod.message.service.notifyservice;

import com.huumod.message.dto.request.notify.EmailRequest;
import com.huumod.message.dto.request.notify.SendEmailRequest;
import com.huumod.message.dto.request.notify.Sender;
import com.huumod.message.dto.response.notify.EmailResponse;
import com.huumod.message.exception.AppException;
import com.huumod.message.exception.ErrorCode;
import com.huumod.message.repository.kafka.EmailClient;
import feign.FeignException;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmailService {

    @Value("${brev.apiKey}")
    private String API_KEY;

    @Autowired
    private EmailClient emailClient;

    public EmailResponse sendEmail(@RequestBody SendEmailRequest request) {

        EmailRequest emailRequest = EmailRequest.builder()
                .htmlContent(request.getHtmlContent())
                .to(request.getTo())
                .subject(request.getSubject())
                .sender(Sender.builder()
                        .name("BLV HUU MOD")
                        .email("trihuutran4@gmail.com")
                        .build())
                .build();
        try {
            return emailClient.sendEmail(API_KEY, emailRequest);
        }catch (FeignException e) {
            e.printStackTrace();
            throw new AppException(ErrorCode.EMAIL_NOT_SEND);
        }
    }
}
