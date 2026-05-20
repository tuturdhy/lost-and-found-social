package com.lostandfound.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MessageResponse {
    private Long id;
    private Long senderId;
    private String senderName;
    private Long receiverId;
    private Long itemId;
    private String chatId;
    private String content;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
