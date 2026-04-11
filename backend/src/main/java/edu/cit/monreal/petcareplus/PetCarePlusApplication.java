// Main Spring Boot application entry point for PetCarePlus
package edu.cit.monreal.petcareplus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

@SpringBootApplication
@RestController
public class PetCarePlusApplication {
    @GetMapping("/")
    public Map<String, Object> root() {
        return Map.of(
                "success", true,
                "message", "PetCare+ API is running",
                "docs", "/swagger-ui.html"
        );
    }

    public static void main(String[] args) {
        applySupabaseEnvFileOverrides();
        SpringApplication.run(PetCarePlusApplication.class, args);
    }

    private static void applySupabaseEnvFileOverrides() {
        String existingUrl = System.getProperty("spring.datasource.url");
        if (existingUrl == null || existingUrl.isBlank()) existingUrl = System.getenv("SPRING_DATASOURCE_URL");
        boolean alreadyPostgres = existingUrl != null && existingUrl.trim().toLowerCase().startsWith("jdbc:postgresql://");
        if (alreadyPostgres) return;

        Map<String, String> envFile = readDotEnvFile(".env");
        String supabaseUrl = envFile.get("SUPABASE_DB_URL");
        String supabaseUser = envFile.get("SUPABASE_DB_USER");
        String supabasePassword = envFile.get("SUPABASE_DB_PASSWORD");
        String jwtSecret = envFile.get("JWT_SECRET");

        if (supabaseUrl == null || supabaseUrl.isBlank()) return;

        System.setProperty("spring.datasource.url", supabaseUrl);
        if (supabaseUser != null) System.setProperty("spring.datasource.username", supabaseUser);
        if (supabasePassword != null) System.setProperty("spring.datasource.password", supabasePassword);
        System.setProperty("spring.datasource.driver-class-name", "org.postgresql.Driver");
        System.setProperty("spring.jpa.properties.hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");

        if (jwtSecret != null && !jwtSecret.isBlank()) {
            System.setProperty("jwt.secret", jwtSecret);
        }
    }

    private static Map<String, String> readDotEnvFile(String fileName) {
        Path path = Path.of(fileName);
        if (!Files.exists(path)) return Map.of();

        try {
            return Files.readAllLines(path).stream()
                    .map(String::trim)
                    .filter(line -> !line.isBlank())
                    .filter(line -> !line.startsWith("#"))
                    .filter(line -> line.contains("="))
                    .collect(java.util.stream.Collectors.toUnmodifiableMap(
                            line -> line.substring(0, line.indexOf('=')).trim(),
                            line -> line.substring(line.indexOf('=') + 1).trim(),
                            (a, b) -> b
                    ));
        } catch (IOException e) {
            return Map.of();
        }
    }
}
