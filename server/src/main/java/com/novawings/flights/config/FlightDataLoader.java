package com.novawings.flights.config;

import com.novawings.flights.model.Flight;
import com.novawings.flights.repository.FlightRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

/**
 * Generates thousands of realistic Indian domestic flights on startup
 * and stores them in MongoDB. Runs only once — skips if flights already exist.
 */
@Component
public class FlightDataLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(FlightDataLoader.class);

    @Autowired
    private FlightRepository flightRepository;

    // ── City list ────────────────────────────────────────────

    private static final List<String> CITIES = List.of(
            "Delhi", "Mumbai", "Surat", "Bangalore", "Chennai",
            "Kolkata", "Hyderabad", "Ahmedabad", "Jaipur", "Pune"
    );

    // ── Airlines ─────────────────────────────────────────────

    private static final List<String> AIRLINES = List.of(
            "IndiGo", "Air India", "Vistara", "SpiceJet", "Akasa Air"
    );

    private static final Map<String, String> AIRLINE_CODES = Map.of(
            "IndiGo",    "6E",
            "Air India", "AI",
            "Vistara",   "UK",
            "SpiceJet",  "SG",
            "Akasa Air", "QP"
    );

    // Realistic price ranges per airline (INR)
    private static final Map<String, int[]> AIRLINE_PRICE_RANGE = Map.of(
            "IndiGo",    new int[]{2500, 7000},
            "Air India", new int[]{4000, 12000},
            "Vistara",   new int[]{5000, 12000},
            "SpiceJet",  new int[]{2500, 6500},
            "Akasa Air", new int[]{2800, 7500}
    );

    // Duration bounds (minutes)
    private static final int MIN_DURATION = 60;
    private static final int MAX_DURATION = 180;

    // Generation parameters
    private static final int DAYS_TO_GENERATE = 30;
    private static final int MIN_FLIGHTS_PER_ROUTE_PER_DAY = 3;
    private static final int MAX_FLIGHTS_PER_ROUTE_PER_DAY = 5;

    private final Random random = new Random();
    private final Set<String> usedFlightNumbers = new HashSet<>();

    // ── Entry point ──────────────────────────────────────────

    @Override
    public void run(String... args) {
        try {
            long existingCount = flightRepository.count();
            log.info("✈ Current flight count in DB: {}", existingCount);

            // Skip only if already have a full dataset (1000+)
            if (existingCount >= 1000) {
                log.info("✅ Already have {} flights — skipping generation", existingCount);
                return;
            }

            // Clear any partial/old data
            if (existingCount > 0) {
                flightRepository.deleteAll();
                log.info("🗑️ Cleared {} old/partial flights", existingCount);
            }

            log.info("🚀 Starting flight data generation...");
            long startTime = System.currentTimeMillis();

            List<Flight> allFlights = generateAllFlights();
            log.info("📋 Generated {} flight objects in memory", allFlights.size());

            if (allFlights.isEmpty()) {
                log.error("❌ generateAllFlights() returned EMPTY list — check city/date logic");
                return;
            }

            // Save in batches of 200 for reliability
            int batchSize = 200;
            int totalSaved = 0;

            for (int i = 0; i < allFlights.size(); i += batchSize) {
                int end = Math.min(i + batchSize, allFlights.size());
                List<Flight> batch = allFlights.subList(i, end);
                try {
                    flightRepository.saveAll(batch);
                    totalSaved += batch.size();
                    log.info("💾 Progress: {}/{} flights", totalSaved, allFlights.size());
                } catch (Exception e) {
                    log.error("❌ Batch {}-{} failed: {}", i, end, e.getMessage());
                }
            }

            long elapsed = System.currentTimeMillis() - startTime;
            log.info("✅ COMPLETE — {} flights saved to MongoDB in {}ms", flightRepository.count(), elapsed);

        } catch (Exception e) {
            log.error("❌ FlightDataLoader FAILED: {}", e.getMessage(), e);
        }
    }

    // ── Generate all flights ─────────────────────────────────

    private List<Flight> generateAllFlights() {
        List<Flight> flights = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (String source : CITIES) {
            for (String destination : CITIES) {
                if (source.equals(destination)) continue;

                for (int day = 0; day < DAYS_TO_GENERATE; day++) {
                    LocalDate flightDate = today.plusDays(day);

                    int flightsForRoute = MIN_FLIGHTS_PER_ROUTE_PER_DAY
                            + random.nextInt(MAX_FLIGHTS_PER_ROUTE_PER_DAY - MIN_FLIGHTS_PER_ROUTE_PER_DAY + 1);

                    for (int f = 0; f < flightsForRoute; f++) {
                        flights.add(generateFlight(source, destination, flightDate));
                    }
                }
            }
        }

        return flights;
    }

    // ── Generate a single flight ─────────────────────────────

    private Flight generateFlight(String source, String destination, LocalDate date) {

        // Random airline
        String airline = AIRLINES.get(random.nextInt(AIRLINES.size()));
        String airlineCode = AIRLINE_CODES.get(airline);

        // Unique flight number
        String flightNumber = generateUniqueFlightNumber(airlineCode);

        // Random departure time (hour 0-23, minute 0/15/30/45)
        int departureHour = random.nextInt(24);
        int departureMinute = random.nextInt(4) * 15;

        // Random duration
        int durationMinutes = MIN_DURATION + random.nextInt(MAX_DURATION - MIN_DURATION + 1);

        // Calculate DateTimes
        LocalDateTime departureDateTime = LocalDateTime.of(date, LocalTime.of(departureHour, departureMinute));
        LocalDateTime arrivalDateTime = departureDateTime.plusMinutes(durationMinutes);

        // Random price from airline range, rounded to nearest 99
        int[] priceRange = AIRLINE_PRICE_RANGE.get(airline);
        double price = priceRange[0] + random.nextInt(priceRange[1] - priceRange[0] + 1);
        price = Math.round(price / 100.0) * 100 - 1;

        // Random total seats (20–180), all available at creation
        int totalSeats = 20 + random.nextInt(161);
        int availableSeats = totalSeats;

        return Flight.builder()
                .flightNumber(flightNumber)
                .airlineName(airline)
                .source(source)
                .destination(destination)
                .departureDate(date)
                .departureTime(departureDateTime)
                .arrivalTime(arrivalDateTime)
                .durationMinutes(durationMinutes)
                .price(price)
                .availableSeats(availableSeats)
                .totalSeats(totalSeats)
                .status("SCHEDULED")
                .build();
    }

    // ── Unique flight number generator ───────────────────────

    private String generateUniqueFlightNumber(String airlineCode) {
        String flightNumber;
        int attempts = 0;

        do {
            int number = 100 + random.nextInt(9900);
            flightNumber = airlineCode + "-" + number;
            attempts++;

            if (attempts > 100) {
                flightNumber = airlineCode + "-" + number + "-" + System.nanoTime() % 1000;
                break;
            }
        } while (usedFlightNumbers.contains(flightNumber));

        usedFlightNumbers.add(flightNumber);
        return flightNumber;
    }
}
