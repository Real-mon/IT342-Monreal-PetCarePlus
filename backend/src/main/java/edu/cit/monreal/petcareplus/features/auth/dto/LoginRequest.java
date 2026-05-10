// DTO for user login request
package edu.cit.monreal.petcareplus.features.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    @NotBlank
    private String email;

    @NotBlank
    private String password;
}

