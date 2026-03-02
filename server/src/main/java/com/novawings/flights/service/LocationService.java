package com.novawings.flights.service;

import com.novawings.flights.model.Flight;
import com.novawings.flights.model.Location;
import com.novawings.flights.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LocationService {

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    // ── PUBLIC ───────────────────────────────────

    /** Get all active locations (for CityCombobox) */
    public List<Location> getAllActiveLocations() {
        return locationRepository.findByActiveTrueOrderByDisplayOrderAsc();
    }

    /** Search locations (for combobox typing) */
    public List<Location> searchLocations(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllActiveLocations();
        }
        return locationRepository.searchLocations(query.trim());
    }

    /** Get explore page cities */
    public List<Location> getExploreCities() {
        return locationRepository.findByShowOnExploreTrueAndActiveTrueOrderByDisplayOrderAsc();
    }

    /** Get home page cities */
    public List<Location> getHomeCities() {
        return locationRepository.findByShowOnHomeTrueAndActiveTrueOrderByDisplayOrderAsc();
    }

    // ── ADMIN ────────────────────────────────────

    /** Get ALL locations including inactive (admin view) */
    public List<Location> getAllLocations() {
        return mongoTemplate.findAll(Location.class);
    }

    /** Create new location */
    public Location createLocation(Location location, String adminEmail) {
        if (locationRepository.existsByCityIgnoreCase(location.getCity())) {
            throw new RuntimeException("City '" + location.getCity() + "' already exists");
        }
        location.setCreatedAt(LocalDateTime.now());
        location.setUpdatedAt(LocalDateTime.now());
        location.setUpdatedBy(adminEmail);
        if (!location.isActive()) {
            location.setActive(true);
        }

        updateFlightCounts(location);
        return locationRepository.save(location);
    }

    /** Update existing location */
    public Location updateLocation(String id, Location updated, String adminEmail) {
        Location existing = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found"));

        existing.setCity(updated.getCity());
        existing.setState(updated.getState());
        existing.setCountry(updated.getCountry());
        existing.setAirportCode(updated.getAirportCode());
        existing.setAirportName(updated.getAirportName());
        existing.setType(updated.getType());
        existing.setActive(updated.isActive());
        existing.setDisplayOrder(updated.getDisplayOrder());
        existing.setShowOnExplore(updated.isShowOnExplore());
        existing.setShowOnHome(updated.isShowOnHome());
        existing.setUpdatedAt(LocalDateTime.now());
        existing.setUpdatedBy(adminEmail);

        return locationRepository.save(existing);
    }

    /** Delete location */
    public void deleteLocation(String id) {
        locationRepository.deleteById(id);
    }

    /** Toggle active status */
    public Location toggleActive(String id, String adminEmail) {
        Location loc = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found"));
        loc.setActive(!loc.isActive());
        loc.setUpdatedAt(LocalDateTime.now());
        loc.setUpdatedBy(adminEmail);
        return locationRepository.save(loc);
    }

    /** Refresh flight counts for all locations */
    public void refreshAllFlightCounts() {
        List<Location> locations = locationRepository.findAll();
        for (Location loc : locations) {
            updateFlightCounts(loc);
            locationRepository.save(loc);
        }
    }

    /** Calculate flight counts for one location */
    private void updateFlightCounts(Location loc) {
        Query query = new Query(
                Criteria.where("source").is(loc.getCity())
        );
        long total = mongoTemplate.count(query, Flight.class);

        Query activeQuery = new Query(
                Criteria.where("source").is(loc.getCity())
                        .and("status").is("SCHEDULED")
        );
        long active = mongoTemplate.count(activeQuery, Flight.class);

        loc.setTotalFlights(total);
        loc.setActiveFlights(active);
    }
}
