package com.example.backend.service;

import com.example.backend.constant.AlertType;
import com.example.backend.dto.response.AlertResponse;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.entity.Alert;
import com.example.backend.entity.Geofence;
import com.example.backend.entity.Vehicle;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.mapper.AlertMapper;
import com.example.backend.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final AlertRepository alertRepository;
    private final AlertMapper alertMapper;

    @Transactional(readOnly = true)
    public PageResponse<AlertResponse> findAll(Pageable pageable) {
        return toPageResponse(alertRepository.findAll(pageable));
    }

    @Transactional(readOnly = true)
    public PageResponse<AlertResponse> findUnacknowledged(Pageable pageable) {
        return toPageResponse(alertRepository.findByAcknowledgedFalseOrderByCreatedAtDesc(pageable));
    }

    @Transactional(readOnly = true)
    public PageResponse<AlertResponse> findByVehicle(Long vehicleId, Pageable pageable) {
        return toPageResponse(alertRepository.findByVehicleIdOrderByCreatedAtDesc(vehicleId, pageable));
    }

    @Transactional
    public AlertResponse acknowledge(Long id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found: " + id));
        alert.setAcknowledged(true);
        alert.setAcknowledgedAt(LocalDateTime.now());
        return alertMapper.toResponse(alertRepository.save(alert));
    }

    /**
     * BUG FIX B9: New method supporting the acknowledgeAll controller endpoint.
     */
    @Transactional
    public void acknowledgeAll() {
        List<Alert> unacked = alertRepository.findByAcknowledgedFalse();
        LocalDateTime now = LocalDateTime.now();
        unacked.forEach(a -> {
            a.setAcknowledged(true);
            a.setAcknowledgedAt(now);
        });
        alertRepository.saveAll(unacked);
        log.info("Acknowledged {} alerts", unacked.size());
    }

    @Transactional
    public Alert createAlert(Vehicle vehicle, AlertType type, String message, Geofence geofence) {
        if (type == AlertType.OVERSPEED || type == AlertType.OFFLINE) {
            List<Alert> existing = alertRepository
                    .findByVehicleIdAndAlertTypeAndAcknowledgedFalse(vehicle.getId(), type);
            if (!existing.isEmpty()) {
                log.debug("Skipping duplicate {} alert for vehicle {}", type, vehicle.getId());
                return existing.get(0);
            }
        }

        Alert alert = Alert.builder()
                .vehicle(vehicle)
                .alertType(type)
                .message(message)
                .geofence(geofence)
                .build();

        alert = alertRepository.save(alert);
        log.info("Created {} alert for vehicle {}: {}", type, vehicle.getVehicleNumber(), message);
        return alert;
    }

    private PageResponse<AlertResponse> toPageResponse(Page<Alert> page) {
        return PageResponse.<AlertResponse>builder()
                .content(page.getContent().stream().map(alertMapper::toResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}