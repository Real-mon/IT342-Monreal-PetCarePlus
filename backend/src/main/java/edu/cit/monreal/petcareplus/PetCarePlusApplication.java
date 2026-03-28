// Main Spring Boot application entry point for PetCarePlus
package edu.cit.monreal.petcareplus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PetCarePlusApplication {
    public static void main(String[] args) {
        String configuredUrl = System.getProperty("spring.datasource.url");
        if (configuredUrl == null || configuredUrl.isBlank()) configuredUrl = System.getenv("SPRING_DATASOURCE_URL");
        if (configuredUrl == null || configuredUrl.isBlank()) configuredUrl = System.getenv("SUPABASE_DB_URL");

        boolean hasPostgresUrl = configuredUrl != null && configuredUrl.trim().toLowerCase().startsWith("jdbc:postgresql://");
        if (!hasPostgresUrl) {
            String h2Url = "jdbc:h2:mem:petcareplus;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE";

            System.setProperty("spring.datasource.url", h2Url);
            System.setProperty("spring.datasource.username", "sa");
            System.setProperty("spring.datasource.password", "");
            System.setProperty("spring.datasource.driver-class-name", "org.h2.Driver");
            System.setProperty("spring.jpa.properties.hibernate.dialect", "org.hibernate.dialect.H2Dialect");

            System.setProperty("SUPABASE_DB_URL", h2Url);
            System.setProperty("SUPABASE_DB_USER", "sa");
            System.setProperty("SUPABASE_DB_PASSWORD", "");
            System.setProperty("DB_DRIVER_CLASS", "org.h2.Driver");
            System.setProperty("HIBERNATE_DIALECT", "org.hibernate.dialect.H2Dialect");
        }
        SpringApplication.run(PetCarePlusApplication.class, args);
    }
}

