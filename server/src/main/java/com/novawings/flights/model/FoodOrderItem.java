package com.novawings.flights.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodOrderItem {
    private String foodItemId;
    private String foodItemName;
    private String categoryName;
    private String dietType;
    private double price;
    private int quantity;
    private String imageUrl;
}
