package com.novawings.flights.dto;

import com.novawings.flights.model.BookingStatus;
import com.novawings.flights.model.FoodOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    private String id;
    private String userId;
    private String flightId;
    private String flightNumber;
    private String airlineName;
    private String source;
    private String destination;
    private int numberOfSeats;
    private double totalPrice;
    private double foodTotal;
    private List<FoodOrder> foodOrders;
    private boolean mealSkipped;
    private double baseFlightFare;
    private double taxes;
    private double convenienceFee;
    private String paymentId;
    private List<String> selectedSeats;
    private BookingStatus status;
    private LocalDateTime bookingDate;

    // Passenger snapshot
    private String userName;
    private String userEmail;

    // Flight snapshot
    private String arrivalTime;
    private String duration;
    private String departureTimeStr;
}
