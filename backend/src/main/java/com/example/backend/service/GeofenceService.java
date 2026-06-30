package com.example.backend.service;

import com.example.backend.dto.request.GeofenceRequest;
import com.example.backend.dto.response.GeofenceResponse;
import com.example.backend.entity.Geofence;
import com.example.backend.exception.DuplicateResourceException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.mapper.GeofenceMapper;
import com.example.backend.repository.GeofenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GeofenceService {

    private final GeofenceRepository geofenceRepository;
    private final GeofenceMapper geofenceMapper;

    @Transactional(readOnly = true)
    public Page<GeofenceResponse> findAll(Pageable pageable) {
        return geofenceRepository.findAll(pageable).map(geofenceMapper::toResponse);
    }

    /**
     * BUG FIX B10: New method that returns all geofences as a list.
     * Used by GeofenceController.getAll() to match the frontend's expectation
     * of receiving a JSON array (not a paginated wrapper).
     */
    @Transactional(readOnly = true)
    public List<GeofenceResponse> findAllAsList() {
        return geofenceRepository.findAll()
                .stream()
                .map(geofenceMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public GeofenceResponse findById(Long id) {
        return geofenceMapper.toResponse(getGeofence(id));
    }

    @Transactional(readOnly = true)
    public List<Geofence> findAllActive() {
        return geofenceRepository.findByActiveTrue();
    }

    @Transactional
    public GeofenceResponse create(GeofenceRequest request) {
        if (geofenceRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Geofence name already exists: " + request.getName());
        }
        Geofence geofence = geofenceMapper.toEntity(request);
        return geofenceMapper.toResponse(geofenceRepository.save(geofence));
    }

    @Transactional
    public GeofenceResponse update(Long id, GeofenceRequest request) {
        Geofence geofence = getGeofence(id);

        if (!geofence.getName().equals(request.getName())
                && geofenceRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Geofence name already exists: " + request.getName());
        }

        geofence.setName(request.getName());
        geofence.setCenterLatitude(BigDecimal.valueOf(request.getCenterLatitude()));
        geofence.setCenterLongitude(BigDecimal.valueOf(request.getCenterLongitude()));
        geofence.setRadiusMeters(request.getRadiusMeters());
        if (request.getActive() != null) geofence.setActive(request.getActive());

        return geofenceMapper.toResponse(geofenceRepository.save(geofence));
    }

    @Transactional
    public void delete(Long id) {
        if (!geofenceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Geofence not found: " + id);
        }
        geofenceRepository.deleteById(id);
    }

    public Geofence getGeofence(Long id) {
        return geofenceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Geofence not found: " + id));
    }
}