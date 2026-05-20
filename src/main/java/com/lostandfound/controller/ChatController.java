package com.lostandfound.controller;

import com.lostandfound.dto.request.MessageRequest;
import com.lostandfound.dto.response.ApiResponse;
import com.lostandfound.dto.response.MessageResponse;
import com.lostandfound.security.JwtUtil;
import com.lostandfound.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final JwtUtil jwtUtil;

    // POST /api/chat/send — Envoyer un message (REST)
    @PostMapping("/send")
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody MessageRequest request
    ) {
        Long senderId = extractUserId(authHeader);
        MessageResponse response = chatService.sendMessage(senderId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // GET /api/chat/{otherUserId} — Messages d'une conversation
    @GetMapping("/{otherUserId}")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getChatMessages(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long otherUserId
    ) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(
                ApiResponse.success(chatService.getChatMessages(userId, otherUserId))
        );
    }

    // GET /api/chat — Toutes mes conversations
    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMyChats(
            @RequestHeader("Authorization") String authHeader
    ) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(ApiResponse.success(chatService.getUserChats(userId)));
    }

    // PATCH /api/chat/{chatId}/read — Marquer comme lu
    @PatchMapping("/{chatId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String chatId
    ) {
        Long userId = extractUserId(authHeader);
        chatService.markMessagesAsRead(chatId, userId);
        return ResponseEntity.ok(ApiResponse.success("Messages lus", null));
    }

    // WebSocket endpoint — Envoyer message en temps réel
    @MessageMapping("/chat.send")
    public void sendMessageWs(@Payload MessageRequest request) {
        // Géré via SimpMessagingTemplate dans ChatService
    }

    private Long extractUserId(String authHeader) {
        String token = authHeader.substring(7);
        return jwtUtil.extractUserId(token);
    }
}
