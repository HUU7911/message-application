package com.huumod.message.mapper;

import com.huumod.message.dto.request.chat.ConversationRequest;
import com.huumod.message.dto.response.chat.ConversationResponse;
import com.huumod.message.entity.chat.Conversation;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ConversationMapper {
    Conversation toConversation(ConversationRequest request);
    ConversationResponse toConversationResponse(Conversation conversation);
}
