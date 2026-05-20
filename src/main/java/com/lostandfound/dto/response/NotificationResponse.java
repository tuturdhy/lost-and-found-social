package com.lostandfound.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String title;
    private String body;
    private String type;
    private Long itemId;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
