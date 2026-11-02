package com.huumod.message.repository.httpclient;

import com.huumod.message.dto.response.auth.OutboundUserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "outbound-user-client", url = "https://oauth2.googleapis.com")
public interface OutboundUserClient {
    @PostMapping(value = "/oauth2/v2/infor")
    OutboundUserResponse getUserInfor(@RequestParam("alt") String alt,
                               @RequestParam("access_token") String accessToken
    );
}
