package com.vehiclerental.controller;

import com.vehiclerental.dto.ReviewDto;
import com.vehiclerental.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<ReviewDto>> getForVehicle(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(reviewService.getVehicleReviews(vehicleId));
    }

    @PostMapping
    public ResponseEntity<ReviewDto> addReview(
            @Valid @RequestBody ReviewDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(reviewService.addReview(dto, userDetails.getUsername()));
    }
}
