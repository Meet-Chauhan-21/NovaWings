package com.novawings.flights.repository;

import com.novawings.flights.model.Flight;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlightRepository extends MongoRepository<Flight, String> {

    Optional<Flight> findByFlightNumber(String flightNumber);

    List<Flight> findBySourceAndDestination(String source, String destination);

    List<Flight> findBySourceIgnoreCaseAndDestinationIgnoreCase(String source, String destination);

    List<Flight> findBySourceIgnoreCaseAndDestinationIgnoreCaseAndDepartureDate(
            String source, String destination, LocalDate date);

    List<Flight> findByDepartureDate(LocalDate date);

    boolean existsByFlightNumber(String flightNumber);

    @Aggregation(pipeline = {
            "{ $group: { _id: '$airlineName' } }",
            "{ $sort: { _id: 1 } }"
    })
    List<String> findDistinctAirlineNames();
}
