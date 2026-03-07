// This service handles user registration, password hashing, login, and JWT generation
package edu.cit.monreal.petcareplus.service;

import edu.cit.monreal.petcareplus.dto.AuthResponse;
import edu.cit.monreal.petcareplus.dto.LoginRequest;
import edu.cit.monreal.petcareplus.dto.RegisterRequest;
import edu.cit.monreal.petcareplus.exception.DuplicateEmailException;
import edu.cit.monreal.petcareplus.model.User;
import edu.cit.monreal.petcareplus.repository.UserRepository;
import edu.cit.monreal.petcareplus.security.JwtUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       BCryptPasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        Optional<User> existing = userRepository.findByEmail(request.getEmail());
        if (existing.isPresent()) {
            throw new DuplicateEmailException("Email already in use");
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
        return new AuthResponse(null, "Registration successful!");
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, "Login successful");
    }
}
