package com.lostandfound.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AuthResponse {
    private String token;
    @Builder.Default private String type = "Bearer";
    private Long userId;
    private String name;
    private String email;
}
