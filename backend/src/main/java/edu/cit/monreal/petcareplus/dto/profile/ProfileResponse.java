// DTO representing profile details returned to clients
package edu.cit.monreal.petcareplus.dto.profile;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    private Long profileId;
    private Long userId;
    private String fullName;
    private String contactNumber;
    private String address;
    private String photoUrl;
}

