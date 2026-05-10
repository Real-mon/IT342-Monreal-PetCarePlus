package edu.cit.monreal.petcareplus.features.services.service;

import edu.cit.monreal.petcareplus.common.exception.ApiException;
import edu.cit.monreal.petcareplus.features.services.model.Service;
import edu.cit.monreal.petcareplus.features.services.model.ServiceProvider;
import edu.cit.monreal.petcareplus.features.services.repository.ServiceRepository;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.Set;

@org.springframework.stereotype.Service
public class ProviderServicesService {
    private final ServiceRepository serviceRepository;

    public ProviderServicesService(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    public Service createService(ServiceProvider provider, String name, String description, BigDecimal price, Integer durationMinutes) {
        String cleanedName = name != null ? name.trim() : null;
        if (cleanedName == null || cleanedName.isEmpty()) {
            throw new ApiException("BUSINESS-001", "Invalid service", "Service name is required", HttpStatus.BAD_REQUEST);
        }
        Set<String> allowed = Set.of("Full grooming", "Basic grooming", "Vet Check-up", "Vaccination");
        if (!allowed.contains(cleanedName)) {
            throw new ApiException("BUSINESS-002", "Invalid service", "Service name must be one of the allowed options", HttpStatus.BAD_REQUEST);
        }
        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException("BUSINESS-003", "Invalid price", "Price must be greater than 0", HttpStatus.BAD_REQUEST);
        }
        if (durationMinutes == null || durationMinutes <= 0) {
            throw new ApiException("BUSINESS-004", "Invalid duration", "Duration must be greater than 0 minutes", HttpStatus.BAD_REQUEST);
        }

        String category = (cleanedName.equals("Vet Check-up") || cleanedName.equals("Vaccination")) ? "VETERINARY" : "GROOMING";
        Service service = Service.builder()
                .provider(provider)
                .category(category)
                .name(cleanedName)
                .description(description)
                .price(price)
                .durationMinutes(durationMinutes)
                .build();
        return serviceRepository.saveAndFlush(service);
    }

    public void deleteService(Long providerId, Long serviceId) {
        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ApiException("DB-001", "Resource not found", "Service not found", HttpStatus.NOT_FOUND));
        if (service.getProvider() == null || !service.getProvider().getProviderId().equals(providerId)) {
            throw new ApiException("AUTH-003", "Insufficient permissions", "Service does not belong to current provider", HttpStatus.FORBIDDEN);
        }
        serviceRepository.delete(service);
        serviceRepository.flush();
    }
}
