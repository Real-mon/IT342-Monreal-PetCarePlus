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
    private final PetRepository petRepository;
    private final ProfileRepository profileRepository;

    public BookingService(BookingRepository bookingRepository,
                          ScheduleRepository scheduleRepository,
                          ServiceRepository serviceRepository,
                          UserRepository userRepository,
                          PetRepository petRepository,
                          ProfileRepository profileRepository) {
        this.bookingRepository = bookingRepository;
        this.scheduleRepository = scheduleRepository;
        this.serviceRepository = serviceRepository;
        this.userRepository = userRepository;
        this.petRepository = petRepository;
        this.profileRepository = profileRepository;
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
        if (!schedule.getService().getServiceId().equals(service.getServiceId())) {
            throw new ApiException("BUSINESS-002", "Invalid schedule", "Schedule does not belong to the selected service", HttpStatus.BAD_REQUEST);
        }
        if (!schedule.getProvider().getProviderId().equals(service.getProvider().getProviderId())) {
            throw new ApiException("BUSINESS-003", "Invalid provider", "Service and schedule provider mismatch", HttpStatus.BAD_REQUEST);
        }

        Pet pet = null;
        if (request.getPetId() != null) {
            pet = petRepository.findById(request.getPetId())
                    .orElseThrow(() -> new ApiException("DB-001", "Resource not found", "Pet not found", HttpStatus.NOT_FOUND));
            if (!pet.getOwner().getId().equals(owner.getId())) {
                throw new ApiException("AUTH-003", "Insufficient permissions", "Pet does not belong to current user", HttpStatus.FORBIDDEN);
            }
        }

        Booking booking = Booking.builder()
                .petOwner(owner)
                .service(service)
                .schedule(schedule)
                .pet(pet)
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

    @Transactional(readOnly = true)
    public BookingResponse getBookingByOwner(Long bookingId, Long petOwnerId) {
        Booking booking = bookingRepository.findByIdAndPetOwnerId(bookingId, petOwnerId)
                .orElseThrow(() -> new ApiException("DB-001", "Resource not found", "Booking not found", HttpStatus.NOT_FOUND));
        return toResponse(booking);
    }

    @Transactional
    public void cancelBookingByOwner(Long bookingId, Long petOwnerId) {
        Booking booking = bookingRepository.findByIdAndPetOwnerId(bookingId, petOwnerId)
                .orElseThrow(() -> new ApiException("DB-001", "Resource not found", "Booking not found", HttpStatus.NOT_FOUND));
        Schedule schedule = booking.getSchedule();
        bookingRepository.delete(booking);
        bookingRepository.flush();
        if (schedule != null) {
            schedule.setIsAvailable(true);
            scheduleRepository.save(schedule);
        }
    }

    private BookingResponse toResponse(Booking b) {
        String petOwnerName = profileRepository.findByUserId(b.getPetOwner().getId())
                .map(Profile::getFullName)
                .filter(n -> n != null && !n.isBlank())
                .orElse(null);
        return BookingResponse.builder()
                .bookingId(b.getBookingId())
                .petOwnerId(b.getPetOwner().getId())
                .petOwnerEmail(b.getPetOwner().getEmail())
                .petOwnerName(petOwnerName)
                .serviceId(b.getService().getServiceId())
                .scheduleId(b.getSchedule().getScheduleId())
                .petId(b.getPet() != null ? b.getPet().getPetId() : null)
                .status(b.getStatus())
                .createdAt(b.getCreatedAt())
                .providerId(b.getSchedule().getProvider().getProviderId())
                .providerName(b.getSchedule().getProvider().getBusinessName())
                .serviceName(b.getService().getName())
                .scheduleDate(b.getSchedule().getDate())
                .startTime(b.getSchedule().getStartTime())
                .endTime(b.getSchedule().getEndTime())
                .petName(b.getPet() != null ? b.getPet().getName() : null)
                .build();
    }
}
