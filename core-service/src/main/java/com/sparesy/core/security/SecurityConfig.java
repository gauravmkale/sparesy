package com.sparesy.core.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/*
 * SecurityConfig
 * Defines how Spring Security protects this service.
 *
 * request flow:
 *
 *      HTTP Request
 *          ↓
 *      Spring Security Filter Chain
 *          ↓
 *      JwtFilter (our custom filter)
 *          ↓
 *      Controller
 *
 * This service is stateless and uses JWT tokens,:
 * - No HTTP sessions
 * - No login form
 * - Every request must include a valid JWT
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /*
     * Our custom JWT authentication filter.
     */
    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    /*
     * Defines the main Spring Security filter chain.
     * HttpSecurity is a builder used to configure security rules.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        /*
        * CSRF (Cross-Site Request Forgery) protection is mainly required for
        * browser sessions using cookies.Since we use stateless JWT we dont require it.
        */
        http.csrf(csrf -> csrf.disable())
            /*
             * STATELESS means:
             * - Spring Security will NOT create HTTP sessions
             * - Authentication must be provided with every request (via JWT)
             */
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            /*
             * Authorization rules.
             *
             * anyRequest().authenticated() means:
             * Every endpoint in this service requires authentication.
             */
            .authorizeHttpRequests(auth -> auth
                // Permit Swagger UI paths — no JWT needed to view the docs
                .requestMatchers(
                    "/swagger-ui/**",
                    "/swagger-ui/index.html",
                    "/api-docs/**",
                    "/v3/api-docs/**"
                ).permitAll()
                // Everything else requires a valid JWT
                .anyRequest().authenticated()
            )
            /*
             * Insert our JwtFilter into the Spring Security filter chain.
             * JwtFilter will validate the token and set authentication
             * before Spring performs authorization checks.
             */
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        /*
         * Build and return the configured security filter chain.
         */
        return http.build();
    }
}