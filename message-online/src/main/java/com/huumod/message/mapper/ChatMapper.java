package com.huumod.message.mapper;

import com.huumod.message.dto.request.chat.ChatMessageRequest;
import com.huumod.message.dto.response.chat.ChatMessageResponse;
import com.huumod.message.entity.chat.ChatMessage;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ChatMapper {
    ChatMessage toChatMessage(ChatMessageRequest request);
    ChatMessageResponse toChatMessageResponse(ChatMessage message);
    List<ChatMessageResponse> toChatMessageResponseList(List<ChatMessage> messages);
}
