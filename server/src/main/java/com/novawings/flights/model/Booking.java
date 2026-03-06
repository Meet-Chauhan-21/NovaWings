package com.novawings.flights.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    private String userId;

    private String flightId;

    private int numberOfSeats;

    private double totalPrice;

    // Payment & seat fields
    private String paymentId;
    private List<String> selectedSeats;
    private String flightNumber;
    private String airlineName;
    private String source;
    private String destination;

    @Builder.Default
    private BookingStatus status = BookingStatus.CONFIRMED;

    @CreatedDate
    private LocalDateTime bookingDate;
}
