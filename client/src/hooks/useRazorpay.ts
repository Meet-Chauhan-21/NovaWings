// src/hooks/useRazorpay.ts
// Custom hook that handles the entire Razorpay payment flow

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import paymentService from "../services/paymentService";

export function useRazorpay() {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  async function initiatePayment(params: {
    flightId: string;
    numberOfSeats: number;
    selectedSeats: string[];
    totalAmount: number;
    flightDetails: {
      flightNumber: string;
      source: string;
      destination: string;
      airlineName: string;
    };
  }) {
    setIsProcessing(true);

    try {
      // Step 1: Create order on backend
      const order = await paymentService.createOrder({
        flightId: params.flightId,
        numberOfSeats: params.numberOfSeats,
        selectedSeats: params.selectedSeats,
        totalAmount: params.totalAmount,
      });

      // Step 2: Configure Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amountInPaise,
        currency: order.currency,
        name: import.meta.env.VITE_APP_NAME || "SkyBook",
        description: `${params.flightDetails.source} → ${params.flightDetails.destination} | ${params.flightDetails.flightNumber}`,
        order_id: order.razorpayOrderId,
        theme: {
          color: "#0ea5e9",
        },
        prefill: {
          email: order.userEmail,
          name: order.userName,
        },

        // Success handler — called when payment completes
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          try {
            toast.loading("Confirming your booking...", { id: "booking" });

            // Step 3: Verify payment on backend
            const result = await paymentService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            toast.success("Booking Confirmed!", { id: "booking" });

            // Step 4: Navigate to confirmation page
            navigate(`/booking-confirmation/${result.bookingId}`, {
              state: { paymentResult: result },
            });
          } catch (err: any) {
            toast.error(
              err?.response?.data?.message || "Payment verification failed",
              { id: "booking" }
            );
            setIsProcessing(false);
          }
        },

        // Modal close / dismissal handler
        modal: {
          ondismiss: function () {
            toast.error("Payment cancelled");
            setIsProcessing(false);
          },
        },
      };

      // Step 5: Open Razorpay modal
      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response: any) {
        toast.error(response.error.description || "Payment failed");
        setIsProcessing(false);
      });

      razorpay.open();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to initiate payment"
      );
      setIsProcessing(false);
    }
  }

  return { initiatePayment, isProcessing };
}
