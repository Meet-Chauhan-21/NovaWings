package com.novawings.flights.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodOrder {
    private String seatNumber;
    private String passengerLabel;
    private List<FoodOrderItem> items;
    private double subtotal;
}
