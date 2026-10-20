package com.huumod.message.mapper;

import com.huumod.message.dto.request.chatrequest.ChatMessageRequest;
import com.huumod.message.dto.response.chatresponse.ChatMessageResponse;
import com.huumod.message.entity.chat.ChatMessage;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ChatMapper {
    ChatMessage toChatMessage(ChatMessageRequest request);
    ChatMessageResponse toChatMessageResponse(ChatMessage message);
    List<ChatMessageResponse> toChatMessageResponseList(List<ChatMessage> messages);
}
