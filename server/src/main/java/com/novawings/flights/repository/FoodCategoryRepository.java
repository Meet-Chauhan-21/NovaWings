package com.novawings.flights.repository;

import com.novawings.flights.model.FoodCategory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodCategoryRepository extends MongoRepository<FoodCategory, String> {

    List<FoodCategory> findByActiveTrueOrderByDisplayOrderAsc();

    List<FoodCategory> findByAirlineNamesContainingOrAirlineNamesIsEmpty(String airline);
}
