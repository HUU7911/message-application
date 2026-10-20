package com.huumod.message.controller.notify;

import com.huumod.event.dto.NotificationEvent;
import com.huumod.message.dto.request.notify.Receptor;
import com.huumod.message.dto.request.notify.SendEmailRequest;
import com.huumod.message.service.notifyservice.EmailService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationController {

    EmailService emailService;

    @KafkaListener(topics = "Created-user")
    public void listenCreatedUser(NotificationEvent event) {
        log.info("Received created user notification event: {}", event);
        emailService.sendEmail(
                SendEmailRequest.builder()
                        .to(List.of(Receptor.builder()
                                        .email(event.getReceiver())
                                .build()))
                        .subject(event.getSubject())
                        .htmlContent(event.getBody())
                        .build()
        );
    }
}
