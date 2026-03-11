package com.novawings.flights.dto;

import com.novawings.flights.model.FoodCategory;
import com.novawings.flights.model.FoodItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FoodMenuResponse {

    private List<FoodCategoryWithItems> categories;
    private String airline;
    private String cabinClass;
    private boolean hasComplimentaryMeals;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FoodCategoryWithItems {
        private FoodCategory category;
        private List<FoodItem> items;
    }
}
