package edu.cit.monreal.petcareplus.features.booking.service;

import edu.cit.monreal.petcareplus.common.exception.ApiException;
import edu.cit.monreal.petcareplus.features.auth.model.User;
import edu.cit.monreal.petcareplus.features.auth.repository.UserRepository;
import edu.cit.monreal.petcareplus.features.booking.dto.BookingRequest;
import edu.cit.monreal.petcareplus.features.booking.dto.BookingResponse;
import edu.cit.monreal.petcareplus.features.booking.model.Booking;
import edu.cit.monreal.petcareplus.features.booking.repository.BookingRepository;
import edu.cit.monreal.petcareplus.features.pets.repository.PetRepository;
import edu.cit.monreal.petcareplus.features.profile.repository.ProfileRepository;
import edu.cit.monreal.petcareplus.features.schedule.model.Schedule;
import edu.cit.monreal.petcareplus.features.schedule.repository.ScheduleRepository;
import edu.cit.monreal.petcareplus.features.services.model.Service;
import edu.cit.monreal.petcareplus.features.services.model.ServiceProvider;
import edu.cit.monreal.petcareplus.features.services.repository.ServiceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {
    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ScheduleRepository scheduleRepository;

    @Mock
    private ServiceRepository serviceRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PetRepository petRepository;

    @Mock
    private ProfileRepository profileRepository;

    @InjectMocks
    private BookingService bookingService;

    @Test
    void createBooking_withValidFutureDateAndAvailableSlot_expectSuccess() {
        Long petOwnerId = 100L;
        ServiceProvider provider = ServiceProvider.builder().providerId(1L).businessName("Provider 1").build();
        Service service = Service.builder()
                .serviceId(10L)
                .provider(provider)
                .category("GROOMING")
                .name("Full grooming")
                .price(new BigDecimal("100.00"))
                .durationMinutes(60)
                .build();
        Schedule schedule = Schedule.builder()
                .scheduleId(20L)
                .provider(provider)
                .service(service)
                .date(LocalDate.now().plusDays(3))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 0))
                .isAvailable(true)
                .build();
        User owner = User.builder().id(petOwnerId).email("owner@test.com").password("x").role("PET_OWNER").build();

        when(scheduleRepository.findById(20L)).thenReturn(Optional.of(schedule));
        when(serviceRepository.findById(10L)).thenReturn(Optional.of(service));
        when(userRepository.findById(petOwnerId)).thenReturn(Optional.of(owner));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking b = invocation.getArgument(0);
            b.setBookingId(300L);
            return b;
        });
        when(scheduleRepository.save(any(Schedule.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(profileRepository.findByUserId(petOwnerId)).thenReturn(Optional.empty());

        BookingRequest request = BookingRequest.builder().serviceId(10L).scheduleId(20L).petId(null).build();
        BookingResponse response = bookingService.createBooking(petOwnerId, request);

        assertEquals(300L, response.getBookingId());
        assertEquals("PENDING", response.getStatus());
        assertEquals(20L, response.getScheduleId());
        assertEquals(1L, response.getProviderId());
        assertEquals("Provider 1", response.getProviderName());
        assertEquals("Full grooming", response.getServiceName());
        assertFalse(schedule.getIsAvailable());
        verify(bookingRepository, times(1)).save(any(Booking.class));
        verify(scheduleRepository, times(1)).save(schedule);
    }

    @Test
    void createBooking_withSlotAlreadyTaken_expectException() {
        Schedule schedule = Schedule.builder().scheduleId(20L).isAvailable(false).build();
        when(scheduleRepository.findById(20L)).thenReturn(Optional.of(schedule));

        BookingRequest request = BookingRequest.builder().serviceId(10L).scheduleId(20L).petId(null).build();
        ApiException ex = assertThrows(ApiException.class, () -> bookingService.createBooking(100L, request));

        assertEquals("BUSINESS-001", ex.getCode());
        verify(bookingRepository, never()).save(any(Booking.class));
        verify(scheduleRepository, never()).save(any(Schedule.class));
        verify(serviceRepository, never()).findById(any(Long.class));
    }

    @Test
    void cancelBooking_thatBelongsToLoggedInPetOwner_expectSuccess() {
        Long bookingId = 400L;
        Long petOwnerId = 100L;
        Schedule schedule = Schedule.builder().scheduleId(20L).isAvailable(false).build();
        Booking booking = Booking.builder().bookingId(bookingId).schedule(schedule).build();

        when(bookingRepository.findByIdAndPetOwnerId(bookingId, petOwnerId)).thenReturn(Optional.of(booking));
        when(scheduleRepository.save(any(Schedule.class))).thenAnswer(invocation -> invocation.getArgument(0));

        bookingService.cancelBookingByOwner(bookingId, petOwnerId);

        assertEquals(true, schedule.getIsAvailable());
        verify(bookingRepository, times(1)).delete(booking);
        verify(bookingRepository, times(1)).flush();
        verify(scheduleRepository, times(1)).save(schedule);
    }

    @Test
    void cancelBooking_thatBelongsToAnotherPetOwner_expectException() {
        Long bookingId = 400L;
        Long petOwnerId = 100L;
        when(bookingRepository.findByIdAndPetOwnerId(bookingId, petOwnerId)).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class, () -> bookingService.cancelBookingByOwner(bookingId, petOwnerId));

        assertEquals("DB-001", ex.getCode());
        verify(bookingRepository, never()).delete(any(Booking.class));
        verify(bookingRepository, never()).flush();
    }
}
