package com.vehiclerental.controller;

import com.vehiclerental.dto.LocationUpdateDto;
import com.vehiclerental.dto.VehicleDto;
import com.vehiclerental.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    /** GET /api/vehicles?status=AVAILABLE&type=CAR */
    @GetMapping
    public ResponseEntity<List<VehicleDto>> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(vehicleService.getAllVehicles(status, type));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.getVehicleById(id));
    }

    @PostMapping
    public ResponseEntity<VehicleDto> add(@Valid @RequestBody VehicleDto dto) {
        return ResponseEntity.ok(vehicleService.addVehicle(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehicleDto> update(@PathVariable Long id,
                                              @Valid @RequestBody VehicleDto dto) {
        return ResponseEntity.ok(vehicleService.updateVehicle(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }

    // ── Tracking ─────────────────────────────────────────────

    @PutMapping("/{id}/location")
    public ResponseEntity<VehicleDto> updateLocation(@PathVariable Long id,
                                                      @Valid @RequestBody LocationUpdateDto loc) {
        return ResponseEntity.ok(vehicleService.updateLocation(id, loc));
    }

    @GetMapping("/{id}/location")
    public ResponseEntity<VehicleDto> getLocation(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.getVehicleLocation(id));
    }
}
