package com.example.backend.repository;

import com.example.backend.constant.DriverStatus;
import com.example.backend.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DriverRepository extends JpaRepository<Driver, Long> {
    boolean existsByLicenseNumber(String licenseNumber);

    // BUG FIX B8: needed by DashboardService for availableDrivers count
    long countByStatus(DriverStatus status);
}