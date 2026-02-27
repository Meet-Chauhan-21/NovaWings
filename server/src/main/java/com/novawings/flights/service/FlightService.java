package com.novawings.flights.service;

import com.novawings.flights.dto.FlightRequest;
import com.novawings.flights.exception.BadRequestException;
import com.novawings.flights.exception.ResourceNotFoundException;
import com.novawings.flights.model.Flight;
import com.novawings.flights.repository.FlightRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FlightService {

    private final FlightRepository flightRepository;

    public List<Flight> getAllFlights() {
        return flightRepository.findAll();
    }

    public Flight getFlightById(String id) {
        return flightRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flight", "id", id));
    }

    public List<Flight> searchFlights(String source, String destination) {
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
}
