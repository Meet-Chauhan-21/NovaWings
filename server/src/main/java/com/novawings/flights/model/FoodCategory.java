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
@Document(collection = "food_categories")
public class FoodCategory {

    @Id
    private String id;

    private String name;
    private String icon;
    private String description;
    private boolean active;
    private int displayOrder;

    // Empty means this category applies to all airlines.
    private List<String> airlineNames;

    // Empty means this category applies to all cabin classes.
    private List<String> cabinClasses;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
