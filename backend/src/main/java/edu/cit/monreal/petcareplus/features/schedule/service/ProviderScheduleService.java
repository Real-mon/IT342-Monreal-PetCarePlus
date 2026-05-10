package edu.cit.monreal.petcareplus.features.schedule.service;

import edu.cit.monreal.petcareplus.common.exception.ApiException;
import edu.cit.monreal.petcareplus.features.schedule.model.Schedule;
import edu.cit.monreal.petcareplus.features.schedule.repository.ScheduleRepository;
import edu.cit.monreal.petcareplus.features.services.model.Service;
import edu.cit.monreal.petcareplus.features.services.model.ServiceProvider;
import edu.cit.monreal.petcareplus.features.services.repository.ServiceRepository;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@org.springframework.stereotype.Service
public class ProviderScheduleService {
    private final ScheduleRepository scheduleRepository;
    private final ServiceRepository serviceRepository;

    public ProviderScheduleService(ScheduleRepository scheduleRepository, ServiceRepository serviceRepository) {
        this.scheduleRepository = scheduleRepository;
        this.serviceRepository = serviceRepository;
    }

    public Schedule createSlot(ServiceProvider provider, LocalDate date, LocalTime startTime, Long serviceId) {
        if (date == null) {
            throw new ApiException("VALID-001", "Validation failed", "date is required", HttpStatus.BAD_REQUEST);
        }
        if (startTime == null) {
            throw new ApiException("VALID-001", "Validation failed", "startTime is required", HttpStatus.BAD_REQUEST);
        }
        if (serviceId == null) {
            throw new ApiException("VALID-001", "Validation failed", "serviceId is required", HttpStatus.BAD_REQUEST);
        }

        if (startTime.getMinute() != 0) {
            throw new ApiException("BUSINESS-010", "Invalid time slot", "Time slots must start on the hour", HttpStatus.BAD_REQUEST);
        }
        if (startTime.isBefore(LocalTime.of(9, 0)) || startTime.isAfter(LocalTime.of(15, 0))) {
            throw new ApiException("BUSINESS-011", "Invalid time slot", "Time slots must be between 9:00 AM and 4:00 PM", HttpStatus.BAD_REQUEST);
        }
        LocalTime endTime = startTime.plusHours(1);
        if (endTime.isAfter(LocalTime.of(16, 0))) {
            throw new ApiException("BUSINESS-011", "Invalid time slot", "Time slots must be between 9:00 AM and 4:00 PM", HttpStatus.BAD_REQUEST);
        }

        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ApiException("DB-001", "Resource not found", "Service not found", HttpStatus.NOT_FOUND));
        if (service.getProvider() == null || !service.getProvider().getProviderId().equals(provider.getProviderId())) {
            throw new ApiException("AUTH-003", "Insufficient permissions", "Service does not belong to current provider", HttpStatus.FORBIDDEN);
        }

        List<Schedule> existing = scheduleRepository.findByProviderIdAndDateAndStartTime(provider.getProviderId(), date, startTime);
        if (!existing.isEmpty()) {
            Schedule s = existing.get(0);
            if (Boolean.FALSE.equals(s.getIsAvailable())) {
                throw new ApiException("BUSINESS-012", "Slot already booked", "This slot is already booked and cannot be reopened", HttpStatus.BAD_REQUEST);
            }
            return s;
        }

        Schedule schedule = new Schedule();
        schedule.setProvider(provider);
        schedule.setService(service);
        schedule.setDate(date);
        schedule.setStartTime(startTime);
        schedule.setEndTime(endTime);
        schedule.setIsAvailable(true);
        return scheduleRepository.saveAndFlush(schedule);
    }

    public void deleteSlot(ServiceProvider provider, Long scheduleId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ApiException("DB-001", "Resource not found", "Schedule not found", HttpStatus.NOT_FOUND));
        if (schedule.getProvider() == null || !schedule.getProvider().getProviderId().equals(provider.getProviderId())) {
            throw new ApiException("AUTH-003", "Insufficient permissions", "Schedule does not belong to current provider", HttpStatus.FORBIDDEN);
        }
        if (Boolean.FALSE.equals(schedule.getIsAvailable())) {
            throw new ApiException("BUSINESS-013", "Cannot remove booked slot", "Booked slots cannot be removed", HttpStatus.BAD_REQUEST);
        }
        scheduleRepository.delete(schedule);
        scheduleRepository.flush();
    }
}
