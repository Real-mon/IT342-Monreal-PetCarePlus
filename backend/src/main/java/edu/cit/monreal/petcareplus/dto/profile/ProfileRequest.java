// DTO for updating a user's profile
package edu.cit.monreal.petcareplus.dto.profile;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileRequest {
    private String fullName;
    private String contactNumber;
    private String address;
    private String photoUrl;
}

