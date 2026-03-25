// Business logic for authentication: register, login, logout
package edu.cit.monreal.petcareplus.service;

import edu.cit.monreal.petcareplus.dto.auth.*;
import edu.cit.monreal.petcareplus.exception.ApiException;
import edu.cit.monreal.petcareplus.model.*;
import edu.cit.monreal.petcareplus.repository.*;
import edu.cit.monreal.petcareplus.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final ServiceProviderRepository serviceProviderRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${jwt.refresh-expiration:604800000}")
    private long refreshExpirationMs;

    public AuthService(UserRepository userRepository,
                       ProfileRepository profileRepository,
                       ServiceProviderRepository serviceProviderRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       BCryptPasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.serviceProviderRepository = serviceProviderRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        Optional<User> existing = userRepository.findByEmail(request.getEmail());
        if (existing.isPresent()) {
            throw new ApiException("DB-002", "Duplicate entry", "Email already registered", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();
        user = userRepository.save(user);

        Profile profile = Profile.builder()
                .user(user)
                .fullName((request.getFirstname() + " " + request.getLastname()).trim())
                .build();
        profileRepository.save(profile);

        if ("SERVICE_PROVIDER".equalsIgnoreCase(request.getRole())) {
            ServiceProvider sp = ServiceProvider.builder()
                    .user(user)
                    .businessName(null)
                    .description(null)
                    .build();
            serviceProviderRepository.save(sp);
        }

        String access = jwtUtil.generateAccessToken(user.getEmail(), user.getRole());
        String refresh = jwtUtil.generateRefreshToken(user.getEmail());

        RefreshToken refreshEntity = RefreshToken.builder()
                .user(user)
                .token(refresh)
                .expiresAt(LocalDateTime.now().plusSeconds(refreshExpirationMs / 1000))
                .build();
        refreshTokenRepository.save(refreshEntity);

        UserDto userDto = UserDto.builder()
                .email(user.getEmail())
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .role(user.getRole())
                .build();

        return AuthResponse.builder()
                .success(true)
                .accessToken(access)
                .refreshToken(refresh)
                .user(userDto)
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("AUTH-001", "Invalid credentials", "Email or password is incorrect", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ApiException("AUTH-001", "Invalid credentials", "Email or password is incorrect", HttpStatus.UNAUTHORIZED);
        }

        String access = jwtUtil.generateAccessToken(user.getEmail(), user.getRole());
        String refresh = jwtUtil.generateRefreshToken(user.getEmail());

        refreshTokenRepository.deleteByUserId(user.getId());
        RefreshToken refreshEntity = RefreshToken.builder()
                .user(user)
                .token(refresh)
                .expiresAt(LocalDateTime.now().plusSeconds(refreshExpirationMs / 1000))
                .build();
        refreshTokenRepository.save(refreshEntity);

        String firstname = null;
        String lastname = null;
        Optional<Profile> p = profileRepository.findByUserId(user.getId());
        if (p.isPresent() && p.get().getFullName() != null) {
            String[] parts = p.get().getFullName().trim().split(" ", 2);
            firstname = parts.length > 0 ? parts[0] : null;
            lastname = parts.length > 1 ? parts[1] : null;
        }

        UserDto userDto = UserDto.builder()
                .email(user.getEmail())
                .firstname(firstname)
                .lastname(lastname)
                .role(user.getRole())
                .build();

        return AuthResponse.builder()
                .success(true)
                .accessToken(access)
                .refreshToken(refresh)
                .user(userDto)
                .build();
    }

    @Transactional
    public void logout(String token) {
        refreshTokenRepository.findByToken(token).ifPresent(rt -> refreshTokenRepository.delete(rt));
    }
}
