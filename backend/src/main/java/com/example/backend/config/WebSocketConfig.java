package com.example.backend.config;

import com.example.backend.websocket.WebSocketAuthChannelInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket / STOMP configuration.
 *
 * FIX H2: Added WebSocketAuthChannelInterceptor to the inbound channel so
 * every STOMP CONNECT frame is validated against the JWT before a subscription
 * is established.  The raw WebSocket HTTP-upgrade path (/ws/**) is still
 * PUBLIC in SecurityConfig (required for SockJS handshake), but the STOMP
 * session-level auth happens here.
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthChannelInterceptor wsAuthInterceptor;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/tracking")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Clients subscribe to /topic/... destinations
        registry.enableSimpleBroker("/topic");
        // Controller @MessageMapping methods are prefixed with /app
        registry.setApplicationDestinationPrefixes("/app");
    }

    /**
     * Register the JWT interceptor on the inbound channel.
     * This fires before any @MessageMapping or broker subscription.
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(wsAuthInterceptor);
    }
}