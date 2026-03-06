package com.novawings.flights.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "payments")
public class Payment {

    @Id
    private String id;

    // Razorpay IDs
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;

    // Booking reference
    private String bookingId;
    private String userId;
    private String userEmail;
    private String userName;

    // Flight info snapshot
    private String flightId;
    private String flightNumber;
    private String airlineName;
    private String source;
    private String destination;
    private String departureTime;

    // Payment details
    private double amount;
    private int amountInPaise;
    private String currency;
    private int numberOfSeats;
    private List<String> selectedSeats;

    // Status: PENDING, SUCCESS, FAILED, REFUNDED
    private String status;

    // Price breakdown
    private double baseFare;
    private double taxes;
    private double convenienceFee;
    private double totalAmount;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime paidAt;
}
