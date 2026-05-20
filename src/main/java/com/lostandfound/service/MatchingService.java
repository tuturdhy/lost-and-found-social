package com.lostandfound.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lostandfound.dto.response.ItemResponse;
import com.lostandfound.dto.response.MatchResponse;
import com.lostandfound.entity.Item;
import com.lostandfound.entity.Match;
import com.lostandfound.repository.ItemRepository;
import com.lostandfound.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchingService {

    private final ItemRepository itemRepository;
    private final MatchRepository matchRepository;
    private final ObjectMapper objectMapper;

    /**
     * Trouve les correspondances pour un objet nouvellement publié
     */
    public List<MatchResponse> findMatches(Item newItem) {
        // Chercher les objets du type opposé
        Item.ItemType oppositeType = newItem.getType() == Item.ItemType.LOST
                ? Item.ItemType.FOUND
                : Item.ItemType.LOST;

        List<Item> candidates = itemRepository
                .findByTypeAndStatusOrderByCreatedAtDesc(
                        oppositeType, Item.ItemStatus.ACTIVE
                );

        List<Map<String, Object>> scored = new ArrayList<>();

        for (Item candidate : candidates) {
            List<String> matchedKw = getMatchedKeywords(newItem, candidate);

// Au moins 2 mots-clés communs
if (matchedKw.size() < 2) {
    continue;
}
            // Ne pas comparer avec ses propres objets
            if (candidate.getUser().getId().equals(newItem.getUser().getId())) continue;
// Catégorie obligatoire
if (newItem.getCategory() == null ||
    candidate.getCategory() == null ||
    !newItem.getCategory().equalsIgnoreCase(candidate.getCategory())) {
    continue;
}
            int score = computeScore(newItem, candidate);
           

            if (score >= 50) {
                Map<String, Object> entry = new HashMap<>();
                entry.put("item", candidate);
                entry.put("score", score);
                entry.put("keywords", matchedKw);
                scored.add(entry);
            }
        }

        // Trier par score décroissant
        scored.sort((a, b) -> (int) b.get("score") - (int) a.get("score"));

        // Prendre les 5 meilleurs et les sauvegarder
        List<MatchResponse> results = new ArrayList<>();
        for (Map<String, Object> entry : scored.stream().limit(5).toList()) {
            Item candidate = (Item) entry.get("item");
            int score = (int) entry.get("score");
            List<String> kw = (List<String>) entry.get("keywords");
            boolean alreadyExists = matchRepository
            .findAll()
            .stream()
            .anyMatch(m ->
                    m.getItem().getId().equals(newItem.getId())
                            && m.getMatchedItemId().equals(candidate.getId())
            );
    
    if (alreadyExists) {
        continue;
    }
            // Sauvegarder le match en base
            Match match = Match.builder()
                    .item(newItem)
                    .matchedItemId(candidate.getId())
                    .lostUserId(
                        newItem.getType() == Item.ItemType.LOST
                                ? newItem.getUser().getId()
                                : candidate.getUser().getId()
                )
                .foundUserId(
                        newItem.getType() == Item.ItemType.FOUND
                                ? newItem.getUser().getId()
                                : candidate.getUser().getId()
                )
                    .similarityScore(score)
                    .matchedKeywords(String.join(",", kw))
                    .build();

            match = matchRepository.save(match);

            results.add(MatchResponse.builder()
                    .id(match.getId())
                    .matchedItem(toItemResponse(candidate))
                    .similarityScore(score)
                    .matchedKeywords(kw)
                    .scoreLabel(getScoreLabel(score))
                    .createdAt(match.getCreatedAt())
                    .build());
        }

        return results;
    }

    /**
     * Algorithme de scoring
     * Catégorie (+35) + Couleur (+25) + Keywords (+8 chacun) + Proximité (+10) + Titre (+5)
     */
    private int computeScore(Item query, Item candidate) {
        int score = 0;

        // 1. Même catégorie
        if (query.getCategory() != null && candidate.getCategory() != null
                && query.getCategory().equalsIgnoreCase(candidate.getCategory())) {
            score += 35;
        }

        // 2. Même couleur
        if (query.getColor() != null && candidate.getColor() != null
                && !query.getColor().isEmpty() && !candidate.getColor().isEmpty()
                && query.getColor().equalsIgnoreCase(candidate.getColor())) {
            score += 25;
        }

        // 3. Mots-clés en commun
        List<String> kw1 = parseKeywords(query.getKeywords());
        List<String> kw2 = parseKeywords(candidate.getKeywords());
        long common = kw1.stream()
                .filter(k -> kw2.stream()
                        .anyMatch(k2 -> k2.equalsIgnoreCase(k)))
                .count();
        score += Math.min((int) common * 8, 40);

        // 4. Proximité GPS (< 2km = +10 points)
        if (query.getLatitude() != null && query.getLongitude() != null
                && candidate.getLatitude() != null && candidate.getLongitude() != null) {
            double dist = calculateDistance(
                    query.getLatitude(), query.getLongitude(),
                    candidate.getLatitude(), candidate.getLongitude()
            );
            if (dist < 2.0) score += 10;
        }

        // 5. Titre similaire
        if (hasTitleSimilarity(query.getTitle(), candidate.getTitle())) {
            score += 5;
        }

        return Math.min(score, 100);
    }

    private List<String> getMatchedKeywords(Item query, Item candidate) {
        List<String> kw1 = parseKeywords(query.getKeywords());
        List<String> kw2 = parseKeywords(candidate.getKeywords());
        return kw1.stream()
                .filter(k -> kw2.stream().anyMatch(k2 -> k2.equalsIgnoreCase(k)))
                .collect(Collectors.toList());
    }

    private List<String> parseKeywords(String keywords) {

        if (keywords == null || keywords.isEmpty()) {
            return new ArrayList<>();
        }
    
        try {
            return objectMapper.readValue(
                    keywords,
                    new TypeReference<List<String>>() {}
            ).stream()
                    .map(String::trim)
                    .map(String::toLowerCase)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
    
        } catch (Exception e) {
    
            log.warn("Erreur parsing keywords: {}", e.getMessage());
    
            return new ArrayList<>();
        }
    }
    /**
     * Formule Haversine pour distance GPS en km
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private boolean hasTitleSimilarity(String title1, String title2) {
        if (title1 == null || title2 == null) return false;
        String[] words1 = title1.toLowerCase().split("\\s+");
        String[] words2 = title2.toLowerCase().split("\\s+");
        for (String w : words1) {
            if (w.length() > 3) {
                for (String w2 : words2) {
                    if (w.equals(w2)) return true;
                }
            }
        }
        return false;
    }

    private String getScoreLabel(int score) {
        if (score >= 80) return "Très forte";
        if (score >= 60) return "Forte";
        if (score >= 40) return "Possible";
        return "Faible";
    }

    private ItemResponse toItemResponse(Item item) {
        return ItemResponse.builder()
                .id(item.getId())
                .userId(item.getUser().getId())
                .userName(item.getUser().getName())
                .type(item.getType().name())
                .title(item.getTitle())
                .description(item.getDescription())
                .photoUrl(item.getPhotoUrl())
                .category(item.getCategory())
                .color(item.getColor())
                .latitude(item.getLatitude())
                .longitude(item.getLongitude())
                .address(item.getAddress())
                .status(item.getStatus().name())
                .createdAt(item.getCreatedAt())
                .build();
    }
}
