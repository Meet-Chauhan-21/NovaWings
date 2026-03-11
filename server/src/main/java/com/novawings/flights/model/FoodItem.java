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
@Document(collection = "food_items")
public class FoodItem {

    @Id
    private String id;

    private String categoryId;
    private String categoryName;

    private String name;
    private String description;
    private String imageUrl;

    private String dietType;

    private double economyPrice;
    private double businessPrice;
    private double firstClassPrice;

    private int calories;
    private String weight;
    private List<String> allergens;

    private boolean available;
    private boolean popular;
    private boolean newItem;

    // Empty means this item applies to all airlines.
    private List<String> airlineNames;

    // Empty means this item applies to all cabin classes.
    private List<String> cabinClasses;

    private List<String> mealTiming;

    private int displayOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String updatedBy;
}
