package com.novawings.flights.service;

import com.novawings.flights.dto.CreateOrderRequest;
import com.novawings.flights.dto.CreateOrderResponse;
import com.novawings.flights.dto.PaymentResponse;
import com.novawings.flights.dto.VerifyPaymentRequest;
import com.novawings.flights.model.Booking;
import com.novawings.flights.model.BookingStatus;
import com.novawings.flights.model.Flight;
import com.novawings.flights.model.Payment;
import com.novawings.flights.repository.BookingRepository;
import com.novawings.flights.repository.FlightRepository;
import com.novawings.flights.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final FlightRepository flightRepository;
    private final EmailService emailService;

    /**
     * Step 1: Create a Razorpay order and save a PENDING payment record.
     */
    public CreateOrderResponse createOrder(
            CreateOrderRequest request,
            String userId,
            String userEmail,
            String userName
    ) throws Exception {

        Flight flight = flightRepository.findById(request.getFlightId())
                .orElseThrow(() -> new RuntimeException("Flight not found"));

        // Calculate price breakdown
        double baseFare = flight.getPrice() * request.getNumberOfSeats();
        double taxes = Math.round(baseFare * 0.18 * 100.0) / 100.0;
        double convenience = 199.0;
        double sanitizedFoodTotal = Math.max(0.0, request.getFoodTotal());
        double total = baseFare + taxes + convenience + sanitizedFoodTotal;

        // Razorpay uses paise (1 INR = 100 paise)
        int amountInPaise = (int) (total * 100);

        // Create Razorpay client and order
        RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "rcpt_" + System.currentTimeMillis());

        JSONObject notes = new JSONObject();
        notes.put("userId", userId);
        notes.put("flightId", request.getFlightId());
        notes.put("seats", request.getNumberOfSeats());
        orderRequest.put("notes", notes);

        Order razorpayOrder = razorpay.orders.create(orderRequest);
        String razorpayOrderId = razorpayOrder.get("id");

        // Save PENDING payment to DB
        Payment payment = Payment.builder()
                .razorpayOrderId(razorpayOrderId)
                .userId(userId)
                .userEmail(userEmail)
                .userName(userName)
                .flightId(request.getFlightId())
                .flightNumber(flight.getFlightNumber())
                .airlineName(flight.getAirlineName())
                .source(flight.getSource())
                .destination(flight.getDestination())
                .departureTime(flight.getDepartureTime().toString())
                .amount(total)
                .amountInPaise(amountInPaise)
                .currency("INR")
                .numberOfSeats(request.getNumberOfSeats())
                .selectedSeats(request.getSelectedSeats())
                .foodOrders(request.getFoodOrders() != null ? request.getFoodOrders() : Collections.emptyList())
                .foodTotal(sanitizedFoodTotal)
                .mealSkipped(request.isMealSkipped())
                .baseFare(baseFare)
                .taxes(taxes)
                .convenienceFee(convenience)
                .totalAmount(total)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        paymentRepository.save(payment);

        // Build response for frontend
        CreateOrderResponse response = new CreateOrderResponse();
        response.setRazorpayOrderId(razorpayOrderId);
        response.setCurrency("INR");
        response.setAmountInPaise(amountInPaise);
        response.setKeyId(razorpayKeyId);
        response.setFlightNumber(flight.getFlightNumber());
        response.setSource(flight.getSource());
        response.setDestination(flight.getDestination());
        response.setTotalAmount(total);
        response.setUserEmail(userEmail);
        response.setUserName(userName);

        return response;
    }

    /**
     * Step 2: Verify Razorpay payment signature and create the booking.
     */
    public PaymentResponse verifyAndCreateBooking(
            VerifyPaymentRequest request
    ) throws Exception {

        Payment payment = paymentRepository
                .findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new RuntimeException("Payment record not found"));

        // Verify Razorpay signature using HMAC SHA256
        String payload = request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId();

        boolean isValid = verifySignature(
                payload,
                request.getRazorpaySignature(),
                razorpayKeySecret
        );

        if (!isValid) {
            payment.setStatus("FAILED");
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);
            throw new RuntimeException("Payment verification failed — invalid signature");
        }

        // Look up flight for snapshot data
        Flight flightForSnapshot = flightRepository
                .findById(payment.getFlightId()).orElse(null);

        String arrivalTimeStr = null;
        String durationStr = null;
        String departureTimeStr = payment.getDepartureTime();
        if (flightForSnapshot != null) {
            if (flightForSnapshot.getArrivalTime() != null) {
                arrivalTimeStr = flightForSnapshot.getArrivalTime().toString();
            }
            if (flightForSnapshot.getDepartureTime() != null) {
                departureTimeStr = flightForSnapshot.getDepartureTime().toString();
            }
            if (flightForSnapshot.getDurationMinutes() > 0) {
                int hrs = flightForSnapshot.getDurationMinutes() / 60;
                int mins = flightForSnapshot.getDurationMinutes() % 60;
                durationStr = hrs + "h " + mins + "m";
            }
        }

        // Signature valid — create booking
        Booking booking = Booking.builder()
                .userId(payment.getUserId())
                .flightId(payment.getFlightId())
                .flightNumber(payment.getFlightNumber())
                .airlineName(payment.getAirlineName())
                .source(payment.getSource())
                .destination(payment.getDestination())
                .numberOfSeats(payment.getNumberOfSeats())
                .selectedSeats(payment.getSelectedSeats())
                .totalPrice(payment.getTotalAmount())
                .foodOrders(payment.getFoodOrders())
                .foodTotal(payment.getFoodTotal())
                .mealSkipped(payment.isMealSkipped())
                .baseFlightFare(payment.getBaseFare())
                .taxes(payment.getTaxes())
                .convenienceFee(payment.getConvenienceFee())
                .status(BookingStatus.CONFIRMED)
                .paymentId(request.getRazorpayPaymentId())
                .bookingDate(LocalDateTime.now())
                .userName(payment.getUserName())
                .userEmail(payment.getUserEmail())
                .arrivalTime(arrivalTimeStr)
                .duration(durationStr)
                .departureTimeStr(departureTimeStr)
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        // Update flight available seats
        Flight flight = flightRepository
                .findById(payment.getFlightId())
                .orElseThrow(() -> new RuntimeException("Flight not found"));
        flight.setAvailableSeats(flight.getAvailableSeats() - payment.getNumberOfSeats());
        flightRepository.save(flight);

        // Update payment record
        payment.setStatus("SUCCESS");
        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setBookingId(savedBooking.getId());
        payment.setPaidAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        // Send booking confirmation email
        try {
            emailService.sendBookingConfirmationEmail(savedBooking);
        } catch (Exception e) {
            // Log error but don't fail the payment
            System.err.println("Failed to send confirmation email: " + e.getMessage());
        }

        // Build response
        PaymentResponse response = new PaymentResponse();
        response.setBookingId(savedBooking.getId());
        response.setPaymentId(request.getRazorpayPaymentId());
        response.setStatus("SUCCESS");
        response.setMessage("Payment successful! Booking confirmed.");
        response.setTotalAmount(payment.getTotalAmount());
        response.setFlightNumber(payment.getFlightNumber());
        response.setSource(payment.getSource());
        response.setDestination(payment.getDestination());
        response.setDepartureTime(payment.getDepartureTime());
        response.setNumberOfSeats(payment.getNumberOfSeats());
        response.setSelectedSeats(payment.getSelectedSeats());

        return response;
    }

    /**
     * HMAC SHA256 signature verification for Razorpay.
     */
    private boolean verifySignature(String payload, String signature, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(
                secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"
        );
        mac.init(secretKeySpec);
        byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString().equals(signature);
    }

    // ── Admin methods ──

    public List<Payment> getAllPayments() {
        return paymentRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Payment> getPaymentsByUser(String userId) {
        return paymentRepository.findByUserId(userId);
    }

    public Double getTotalRevenue() {
        Double revenue = paymentRepository.getTotalRevenue();
        return revenue != null ? revenue : 0.0;
    }
}
