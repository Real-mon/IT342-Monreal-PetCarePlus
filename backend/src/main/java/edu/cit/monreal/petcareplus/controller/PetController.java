// REST endpoints for pet management
package edu.cit.monreal.petcareplus.controller;

import edu.cit.monreal.petcareplus.exception.ApiException;
import edu.cit.monreal.petcareplus.model.Pet;
import edu.cit.monreal.petcareplus.model.User;
import edu.cit.monreal.petcareplus.repository.PetRepository;
import edu.cit.monreal.petcareplus.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pets")
public class PetController {
    private final PetRepository petRepository;
    private final UserRepository userRepository;

    public PetController(PetRepository petRepository, UserRepository userRepository) {
        this.petRepository = petRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<PetResponse>> getMyPets() {
        requireRole("PET_OWNER");
        Long userId = currentUserId();
        List<Pet> pets = petRepository.findByOwnerId(userId);
        List<PetResponse> out = pets.stream()
                .map(p -> new PetResponse(p.getPetId(), p.getName(), p.getSpecies(), p.getBreed()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(out);
    }

    private Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("DB-001", "Resource not found", "User not found", HttpStatus.NOT_FOUND));
        return user.getId();
    }

    private void requireRole(String role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean ok = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_" + role));
        if (!ok) {
            throw new ApiException("AUTH-003", "Insufficient permissions", "Required role: " + role, HttpStatus.FORBIDDEN);
        }
    }

    public record PetResponse(Long petId, String name, String species, String breed) {}
}

