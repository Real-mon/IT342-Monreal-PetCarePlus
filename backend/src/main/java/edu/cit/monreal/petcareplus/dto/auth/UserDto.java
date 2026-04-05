// DTO representing minimal user details in responses
package edu.cit.monreal.petcareplus.dto.auth;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private String email;
    private String firstname;
    private String lastname;
    private String role;
}

