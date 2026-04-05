// REST endpoints for services and providers
package edu.cit.monreal.petcareplus.controller;

import edu.cit.monreal.petcareplus.model.Schedule;
import edu.cit.monreal.petcareplus.model.Service;
import edu.cit.monreal.petcareplus.model.ServiceProvider;
import edu.cit.monreal.petcareplus.repository.ServiceRepository;
import edu.cit.monreal.petcareplus.service.ServiceProviderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ServiceController {
    private final ServiceRepository serviceRepository;
    private final ServiceProviderService providerService;

    public ServiceController(ServiceRepository serviceRepository, ServiceProviderService providerService) {
        this.serviceRepository = serviceRepository;
        this.providerService = providerService;
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

    @GetMapping("/providers/{id}/availability")
    public ResponseEntity<List<Schedule>> getAvailability(@PathVariable("id") Long providerId) {
        return ResponseEntity.ok(providerService.getProviderAvailability(providerId));
    }
}

