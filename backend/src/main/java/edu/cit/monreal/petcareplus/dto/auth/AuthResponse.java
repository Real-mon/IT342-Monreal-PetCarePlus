// DTO for authentication responses carrying tokens and user info
package edu.cit.monreal.petcareplus.dto.auth;

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

