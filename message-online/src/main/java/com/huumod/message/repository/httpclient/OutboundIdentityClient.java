package com.huumod.message.repository.httpclient;

import com.huumod.message.dto.request.auth.ExchangeTokenRequest;
import com.huumod.message.dto.response.auth.ExchangeTokenResponse;
import feign.QueryMap;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(name = "outbound-identity", url = "https://oauth2.googleapis.com")
public interface OutboundIdentityClient {
    @PostMapping(value = "/token", produces = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    ExchangeTokenResponse token(@QueryMap ExchangeTokenRequest request);
}
