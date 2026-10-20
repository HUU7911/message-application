package com.huumod.message.controller.chatcontroller;

import com.huumod.message.dto.ApiResponse;
import com.huumod.message.dto.request.chatrequest.ConversationRequest;
import com.huumod.message.dto.response.chatresponse.ConversationResponse;
import com.huumod.message.service.chatservice.ConversationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConversationController {
    ConversationService conversationService;

    @PostMapping("/create")
    ApiResponse<ConversationResponse> create(@RequestBody ConversationRequest request) {
        return ApiResponse.<ConversationResponse>builder()
                .results(conversationService.create(request))
                .build();
    }

    @GetMapping
    ApiResponse<List<ConversationResponse>> myConversations() {
        return ApiResponse.<List<ConversationResponse>>builder()
                .results(conversationService.myConversation())
                .build();
    }
}
