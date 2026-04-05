// Spring Data JPA repository for Booking entity
package edu.cit.monreal.petcareplus.repository;

import edu.cit.monreal.petcareplus.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    @Query("select b from Booking b where b.petOwner.id = :petOwnerId")
    List<Booking> findByPetOwnerId(@Param("petOwnerId") Long petOwnerId);

    @Query("select b from Booking b where b.schedule.provider.providerId = :providerId")
    List<Booking> findByScheduleProviderId(@Param("providerId") Long providerId);
}

