// Business logic for booking creation and management
package edu.cit.monreal.petcareplus.service;

import edu.cit.monreal.petcareplus.dto.booking.BookingRequest;
import edu.cit.monreal.petcareplus.dto.booking.BookingResponse;
import edu.cit.monreal.petcareplus.exception.ApiException;
import edu.cit.monreal.petcareplus.model.*;
import edu.cit.monreal.petcareplus.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class BookingService {
    private final BookingRepository bookingRepository;
    private final ScheduleRepository scheduleRepository;
    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository,
                          ScheduleRepository scheduleRepository,
                          ServiceRepository serviceRepository,
                          UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.scheduleRepository = scheduleRepository;
        this.serviceRepository = serviceRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public BookingResponse createBooking(Long petOwnerId, BookingRequest request) {
        Schedule schedule = scheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new ApiException("DB-001", "Resource not found", "Schedule not found", HttpStatus.NOT_FOUND));
        if (Boolean.FALSE.equals(schedule.getIsAvailable())) {
            throw new ApiException("BUSINESS-001", "Booking slot unavailable", "Selected schedule is not available", HttpStatus.BAD_REQUEST);
        }
        Service service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ApiException("DB-001", "Resource not found", "Service not found", HttpStatus.NOT_FOUND));
        User owner = userRepository.findById(petOwnerId)
                .orElseThrow(() -> new ApiException("DB-001", "Resource not found", "User not found", HttpStatus.NOT_FOUND));

        Booking booking = Booking.builder()
                .petOwner(owner)
                .service(service)
                .schedule(schedule)
                .status("PENDING")
                .build();
        booking = bookingRepository.save(booking);

        schedule.setIsAvailable(false);
        scheduleRepository.save(schedule);

        return toResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByOwner(Long petOwnerId) {
        return bookingRepository.findByPetOwnerId(petOwnerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByProvider(Long providerId) {
        return bookingRepository.findByScheduleProviderId(providerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse updateBookingStatus(Long bookingId, String status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException("DB-001", "Resource not found", "Booking not found", HttpStatus.NOT_FOUND));
        booking.setStatus(status);
        booking = bookingRepository.save(booking);
        return toResponse(booking);
    }

    private BookingResponse toResponse(Booking b) {
        return BookingResponse.builder()
                .bookingId(b.getBookingId())
                .petOwnerId(b.getPetOwner().getId())
                .serviceId(b.getService().getServiceId())
                .scheduleId(b.getSchedule().getScheduleId())
                .status(b.getStatus())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
