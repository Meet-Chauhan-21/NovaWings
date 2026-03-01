package com.novawings.flights.service;

import com.novawings.flights.model.HomeConfig;
import com.novawings.flights.model.RouteConfig;
import com.novawings.flights.repository.HomeConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HomeConfigService {

    private final HomeConfigRepository homeConfigRepository;

    public HomeConfig getConfig() {
        return homeConfigRepository
                .findFirstByOrderByUpdatedAtDesc()
                .orElseGet(this::createDefaultConfig);
    }

    public HomeConfig updateConfig(HomeConfig updated, String adminEmail) {
        HomeConfig existing = getConfig();
        existing.setPopularRoutes(updated.getPopularRoutes());
        existing.setDealRoutes(updated.getDealRoutes());
        existing.setHeroTitle(updated.getHeroTitle());
        existing.setHeroSubtitle(updated.getHeroSubtitle());
        existing.setUpdatedAt(LocalDateTime.now());
        existing.setUpdatedBy(adminEmail);
        return homeConfigRepository.save(existing);
    }

    private HomeConfig createDefaultConfig() {
        HomeConfig config = HomeConfig.builder()
                .popularRoutes(List.of(
                        new RouteConfig("Delhi", "Mumbai", "Most Popular", true),
                        new RouteConfig("Mumbai", "Bangalore", "Trending", true),
                        new RouteConfig("Delhi", "Bangalore", "Popular", true),
                        new RouteConfig("Mumbai", "Chennai", "Popular", true),
                        new RouteConfig("Delhi", "Hyderabad", "Popular", true),
                        new RouteConfig("Kolkata", "Delhi", "Popular", true),
                        new RouteConfig("Mumbai", "Kolkata", "Popular", true),
                        new RouteConfig("Bangalore", "Hyderabad", "Popular", true)
                ))
                .dealRoutes(List.of(
                        new RouteConfig("Delhi", "Mumbai", "Hot Deal", true),
                        new RouteConfig("Mumbai", "Bangalore", "Hot Deal", true),
                        new RouteConfig("Delhi", "Bangalore", "Hot Deal", true),
                        new RouteConfig("Mumbai", "Chennai", "Hot Deal", true)
                ))
                .heroTitle("Where do you want to fly?")
                .heroSubtitle("Search and book flights at the best prices")
                .updatedAt(LocalDateTime.now())
                .updatedBy("system")
                .build();

        return homeConfigRepository.save(config);
    }
}
