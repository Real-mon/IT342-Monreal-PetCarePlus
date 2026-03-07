// This DTO holds the registration form data sent by the client
package edu.cit.monreal.petcareplus.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String email;
    @NotBlank
    private String password;
}
