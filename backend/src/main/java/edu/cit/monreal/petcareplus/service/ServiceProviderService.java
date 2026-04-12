// Business logic related to service providers and availability
package edu.cit.monreal.petcareplus.service;

import edu.cit.monreal.petcareplus.model.Schedule;
import edu.cit.monreal.petcareplus.model.ServiceProvider;
import edu.cit.monreal.petcareplus.repository.ScheduleRepository;
import edu.cit.monreal.petcareplus.repository.ServiceProviderRepository;
import edu.cit.monreal.petcareplus.repository.ServiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ServiceProviderService {
    private final ServiceProviderRepository providerRepository;
    private final ServiceRepository serviceRepository;
    private final ScheduleRepository scheduleRepository;

    public ServiceProviderService(ServiceProviderRepository providerRepository,
                                  ServiceRepository serviceRepository,
                                  ScheduleRepository scheduleRepository) {
        this.providerRepository = providerRepository;
        this.serviceRepository = serviceRepository;
        this.scheduleRepository = scheduleRepository;
    }

    @Transactional(readOnly = true)
    public List<ServiceProvider> getAllProviders() {
        return providerRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<ServiceProvider> getProvidersByCategory(String category) {
        List<edu.cit.monreal.petcareplus.model.Service> services = serviceRepository.findByCategory(category);
        Set<Long> providerIds = services.stream()
                .map(s -> s.getProvider().getProviderId())
                .collect(Collectors.toSet());
        return providerRepository.findAll().stream()
                .filter(sp -> providerIds.contains(sp.getProviderId()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Schedule> getProviderAvailability(Long providerId) {
        return scheduleRepository.findByProviderIdAndIsAvailableTrue(providerId);
    }

    @Transactional(readOnly = true)
    public List<edu.cit.monreal.petcareplus.model.Service> getProviderServices(Long providerId) {
        return serviceRepository.findByProviderId(providerId);
    }

    @Transactional(readOnly = true)
    public List<Schedule> getProviderAvailability(Long providerId, Long serviceId, LocalDate date) {
        if (serviceId == null) {
            if (date == null) return scheduleRepository.findByProviderIdAndIsAvailableTrue(providerId);
            return scheduleRepository.findByProviderIdAndDate(providerId, date).stream()
                    .filter(s -> Boolean.TRUE.equals(s.getIsAvailable()))
                    .collect(Collectors.toList());
        }
        if (date == null) {
            return scheduleRepository.findByProviderIdAndServiceIdAndIsAvailableTrue(providerId, serviceId);
        }
        return scheduleRepository.findByProviderIdAndServiceIdAndDateAndIsAvailableTrue(providerId, serviceId, date);
    }
}
