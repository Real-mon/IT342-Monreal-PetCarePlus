// Spring Data JPA repository for Service entity
package edu.cit.monreal.petcareplus.repository;

import edu.cit.monreal.petcareplus.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findByCategory(String category);

    @Query("select s from Service s where s.provider.providerId = :providerId")
    List<Service> findByProviderId(@Param("providerId") Long providerId);
}

