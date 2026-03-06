// src/pages/BookingConfirmation.tsx
// Booking confirmation page shown after successful payment — professional e-ticket

import { useMemo } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBookingById } from "../services/bookingService";
import paymentService from "../services/paymentService";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import TicketCard from "../components/TicketCard";
import { useTicketDownload } from "../hooks/useTicketDownload";
import { getAirportCode } from "../utils/airportHelper";
import type { TicketData } from "../types";

function formatDateStr(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTimeStr(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function BookingConfirmation() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const paymentResult = location.state?.paymentResult;
  const { ticketRef, downloadTicket, isDownloading } = useTicketDownload();

  // Fetch booking as fallback (if user refreshes page)
  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => getBookingById(bookingId!),
    enabled: !!bookingId,
  });

  // Fetch payment details for price breakdown
  const { data: payments } = useQuery({
    queryKey: ["myPayments"],
    queryFn: paymentService.getMyPayments,
    enabled: !!bookingId,
  });

  const ticketData: TicketData | null = useMemo(() => {
    const b = booking;
    const pr = paymentResult;

    const source = pr?.source || b?.source || "";
    const destination = pr?.destination || b?.destination || "";
    const flightNumber = pr?.flightNumber || b?.flightNumber || "";
    const numberOfSeats = pr?.numberOfSeats || b?.numberOfSeats || 0;
    const selectedSeats = pr?.selectedSeats || b?.selectedSeats || [];
    const totalAmount = pr?.totalAmount || b?.totalPrice || 0;
    const paymentId = pr?.paymentId || b?.paymentId || "";
    const departureTime = pr?.departureTime || b?.departureTimeStr || "";
    const arrivalTime = b?.arrivalTime || "";
    const duration = b?.duration || "";
    const passengerName = b?.userName || "Passenger";
    const passengerEmail = b?.userEmail || "";
    const airlineName = b?.airlineName || "";
    const bookingDate = b?.bookingDate || new Date().toISOString();
    const status = pr?.status || b?.status || "CONFIRMED";

    if (!source && !pr) return null;

    // Find payment record for price breakdown
    const payment = payments?.find((p) => p.bookingId === bookingId);

    return {
      bookingId: bookingId || "",
      bookingDate: formatDateStr(bookingDate),
      status: String(status),
      passengerName,
      passengerEmail,
      flightNumber,
      airlineName,
      source,
      sourceCode: getAirportCode(source),
      destination,
      destinationCode: getAirportCode(destination),
      departureDate: departureTime ? formatDateStr(departureTime) : formatDateStr(bookingDate),
      departureTime: departureTime ? formatTimeStr(departureTime) : "--:--",
      arrivalTime: arrivalTime ? formatTimeStr(arrivalTime) : "Check Airline",
      duration,
      numberOfSeats,
      selectedSeats: selectedSeats || [],
      cabinClass: "Economy",
      cabinBaggage: "7 kg per person",
      checkInBaggage: "15 kg per person",
      razorpayPaymentId: payment?.razorpayPaymentId || paymentId || "",
      baseFare: payment?.baseFare || Math.round(totalAmount * 0.82),
      taxes: payment?.taxes || Math.round(totalAmount * 0.15),
      convenienceFee: payment?.convenienceFee || 199,
      totalAmount,
      currency: "INR",
    };
  }, [booking, paymentResult, payments, bookingId]);

  if (!paymentResult && isLoading) return <LoadingSpinner />;
  if (!paymentResult && isError) return <ErrorMessage message="Failed to load booking details." />;
  if (!paymentResult && !booking) return <ErrorMessage message="Booking not found." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 py-12 px-4">
      <style>{`
        @keyframes checkPop {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          60% { transform: scale(1.3) rotate(5deg); }
          80% { transform: scale(0.95); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .check-animate {
          animation: checkPop 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        @keyframes confettiFall {
          0% { transform: translateY(-10px); opacity: 1; }
          100% { transform: translateY(60px); opacity: 0; }
        }
        .confetti-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: confettiFall 1.2s ease-out forwards;
        }
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="max-w-2xl mx-auto">
        {/* ── Success Header with Animation ── */}
        <div className="text-center mb-10">
          <div className="relative inline-block">
            <div className="check-animate inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-4">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            {/* Confetti dots */}
            {["#ef4444","#3b82f6","#22c55e","#eab308","#a855f7","#f97316","#ec4899","#06b6d4"].map((color, i) => (
              <div
                key={i}
                className="confetti-dot"
                style={{
                  backgroundColor: color,
                  top: `${10 + Math.sin(i * 0.8) * 30}px`,
                  left: `${50 + Math.cos(i * 0.8) * 50}%`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Payment Successful!</h1>
          <p className="text-gray-500 mt-1">Your booking has been confirmed</p>
        </div>

        {/* ── Full Professional Ticket ── */}
        {ticketData && <TicketCard ref={ticketRef} ticket={ticketData} />}

        {/* ── Actions ── */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 no-print">
          <button
            onClick={() =>
              ticketData &&
              downloadTicket(ticketData.bookingId, ticketData.passengerName)
            }
            disabled={isDownloading || !ticketData}
            className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-base rounded-2xl transition shadow-lg shadow-sky-200 disabled:opacity-60"
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating PDF...
              </>
            ) : (
              <>📥 Download Ticket PDF</>
            )}
          </button>
          <Link
            to="/explore"
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-medium py-4 rounded-2xl hover:bg-gray-50 transition shadow-sm"
          >
            ✈ Book Another Flight
          </Link>
        </div>

        <div className="mt-4 text-center no-print">
          <Link
            to="/my-bookings"
            className="text-sky-600 hover:text-sky-700 font-medium text-sm hover:underline"
          >
            📋 View All My Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}
