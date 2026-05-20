package com.lostandfound.repository;

import com.lostandfound.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findByStatusOrderByCreatedAtDesc(Item.ItemStatus status);
    List<Item> findAllByOrderByCreatedAtDesc();
    List<Item> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Item> findByTypeAndStatusOrderByCreatedAtDesc(
        Item.ItemType type, Item.ItemStatus status
    );

    // Recherche par catégorie et type opposé (pour le matching)
    List<Item> findByTypeAndStatusAndCategoryIgnoreCase(
        Item.ItemType type, Item.ItemStatus status, String category
    );

    // Recherche full-text dans titre + description
    @Query("SELECT i FROM Item i WHERE i.status = 'ACTIVE' AND " +
           "(LOWER(i.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(i.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(i.category) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(i.keywords) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Item> searchItems(@Param("query") String query);

    // Recherche par proximité GPS (rayon en km)
    @Query("SELECT i FROM Item i WHERE i.status = 'ACTIVE' AND " +
           "(6371 * acos(cos(radians(:lat)) * cos(radians(i.latitude)) * " +
           "cos(radians(i.longitude) - radians(:lng)) + " +
           "sin(radians(:lat)) * sin(radians(i.latitude)))) < :radius")
    List<Item> findItemsNearby(
        @Param("lat") Double lat,
        @Param("lng") Double lng,
        @Param("radius") Double radiusKm
    );
}
