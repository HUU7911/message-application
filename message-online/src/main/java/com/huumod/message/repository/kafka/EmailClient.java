package com.huumod.message.repository.kafka;

import com.huumod.message.dto.request.notify.EmailRequest;
import com.huumod.message.dto.response.notify.EmailResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "emailClient", url = "${brev.url_send}")
public interface EmailClient {

    @PostMapping(value = "/v3/smtp/email", produces = MediaType.APPLICATION_JSON_VALUE)
    EmailResponse sendEmail(@RequestHeader("api-key") String apiKey, @RequestBody EmailRequest body);
}
