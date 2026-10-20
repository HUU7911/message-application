package com.huumod.message.controller.chatcontroller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.huumod.message.dto.ApiResponse;
import com.huumod.message.dto.request.chatrequest.ChatMessageRequest;
import com.huumod.message.dto.response.chatresponse.ChatMessageResponse;
import com.huumod.message.service.chatservice.ChatService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chatting")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatController {
    ChatService chatService;

    @PostMapping("/create")
    ApiResponse<ChatMessageResponse> createChatMessage(@RequestBody ChatMessageRequest chatMessageRequest) throws JsonProcessingException {
        return ApiResponse.<ChatMessageResponse>builder()
                .results(chatService.create(chatMessageRequest))
                .build();
    }

    @GetMapping
    ApiResponse<List<ChatMessageResponse>> getChatMessage(
            @RequestParam("conversationId") String conversationId){
        return ApiResponse.<List<ChatMessageResponse>>builder()
                .results(chatService.getMessages(conversationId))
                .build();
    }
}
