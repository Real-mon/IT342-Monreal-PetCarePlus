// DTO representing booking data returned to clients
package edu.cit.monreal.petcareplus.dto.booking;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long bookingId;
    private Long petOwnerId;
    private Long serviceId;
    private Long scheduleId;
    private String status;
    private LocalDateTime createdAt;
}

