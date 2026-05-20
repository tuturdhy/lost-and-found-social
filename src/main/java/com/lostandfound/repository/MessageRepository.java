package com.lostandfound.repository;

import com.lostandfound.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByChatIdOrderByCreatedAtAsc(String chatId);
    List<Message> findByReceiverIdAndIsReadFalse(Long receiverId);

    // Tous les chats d'un utilisateur (derniers messages)
    List<Message> findBySenderIdOrReceiverIdOrderByCreatedAtDesc(
        Long senderId, Long receiverId
    );
}
