package com.novawings.flights.dto;

import com.novawings.flights.model.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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
    private BookingStatus status;
    private LocalDateTime bookingDate;
}
