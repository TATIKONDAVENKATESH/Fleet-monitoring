package com.example.backend.mapper;

import com.example.backend.dto.response.DriverResponse;
import com.example.backend.entity.Driver;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DriverMapper {
    DriverResponse toResponse(Driver driver);
}