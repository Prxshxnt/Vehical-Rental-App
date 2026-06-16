package com.vehiclerental.service;

import com.vehiclerental.dto.BookingDto;
import com.vehiclerental.entity.Booking;
import com.vehiclerental.entity.User;
import com.vehiclerental.entity.Vehicle;
import com.vehiclerental.enums.BookingStatus;
import com.vehiclerental.enums.VehicleStatus;
import com.vehiclerental.repository.BookingRepository;
import com.vehiclerental.repository.UserRepository;
import com.vehiclerental.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository  bookingRepository;
    private final VehicleRepository  vehicleRepository;
    private final UserRepository     userRepository;
    private final EmailService       emailService;

    @Transactional
    public BookingDto createBooking(BookingDto dto, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new RuntimeException("Vehicle is not available");
        }

        if (bookingRepository.isVehicleBooked(vehicle.getId(), dto.getStartDate(), dto.getEndDate())) {
            throw new RuntimeException("Vehicle already booked for selected dates");
        }

        long days = ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate());
        if (days <= 0) throw new RuntimeException("End date must be after start date");

        BigDecimal total = vehicle.getPricePerDay().multiply(BigDecimal.valueOf(days));

        Booking booking = Booking.builder()
                .user(user).vehicle(vehicle)
                .startDate(dto.getStartDate()).endDate(dto.getEndDate())
                .totalPrice(total).status(BookingStatus.PENDING)
                .notes(dto.getNotes()).build();

        vehicle.setStatus(VehicleStatus.BOOKED);
        vehicleRepository.save(vehicle);
        Booking saved = bookingRepository.save(booking);

        // async email notification
        emailService.sendBookingConfirmation(user.getEmail(), user.getName(), vehicle.getName(), saved);

        return toDto(saved);
    }

    public List<BookingDto> getUserBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findByUserId(user.getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<BookingDto> getAllBookings() {
        return bookingRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public BookingDto getBookingById(Long id) {
        return toDto(findOrThrow(id));
    }

    @Transactional
    public BookingDto cancelBooking(Long id, String userEmail) {
        Booking booking = findOrThrow(id);
        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Not authorized");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        booking.getVehicle().setStatus(VehicleStatus.AVAILABLE);
        vehicleRepository.save(booking.getVehicle());
        return toDto(bookingRepository.save(booking));
    }

    @Transactional
    public BookingDto updateStatus(Long id, String status) {
        Booking booking = findOrThrow(id);
        booking.setStatus(BookingStatus.valueOf(status.toUpperCase()));
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            booking.getVehicle().setStatus(VehicleStatus.AVAILABLE);
            vehicleRepository.save(booking.getVehicle());
        }
        return toDto(bookingRepository.save(booking));
    }

    private Booking findOrThrow(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + id));
    }

    public BookingDto toDto(Booking b) {
        return BookingDto.builder()
                .id(b.getId())
                .vehicleId(b.getVehicle().getId())
                .startDate(b.getStartDate()).endDate(b.getEndDate())
                .totalPrice(b.getTotalPrice()).status(b.getStatus())
                .notes(b.getNotes()).createdAt(b.getCreatedAt())
                .vehicleName(b.getVehicle().getName())
                .vehicleImageUrl(b.getVehicle().getImageUrl())
                .userName(b.getUser().getName())
                .build();
    }
}
