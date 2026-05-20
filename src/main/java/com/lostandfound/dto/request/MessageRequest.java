package com.lostandfound.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MessageRequest {

    @NotNull(message = "L'ID du destinataire est obligatoire")
    private Long receiverId;

    @NotNull(message = "L'ID de l'objet est obligatoire")
    private Long itemId;

    @NotBlank(message = "Le contenu du message est obligatoire")
    private String content;
}
