package com.example.fitness_booking_system.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Utility class for handling JWT (JSON Web Tokens) operations.
 * This class provides methods to generate, validate, and extract information from JWT tokens.
 */
@Component
public class JwtUtil {

    /**
     * Secret key used for signing JWT tokens.
     */
    @Value("${jwt.secret:defaultSecretKey123456789012345678901234567890}")
    private String secretKey;

    /**
     * Expiration time for JWT tokens in milliseconds.
     * Default is set to 24 hours (86400000 milliseconds).
     */
    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;

    // Public method to get the signing key
    public Key getSigningKey() {
        byte[] keyBytes = secretKey.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Generation of JWT token with email and role.
    public String generateToken(String email, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        return createToken(claims, email);
    }

    // Generation of JWT token with custom claims.
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // the algorithm
                .compact();
    }

    // Getting the username from the JWT token.
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Method for getting concrete claim from JWT token.
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Method for getting all claims from JWT token.
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}