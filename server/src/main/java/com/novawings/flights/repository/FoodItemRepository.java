package com.novawings.flights.repository;

import com.novawings.flights.model.FoodItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodItemRepository extends MongoRepository<FoodItem, String> {

    List<FoodItem> findByAvailableTrueOrderByDisplayOrderAsc();

    List<FoodItem> findByCategoryIdAndAvailableTrueOrderByDisplayOrderAsc(String categoryId);

    List<FoodItem> findByCategoryIdOrderByDisplayOrderAsc(String categoryId);

    List<FoodItem> findByAirlineNamesContainingOrAirlineNamesIsEmpty(String airline);

    List<FoodItem> findByCabinClassesContainingOrCabinClassesIsEmpty(String cabinClass);

    List<FoodItem> findByAvailableTrueAndAirlineNamesContaining(String airline);
}
