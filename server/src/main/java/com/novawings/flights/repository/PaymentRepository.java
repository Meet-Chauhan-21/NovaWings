package com.novawings.flights.repository;

import com.novawings.flights.model.Payment;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {

    Optional<Payment> findByRazorpayOrderId(String orderId);

    Optional<Payment> findByRazorpayPaymentId(String paymentId);

    Optional<Payment> findByBookingId(String bookingId);

    List<Payment> findByUserId(String userId);

    List<Payment> findByStatus(String status);

    List<Payment> findAllByOrderByCreatedAtDesc();

    @Aggregation(pipeline = {
            "{ $match: { status: 'SUCCESS' } }",
            "{ $group: { _id: null, total: { $sum: '$totalAmount' } } }"
    })
    Double getTotalRevenue();
}
