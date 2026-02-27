package com.novawings.flights.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {

    @NotBlank(message = "Flight ID is required")
    private String flightId;

    @Min(value = 1, message = "Number of seats must be at least 1")
    private int numberOfSeats;
}
