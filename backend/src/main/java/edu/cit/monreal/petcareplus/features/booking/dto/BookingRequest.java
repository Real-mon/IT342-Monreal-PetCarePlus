// DTO for creating a booking request
package edu.cit.monreal.petcareplus.features.booking.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {
    private Long serviceId;
    private Long scheduleId;
    private Long petId;
}
