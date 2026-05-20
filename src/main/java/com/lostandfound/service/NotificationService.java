package com.lostandfound.service;

import com.lostandfound.dto.response.NotificationResponse;
import com.lostandfound.entity.Notification;
import com.lostandfound.entity.User;
import com.lostandfound.repository.NotificationRepository;
import com.lostandfound.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public void sendNotification(Long userId, String title, String body,
                                  String type, Long itemId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Notification notif = Notification.builder()
                .user(user)
                .title(title)
                .body(body)
                .type(type)
                .itemId(itemId)
                .build();

        notificationRepository.save(notif);
    }

    public void sendMatchNotification(Long userId, String itemTitle,
                                       int score, Long matchedItemId) {
        sendNotification(
                userId,
                "🔥 Correspondance trouvée !",
                "Ton objet \"" + itemTitle + "\" a une correspondance à "
                        + score + "% — Vérifie vite !",
                "MATCH",
                matchedItemId
        );
    }

    public void sendMessageNotification(Long userId, String senderName,
                                         String message) {
        sendNotification(
                userId,
                "💬 Nouveau message de " + senderName,
                message,
                "MESSAGE",
                null
        );
    }

    public void sendResolvedNotification(Long userId, String itemTitle) {
        sendNotification(
                userId,
                "🎉 Objet retrouvé !",
                "\"" + itemTitle + "\" a été marqué comme retrouvé. Bravo !",
                "RESOLVED",
                null
        );
    }

    public List<NotificationResponse> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public void markAsRead(Long notifId) {
        Notification notif = notificationRepository.findById(notifId)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée"));
        notif.setIsRead(true);
        notificationRepository.save(notif);
    }

    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository
                .findByUserIdAndIsReadFalse(userId);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .body(n.getBody())
                .type(n.getType())
                .itemId(n.getItemId())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
