package com.vehiclerental.repository;

import com.vehiclerental.entity.Booking;
import com.vehiclerental.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);
    List<Booking> findByVehicleId(Long vehicleId);
    List<Booking> findByStatus(BookingStatus status);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.vehicle.id = :vehicleId " +
           "AND b.status NOT IN (com.vehiclerental.enums.BookingStatus.CANCELLED, " +
           "com.vehiclerental.enums.BookingStatus.COMPLETED) " +
           "AND b.startDate <= :endDate AND b.endDate >= :startDate")
    boolean isVehicleBooked(@Param("vehicleId") Long vehicleId,
                            @Param("startDate") LocalDate startDate,
                            @Param("endDate")   LocalDate endDate);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status")
    Long countByStatus(@Param("status") BookingStatus status);
}
