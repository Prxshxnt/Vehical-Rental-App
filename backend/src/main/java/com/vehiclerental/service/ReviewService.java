package com.vehiclerental.service;

import com.vehiclerental.dto.ReviewDto;
import com.vehiclerental.entity.Booking;
import com.vehiclerental.entity.Review;
import com.vehiclerental.entity.User;
import com.vehiclerental.entity.Vehicle;
import com.vehiclerental.repository.BookingRepository;
import com.vehiclerental.repository.ReviewRepository;
import com.vehiclerental.repository.UserRepository;
import com.vehiclerental.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository  reviewRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository    userRepository;

    public List<ReviewDto> getVehicleReviews(Long vehicleId) {
        return reviewRepository.findByVehicleId(vehicleId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public ReviewDto addReview(ReviewDto dto, String userEmail) {
        if (reviewRepository.existsByBookingId(dto.getBookingId())) {
            throw new RuntimeException("Review already submitted for this booking");
        }
        User    user    = userRepository.findByEmail(userEmail).orElseThrow();
        Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId()).orElseThrow();
        Booking booking = bookingRepository.findById(dto.getBookingId()).orElseThrow();

        Review review = Review.builder()
                .user(user).vehicle(vehicle).booking(booking)
                .rating(dto.getRating()).comment(dto.getComment()).build();
        reviewRepository.save(review);

        // recalculate average rating
        Double avg = reviewRepository.avgRatingByVehicleId(vehicle.getId());
        if (avg != null) {
            vehicle.setRating(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
            vehicleRepository.save(vehicle);
        }
        return toDto(review);
    }

    private ReviewDto toDto(Review r) {
        return ReviewDto.builder()
                .id(r.getId()).vehicleId(r.getVehicle().getId())
                .bookingId(r.getBooking().getId()).rating(r.getRating())
                .comment(r.getComment()).userName(r.getUser().getName())
                .createdAt(r.getCreatedAt()).build();
    }
}
