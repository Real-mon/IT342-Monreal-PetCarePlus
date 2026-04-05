// Spring Data JPA repository for ServiceProvider entity
package edu.cit.monreal.petcareplus.repository;

import edu.cit.monreal.petcareplus.model.ServiceProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ServiceProviderRepository extends JpaRepository<ServiceProvider, Long> {
    @Query("select sp from ServiceProvider sp where sp.user.id = :userId")
    Optional<ServiceProvider> findByUserId(@Param("userId") Long userId);

    List<ServiceProvider> findAll();
}

