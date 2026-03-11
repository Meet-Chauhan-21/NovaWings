package com.novawings.flights.dto;

import com.novawings.flights.model.FoodOrder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    private String flightId;
    private int numberOfSeats;
    private List<String> selectedSeats;
    private double totalAmount;
    private List<FoodOrder> foodOrders;
    private double foodTotal;
    private boolean mealSkipped;
}
