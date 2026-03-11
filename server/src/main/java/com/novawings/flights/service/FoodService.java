package com.novawings.flights.service;

import com.novawings.flights.dto.FoodMenuResponse;
import com.novawings.flights.model.FoodCategory;
import com.novawings.flights.model.FoodItem;
import com.novawings.flights.repository.FoodCategoryRepository;
import com.novawings.flights.repository.FoodItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FoodService {

    private final FoodCategoryRepository categoryRepository;
    private final FoodItemRepository itemRepository;

    public FoodMenuResponse getMenuForFlight(String airline, String cabinClass) {
        String normalizedCabin = cabinClass == null || cabinClass.isBlank() ? "Economy" : cabinClass;
        String normalizedAirline = airline == null ? "" : airline.trim();

        List<FoodCategory> categories = categoryRepository.findByActiveTrueOrderByDisplayOrderAsc().stream()
                .filter(category -> matchesScope(category.getAirlineNames(), normalizedAirline))
                .filter(category -> matchesScope(category.getCabinClasses(), normalizedCabin))
                .collect(Collectors.toList());

        List<FoodMenuResponse.FoodCategoryWithItems> grouped = categories.stream()
                .map(category -> {
                    List<FoodItem> items = itemRepository.findByCategoryIdAndAvailableTrueOrderByDisplayOrderAsc(category.getId()).stream()
                            .filter(item -> matchesScope(item.getAirlineNames(), normalizedAirline))
                            .filter(item -> matchesScope(item.getCabinClasses(), normalizedCabin))
                            .collect(Collectors.toList());
                    return new FoodMenuResponse.FoodCategoryWithItems(category, items);
                })
                .filter(group -> !group.getItems().isEmpty())
                .collect(Collectors.toList());

        boolean complimentary = "Business".equalsIgnoreCase(normalizedCabin)
                || "First Class".equalsIgnoreCase(normalizedCabin);

        return new FoodMenuResponse(grouped, normalizedAirline, normalizedCabin, complimentary);
    }

    public double getPriceForCabin(FoodItem item, String cabinClass) {
        if ("Business".equalsIgnoreCase(cabinClass)) {
            return item.getBusinessPrice();
        }
        if ("First Class".equalsIgnoreCase(cabinClass)) {
            return item.getFirstClassPrice();
        }
        return item.getEconomyPrice();
    }

    public List<FoodCategory> getAllCategories() {
        return categoryRepository.findAll(Sort.by(Sort.Direction.ASC, "displayOrder"));
    }

    public FoodCategory createCategory(FoodCategory category, String adminEmail) {
        LocalDateTime now = LocalDateTime.now();
        category.setCreatedAt(now);
        category.setUpdatedAt(now);
        category.setAirlineNames(defaultList(category.getAirlineNames()));
        category.setCabinClasses(defaultList(category.getCabinClasses()));
        return categoryRepository.save(category);
    }

    public FoodCategory updateCategory(String id, FoodCategory updated, String adminEmail) {
        FoodCategory existing = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        existing.setName(updated.getName());
        existing.setIcon(updated.getIcon());
        existing.setDescription(updated.getDescription());
        existing.setActive(updated.isActive());
        existing.setDisplayOrder(updated.getDisplayOrder());
        existing.setAirlineNames(defaultList(updated.getAirlineNames()));
        existing.setCabinClasses(defaultList(updated.getCabinClasses()));
        existing.setUpdatedAt(LocalDateTime.now());
        return categoryRepository.save(existing);
    }

    public void deleteCategory(String id) {
        categoryRepository.deleteById(id);
        List<FoodItem> inCategory = itemRepository.findByCategoryIdOrderByDisplayOrderAsc(id);
        if (!inCategory.isEmpty()) {
            itemRepository.deleteAll(inCategory);
        }
    }

    public List<FoodItem> getAllItems() {
        return itemRepository.findAll(Sort.by(Sort.Direction.ASC, "displayOrder"));
    }

    public List<FoodItem> getItemsByCategory(String categoryId) {
        return itemRepository.findByCategoryIdAndAvailableTrueOrderByDisplayOrderAsc(categoryId);
    }

    public FoodItem createItem(FoodItem item, String adminEmail) {
        LocalDateTime now = LocalDateTime.now();
        item.setCreatedAt(now);
        item.setUpdatedAt(now);
        item.setUpdatedBy(adminEmail);
        item.setAirlineNames(defaultList(item.getAirlineNames()));
        item.setCabinClasses(defaultList(item.getCabinClasses()));
        item.setMealTiming(defaultList(item.getMealTiming()));
        item.setAllergens(defaultList(item.getAllergens()));
        return itemRepository.save(item);
    }

    public FoodItem updateItem(String id, FoodItem updated, String email) {
        FoodItem existing = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food item not found"));

        existing.setCategoryId(updated.getCategoryId());
        existing.setCategoryName(updated.getCategoryName());
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setImageUrl(updated.getImageUrl());
        existing.setDietType(updated.getDietType());
        existing.setEconomyPrice(updated.getEconomyPrice());
        existing.setBusinessPrice(updated.getBusinessPrice());
        existing.setFirstClassPrice(updated.getFirstClassPrice());
        existing.setCalories(updated.getCalories());
        existing.setWeight(updated.getWeight());
        existing.setAllergens(defaultList(updated.getAllergens()));
        existing.setAvailable(updated.isAvailable());
        existing.setPopular(updated.isPopular());
        existing.setNewItem(updated.isNewItem());
        existing.setAirlineNames(defaultList(updated.getAirlineNames()));
        existing.setCabinClasses(defaultList(updated.getCabinClasses()));
        existing.setMealTiming(defaultList(updated.getMealTiming()));
        existing.setDisplayOrder(updated.getDisplayOrder());
        existing.setUpdatedAt(LocalDateTime.now());
        existing.setUpdatedBy(email);

        return itemRepository.save(existing);
    }

    public void deleteItem(String id) {
        itemRepository.deleteById(id);
    }

    public FoodItem toggleAvailability(String id, String email) {
        FoodItem item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food item not found"));
        item.setAvailable(!item.isAvailable());
        item.setUpdatedAt(LocalDateTime.now());
        item.setUpdatedBy(email);
        return itemRepository.save(item);
    }

    private boolean matchesScope(List<String> scopes, String target) {
        if (scopes == null || scopes.isEmpty()) {
            return true;
        }
        return scopes.stream()
                .filter(Objects::nonNull)
                .anyMatch(scope -> scope.equalsIgnoreCase(target));
    }

    private List<String> defaultList(List<String> list) {
        return list == null ? Collections.emptyList() : list;
    }
}
