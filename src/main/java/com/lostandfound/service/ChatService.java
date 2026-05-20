package com.lostandfound.service;

import com.lostandfound.dto.request.MessageRequest;
import com.lostandfound.dto.response.MessageResponse;
import com.lostandfound.entity.Message;
import com.lostandfound.entity.User;
import com.lostandfound.repository.MessageRepository;
import com.lostandfound.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Générer un chatId unique entre 2 utilisateurs
     */
    public String getChatId(Long userId1, Long userId2) {
        List<Long> ids = Arrays.asList(userId1, userId2);
        Collections.sort(ids);
        return ids.get(0) + "_" + ids.get(1);
    }

    /**
     * Envoyer un message
     */
    public MessageResponse sendMessage(Long senderId, MessageRequest request) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        String chatId = getChatId(senderId, request.getReceiverId());

        Message message = Message.builder()
                .senderId(senderId)
                .receiverId(request.getReceiverId())
                .itemId(request.getItemId())
                .chatId(chatId)
                .content(request.getContent())
                .build();

        message = messageRepository.save(message);
        MessageResponse response = toResponse(message, sender.getName());

        // Envoyer via WebSocket en temps réel
        messagingTemplate.convertAndSendToUser(
                request.getReceiverId().toString(),
                "/queue/messages",
                response
        );

        // Envoyer notification
        notificationService.sendMessageNotification(
                request.getReceiverId(),
                sender.getName(),
                request.getContent()
        );

        return response;
    }

    /**
     * Récupérer les messages d'un chat
     */
    public List<MessageResponse> getChatMessages(Long userId1, Long userId2) {
        String chatId = getChatId(userId1, userId2);
        return messageRepository.findByChatIdOrderByCreatedAtAsc(chatId)
                .stream()
                .map(m -> {
                    String senderName = userRepository.findById(m.getSenderId())
                            .map(User::getName).orElse("Utilisateur");
                    return toResponse(m, senderName);
                })
                .collect(Collectors.toList());
    }

    /**
     * Récupérer tous les chats d'un utilisateur
     */
    public List<Map<String, Object>> getUserChats(Long userId) {
        List<Message> allMessages = messageRepository
                .findBySenderIdOrReceiverIdOrderByCreatedAtDesc(userId, userId);

        // Regrouper par chatId et garder le dernier message
        Map<String, Message> lastMessages = new LinkedHashMap<>();
        for (Message msg : allMessages) {
            if (!lastMessages.containsKey(msg.getChatId())) {
                lastMessages.put(msg.getChatId(), msg);
            }
        }

        return lastMessages.values().stream().map(msg -> {
            Long otherUserId = msg.getSenderId().equals(userId)
                    ? msg.getReceiverId()
                    : msg.getSenderId();

            User otherUser = userRepository.findById(otherUserId).orElse(null);
            Map<String, Object> chat = new HashMap<>();
            chat.put("chatId", msg.getChatId());
            chat.put("otherUserId", otherUserId);
            chat.put("otherUserName", otherUser != null ? otherUser.getName() : "Utilisateur");
            chat.put("otherUserAvatar", otherUser != null ? otherUser.getAvatarUrl() : null);
            chat.put("lastMessage", msg.getContent());
            chat.put("lastMessageAt", msg.getCreatedAt());
            chat.put("itemId", msg.getItemId());
            Long unreadCount = allMessages.stream()
        .filter(m ->
                m.getChatId().equals(msg.getChatId()) &&
                m.getReceiverId().equals(userId) &&
                !m.getIsRead()
        )
        .count();

chat.put("unreadCount", unreadCount);
            return chat;
        }).collect(Collectors.toList());
    }

    /**
     * Marquer les messages comme lus
     */
    public void markMessagesAsRead(String chatId, Long userId) {
        List<Message> unread = messageRepository
                .findByChatIdOrderByCreatedAtAsc(chatId)
                .stream()
                .filter(m -> m.getReceiverId().equals(userId) && !m.getIsRead())
                .collect(Collectors.toList());
        unread.forEach(m -> m.setIsRead(true));
        messageRepository.saveAll(unread);
    }

    private MessageResponse toResponse(Message msg, String senderName) {
        return MessageResponse.builder()
                .id(msg.getId())
                .senderId(msg.getSenderId())
                .senderName(senderName)
                .receiverId(msg.getReceiverId())
                .itemId(msg.getItemId())
                .chatId(msg.getChatId())
                .content(msg.getContent())
                .isRead(msg.getIsRead())
                .createdAt(msg.getCreatedAt())
                .build();
    }
}
