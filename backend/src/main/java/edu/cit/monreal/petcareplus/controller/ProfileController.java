// REST endpoints for profile management
package edu.cit.monreal.petcareplus.controller;

import edu.cit.monreal.petcareplus.dto.profile.ProfileRequest;
import edu.cit.monreal.petcareplus.dto.profile.ProfileResponse;
import edu.cit.monreal.petcareplus.exception.ApiException;
import edu.cit.monreal.petcareplus.model.User;
import edu.cit.monreal.petcareplus.repository.UserRepository;
import edu.cit.monreal.petcareplus.service.ProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private final ProfileService profileService;
    private final UserRepository userRepository;

    public ProfileController(ProfileService profileService, UserRepository userRepository) {
        this.profileService = profileService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile() {
        Long userId = currentUserId();
        return ResponseEntity.ok(profileService.getProfile(userId));
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(@RequestBody ProfileRequest request) {
        Long userId = currentUserId();
        return ResponseEntity.ok(profileService.updateProfile(userId, request));
    }

    private Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("DB-001", "Resource not found", "User not found", HttpStatus.NOT_FOUND));
        return user.getId();
    }
}

