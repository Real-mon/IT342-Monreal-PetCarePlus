// Business logic for retrieving and updating profiles
package edu.cit.monreal.petcareplus.service;

import edu.cit.monreal.petcareplus.dto.profile.ProfileRequest;
import edu.cit.monreal.petcareplus.dto.profile.ProfileResponse;
import edu.cit.monreal.petcareplus.exception.ApiException;
import edu.cit.monreal.petcareplus.model.Profile;
import edu.cit.monreal.petcareplus.model.User;
import edu.cit.monreal.petcareplus.repository.ProfileRepository;
import edu.cit.monreal.petcareplus.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {
    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    public ProfileService(ProfileRepository profileRepository, UserRepository userRepository) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(Long userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("DB-001", "Resource not found", "Profile not found", HttpStatus.NOT_FOUND));
        return toResponse(profile);
    }

    @Transactional
    public ProfileResponse updateProfile(Long userId, ProfileRequest request) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ApiException("DB-001", "Resource not found", "User not found", HttpStatus.NOT_FOUND));
                    Profile p = new Profile();
                    p.setUser(user);
                    return p;
                });
        profile.setFullName(request.getFullName());
        profile.setContactNumber(request.getContactNumber());
        profile.setAddress(request.getAddress());
        profile.setPhotoUrl(request.getPhotoUrl());
        profile = profileRepository.save(profile);
        return toResponse(profile);
    }

    private ProfileResponse toResponse(Profile p) {
        return ProfileResponse.builder()
                .profileId(p.getProfileId())
                .userId(p.getUser().getId())
                .fullName(p.getFullName())
                .contactNumber(p.getContactNumber())
                .address(p.getAddress())
                .photoUrl(p.getPhotoUrl())
                .build();
    }
}

