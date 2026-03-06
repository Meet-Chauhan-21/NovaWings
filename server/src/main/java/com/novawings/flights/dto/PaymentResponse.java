package com.novawings.flights.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private String bookingId;
    private String paymentId;
    private String status;
    private String message;
    private double totalAmount;
    private String flightNumber;
    private String source;
    private String destination;
    private String departureTime;
    private int numberOfSeats;
    private List<String> selectedSeats;
}
