// Spring Data JPA repository for Schedule entity
package edu.cit.monreal.petcareplus.repository;

import edu.cit.monreal.petcareplus.model.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    @Query("select s from Schedule s where s.provider.providerId = :providerId and s.isAvailable = true")
    List<Schedule> findByProviderIdAndIsAvailableTrue(@Param("providerId") Long providerId);

    @Query("select s from Schedule s where s.provider.providerId = :providerId and s.date = :date")
    List<Schedule> findByProviderIdAndDate(@Param("providerId") Long providerId, @Param("date") LocalDate date);
}

