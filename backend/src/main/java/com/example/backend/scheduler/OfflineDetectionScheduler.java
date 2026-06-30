package com.example.backend.scheduler;

import com.example.backend.constant.AlertType;
import com.example.backend.constant.VehicleStatus;
import com.example.backend.dto.response.AlertResponse;
import com.example.backend.entity.Alert;
import com.example.backend.entity.Vehicle;
import com.example.backend.mapper.AlertMapper;
import com.example.backend.redis.RedisKeyConstants;
import com.example.backend.redis.RedisPublisher;
import com.example.backend.repository.VehicleRepository;
import com.example.backend.service.AlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OfflineDetectionScheduler {

    private final VehicleRepository vehicleRepository;
    private final AlertService alertService;
    private final AlertMapper alertMapper;
    private final RedisPublisher redisPublisher;
    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${app.fleet.offline-threshold-minutes:5}")
    private int offlineThresholdMinutes;

    @Scheduled(fixedDelay = 60_000)
    public void detectOfflineVehicles() {
        log.debug("Running offline detection scan");

        List<Vehicle> activeVehicles = vehicleRepository.findByStatus(VehicleStatus.ACTIVE);
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(offlineThresholdMinutes);

        for (Vehicle vehicle : activeVehicles) {
            Object raw = readLastSeen(RedisKeyConstants.vehicleLastSeen(vehicle.getId()));

            boolean isOffline;

            if (raw == null) {
                isOffline = true;
            } else {
                String lastSeenStr = raw.toString().replace("\"", "");
                try {
                    LocalDateTime lastSeen = LocalDateTime.parse(lastSeenStr);
                    isOffline = lastSeen.isBefore(threshold);
                } catch (Exception e) {
                    log.warn("Could not parse last_seen timestamp for vehicle {}: '{}'",
                            vehicle.getId(), lastSeenStr);
                    isOffline = true;
                }
            }

            if (isOffline) {
                log.info("Vehicle {} is OFFLINE (no update for {} min)",
                        vehicle.getVehicleNumber(), offlineThresholdMinutes);
                markOffline(vehicle.getId());
            }
        }
    }

    @Transactional
    public void markOffline(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElse(null);
        if (vehicle == null || vehicle.getStatus() == VehicleStatus.OFFLINE) return;

        vehicle.setStatus(VehicleStatus.OFFLINE);
        vehicleRepository.save(vehicle);

        Alert alert = alertService.createAlert(vehicle, AlertType.OFFLINE,
                String.format("Vehicle %s has gone offline (no update for %d minutes)",
                        vehicle.getVehicleNumber(), offlineThresholdMinutes), null);

        AlertResponse alertResponse = alertMapper.toResponse(alert);
        redisPublisher.publish(RedisKeyConstants.ALERT_CHANNEL, alertResponse);
    }

    private Object readLastSeen(String key) {
        try {
            return redisTemplate.opsForValue().get(key);
        } catch (Exception e) {
            log.error("Failed to read Redis key {}: {}", key, e.getMessage());
            return null;
        }
    }
}
