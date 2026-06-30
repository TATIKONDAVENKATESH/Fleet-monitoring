package com.example.backend.entity;

import com.example.backend.constant.AlertType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "alerts", indexes = {
        @Index(name = "idx_alerts_vehicle", columnList = "vehicle_id"),
        @Index(name = "idx_alerts_type", columnList = "alert_type"),
        @Index(name = "idx_alerts_created", columnList = "created_at DESC"),
        @Index(name = "idx_alerts_acknowledged", columnList = "acknowledged")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Alert extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false)
    private AlertType alertType;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    @Builder.Default
    private Boolean acknowledged = false;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "geofence_id")
    private Geofence geofence;
}