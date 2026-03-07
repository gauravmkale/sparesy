package com.sparesy.auth.security;

import com.sparesy.auth.enums.CompanyType;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

// @Component tells Spring to manage this class as a bean
// meaning you can @Autowired it anywhere you need it
@Component
public class JwtUtil {

    // @Value reads from application.properties
    // ${jwt.secret} maps to jwt.secret
    @Value("${jwt.secret}")
    private String secret;

    // ${jwt.expiration} maps to jwt.expiration=86400000 (24 hours in ms)
    @Value("${jwt.expiration}")
    private Long expiration;

    // Converts the secret string into a cryptographic Key object
    // Keys.hmacShaKeyFor needs a byte array, so we convert the string
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    // Builds and signs the JWT token
    // We store companyId and companyType as claims inside the token
    public String generateToken(Long companyId, CompanyType companyType) {
        return Jwts.builder()
                // subject = who this token belongs to
                .setSubject(String.valueOf(companyId))
                // claims = extra data we pack into the token
                .claim("companyId", companyId)
                .claim("companyType", companyType.name())
                .setIssuedAt(new Date())
                // expiration = now + 86400000ms (24 hours)
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Validates the token — returns true if valid, false if expired or tampered
    public boolean validateToken(String token) {
        try {
            // parse() will throw an exception if token is invalid or expired
            // if no exception is thrown, the token is valid
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            // Any exception means the token is bad
            return false;
        }
    }

    // Extracts all the data packed inside the token
    // Claims is like a Map — key/value pairs stored in the token
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public Long extractCompanyId(String token) {
        // We stored companyId as a claim — now we read it back
        // get() returns Object so we cast to Integer first then to Long
        return ((Integer) extractAllClaims(token).get("companyId")).longValue();
    }

    public CompanyType extractCompanyType(String token) {
        // We stored companyType as a string e.g. "MANUFACTURER"
        // CompanyType.valueOf converts that string back to the enum
        String type = (String) extractAllClaims(token).get("companyType");
        return CompanyType.valueOf(type);
    }
}
