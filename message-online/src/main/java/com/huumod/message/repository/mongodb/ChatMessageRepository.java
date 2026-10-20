package com.huumod.message.repository.mongodb;

import com.huumod.message.entity.chat.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findAllByConversationIdOrderByCreatedAtDesc(String conversationId);
}
