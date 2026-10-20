package com.huumod.message.repository.mongodb;

import com.huumod.message.entity.chat.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {
    Optional<Conversation> findByParticipantHash(String Id);
    @Query("{'participants.Id' : ?0}")
    List<Conversation> findByParticipantIdsContains(String Id);
}
