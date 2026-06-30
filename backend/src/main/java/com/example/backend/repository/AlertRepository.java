package com.example.backend.repository;

import com.example.backend.constant.AlertType;
import com.example.backend.entity.Alert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {

    Page<Alert> findByVehicleIdOrderByCreatedAtDesc(Long vehicleId, Pageable pageable);

    Page<Alert> findByAcknowledgedFalseOrderByCreatedAtDesc(Pageable pageable);

    // BUG FIX B9: list variant needed by acknowledgeAll()
    List<Alert> findByAcknowledgedFalse();

    long countByAcknowledgedFalse();

    List<Alert> findByVehicleIdAndAlertTypeAndAcknowledgedFalse(Long vehicleId, AlertType alertType);

    @Query("SELECT COUNT(a) FROM Alert a")
    long countTotal();
}