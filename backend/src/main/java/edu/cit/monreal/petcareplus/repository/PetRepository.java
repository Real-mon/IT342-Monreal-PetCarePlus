// Spring Data JPA repository for Pet entity
package edu.cit.monreal.petcareplus.repository;

import edu.cit.monreal.petcareplus.model.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PetRepository extends JpaRepository<Pet, Long> {
    @Query("select p from Pet p where p.owner.id = :ownerId order by p.createdAt desc")
    List<Pet> findByOwnerId(@Param("ownerId") Long ownerId);
}

