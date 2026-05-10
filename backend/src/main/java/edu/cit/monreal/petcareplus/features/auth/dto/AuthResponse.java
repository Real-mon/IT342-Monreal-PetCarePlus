// DTO for authentication responses carrying tokens and user info
package edu.cit.monreal.petcareplus.features.auth.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private boolean success;
    private String accessToken;
    private String refreshToken;
    private UserDto user;
}

