package edu.cit.monreal.petcareplus.features.schedule.service;

import edu.cit.monreal.petcareplus.common.exception.ApiException;
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

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProviderScheduleServiceTest {
    @Mock
    private ScheduleRepository scheduleRepository;

    @Mock
    private ServiceRepository serviceRepository;

    @InjectMocks
    private ProviderScheduleService providerScheduleService;

    @Test
    void createSlot_withValidDateHourBetween9And3AndServiceId_expectSuccess() {
        ServiceProvider provider = ServiceProvider.builder().providerId(1L).build();
        Service service = Service.builder().serviceId(10L).provider(provider).name("Full grooming").build();
        when(serviceRepository.findById(10L)).thenReturn(Optional.of(service));
        when(scheduleRepository.findByProviderIdAndDateAndStartTime(1L, LocalDate.now().plusDays(1), LocalTime.of(9, 0)))
                .thenReturn(Collections.emptyList());
        when(scheduleRepository.saveAndFlush(any(Schedule.class))).thenAnswer(invocation -> {
            Schedule s = invocation.getArgument(0);
            s.setScheduleId(99L);
            return s;
        });

        Schedule created = providerScheduleService.createSlot(provider, LocalDate.now().plusDays(1), LocalTime.of(9, 0), 10L);

        assertEquals(99L, created.getScheduleId());
        assertEquals(LocalTime.of(9, 0), created.getStartTime());
        assertEquals(LocalTime.of(10, 0), created.getEndTime());
        assertEquals(true, created.getIsAvailable());
        assertEquals(10L, created.getService().getServiceId());
        verify(scheduleRepository, times(1)).saveAndFlush(any(Schedule.class));
    }

    @Test
    void createSlot_withStartTimeOutside9To3_expectException() {
        ServiceProvider provider = ServiceProvider.builder().providerId(1L).build();

        ApiException ex = assertThrows(ApiException.class, () ->
                providerScheduleService.createSlot(provider, LocalDate.now().plusDays(1), LocalTime.of(8, 0), 10L)
        );

        assertEquals("BUSINESS-011", ex.getCode());
        verify(scheduleRepository, never()).saveAndFlush(any(Schedule.class));
    }

    @Test
    void createSlot_withNonHourStartTime_expectException() {
        ServiceProvider provider = ServiceProvider.builder().providerId(1L).build();

        ApiException ex = assertThrows(ApiException.class, () ->
                providerScheduleService.createSlot(provider, LocalDate.now().plusDays(1), LocalTime.of(9, 30), 10L)
        );

        assertEquals("BUSINESS-010", ex.getCode());
        verify(scheduleRepository, never()).saveAndFlush(any(Schedule.class));
    }

    @Test
    void deleteSlot_whereIsAvailableTrue_expectSuccess() {
        ServiceProvider provider = ServiceProvider.builder().providerId(1L).build();
        Schedule schedule = Schedule.builder().scheduleId(50L).provider(provider).isAvailable(true).build();
        when(scheduleRepository.findById(50L)).thenReturn(Optional.of(schedule));

        providerScheduleService.deleteSlot(provider, 50L);

        verify(scheduleRepository, times(1)).delete(schedule);
        verify(scheduleRepository, times(1)).flush();
    }

    @Test
    void deleteSlot_whereIsAvailableFalse_expectException() {
        ServiceProvider provider = ServiceProvider.builder().providerId(1L).build();
        Schedule schedule = Schedule.builder().scheduleId(50L).provider(provider).isAvailable(false).build();
        when(scheduleRepository.findById(50L)).thenReturn(Optional.of(schedule));

        ApiException ex = assertThrows(ApiException.class, () -> providerScheduleService.deleteSlot(provider, 50L));

        assertEquals("BUSINESS-013", ex.getCode());
        verify(scheduleRepository, never()).delete(any(Schedule.class));
        verify(scheduleRepository, never()).flush();
    }
}
