package edu.cit.monreal.petcareplus.features.services.service;

import edu.cit.monreal.petcareplus.common.exception.ApiException;
import edu.cit.monreal.petcareplus.features.services.model.Service;
import edu.cit.monreal.petcareplus.features.services.model.ServiceProvider;
import edu.cit.monreal.petcareplus.features.services.repository.ServiceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProviderServicesServiceTest {
    @Mock
    private ServiceRepository serviceRepository;

    @InjectMocks
    private ProviderServicesService providerServicesService;

    @Test
    void addService_withValidInputs_expectSuccess() {
        ServiceProvider provider = ServiceProvider.builder().providerId(1L).build();
        when(serviceRepository.saveAndFlush(any(Service.class))).thenAnswer(invocation -> {
            Service s = invocation.getArgument(0);
            s.setServiceId(10L);
            return s;
        });

        Service created = providerServicesService.createService(
                provider,
                "Full grooming",
                "desc",
                new BigDecimal("100.00"),
                60
        );

        assertEquals(10L, created.getServiceId());
        assertEquals("Full grooming", created.getName());
        assertEquals("GROOMING", created.getCategory());
        assertEquals(provider.getProviderId(), created.getProvider().getProviderId());
        verify(serviceRepository, times(1)).saveAndFlush(any(Service.class));
    }

    @Test
    void addService_withNameNotAllowed_expectException() {
        ServiceProvider provider = ServiceProvider.builder().providerId(1L).build();

        ApiException ex = assertThrows(ApiException.class, () ->
                providerServicesService.createService(
                        provider,
                        "Not Allowed",
                        "desc",
                        new BigDecimal("100.00"),
                        60
                )
        );

        assertEquals("BUSINESS-002", ex.getCode());
        verify(serviceRepository, never()).saveAndFlush(any(Service.class));
    }

    @Test
    void addService_withPriceZero_expectException() {
        ServiceProvider provider = ServiceProvider.builder().providerId(1L).build();

        ApiException ex = assertThrows(ApiException.class, () ->
                providerServicesService.createService(
                        provider,
                        "Full grooming",
                        "desc",
                        BigDecimal.ZERO,
                        60
                )
        );

        assertEquals("BUSINESS-003", ex.getCode());
        verify(serviceRepository, never()).saveAndFlush(any(Service.class));
    }

    @Test
    void addService_withDurationMinutesZero_expectException() {
        ServiceProvider provider = ServiceProvider.builder().providerId(1L).build();

        ApiException ex = assertThrows(ApiException.class, () ->
                providerServicesService.createService(
                        provider,
                        "Full grooming",
                        "desc",
                        new BigDecimal("100.00"),
                        0
                )
        );

        assertEquals("BUSINESS-004", ex.getCode());
        verify(serviceRepository, never()).saveAndFlush(any(Service.class));
    }

    @Test
    void deleteService_thatBelongsToLoggedInProvider_expectSuccess() {
        ServiceProvider provider = ServiceProvider.builder().providerId(1L).build();
        Service service = Service.builder().serviceId(10L).provider(provider).build();
        when(serviceRepository.findById(10L)).thenReturn(Optional.of(service));

        providerServicesService.deleteService(1L, 10L);

        verify(serviceRepository, times(1)).delete(service);
        verify(serviceRepository, times(1)).flush();
    }

    @Test
    void deleteService_thatBelongsToAnotherProvider_expectException() {
        ServiceProvider provider = ServiceProvider.builder().providerId(2L).build();
        Service service = Service.builder().serviceId(10L).provider(provider).build();
        when(serviceRepository.findById(10L)).thenReturn(Optional.of(service));

        ApiException ex = assertThrows(ApiException.class, () -> providerServicesService.deleteService(1L, 10L));

        assertEquals("AUTH-003", ex.getCode());
        verify(serviceRepository, never()).delete(any(Service.class));
        verify(serviceRepository, never()).flush();
    }
}
