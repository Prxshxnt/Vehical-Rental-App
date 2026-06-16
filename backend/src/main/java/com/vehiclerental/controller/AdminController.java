package com.vehiclerental.controller;

import com.vehiclerental.dto.BookingDto;
import com.vehiclerental.enums.BookingStatus;
import com.vehiclerental.enums.PaymentStatus;
import com.vehiclerental.enums.VehicleStatus;
import com.vehiclerental.repository.BookingRepository;
import com.vehiclerental.repository.PaymentRepository;
import com.vehiclerental.repository.UserRepository;
import com.vehiclerental.repository.VehicleRepository;
import com.vehiclerental.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository    userRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final BookingService    bookingService;

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalUsers",         userRepository.count());
        data.put("totalVehicles",      vehicleRepository.count());
        data.put("availableVehicles",  vehicleRepository.countByStatus(VehicleStatus.AVAILABLE));
        data.put("bookedVehicles",     vehicleRepository.countByStatus(VehicleStatus.BOOKED));
        data.put("totalBookings",      bookingRepository.count());
        data.put("confirmedBookings",  bookingRepository.countByStatus(BookingStatus.CONFIRMED));
        data.put("pendingBookings",    bookingRepository.countByStatus(BookingStatus.PENDING));
        data.put("completedBookings",  bookingRepository.countByStatus(BookingStatus.COMPLETED));
        data.put("successfulPayments", paymentRepository.countByPaymentStatus(PaymentStatus.SUCCESS));
        data.put("failedPayments",     paymentRepository.countByPaymentStatus(PaymentStatus.FAILED));
        return ResponseEntity.ok(data);
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDto>> getAllBookings() {
        return ResponseEntity.ok(
                bookingRepository.findAll().stream()
                        .map(bookingService::toDto)
                        .collect(Collectors.toList()));
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll()
                .stream().map(u -> Map.of(
                        "id", u.getId(), "name", u.getName(),
                        "email", u.getEmail(), "role", u.getRole(),
                        "createdAt", String.valueOf(u.getCreatedAt())))
                .collect(Collectors.toList()));
    }
}
