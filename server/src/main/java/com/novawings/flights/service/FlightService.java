package com.novawings.flights.service;

import com.novawings.flights.dto.FlightRequest;
import com.novawings.flights.exception.BadRequestException;
import com.novawings.flights.exception.ResourceNotFoundException;
import com.novawings.flights.model.Flight;
import com.novawings.flights.repository.FlightRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FlightService {

    private final FlightRepository flightRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    public List<Flight> getAllFlights() {
        return flightRepository.findAll();
    }

    public Flight getFlightById(String id) {
        return flightRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flight", "id", id));
    }

    public List<Flight> searchFlights(String source, String destination, LocalDate date) {
        if (date != null) {
            return flightRepository.findBySourceIgnoreCaseAndDestinationIgnoreCaseAndDepartureDate(
                    source, destination, date);
        }
        return flightRepository.findBySourceIgnoreCaseAndDestinationIgnoreCase(source, destination);
    }

    public Flight createFlight(FlightRequest request) {
        if (flightRepository.existsByFlightNumber(request.getFlightNumber())) {
            throw new BadRequestException("Flight number already exists: " + request.getFlightNumber());
        }

        Flight flight = Flight.builder()
                .flightNumber(request.getFlightNumber())
                .airlineName(request.getAirlineName())
                .source(request.getSource())
                .destination(request.getDestination())
                .departureTime(request.getDepartureTime())
                .arrivalTime(request.getArrivalTime())
                .price(request.getPrice())
                .availableSeats(request.getAvailableSeats())
                .build();

        return flightRepository.save(flight);
    }

    public Flight updateFlight(String id, FlightRequest request) {
        Flight flight = getFlightById(id);

        flight.setFlightNumber(request.getFlightNumber());
        flight.setAirlineName(request.getAirlineName());
        flight.setSource(request.getSource());
        flight.setDestination(request.getDestination());
        flight.setDepartureTime(request.getDepartureTime());
        flight.setArrivalTime(request.getArrivalTime());
        flight.setPrice(request.getPrice());
        flight.setAvailableSeats(request.getAvailableSeats());

        return flightRepository.save(flight);
    }

    public void deleteFlight(String id) {
        Flight flight = getFlightById(id);
        flightRepository.delete(flight);
    }

    public List<String> getDistinctAirlines() {
        return flightRepository.findDistinctAirlineNames();
    }

    public Page<Flight> searchFlightsAdmin(
            String q, String source, String destination,
            String airline, Pageable pageable) {
        Query query = new Query();

        if (q != null && !q.isEmpty()) {
            Criteria criteria = new Criteria().orOperator(
                    Criteria.where("flightNumber").regex(q, "i"),
                    Criteria.where("airlineName").regex(q, "i")
            );
            query.addCriteria(criteria);
        }
        if (source != null && !source.isEmpty()) {
            query.addCriteria(Criteria.where("source").regex(source, "i"));
        }
        if (destination != null && !destination.isEmpty()) {
            query.addCriteria(Criteria.where("destination").regex(destination, "i"));
        }
        if (airline != null && !airline.isEmpty()) {
            query.addCriteria(Criteria.where("airlineName").regex(airline, "i"));
        }

        long total = mongoTemplate.count(query, Flight.class);
        query.with(pageable);
        List<Flight> results = mongoTemplate.find(query, Flight.class);

        return new PageImpl<>(results, pageable, total);
    }
}
