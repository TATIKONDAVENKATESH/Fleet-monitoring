package com.example.backend.service;

import com.example.backend.constant.DriverStatus;
import com.example.backend.dto.request.DriverRequest;
import com.example.backend.dto.response.DriverResponse;
import com.example.backend.entity.Driver;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.mapper.DriverMapper;
import com.example.backend.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;
    private final DriverMapper driverMapper;

    @Transactional(readOnly = true)
    public Page<DriverResponse> findAll(Pageable pageable) {
        return driverRepository.findAll(pageable).map(driverMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public DriverResponse findById(Long id) {
        return driverMapper.toResponse(getDriver(id));
    }

    @Transactional
    public DriverResponse create(DriverRequest request) {
        if (driverRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new DuplicateResourceException("License number already exists: " + request.getLicenseNumber());
        }
        Driver driver = Driver.builder()
                .name(request.getName())
                .phoneNumber(request.getPhoneNumber())
                .licenseNumber(request.getLicenseNumber())
                .build();
        return driverMapper.toResponse(driverRepository.save(driver));
    }

    @Transactional
    public DriverResponse update(Long id, DriverRequest request) {
        Driver driver = getDriver(id);

        if (!driver.getLicenseNumber().equals(request.getLicenseNumber())
                && driverRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new DuplicateResourceException("License number already exists: " + request.getLicenseNumber());
        }

        driver.setName(request.getName());
        driver.setPhoneNumber(request.getPhoneNumber());
        driver.setLicenseNumber(request.getLicenseNumber());
        return driverMapper.toResponse(driverRepository.save(driver));
    }

    @Transactional
    public void delete(Long id) {
        if (!driverRepository.existsById(id)) {
            throw new ResourceNotFoundException("Driver not found: " + id);
        }
        driverRepository.deleteById(id);
    }

    @Transactional
    public DriverResponse updateStatus(Long id, DriverStatus status) {
        Driver driver = getDriver(id);
        driver.setStatus(status);
        return driverMapper.toResponse(driverRepository.save(driver));
    }

    public Driver getDriver(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found: " + id));
    }
}