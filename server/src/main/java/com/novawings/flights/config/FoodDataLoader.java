package com.novawings.flights.config;

import com.novawings.flights.model.FoodCategory;
import com.novawings.flights.model.FoodItem;
import com.novawings.flights.repository.FoodCategoryRepository;
import com.novawings.flights.repository.FoodItemRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@Order(4)
@RequiredArgsConstructor
public class FoodDataLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(FoodDataLoader.class);

    private final FoodCategoryRepository categoryRepository;
    private final FoodItemRepository itemRepository;

    @Override
    public void run(String... args) {
        if (categoryRepository.count() > 0) {
            log.info("Food menu already seeded");
            return;
        }

        log.info("Seeding food menu");

        LocalDateTime now = LocalDateTime.now();

        FoodCategory meals = categoryRepository.save(FoodCategory.builder()
                .name("Meals")
                .icon("🍱")
                .description("Full meals and main course")
                .active(true)
                .displayOrder(1)
                .airlineNames(List.of())
                .cabinClasses(List.of())
                .createdAt(now)
                .updatedAt(now)
                .build());

        FoodCategory snacks = categoryRepository.save(FoodCategory.builder()
                .name("Snacks")
                .icon("🥪")
                .description("Light bites and finger food")
                .active(true)
                .displayOrder(2)
                .airlineNames(List.of())
                .cabinClasses(List.of())
                .createdAt(now)
                .updatedAt(now)
                .build());

        FoodCategory beverages = categoryRepository.save(FoodCategory.builder()
                .name("Beverages")
                .icon("☕")
                .description("Hot and cold drinks")
                .active(true)
                .displayOrder(3)
                .airlineNames(List.of())
                .cabinClasses(List.of())
                .createdAt(now)
                .updatedAt(now)
                .build());

        FoodCategory desserts = categoryRepository.save(FoodCategory.builder()
                .name("Desserts")
                .icon("🍰")
                .description("Sweet treats and bakery items")
                .active(true)
                .displayOrder(4)
                .airlineNames(List.of())
                .cabinClasses(List.of())
                .createdAt(now)
                .updatedAt(now)
                .build());

        FoodCategory kids = categoryRepository.save(FoodCategory.builder()
                .name("Kids Meals")
                .icon("🧒")
                .description("Special meals for children")
                .active(true)
                .displayOrder(5)
                .airlineNames(List.of())
                .cabinClasses(List.of("Economy"))
                .createdAt(now)
                .updatedAt(now)
                .build());

        List<FoodItem> items = new ArrayList<>();

        items.add(FoodItem.builder()
                .categoryId(meals.getId())
                .categoryName("Meals")
                .name("Paneer Butter Masala with Rice")
                .description("Creamy paneer in rich tomato gravy served with steamed basmati rice")
                .imageUrl("https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80")
                .dietType("VEG")
                .economyPrice(299)
                .businessPrice(0)
                .firstClassPrice(0)
                .calories(480)
                .weight("350g")
                .allergens(List.of("Dairy", "Gluten"))
                .available(true)
                .popular(true)
                .newItem(false)
                .airlineNames(List.of())
                .cabinClasses(List.of())
                .mealTiming(List.of("Lunch", "Dinner"))
                .displayOrder(1)
                .createdAt(now)
                .updatedAt(now)
                .updatedBy("system")
                .build());

        items.add(FoodItem.builder()
                .categoryId(meals.getId())
                .categoryName("Meals")
                .name("Chicken Biryani")
                .description("Aromatic basmati rice with tender chicken pieces")
                .imageUrl("https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80")
                .dietType("NON_VEG")
                .economyPrice(349)
                .businessPrice(0)
                .firstClassPrice(0)
                .calories(560)
                .weight("420g")
                .allergens(List.of("Dairy"))
                .available(true)
                .popular(true)
                .newItem(false)
                .airlineNames(List.of())
                .cabinClasses(List.of())
                .mealTiming(List.of("Lunch", "Dinner"))
                .displayOrder(2)
                .createdAt(now)
                .updatedAt(now)
                .updatedBy("system")
                .build());

        items.add(FoodItem.builder()
                .categoryId(snacks.getId())
                .categoryName("Snacks")
                .name("Veg Sandwich")
                .description("Fresh cucumber, tomato and cheese sandwich")
                .imageUrl("https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80")
                .dietType("VEG")
                .economyPrice(149)
                .businessPrice(0)
                .firstClassPrice(0)
                .calories(260)
                .weight("180g")
                .allergens(List.of("Gluten", "Dairy"))
                .available(true)
                .popular(false)
                .newItem(false)
                .airlineNames(List.of())
                .cabinClasses(List.of())
                .mealTiming(List.of("Anytime"))
                .displayOrder(1)
                .createdAt(now)
                .updatedAt(now)
                .updatedBy("system")
                .build());

        items.add(FoodItem.builder()
                .categoryId(snacks.getId())
                .categoryName("Snacks")
                .name("Chicken Tikka Wrap")
                .description("Grilled chicken tikka with mint mayo in a soft wrap")
                .imageUrl("https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80")
                .dietType("NON_VEG")
                .economyPrice(199)
                .businessPrice(0)
                .firstClassPrice(0)
                .calories(380)
                .weight("220g")
                .allergens(List.of("Gluten", "Dairy"))
                .available(true)
                .popular(true)
                .newItem(false)
                .airlineNames(List.of())
                .cabinClasses(List.of())
                .mealTiming(List.of("Anytime"))
                .displayOrder(2)
                .createdAt(now)
                .updatedAt(now)
                .updatedBy("system")
                .build());

        items.add(FoodItem.builder()
                .categoryId(beverages.getId())
                .categoryName("Beverages")
                .name("Tea / Coffee")
                .description("Choice of masala chai or filter coffee")
                .imageUrl("https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80")
                .dietType("VEG")
                .economyPrice(69)
                .businessPrice(0)
                .firstClassPrice(0)
                .calories(60)
                .weight("250ml")
                .allergens(List.of("Dairy"))
                .available(true)
                .popular(true)
                .newItem(false)
                .airlineNames(List.of())
                .cabinClasses(List.of())
                .mealTiming(List.of("Anytime"))
                .displayOrder(1)
                .createdAt(now)
                .updatedAt(now)
                .updatedBy("system")
                .build());

        items.add(FoodItem.builder()
                .categoryId(beverages.getId())
                .categoryName("Beverages")
                .name("Fresh Juice")
                .description("Cold-pressed juice, choice of orange or mango")
                .imageUrl("https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80")
                .dietType("VEGAN")
                .economyPrice(119)
                .businessPrice(0)
                .firstClassPrice(0)
                .calories(110)
                .weight("300ml")
                .allergens(List.of())
                .available(true)
                .popular(false)
                .newItem(true)
                .airlineNames(List.of())
                .cabinClasses(List.of())
                .mealTiming(List.of("Anytime"))
                .displayOrder(2)
                .createdAt(now)
                .updatedAt(now)
                .updatedBy("system")
                .build());

        items.add(FoodItem.builder()
                .categoryId(desserts.getId())
                .categoryName("Desserts")
                .name("Gulab Jamun (2 pcs)")
                .description("Warm gulab jamun in rose-flavoured syrup")
                .imageUrl("https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80")
                .dietType("VEG")
                .economyPrice(99)
                .businessPrice(0)
                .firstClassPrice(0)
                .calories(280)
                .weight("150g")
                .allergens(List.of("Dairy", "Gluten"))
                .available(true)
                .popular(true)
                .newItem(false)
                .airlineNames(List.of())
                .cabinClasses(List.of())
                .mealTiming(List.of("Anytime"))
                .displayOrder(1)
                .createdAt(now)
                .updatedAt(now)
                .updatedBy("system")
                .build());

        items.add(FoodItem.builder()
                .categoryId(kids.getId())
                .categoryName("Kids Meals")
                .name("Mac and Cheese Box")
                .description("Creamy macaroni in cheesy sauce with fruit pouch")
                .imageUrl("https://images.unsplash.com/photo-1543340904-0d1263ce3e57?w=400&q=80")
                .dietType("VEG")
                .economyPrice(199)
                .businessPrice(0)
                .firstClassPrice(0)
                .calories(380)
                .weight("250g")
                .allergens(List.of("Gluten", "Dairy"))
                .available(true)
                .popular(true)
                .newItem(false)
                .airlineNames(List.of())
                .cabinClasses(List.of("Economy"))
                .mealTiming(List.of("Anytime"))
                .displayOrder(1)
                .createdAt(now)
                .updatedAt(now)
                .updatedBy("system")
                .build());

        itemRepository.saveAll(items);
        log.info("Seeded {} food items", items.size());
    }
}
