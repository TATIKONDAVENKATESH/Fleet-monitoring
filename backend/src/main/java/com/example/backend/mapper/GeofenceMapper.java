package com.example.backend.mapper;

import com.example.backend.dto.request.GeofenceRequest;
import com.example.backend.dto.response.GeofenceResponse;
import com.example.backend.entity.Geofence;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * FIX B4: Added explicit mapping for the `active` field.
 *
 * Without this, MapStruct leaves `active` null in the generated entity,
 * causing a NOT NULL constraint violation on INSERT since the DB column
 * defaults to TRUE only at the SQL level — Hibernate bypasses that default
 * when it sends an explicit NULL value.
 *
 * The `@Builder.Default` on Geofence.active = true handles the Java-side
 * default when building via the builder manually, but MapStruct generates
 * code that calls setters, bypassing the builder default.
 */
@Mapper(componentModel = "spring")
public interface GeofenceMapper {

    @Mapping(target = "centerLatitude",
            expression = "java(geofence.getCenterLatitude().doubleValue())")
    @Mapping(target = "centerLongitude",
            expression = "java(geofence.getCenterLongitude().doubleValue())")
    GeofenceResponse toResponse(Geofence geofence);

    @Mapping(target = "id",         ignore = true)
//    @Mapping(target = "createdAt",  ignore = true)
//    @Mapping(target = "updatedAt",  ignore = true)
//    @Mapping(target = "createdBy",  ignore = true)
//    @Mapping(target = "updatedBy",  ignore = true)
    @Mapping(target = "centerLatitude",
            expression = "java(java.math.BigDecimal.valueOf(request.getCenterLatitude()))")
    @Mapping(target = "centerLongitude",
            expression = "java(java.math.BigDecimal.valueOf(request.getCenterLongitude()))")
    // FIX B4: Explicitly map active so the entity never has null for that column
    @Mapping(target = "active",
            expression = "java(request.getActive() != null ? request.getActive() : Boolean.TRUE)")
    Geofence toEntity(GeofenceRequest request);
}