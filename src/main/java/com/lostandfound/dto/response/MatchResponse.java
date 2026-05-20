package com.lostandfound.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MatchResponse {
    private Long id;
    private ItemResponse matchedItem;
    private Integer similarityScore;
    private List<String> matchedKeywords;
    private String scoreLabel;
    private LocalDateTime createdAt;
}
