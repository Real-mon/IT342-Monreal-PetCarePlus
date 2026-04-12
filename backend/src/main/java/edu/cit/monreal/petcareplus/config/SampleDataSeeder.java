package edu.cit.monreal.petcareplus.config;

import edu.cit.monreal.petcareplus.model.ServiceProvider;
import edu.cit.monreal.petcareplus.model.User;
import edu.cit.monreal.petcareplus.repository.ServiceProviderRepository;
import edu.cit.monreal.petcareplus.repository.ServiceRepository;
import edu.cit.monreal.petcareplus.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Component
public class SampleDataSeeder implements ApplicationRunner {
    private final UserRepository userRepository;
    private final ServiceProviderRepository serviceProviderRepository;
    private final ServiceRepository serviceRepository;

    public SampleDataSeeder(UserRepository userRepository, ServiceProviderRepository serviceProviderRepository, ServiceRepository serviceRepository) {
        this.userRepository = userRepository;
        this.serviceProviderRepository = serviceProviderRepository;
        this.serviceRepository = serviceRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        String email = System.getenv().getOrDefault("SEED_PROVIDER_EMAIL", "markallen@email.com").trim();
        if (email.isEmpty()) return;

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return;
        if (user.getRole() == null || !user.getRole().equalsIgnoreCase("SERVICE_PROVIDER")) return;

        ServiceProvider provider = serviceProviderRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    ServiceProvider sp = new ServiceProvider();
                    sp.setUser(user);
                    sp.setBusinessName("Mark Allen");
                    return serviceProviderRepository.save(sp);
                });

        List<edu.cit.monreal.petcareplus.model.Service> existing = serviceRepository.findByProviderId(provider.getProviderId());
        Set<String> existingNames = new HashSet<>();
        for (edu.cit.monreal.petcareplus.model.Service s : existing) {
            if (s != null && s.getName() != null) existingNames.add(s.getName().toLowerCase(Locale.ROOT));
        }

        seedServiceIfMissing(provider, existingNames, "Full grooming", "GROOMING", "Full grooming package", new BigDecimal("500.00"), 90);
        seedServiceIfMissing(provider, existingNames, "Basic grooming", "GROOMING", "Basic grooming package", new BigDecimal("350.00"), 60);
        seedServiceIfMissing(provider, existingNames, "Vet Check-up", "VETERINARY", "General consultation", new BigDecimal("300.00"), 30);
        seedServiceIfMissing(provider, existingNames, "Vaccination", "VETERINARY", "Routine vaccination", new BigDecimal("450.00"), 30);

        serviceRepository.flush();
    }

    private void seedServiceIfMissing(
            ServiceProvider provider,
            Set<String> existingNames,
            String name,
            String category,
            String description,
            BigDecimal price,
            int durationMinutes
    ) {
        if (existingNames.contains(name.toLowerCase(Locale.ROOT))) return;
        edu.cit.monreal.petcareplus.model.Service service = edu.cit.monreal.petcareplus.model.Service.builder()
                .provider(provider)
                .category(category)
                .name(name)
                .description(description)
                .price(price)
                .durationMinutes(durationMinutes)
                .build();
        serviceRepository.save(service);
        existingNames.add(name.toLowerCase(Locale.ROOT));
    }
}

