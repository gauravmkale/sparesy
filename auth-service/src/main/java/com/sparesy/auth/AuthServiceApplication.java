package com.sparesy.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class AuthServiceApplication {
    // Entry point for the auth-service.
    // Spring Boot will:
    // 1. Start an embedded Tomcat server on port 8081
    // 2. Scan all classes under com.sparesy.auth
    // 3. Set up database connection, security, and JWT config automatically

    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }

    // Exposes BCryptPasswordEncoder as a managed Spring bean.
    // This allows @Autowired injection in AuthService instead of using 'new',
    // making it a proper singleton that Spring can intercept and manage.
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
