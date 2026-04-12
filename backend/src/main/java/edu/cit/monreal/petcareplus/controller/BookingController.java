// REST endpoints for booking operations
package edu.cit.monreal.petcareplus.controller;

import edu.cit.monreal.petcareplus.dto.booking.BookingRequest;
import edu.cit.monreal.petcareplus.dto.booking.BookingResponse;
import edu.cit.monreal.petcareplus.exception.ApiException;
import edu.cit.monreal.petcareplus.model.User;
import edu.cit.monreal.petcareplus.repository.UserRepository;
import edu.cit.monreal.petcareplus.repository.ServiceProviderRepository;
import edu.cit.monreal.petcareplus.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    private final BookingService bookingService;
    private final UserRepository userRepository;
    private final ServiceProviderRepository serviceProviderRepository;

    public BookingController(BookingService bookingService, UserRepository userRepository, ServiceProviderRepository serviceProviderRepository) {
        this.bookingService = bookingService;
        this.userRepository = userRepository;
        this.serviceProviderRepository = serviceProviderRepository;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@RequestBody BookingRequest request) {
        Long userId = currentUserId();
        return ResponseEntity.ok(bookingService.createBooking(userId, request));
    }

    @GetMapping("/owner")
    public ResponseEntity<List<BookingResponse>> getBookingsByOwner() {
        requireRole("PET_OWNER");
        Long userId = currentUserId();
        return ResponseEntity.ok(bookingService.getBookingsByOwner(userId));
    }

    @GetMapping("/provider")
    public ResponseEntity<List<BookingResponse>> getBookingsByProvider() {
        requireRole("SERVICE_PROVIDER");
        Long userId = currentUserId();
        Long providerId = serviceProviderRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("DB-001", "Resource not found", "Service provider not found", HttpStatus.NOT_FOUND))
                .getProviderId();
        return ResponseEntity.ok(bookingService.getBookingsByProvider(providerId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateStatus(@PathVariable("id") Long id, @RequestParam("status") String status) {
        requireRole("SERVICE_PROVIDER");
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable("id") Long id) {
        requireRole("PET_OWNER");
        Long userId = currentUserId();
        return ResponseEntity.ok(bookingService.getBookingByOwner(id, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelBooking(@PathVariable("id") Long id) {
        requireRole("PET_OWNER");
        Long userId = currentUserId();
        bookingService.cancelBookingByOwner(id, userId);
        return ResponseEntity.noContent().build();
    }

    private Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("DB-001", "Resource not found", "User not found", HttpStatus.NOT_FOUND));
        return user.getId();
    }

    private void requireRole(String role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean ok = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_" + role));
        if (!ok) {
            throw new ApiException("AUTH-003", "Insufficient permissions", "Required role: " + role, HttpStatus.FORBIDDEN);
        }
    }
}
