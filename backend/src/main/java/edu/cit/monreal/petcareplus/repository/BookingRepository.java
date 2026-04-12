// Spring Data JPA repository for Booking entity
package edu.cit.monreal.petcareplus.repository;

import edu.cit.monreal.petcareplus.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    @Query("select b from Booking b where b.petOwner.id = :petOwnerId")
    List<Booking> findByPetOwnerId(@Param("petOwnerId") Long petOwnerId);

    @Query("select b from Booking b where b.schedule.provider.providerId = :providerId")
    List<Booking> findByScheduleProviderId(@Param("providerId") Long providerId);

    @Query("select b from Booking b where b.schedule.provider.providerId = :providerId and b.schedule.date between :start and :end")
    List<Booking> findByProviderIdAndScheduleDateBetween(@Param("providerId") Long providerId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("select b from Booking b where b.bookingId = :bookingId and b.petOwner.id = :petOwnerId")
    Optional<Booking> findByIdAndPetOwnerId(@Param("bookingId") Long bookingId, @Param("petOwnerId") Long petOwnerId);
}
