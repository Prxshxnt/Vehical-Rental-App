package com.vehiclerental.service;

import com.vehiclerental.dto.LocationUpdateDto;
import com.vehiclerental.dto.VehicleDto;
import com.vehiclerental.entity.Vehicle;
import com.vehiclerental.enums.VehicleStatus;
import com.vehiclerental.enums.VehicleType;
import com.vehiclerental.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public List<VehicleDto> getAllVehicles(String status, String type) {
        List<Vehicle> vehicles;
        if (status != null && type != null) {
            vehicles = vehicleRepository.findByStatusAndType(
                    VehicleStatus.valueOf(status.toUpperCase()),
                    VehicleType.valueOf(type.toUpperCase()));
        } else if (status != null) {
            vehicles = vehicleRepository.findByStatus(VehicleStatus.valueOf(status.toUpperCase()));
        } else if (type != null) {
            vehicles = vehicleRepository.findByType(VehicleType.valueOf(type.toUpperCase()));
        } else {
            vehicles = vehicleRepository.findAll();
        }
        return vehicles.stream().map(this::toDto).collect(Collectors.toList());
    }

    public VehicleDto getVehicleById(Long id) {
        return toDto(findOrThrow(id));
    }

    @Transactional
    public VehicleDto addVehicle(VehicleDto dto) {
        Vehicle v = fromDto(dto);
        return toDto(vehicleRepository.save(v));
    }

    @Transactional
    public VehicleDto updateVehicle(Long id, VehicleDto dto) {
        Vehicle v = findOrThrow(id);
        v.setName(dto.getName());
        v.setType(dto.getType());
        v.setBrand(dto.getBrand());
        v.setModel(dto.getModel());
        v.setYear(dto.getYear());
        v.setPricePerDay(dto.getPricePerDay());
        v.setStatus(dto.getStatus() != null ? dto.getStatus() : v.getStatus());
        v.setImageUrl(dto.getImageUrl());
        v.setDescription(dto.getDescription());
        v.setSeats(dto.getSeats());
        v.setFuelType(dto.getFuelType());
        return toDto(vehicleRepository.save(v));
    }

    @Transactional
    public void deleteVehicle(Long id) {
        vehicleRepository.delete(findOrThrow(id));
    }

    @Transactional
    public VehicleDto updateLocation(Long id, LocationUpdateDto loc) {
        Vehicle v = findOrThrow(id);
        v.setLocationLat(loc.getLat());
        v.setLocationLng(loc.getLng());
        return toDto(vehicleRepository.save(v));
    }

    public VehicleDto getVehicleLocation(Long id) {
        return toDto(findOrThrow(id));
    }

    // ── helpers ──────────────────────────────────────────────

    private Vehicle findOrThrow(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + id));
    }

    public VehicleDto toDto(Vehicle v) {
        return VehicleDto.builder()
                .id(v.getId()).name(v.getName()).type(v.getType())
                .brand(v.getBrand()).model(v.getModel()).year(v.getYear())
                .pricePerDay(v.getPricePerDay()).status(v.getStatus())
                .locationLat(v.getLocationLat()).locationLng(v.getLocationLng())
                .imageUrl(v.getImageUrl()).description(v.getDescription())
                .seats(v.getSeats()).fuelType(v.getFuelType()).rating(v.getRating())
                .build();
    }

    private Vehicle fromDto(VehicleDto dto) {
        return Vehicle.builder()
                .name(dto.getName()).type(dto.getType()).brand(dto.getBrand())
                .model(dto.getModel()).year(dto.getYear()).pricePerDay(dto.getPricePerDay())
                .status(dto.getStatus() != null ? dto.getStatus() : VehicleStatus.AVAILABLE)
                .locationLat(dto.getLocationLat()).locationLng(dto.getLocationLng())
                .imageUrl(dto.getImageUrl()).description(dto.getDescription())
                .seats(dto.getSeats()).fuelType(dto.getFuelType())
                .build();
    }
}
