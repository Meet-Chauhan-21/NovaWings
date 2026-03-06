package com.novawings.flights.service;

import com.novawings.flights.dto.BookingRequest;
import com.novawings.flights.dto.BookingResponse;
import com.novawings.flights.exception.BadRequestException;
import com.novawings.flights.exception.ResourceNotFoundException;
import com.novawings.flights.model.Booking;
import com.novawings.flights.model.BookingStatus;
import com.novawings.flights.model.Flight;
import com.novawings.flights.repository.BookingRepository;
import com.novawings.flights.repository.FlightRepository;
import com.novawings.flights.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FlightRepository flightRepository;

    public BookingResponse createBooking(BookingRequest request) {
        String userId = getCurrentUserId();

        Flight flight = flightRepository.findById(request.getFlightId())
                .orElseThrow(() -> new ResourceNotFoundException("Flight", "id", request.getFlightId()));

        if (flight.getAvailableSeats() < request.getNumberOfSeats()) {
            throw new BadRequestException(
                    "Not enough seats available. Requested: " + request.getNumberOfSeats()
                            + ", Available: " + flight.getAvailableSeats()
            );
        }

        double totalPrice = flight.getPrice() * request.getNumberOfSeats();

        Booking booking = Booking.builder()
                .userId(userId)
                .flightId(flight.getId())
                .numberOfSeats(request.getNumberOfSeats())
                .totalPrice(totalPrice)
                .status(BookingStatus.CONFIRMED)
                .build();

        // Update available seats
        flight.setAvailableSeats(flight.getAvailableSeats() - request.getNumberOfSeats());
        flightRepository.save(flight);

        Booking savedBooking = bookingRepository.save(booking);
        return mapToResponse(savedBooking, flight);
    }

    public List<BookingResponse> getMyBookings() {
        String userId = getCurrentUserId();
        List<Booking> bookings = bookingRepository.findByUserId(userId);

        return bookings.stream()
                .map(booking -> {
                    Flight flight = flightRepository.findById(booking.getFlightId()).orElse(null);
                    return mapToResponse(booking, flight);
                })
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();

        return bookings.stream()
                .map(booking -> {
                    Flight flight = flightRepository.findById(booking.getFlightId()).orElse(null);
                    return mapToResponse(booking, flight);
                })
                .collect(Collectors.toList());
    }

    public BookingResponse getBookingById(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        Flight flight = flightRepository.findById(booking.getFlightId()).orElse(null);
        return mapToResponse(booking, flight);
    }

    public BookingResponse cancelBooking(String id) {
        String userId = getCurrentUserId();

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        if (!booking.getUserId().equals(userId)) {
            throw new BadRequestException("You can only cancel your own bookings");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        // Restore available seats
        Flight flight = flightRepository.findById(booking.getFlightId()).orElse(null);
        if (flight != null) {
            flight.setAvailableSeats(flight.getAvailableSeats() + booking.getNumberOfSeats());
            flightRepository.save(flight);
        }

        return mapToResponse(booking, flight);
    }

    public BookingResponse updateStatus(String id, String status) {
        if (status == null || (!status.equals("CONFIRMED") && !status.equals("CANCELLED"))) {
            throw new BadRequestException("Status must be CONFIRMED or CANCELLED");
        }

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));

        BookingStatus oldStatus = booking.getStatus();
        BookingStatus newStatus = BookingStatus.valueOf(status);

        if (oldStatus == newStatus) {
            throw new BadRequestException("Booking is already " + status);
        }

        booking.setStatus(newStatus);
        bookingRepository.save(booking);

        // Adjust available seats
        Flight flight = flightRepository.findById(booking.getFlightId()).orElse(null);
        if (flight != null) {
            if (newStatus == BookingStatus.CANCELLED) {
                // Restore seats when cancelling
                flight.setAvailableSeats(flight.getAvailableSeats() + booking.getNumberOfSeats());
            } else if (newStatus == BookingStatus.CONFIRMED && oldStatus == BookingStatus.CANCELLED) {
                // Deduct seats when re-confirming a cancelled booking
                flight.setAvailableSeats(flight.getAvailableSeats() - booking.getNumberOfSeats());
            }
            flightRepository.save(flight);
        }

        return mapToResponse(booking, flight);
    }

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getId();
    }

    private BookingResponse mapToResponse(Booking booking, Flight flight) {
        BookingResponse.BookingResponseBuilder builder = BookingResponse.builder()
                .id(booking.getId())
                .userId(booking.getUserId())
                .flightId(booking.getFlightId())
                .numberOfSeats(booking.getNumberOfSeats())
                .totalPrice(booking.getTotalPrice())
                .paymentId(booking.getPaymentId())
                .selectedSeats(booking.getSelectedSeats())
                .status(booking.getStatus())
                .bookingDate(booking.getBookingDate())
                .userName(booking.getUserName())
                .userEmail(booking.getUserEmail())
                .arrivalTime(booking.getArrivalTime())
                .duration(booking.getDuration())
                .departureTimeStr(booking.getDepartureTimeStr());

        if (flight != null) {
            builder.flightNumber(flight.getFlightNumber())
                    .airlineName(flight.getAirlineName())
                    .source(flight.getSource())
                    .destination(flight.getDestination());
            // Populate flight snapshot if not already stored on booking
            if (booking.getArrivalTime() == null && flight.getArrivalTime() != null) {
                builder.arrivalTime(flight.getArrivalTime().toString());
            }
            if (booking.getDepartureTimeStr() == null && flight.getDepartureTime() != null) {
                builder.departureTimeStr(flight.getDepartureTime().toString());
            }
            if (booking.getDuration() == null && flight.getDurationMinutes() > 0) {
                int hrs = flight.getDurationMinutes() / 60;
                int mins = flight.getDurationMinutes() % 60;
                builder.duration(hrs + "h " + mins + "m");
            }
        } else {
            builder.flightNumber(booking.getFlightNumber())
                    .airlineName(booking.getAirlineName())
                    .source(booking.getSource())
                    .destination(booking.getDestination());
        }

        return builder.build();
    }
}
