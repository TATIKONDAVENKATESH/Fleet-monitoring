package com.example.backend.websocket;

import com.example.backend.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null || !StompCommand.CONNECT.equals(accessor.getCommand())) {
            return message; // Only intercept CONNECT frames
        }

        String authHeader = accessor.getFirstNativeHeader("Authorization");
        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
            log.warn("WebSocket CONNECT rejected: missing or malformed Authorization header");
            throw new org.springframework.security.authentication.AuthenticationCredentialsNotFoundException(
                    "Missing JWT in STOMP CONNECT header");
        }

        String token = authHeader.substring(7);
        try {
            String username = jwtTokenProvider.extractUsername(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (!jwtTokenProvider.isTokenValid(token, userDetails)) {
                log.warn("WebSocket CONNECT rejected: invalid or expired JWT for user {}", username);
                throw new org.springframework.security.authentication.BadCredentialsException("Invalid JWT");
            }

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            accessor.setUser(auth);
            log.debug("WebSocket CONNECT authenticated: {}", username);

        } catch (Exception e) {
            log.warn("WebSocket CONNECT rejected: {}", e.getMessage());
            throw new org.springframework.security.authentication.BadCredentialsException(
                    "JWT validation failed: " + e.getMessage());
        }

        return message;
    }
}