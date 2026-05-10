// REST endpoints for services and providers
package edu.cit.monreal.petcareplus.features.services.controller;

import edu.cit.monreal.petcareplus.common.exception.ApiException;
import edu.cit.monreal.petcareplus.features.booking.model.Booking;
import edu.cit.monreal.petcareplus.features.schedule.model.Schedule;
import edu.cit.monreal.petcareplus.features.schedule.service.ProviderScheduleService;
import edu.cit.monreal.petcareplus.features.services.model.Service;
import edu.cit.monreal.petcareplus.features.services.model.ServiceProvider;
import edu.cit.monreal.petcareplus.features.auth.model.User;
import edu.cit.monreal.petcareplus.features.booking.repository.BookingRepository;
import edu.cit.monreal.petcareplus.features.schedule.repository.ScheduleRepository;
import edu.cit.monreal.petcareplus.features.services.repository.ServiceRepository;
import edu.cit.monreal.petcareplus.features.services.repository.ServiceProviderRepository;
import edu.cit.monreal.petcareplus.features.auth.repository.UserRepository;
import edu.cit.monreal.petcareplus.features.services.service.ProviderServicesService;
import edu.cit.monreal.petcareplus.features.services.service.ServiceProviderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ServiceController {
    private final ServiceRepository serviceRepository;
    private final ServiceProviderService providerService;
    private final ProviderServicesService providerServicesService;
    private final ProviderScheduleService providerScheduleService;
    private final ServiceProviderRepository serviceProviderRepository;
    private final UserRepository userRepository;
    private final ScheduleRepository scheduleRepository;
    private final BookingRepository bookingRepository;

    public ServiceController(
            ServiceRepository serviceRepository,
            ServiceProviderService providerService,
            ProviderServicesService providerServicesService,
            ProviderScheduleService providerScheduleService,
            ServiceProviderRepository serviceProviderRepository,
            UserRepository userRepository,
            ScheduleRepository scheduleRepository,
            BookingRepository bookingRepository
    ) {
        this.serviceRepository = serviceRepository;
        this.providerService = providerService;
        this.providerServicesService = providerServicesService;
        this.providerScheduleService = providerScheduleService;
        this.serviceProviderRepository = serviceProviderRepository;
        this.userRepository = userRepository;
        this.scheduleRepository = scheduleRepository;
        this.bookingRepository = bookingRepository;
    }

    @GetMapping("/services")
    public ResponseEntity<List<Service>> getAllServices() {
        return ResponseEntity.ok(serviceRepository.findAll());
    }

    @GetMapping("/services/{category}")
    public ResponseEntity<List<Service>> getByCategory(@PathVariable("category") String category) {
        return ResponseEntity.ok(serviceRepository.findByCategory(category));
    }

    @GetMapping("/providers")
    public ResponseEntity<List<ServiceProvider>> getAllProviders() {
        return ResponseEntity.ok(providerService.getAllProviders());
    }

    @GetMapping("/providers/{id}/services")
    public ResponseEntity<List<Service>> getProviderServices(@PathVariable("id") Long providerId) {
        return ResponseEntity.ok(providerService.getProviderServices(providerId));
    }

    @GetMapping("/providers/{id}/availability")
    public ResponseEntity<List<Schedule>> getAvailability(
            @PathVariable("id") Long providerId,
            @RequestParam(value = "serviceId", required = false) Long serviceId,
            @RequestParam(value = "date", required = false) LocalDate date
    ) {
        return ResponseEntity.ok(providerService.getProviderAvailability(providerId, serviceId, date));
    }

    @GetMapping("/provider/services")
    public ResponseEntity<List<Service>> getMyServices() {
        requireRole("SERVICE_PROVIDER");
        ServiceProvider provider = currentProvider();
        return ResponseEntity.ok(serviceRepository.findByProviderId(provider.getProviderId()));
    }

    @PostMapping("/provider/services")
    public ResponseEntity<Service> createMyService(@RequestBody CreateServiceRequest request) {
        requireRole("SERVICE_PROVIDER");
        ServiceProvider provider = currentProvider();
        Service service = providerServicesService.createService(provider, request.name, request.description, request.price, request.durationMinutes);
        return ResponseEntity.ok(service);
    }

    @PutMapping("/provider/services/{id}")
    public ResponseEntity<Service> updateMyService(@PathVariable("id") Long id, @RequestBody UpdateServiceRequest request) {
        requireRole("SERVICE_PROVIDER");
        Long providerId = currentProvider().getProviderId();
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ApiException("DB-001", "Resource not found", "Service not found", HttpStatus.NOT_FOUND));
        if (!service.getProvider().getProviderId().equals(providerId)) {
            throw new ApiException("AUTH-003", "Insufficient permissions", "Service does not belong to current provider", HttpStatus.FORBIDDEN);
        }
        if (request.price == null || request.price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException("BUSINESS-003", "Invalid price", "Price must be greater than 0", HttpStatus.BAD_REQUEST);
        }
        if (request.durationMinutes == null || request.durationMinutes <= 0) {
            throw new ApiException("BUSINESS-004", "Invalid duration", "Duration must be greater than 0 minutes", HttpStatus.BAD_REQUEST);
        }
        service.setDescription(request.description);
        service.setPrice(request.price);
        service.setDurationMinutes(request.durationMinutes);
        return ResponseEntity.ok(serviceRepository.saveAndFlush(service));
    }

    @DeleteMapping("/provider/services/{id}")
    public ResponseEntity<Void> deleteMyService(@PathVariable("id") Long id) {
        requireRole("SERVICE_PROVIDER");
        Long providerId = currentProvider().getProviderId();
        providerServicesService.deleteService(providerId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/provider/schedule")
    public ResponseEntity<List<ProviderScheduleSlot>> getProviderSchedule(@RequestParam(value = "month", required = false) String month) {
        requireRole("SERVICE_PROVIDER");
        ServiceProvider provider = currentProvider();

        YearMonth ym;
        try {
            ym = (month == null || month.isBlank()) ? YearMonth.now() : YearMonth.parse(month);
        } catch (Exception e) {
            throw new ApiException("VALID-002", "Invalid month", "Expected format YYYY-MM", HttpStatus.BAD_REQUEST);
        }

        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<Schedule> schedules = scheduleRepository.findByProviderIdAndDateBetween(provider.getProviderId(), start, end);
        List<Booking> bookings = bookingRepository.findByProviderIdAndScheduleDateBetween(provider.getProviderId(), start, end);

        Map<Long, Booking> bookingByScheduleId = new HashMap<>();
        for (Booking b : bookings) {
            if (b.getSchedule() != null && b.getSchedule().getScheduleId() != null) {
                bookingByScheduleId.put(b.getSchedule().getScheduleId(), b);
            }
        }

        List<ProviderScheduleSlot> out = schedules.stream()
                .map(s -> {
                    Booking b = bookingByScheduleId.get(s.getScheduleId());
                    return new ProviderScheduleSlot(
                            s.getScheduleId(),
                            s.getDate(),
                            s.getStartTime(),
                            s.getEndTime(),
                            Boolean.TRUE.equals(s.getIsAvailable()),
                            s.getService() != null ? s.getService().getServiceId() : null,
                            s.getService() != null ? s.getService().getName() : null,
                            b != null ? b.getBookingId() : null,
                            b != null && b.getPetOwner() != null ? b.getPetOwner().getEmail() : null,
                            b != null ? b.getStatus() : null
                    );
                })
                .toList();

        return ResponseEntity.ok(out);
    }

    @PostMapping("/provider/schedule")
    public ResponseEntity<ProviderScheduleSlot> createAvailability(@RequestBody CreateAvailabilityRequest request) {
        requireRole("SERVICE_PROVIDER");
        ServiceProvider provider = currentProvider();
        Schedule schedule = providerScheduleService.createSlot(provider, request.date, request.startTime, request.serviceId);
        ProviderScheduleSlot payload = new ProviderScheduleSlot(
                schedule.getScheduleId(),
                schedule.getDate(),
                schedule.getStartTime(),
                schedule.getEndTime(),
                Boolean.TRUE.equals(schedule.getIsAvailable()),
                schedule.getService() != null ? schedule.getService().getServiceId() : null,
                schedule.getService() != null ? schedule.getService().getName() : null,
                null,
                null,
                null
        );
        return ResponseEntity.ok(payload);
    }

    @DeleteMapping("/provider/schedule/{id}")
    public ResponseEntity<Void> deleteAvailability(@PathVariable("id") Long id) {
        requireRole("SERVICE_PROVIDER");
        ServiceProvider provider = currentProvider();
        providerScheduleService.deleteSlot(provider, id);
        return ResponseEntity.noContent().build();
    }

    private ServiceProvider currentProvider() {
        User user = currentUser();
        return serviceProviderRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    ServiceProvider sp = new ServiceProvider();
                    sp.setUser(user);
                    sp.setBusinessName(user.getEmail());
                    return serviceProviderRepository.save(sp);
                });
    }

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("DB-001", "Resource not found", "User not found", HttpStatus.NOT_FOUND));
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

    public static class CreateServiceRequest {
        public String name;
        public String description;
        public BigDecimal price;
        public Integer durationMinutes;
    }

    public static class UpdateServiceRequest {
        public String description;
        public BigDecimal price;
        public Integer durationMinutes;
    }

    public static class CreateAvailabilityRequest {
        public LocalDate date;
        public LocalTime startTime;
        public Long serviceId;
    }

    public record ProviderScheduleSlot(
            Long scheduleId,
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            boolean isAvailable,
            Long serviceId,
            String serviceName,
            Long bookingId,
            String petOwnerEmail,
            String bookingStatus
    ) {
    }
}
