package com.example.fitness_booking_system.security;

import com.example.fitness_booking_system.entities.User;
import com.example.fitness_booking_system.repositories.UserRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.core.userdetails.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

/**
 * Filter for JWT authentication in the fitness booking system.
 * This filter checks for the presence of a JWT token in the request header,
 * validates it, and sets the authentication in the security context if valid.
 * It extracts the user details and role from the token,
 * and creates an authentication object to be used by Spring Security.
 * * If the token is invalid or expired, it logs the error but does not stop the request processing.
 * * This allows the request to continue even if the user is not authenticated,
 * which is useful for public endpoints or when the user is not required to be authenticated.
 *
 * * This filter extends OncePerRequestFilter to ensure it is executed once per request.
 * * The filter is registered as a Spring component, allowing it to be automatically detected and used by the Spring Security framework.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    /**
     * JwtUtil instance for handling JWT operations.
     */
    private final JwtUtil jwtUtil;
    /**
     * UserRepository instance for fetching user details from the database.
     */
    private final UserRepository userRepository;

    @Autowired
    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    /**
     * This method is called for every request to check if the user is authenticated.
     * It extracts the JWT token from the Authorization header, validates it,
     * gets the user details from the token (email and role), and creates an authentication object UserDetails.
     *
     * @param request  The HTTP request
     * @param response The HTTP response
     * @param filterChain The filter chain to continue processing the request
     * @throws ServletException If an error occurs during request processing
     * @throws IOException If an I/O error occurs
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        // If the Authorization header is missing or does not start with "Bearer", continue without authentication
        // This allows public endpoints to be accessed without authentication
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Geт the token from the Authorization header
        final String token = authorizationHeader.substring(7);

        try {
            // Use JwtUtil to extract the username from the token
            String email = jwtUtil.extractUsername(token);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Extract all claims from the token to get the role
                Claims claims = jwtUtil.extractAllClaims(token);
                String role = (String) claims.get("role");

                // Check if the user exists in the database
                Optional<User> userOpt = userRepository.findByEmail(email);
                if (userOpt.isPresent()) {

                    // Create a UserDetails object with the user's email and role
                    UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                            email,
                            "",
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                    );

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Set the authentication in the SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }

        } catch (SignatureException | MalformedJwtException | ExpiredJwtException | UnsupportedJwtException |
                 IllegalArgumentException e) {
            // Log the error if the token is invalid or expired
            logger.error("JWT Token error: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}