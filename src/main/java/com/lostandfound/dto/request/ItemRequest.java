package com.lostandfound.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class ItemRequest {

    @NotBlank(message = "Le type est obligatoire (LOST ou FOUND)")
    private String type; // LOST or FOUND

    @NotBlank(message = "Le titre est obligatoire")
    private String title;

    private String description;

    @NotBlank(message = "La catégorie est obligatoire")
    private String category;

    private List<String> keywords;

    private String color;

    @NotNull(message = "La latitude est obligatoire")
    private Double latitude;

    @NotNull(message = "La longitude est obligatoire")
    private Double longitude;

    private String address;
}
