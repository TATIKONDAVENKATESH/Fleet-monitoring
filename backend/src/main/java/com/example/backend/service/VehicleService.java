package com.example.backend.service;

import com.example.backend.constant.VehicleStatus;
import com.example.backend.dto.request.VehicleRequest;
import com.example.backend.dto.response.VehicleResponse;
import com.example.backend.entity.Driver;
import com.example.backend.entity.Vehicle;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.mapper.VehicleMapper;
import com.example.backend.repository.DriverRepository;
import com.example.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final VehicleMapper vehicleMapper;

    @Transactional(readOnly = true)
    public Page<VehicleResponse> findAll(Pageable pageable) {
        return vehicleRepository.findAll(pageable).map(vehicleMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public VehicleResponse findById(Long id) {
        return vehicleMapper.toResponse(getVehicle(id));
    }

    @Transactional
    public VehicleResponse create(VehicleRequest request) {
        if (vehicleRepository.existsByVehicleNumber(request.getVehicleNumber())) {
            throw new DuplicateResourceException("Vehicle number already exists: " + request.getVehicleNumber());
        }
        if (vehicleRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new DuplicateResourceException("Registration number already exists: " + request.getRegistrationNumber());
        }

        Vehicle vehicle = Vehicle.builder()
                .vehicleNumber(request.getVehicleNumber())
                .vehicleType(request.getVehicleType())
                .registrationNumber(request.getRegistrationNumber())
                .driver(resolveDriver(request.getDriverId()))
                .build();

        return vehicleMapper.toResponse(vehicleRepository.save(vehicle));
    }

    @Transactional
    public VehicleResponse update(Long id, VehicleRequest request) {
        Vehicle vehicle = getVehicle(id);

        if (!vehicle.getVehicleNumber().equals(request.getVehicleNumber())
                && vehicleRepository.existsByVehicleNumber(request.getVehicleNumber())) {
            throw new DuplicateResourceException("Vehicle number already exists: " + request.getVehicleNumber());
        }
        if (!vehicle.getRegistrationNumber().equals(request.getRegistrationNumber())
                && vehicleRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new DuplicateResourceException("Registration number already exists: " + request.getRegistrationNumber());
        }

        vehicle.setVehicleNumber(request.getVehicleNumber());
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setRegistrationNumber(request.getRegistrationNumber());
        vehicle.setDriver(resolveDriver(request.getDriverId()));

        return vehicleMapper.toResponse(vehicleRepository.save(vehicle));
    }

    @Transactional
    public void delete(Long id) {
        if (!vehicleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Vehicle not found: " + id);
        }
        vehicleRepository.deleteById(id);
    }

    @Transactional
    public VehicleResponse updateStatus(Long id, VehicleStatus status) {
        Vehicle vehicle = getVehicle(id);
        vehicle.setStatus(status);
        return vehicleMapper.toResponse(vehicleRepository.save(vehicle));
    }

    /**
     * FIX M7: Added @Transactional so this helper method participates in
     * the caller's transaction (e.g. TrackingService.processLocation).
     * Without it, Hibernate may throw a LazyInitializationException when
     * accessing LAZY relationships (e.g. vehicle.getDriver()) outside a session.
     */
    @Transactional
    public Vehicle getVehicle(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found: " + id));
    }

    private Driver resolveDriver(Long driverId) {
        if (driverId == null) return null;
        return driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found: " + driverId));
    }
}