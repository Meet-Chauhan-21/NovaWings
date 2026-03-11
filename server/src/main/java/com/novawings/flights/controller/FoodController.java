package com.novawings.flights.controller;

import com.novawings.flights.dto.FoodMenuResponse;
import com.novawings.flights.model.FoodCategory;
import com.novawings.flights.model.FoodItem;
import com.novawings.flights.service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/food")
@RequiredArgsConstructor
public class FoodController {

    private final FoodService foodService;

    @GetMapping("/menu")
    public ResponseEntity<FoodMenuResponse> getMenu(
            @RequestParam String airline,
            @RequestParam(defaultValue = "Economy") String cabinClass
    ) {
        return ResponseEntity.ok(foodService.getMenuForFlight(airline, cabinClass));
    }

    @GetMapping("/categories/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FoodCategory>> getAllCategories() {
        return ResponseEntity.ok(foodService.getAllCategories());
    }

    @PostMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FoodCategory> createCategory(
            @RequestBody FoodCategory category,
            Authentication authentication
    ) {
        return ResponseEntity.ok(foodService.createCategory(category, authentication.getName()));
    }

    @PutMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FoodCategory> updateCategory(
            @PathVariable String id,
            @RequestBody FoodCategory category,
            Authentication authentication
    ) {
        return ResponseEntity.ok(foodService.updateCategory(id, category, authentication.getName()));
    }

    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable String id) {
        foodService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/items/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FoodItem>> getAllItems() {
        return ResponseEntity.ok(foodService.getAllItems());
    }

    @PostMapping("/items")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FoodItem> createItem(
            @RequestBody FoodItem item,
            Authentication authentication
    ) {
        return ResponseEntity.ok(foodService.createItem(item, authentication.getName()));
    }

    @PutMapping("/items/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FoodItem> updateItem(
            @PathVariable String id,
            @RequestBody FoodItem item,
            Authentication authentication
    ) {
        return ResponseEntity.ok(foodService.updateItem(id, item, authentication.getName()));
    }

    @DeleteMapping("/items/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteItem(@PathVariable String id) {
        foodService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/items/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FoodItem> toggleAvailability(@PathVariable String id, Authentication authentication) {
        return ResponseEntity.ok(foodService.toggleAvailability(id, authentication.getName()));
    }
}
