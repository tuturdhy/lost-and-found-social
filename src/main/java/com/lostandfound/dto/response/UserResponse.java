package com.lostandfound.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String avatarUrl;
    private Double reputationScore;
    private Integer itemsPublished;
    private Integer itemsResolved;
    private LocalDateTime createdAt;
}
