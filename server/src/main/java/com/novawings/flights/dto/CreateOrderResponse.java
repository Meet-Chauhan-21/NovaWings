package com.novawings.flights.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderResponse {

    private String razorpayOrderId;
    private String currency;
    private int amountInPaise;
    private String keyId;
    private String flightNumber;
    private String source;
    private String destination;
    private double totalAmount;
    private String userEmail;
    private String userName;
}
