// This controller exposes REST endpoints for user registration and login
package edu.cit.monreal.petcareplus.controller;

import edu.cit.monreal.petcareplus.dto.AuthResponse;
import edu.cit.monreal.petcareplus.dto.LoginRequest;
import edu.cit.monreal.petcareplus.dto.RegisterRequest;
import edu.cit.monreal.petcareplus.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Validated @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Validated @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
