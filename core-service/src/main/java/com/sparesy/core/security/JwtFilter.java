package com.sparesy.core.security;

import com.sparesy.core.enums.CompanyType;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.Key;

//@Component tells Spring to automatically detect and register this class as a bean. 
// Once registered, Spring Security can place it inside the filter chain.
@Component
public class JwtFilter extends OncePerRequestFilter {

    // Same secret as auth-service — must match exactly
    @Value("${jwt.secret}")
    private String secret;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Always clean up CompanyContext at the start —
        // just in case a previous request on this thread left something behind
        CompanyContext.clear();

        String authHeader = request.getHeader("Authorization");

        // If no Bearer token is present, let the request continue —
        // SecurityConfig will reject it if the endpoint requires authentication
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7); // strip "Bearer " prefix

        try {
            Key key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

            // Parse and validate the token — throws exception if expired or tampered
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // Extract companyId and companyType from token claims
            Long companyId = claims.get("companyId", Long.class);
            String companyTypeStr = claims.get("companyType", String.class);
            CompanyType companyType = CompanyType.valueOf(companyTypeStr);

            // Store in CompanyContext so any service can read it
            CompanyContext.setCurrentCompanyId(companyId);
            CompanyContext.setCurrentCompanyType(companyType);

            // Tell Spring Security this request is authenticated —
            // no roles needed here, CompanyContext handles our role logic
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(companyId, null, null);
            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (Exception e) {
            // Token is invalid or expired — clear everything and return 401
            CompanyContext.clear();
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Invalid or expired token");
            return;
        }

        // Token was valid — continue to the controller
        filterChain.doFilter(request, response);
    }
}