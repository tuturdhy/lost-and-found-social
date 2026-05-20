package com.lostandfound.controller;

import com.lostandfound.dto.request.ItemRequest;
import com.lostandfound.dto.response.ApiResponse;
import com.lostandfound.dto.response.ItemResponse;
import com.lostandfound.security.JwtUtil;
import com.lostandfound.service.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;
    private final JwtUtil jwtUtil;

    // POST /api/items — Publier un objet (avec photo)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, Object>>> publishItem(
            @RequestHeader("Authorization") String authHeader,
            @RequestPart("item") @Valid ItemRequest request,
            @RequestPart(value = "photo", required = false) MultipartFile photo
    ) throws Exception {
        Long userId = extractUserId(authHeader);
        Map<String, Object> result = itemService.publishItem(userId, request, photo);
        return ResponseEntity.ok(ApiResponse.success("Objet publié avec succès", result));
    }

    // GET /api/items — Tous les objets actifs
    @GetMapping
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getAllItems(
            @RequestParam(required = false) String type
    ) {
        List<ItemResponse> items = type != null
                ? itemService.getItemsByType(type)
                : itemService.getAllActiveItems();
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    // GET /api/items/{id} — Un objet par ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemResponse>> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(itemService.getItemById(id)));
    }

    // GET /api/items/search?q=sac+noir — Recherche intelligente
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ItemResponse>>> searchItems(
            @RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(itemService.searchItems(q)));
    }

    // GET /api/items/nearby?lat=18.07&lng=-15.95&radius=5 — Objets proches
    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getNearbyItems(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "5.0") Double radius
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(itemService.getNearbyItems(lat, lng, radius))
        );
    }

    // GET /api/items/user/me — Mes objets
    @GetMapping("/user/me")
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getMyItems(
            @RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(ApiResponse.success(itemService.getUserItems(userId)));
    }

    // PATCH /api/items/{id}/resolve — Marquer comme résolu
    @PatchMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<ItemResponse>> markAsResolved(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader
    ) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(
                ApiResponse.success("Objet marqué comme retrouvé !",
                        itemService.markAsResolved(id, userId))
        );
    }

    private Long extractUserId(String authHeader) {
        String token = authHeader.substring(7);
        return jwtUtil.extractUserId(token);
    }
}
