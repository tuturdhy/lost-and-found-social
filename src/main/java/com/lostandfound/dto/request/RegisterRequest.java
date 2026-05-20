package com.lostandfound.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

// ===================== AUTH DTOs =====================

@Data
public class RegisterRequest {
    @NotBlank(message = "Le nom est obligatoire")
    private String name;

    @Email(message = "Email invalide")
    @NotBlank(message = "L'email est obligatoire")
    private String email;

    @Size(min = 6, message = "Le mot de passe doit avoir au moins 6 caractères")
    @NotBlank(message = "Le mot de passe est obligatoire")
    private String password;
}
