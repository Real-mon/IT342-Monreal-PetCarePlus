// DTO representing booking data returned to clients
package edu.cit.monreal.petcareplus.dto.booking;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long bookingId;
    private Long petOwnerId;
    private String petOwnerEmail;
    private String petOwnerName;
    private Long serviceId;
    private Long scheduleId;
    private Long petId;
    private String status;
    private LocalDateTime createdAt;

    private Long providerId;
    private String providerName;
    private String serviceName;
    private LocalDate scheduleDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String petName;
}
