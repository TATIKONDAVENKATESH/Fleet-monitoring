package com.example.backend.repository;

import com.example.backend.entity.LocationHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface LocationHistoryRepository extends JpaRepository<LocationHistory, Long> {

    Page<LocationHistory> findByVehicleIdAndRecordedAtBetweenOrderByRecordedAtDesc(
            Long vehicleId, LocalDateTime start, LocalDateTime end, Pageable pageable);

    List<LocationHistory> findByVehicleIdAndRecordedAtBetweenOrderByRecordedAtAsc(
            Long vehicleId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT l FROM LocationHistory l WHERE l.vehicle.id = :vehicleId ORDER BY l.recordedAt DESC")
    List<LocationHistory> findLatestByVehicleId(@Param("vehicleId") Long vehicleId, Pageable pageable);
}