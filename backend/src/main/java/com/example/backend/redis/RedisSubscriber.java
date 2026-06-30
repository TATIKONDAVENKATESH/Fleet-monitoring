package com.example.backend.redis;

import com.example.backend.websocket.LocationWebSocketHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RedisSubscriber implements MessageListener {

    private final LocationWebSocketHandler locationWebSocketHandler;
    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String channel = new String(message.getChannel());
            Object payload = redisTemplate.getValueSerializer().deserialize(message.getBody());
            log.debug("Received message on channel {}", channel);

            if (RedisKeyConstants.LOCATION_CHANNEL.equals(channel)) {
                locationWebSocketHandler.broadcastLocationUpdate(payload);
            } else if (RedisKeyConstants.ALERT_CHANNEL.equals(channel)) {
                locationWebSocketHandler.broadcastAlertUpdate(payload);
            }
        } catch (Exception e) {
            log.error("Error processing Redis message: {}", e.getMessage());
        }
    }
}