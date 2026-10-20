package com.huumod.message.controller.identity;

import com.huumod.message.dto.ApiResponse;
import com.huumod.message.dto.request.auth.AuthenticationRequest;
import com.huumod.message.dto.request.auth.IntrospectRequest;
import com.huumod.message.dto.request.auth.LogoutRequest;
import com.huumod.message.dto.response.auth.AuthenticationResponse;
import com.huumod.message.dto.response.auth.IntrospectResponse;
import com.huumod.message.service.identityservice.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {

    AuthenticationService authenticationService;
    
    @PostMapping("/login")
    ApiResponse<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        var results = authenticationService.authenticate(request);

        return ApiResponse.<AuthenticationResponse>builder()
                .results(results)
                .build();
    }

    @PostMapping("/introspect")
    ApiResponse<IntrospectResponse> authenticate(@RequestBody IntrospectRequest request)
            throws ParseException, JOSEException {
        var results = authenticationService.introspect(request);

        return ApiResponse.<IntrospectResponse>builder()
                .results(results)
                .build();
    }

    @PostMapping("/logout")
    ApiResponse<Void> logout(@RequestBody LogoutRequest request)
            throws ParseException, JOSEException {
        authenticationService.logout(request);

        return ApiResponse.<Void>builder()
                .message("Successfully logged out")
                .build();
    }
}
