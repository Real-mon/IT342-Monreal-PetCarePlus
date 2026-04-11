// REST endpoints for authentication
package edu.cit.monreal.petcareplus.controller;

import edu.cit.monreal.petcareplus.dto.auth.AuthResponse;
import edu.cit.monreal.petcareplus.dto.auth.LoginRequest;
import edu.cit.monreal.petcareplus.dto.auth.RegisterRequest;
import edu.cit.monreal.petcareplus.service.AuthService;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/role")
    public ResponseEntity<Map<String, Object>> getRoleByEmail(@RequestParam("email") String email) {
        String role = authService.lookupRoleByEmail(email);
        Map<String, Object> payload = new HashMap<>();
        payload.put("success", true);
        payload.put("role", role);
        return ResponseEntity.ok(payload);
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(@RequestHeader(name = "Authorization", required = false) String authorization) {
        String token = null;
        if (authorization != null && authorization.startsWith("Bearer ")) {
            token = authorization.substring(7);
        }
        if (token != null) {
            authService.logout(token);
        }
        return ResponseEntity.ok(AuthResponse.builder().success(true).build());
    }
}
