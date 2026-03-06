package com.novawings.flights.controller;

import com.novawings.flights.dto.CreateOrderRequest;
import com.novawings.flights.dto.CreateOrderResponse;
import com.novawings.flights.dto.PaymentResponse;
import com.novawings.flights.dto.VerifyPaymentRequest;
import com.novawings.flights.model.Payment;
import com.novawings.flights.security.CustomUserDetails;
import com.novawings.flights.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Create a Razorpay order.
     * POST /api/payments/create-order
     */
    @PostMapping("/create-order")
    public ResponseEntity<CreateOrderResponse> createOrder(
            @RequestBody CreateOrderRequest request,
            Authentication auth
    ) throws Exception {
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        String userId = userDetails.getId();
        String userEmail = userDetails.getEmail();
        String userName = userDetails.getName();

        return ResponseEntity.ok(
                paymentService.createOrder(request, userId, userEmail, userName)
        );
    }

    /**
     * Verify payment signature and create booking.
     * POST /api/payments/verify
     */
    @PostMapping("/verify")
    public ResponseEntity<PaymentResponse> verifyPayment(
            @RequestBody VerifyPaymentRequest request
    ) throws Exception {
        return ResponseEntity.ok(
                paymentService.verifyAndCreateBooking(request)
        );
    }

    /**
     * Get current user's payment history.
     * GET /api/payments/my
     */
    @GetMapping("/my")
    public ResponseEntity<List<Payment>> getMyPayments(Authentication auth) {
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        return ResponseEntity.ok(
                paymentService.getPaymentsByUser(userDetails.getId())
        );
    }

    /**
     * ADMIN — Get all payments.
     * GET /api/payments/all
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    /**
     * ADMIN — Get total revenue.
     * GET /api/payments/revenue
     */
    @GetMapping("/revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Double>> getRevenue() {
        return ResponseEntity.ok(
                Map.of("totalRevenue", paymentService.getTotalRevenue())
        );
    }
}
