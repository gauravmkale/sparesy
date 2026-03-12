package com.sparesy.auth.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

// @Configuration tells Spring this class contains configuration
// @EnableWebSecurity enables Spring Security for this application
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // @Bean tells Spring to manage the return value of this method
    // SecurityFilterChain is what Spring Security uses to decide
    // which requests need authentication and which don't
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF — not needed for REST APIs using JWT
            // CSRF is only relevant for browser form-based apps
            .csrf(csrf -> csrf.disable())

            // Tell Spring Security not to create HTTP sessions
            // JWT is stateless — every request carries its own token
            // so we don't need server-side sessions at all
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Define which endpoints need authentication
            .authorizeHttpRequests(auth -> auth
                // Allow login and register without any token
                // Anyone can hit these endpoints
                .requestMatchers(
                    "/api/auth/**",
                    "/swagger-ui/**",
                    "/swagger-ui/index.html",
                    "/api-docs/**",
                    "/v3/api-docs/**"
                ).permitAll()
                // Everything else requires authentication
                .anyRequest().authenticated());

        return http.build();
    }
}