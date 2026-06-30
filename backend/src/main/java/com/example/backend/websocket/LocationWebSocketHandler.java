package com.example.backend.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class LocationWebSocketHandler {

    private final SimpMessagingTemplate messagingTemplate;

    @Async("websocketExecutor")
    public void broadcastLocationUpdate(Object payload) {
        try {
            messagingTemplate.convertAndSend("/topic/locations", payload);
            log.debug("Broadcasted location update to /topic/locations");
        } catch (Exception e) {
            log.error("Failed to broadcast location update: {}", e.getMessage());
        }
    }

    @Async("websocketExecutor")
    public void broadcastAlertUpdate(Object payload) {
        try {
            messagingTemplate.convertAndSend("/topic/alerts", payload);
            log.debug("Broadcasted alert to /topic/alerts");
        } catch (Exception e) {
            log.error("Failed to broadcast alert: {}", e.getMessage());
        }
    }
}