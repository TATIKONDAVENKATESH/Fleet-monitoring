package com.example.backend.repository;

import com.example.backend.entity.Geofence;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GeofenceRepository extends JpaRepository<Geofence, Long> {
    List<Geofence> findByActiveTrue();
    boolean existsByName(String name);
}