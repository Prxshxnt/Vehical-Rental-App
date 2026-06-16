package com.vehiclerental.repository;

import com.vehiclerental.entity.Vehicle;
import com.vehiclerental.enums.VehicleStatus;
import com.vehiclerental.enums.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByStatus(VehicleStatus status);
    List<Vehicle> findByType(VehicleType type);
    List<Vehicle> findByStatusAndType(VehicleStatus status, VehicleType type);
    long countByStatus(VehicleStatus status);
}
