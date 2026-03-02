package com.novawings.flights.repository;

import com.novawings.flights.model.Location;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository extends MongoRepository<Location, String> {

    // Get all active locations sorted by displayOrder
    List<Location> findByActiveTrueOrderByDisplayOrderAsc();

    // Get only locations of a specific type that are active
    List<Location> findByTypeAndActiveTrue(String type);

    // Get locations for explore page
    List<Location> findByShowOnExploreTrueAndActiveTrueOrderByDisplayOrderAsc();

    // Get locations for home page
    List<Location> findByShowOnHomeTrueAndActiveTrueOrderByDisplayOrderAsc();

    // Find by city name (case insensitive)
    Optional<Location> findByCityIgnoreCase(String city);

    // Check if city exists
    boolean existsByCityIgnoreCase(String city);

    // Find by airport code
    Optional<Location> findByAirportCodeIgnoreCase(String code);

    // Search across city + state + code + country
    @Query("{ $or: [ " +
            "{ 'city':        { $regex: ?0, $options: 'i' } }, " +
            "{ 'state':       { $regex: ?0, $options: 'i' } }, " +
            "{ 'airportCode': { $regex: ?0, $options: 'i' } }, " +
            "{ 'country':     { $regex: ?0, $options: 'i' } }  " +
            "], 'active': true }")
    List<Location> searchLocations(String query);
}
