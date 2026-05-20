package com.lostandfound.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lostandfound.dto.request.ItemRequest;
import com.lostandfound.dto.response.ItemResponse;
import com.lostandfound.dto.response.MatchResponse;
import com.lostandfound.entity.Item;
import com.lostandfound.entity.User;
import com.lostandfound.repository.ItemRepository;
import com.lostandfound.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ItemService {

    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final MatchingService matchingService;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @Value("${app.upload.dir}")
    private String uploadDir;

    // ===================== PUBLIER UN OBJET =====================

    public Map<String, Object> publishItem(
            Long userId,
            ItemRequest request,
            MultipartFile photo
    ) throws IOException {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Upload photo
        String photoUrl = null;
        if (photo != null && !photo.isEmpty()) {
            photoUrl = savePhoto(photo, userId);
        }

        // Convertir keywords en JSON string
        String keywordsJson = "[]";
        if (request.getKeywords() != null && !request.getKeywords().isEmpty()) {
            keywordsJson = objectMapper.writeValueAsString(request.getKeywords());
        }

        // Créer l'objet
        Item item = Item.builder()
                .user(user)
                .type(Item.ItemType.valueOf(request.getType().toUpperCase()))
                .title(request.getTitle())
                .description(request.getDescription())
                .photoUrl(photoUrl)
                .category(request.getCategory())
                .keywords(keywordsJson)
                .color(request.getColor())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .address(request.getAddress())
                .build();

        item = itemRepository.save(item);

        // Incrémenter compteur
        user.setItemsPublished(
            (user.getItemsPublished() == null ? 0 : user.getItemsPublished()) + 1
        );
        userRepository.save(user);

        // Lancer le matching
        List<MatchResponse> matches = matchingService.findMatches(item);

        // Envoyer notifications si matchs trouvés
        if (!matches.isEmpty()) {
            MatchResponse bestMatch = matches.get(0);
            notificationService.sendMatchNotification(
                userId,
                item.getTitle(),
                bestMatch.getSimilarityScore(),
                bestMatch.getMatchedItem().getId()
        );
        }

        Map<String, Object> result = new HashMap<>();
        result.put("item", toResponse(item));
        result.put("matches", matches);
        return result;
    }

    // ===================== RÉCUPÉRER LES OBJETS =====================

    public List<ItemResponse> getAllActiveItems() {
        return itemRepository.findByStatusOrderByCreatedAtDesc(Item.ItemStatus.ACTIVE)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ItemResponse> getItemsByType(String type) {
        return itemRepository.findByTypeAndStatusOrderByCreatedAtDesc(
                Item.ItemType.valueOf(type.toUpperCase()), Item.ItemStatus.ACTIVE)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ItemResponse> getUserItems(Long userId) {
        return itemRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ItemResponse getItemById(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Objet non trouvé"));
        return toResponse(item);
    }

    // ===================== RECHERCHE SMART =====================

    public List<ItemResponse> searchItems(String query) {
        return itemRepository.searchItems(query)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ===================== OBJETS PROCHES =====================

    public List<ItemResponse> getNearbyItems(Double lat, Double lng, Double radius) {
        return itemRepository.findItemsNearby(lat, lng, radius)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ===================== MARQUER COMME RÉSOLU =====================

    public ItemResponse markAsResolved(Long itemId, Long userId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Objet non trouvé"));

        if (!item.getUser().getId().equals(userId)) {
            throw new RuntimeException("Non autorisé");
        }

        item.setStatus(Item.ItemStatus.RESOLVED);
        item = itemRepository.save(item);

        // Mettre à jour la réputation
        User user = item.getUser();
        user.setItemsResolved(
            (user.getItemsResolved() == null ? 0 : user.getItemsResolved()) + 1
        );
        user.setReputationScore(
            (user.getReputationScore() == null ? 0.0 : user.getReputationScore()) + 1.0
        );
        userRepository.save(user);

        notificationService.sendResolvedNotification(userId, item.getTitle());

        return toResponse(item);
    }

    // ===================== UPLOAD PHOTO =====================

    private String savePhoto(MultipartFile photo, Long userId) throws IOException {
        String uploadPath = uploadDir + "items/" + userId + "/";
        Files.createDirectories(Paths.get(uploadPath));

        String filename = UUID.randomUUID() + "_" + photo.getOriginalFilename();
        Path filePath = Paths.get(uploadPath + filename);
        Files.write(filePath, photo.getBytes());

        return "/uploads/items/" + userId + "/" + filename;
    }

    // ===================== MAPPER =====================

    public ItemResponse toResponse(Item item) {
        List<String> keywordsList = new ArrayList<>();
        try {
            if (item.getKeywords() != null && !item.getKeywords().isEmpty()) {
                keywordsList = objectMapper.readValue(
                        item.getKeywords(),
                        new TypeReference<List<String>>() {}
                );
            }
        } catch (Exception e) {
            log.warn("Impossible de parser les keywords: {}", e.getMessage());
        }

        return ItemResponse.builder()
                .id(item.getId())
                .userId(item.getUser().getId())
                .userName(item.getUser().getName())
                .userAvatar(item.getUser().getAvatarUrl())
                .type(item.getType().name())
                .title(item.getTitle())
                .description(item.getDescription())
                .photoUrl(item.getPhotoUrl())
                .category(item.getCategory())
                .keywords(keywordsList)
                .color(item.getColor())
                .latitude(item.getLatitude())
                .longitude(item.getLongitude())
                .address(item.getAddress())
                .status(item.getStatus().name())
                .createdAt(item.getCreatedAt())
                .build();
    }
}