package com.lostandfound.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ItemResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userAvatar;
    private String type;
    private String title;
    private String description;
    private String photoUrl;
    private String category;
    private List<String> keywords;
    private String color;
    private Double latitude;
    private Double longitude;
    private String address;
    private String status;
    private LocalDateTime createdAt;
}
