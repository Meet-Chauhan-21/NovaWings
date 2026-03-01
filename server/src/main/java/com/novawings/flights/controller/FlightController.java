package com.novawings.flights.controller;

import com.novawings.flights.dto.FlightRequest;
import com.novawings.flights.model.Flight;
import com.novawings.flights.service.FlightService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/flights")
@RequiredArgsConstructor
public class FlightController {

    private final FlightService flightService;

    @GetMapping
    public ResponseEntity<List<Flight>> getAllFlights() {
        return ResponseEntity.ok(flightService.getAllFlights());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Flight> getFlightById(@PathVariable String id) {
        return ResponseEntity.ok(flightService.getFlightById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Flight>> searchFlights(
            @RequestParam String source,
            @RequestParam String destination,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(flightService.searchFlights(source, destination, date));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Flight> createFlight(@Valid @RequestBody FlightRequest request) {
        Flight flight = flightService.createFlight(request);
        return new ResponseEntity<>(flight, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Flight> updateFlight(@PathVariable String id,
                                               @Valid @RequestBody FlightRequest request) {
        return ResponseEntity.ok(flightService.updateFlight(id, request));
    }

    @GetMapping("/airlines")
    public ResponseEntity<List<String>> getDistinctAirlines() {
        return ResponseEntity.ok(flightService.getDistinctAirlines());
    }

    @GetMapping("/search-admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Flight>> searchFlightsAdmin(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) String airline,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("departureTime").ascending());
        return ResponseEntity.ok(
                flightService.searchFlightsAdmin(q, source, destination, airline, pageable));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFlight(@PathVariable String id) {
        flightService.deleteFlight(id);
        return ResponseEntity.noContent().build();
    }
}
