// src/pages/BookingConfirmation.tsx
// Booking confirmation page shown after successful payment — boarding pass style ticket

import { useParams, useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBookingById } from "../services/bookingService";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

/** Format ISO date to readable string */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Format time from ISO string */
function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function BookingConfirmation() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const paymentResult = location.state?.paymentResult;

  // Fallback: fetch booking from API if no state passed
  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => getBookingById(bookingId!),
    enabled: !!bookingId && !paymentResult,
  });

  // Use payment result from navigation state, or fetched booking data
  const source = paymentResult?.source || booking?.source || "";
  const destination = paymentResult?.destination || booking?.destination || "";
  const flightNumber = paymentResult?.flightNumber || booking?.flightNumber || "";
  const numberOfSeats = paymentResult?.numberOfSeats || booking?.numberOfSeats || 0;
  const selectedSeats = paymentResult?.selectedSeats || booking?.selectedSeats || [];
  const totalAmount = paymentResult?.totalAmount || booking?.totalPrice || 0;
  const paymentId = paymentResult?.paymentId || booking?.paymentId || "";
  const departureTime = paymentResult?.departureTime || "";
  const status = paymentResult?.status || booking?.status || "CONFIRMED";
  const bookingDate = booking?.bookingDate || new Date().toISOString();

  if (!paymentResult && isLoading) return <LoadingSpinner />;
  if (!paymentResult && isError) return <ErrorMessage message="Failed to load booking details." />;
  if (!paymentResult && !booking) return <ErrorMessage message="Booking not found." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 py-12 px-4">
      {/* Print-specific styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .ticket { box-shadow: none !important; }
        }
        @keyframes checkPop {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        .check-animate {
          animation: checkPop 0.6s ease-out forwards;
        }
      `}</style>

      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="check-animate inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Payment Successful!</h1>
          <p className="text-gray-500 mt-1">Your booking has been confirmed</p>
        </div>

        {/* Boarding Pass Ticket */}
        <div className="ticket bg-white rounded-3xl shadow-2xl overflow-hidden border-l-8 border-sky-500">
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-600 to-blue-700 px-8 py-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✈</span>
                <div>
                  <p className="font-bold text-lg">{flightNumber}</p>
                </div>
              </div>
              <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide">
                {status}
              </span>
            </div>
          </div>

          {/* Route Section */}
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">{source}</p>
                {departureTime && (
                  <p className="text-sm text-gray-500 mt-1">{formatTime(departureTime)}</p>
                )}
              </div>
              <div className="flex-1 mx-6 flex items-center">
                <div className="flex-1 border-t-2 border-dashed border-gray-300" />
                <span className="mx-3 text-sky-500 text-xl">✈</span>
                <div className="flex-1 border-t-2 border-dashed border-gray-300" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">{destination}</p>
              </div>
            </div>
          </div>

          {/* Ticket Notch Separator */}
          <div className="relative">
            <div className="border-t-2 border-dashed border-gray-200 mx-4" />
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 rounded-full" />
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 rounded-full" />
          </div>

          {/* Details Grid */}
          <div className="px-8 py-6 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Seats</p>
              <p className="font-semibold text-gray-800">
                {selectedSeats.length > 0 ? selectedSeats.join(", ") : `${numberOfSeats} seat(s)`}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Date</p>
              <p className="font-semibold text-gray-800">
                {departureTime ? formatDate(departureTime) : formatDate(bookingDate)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Booking ID</p>
              <p className="font-mono text-sm text-gray-700">#{bookingId?.slice(-8).toUpperCase()}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Payment ID</p>
              <p className="font-mono text-sm text-gray-700">
                {paymentId ? paymentId.slice(0, 16) + "..." : "—"}
              </p>
            </div>
          </div>

          {/* Price Separator */}
          <div className="relative">
            <div className="border-t-2 border-dashed border-gray-200 mx-4" />
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 rounded-full" />
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 rounded-full" />
          </div>

          {/* Price Section */}
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Total Paid</span>
              <span className="text-2xl font-bold text-sky-600">
                ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 no-print">
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-medium py-3 rounded-2xl hover:bg-gray-50 transition shadow-sm"
          >
            <span>📥</span> Download Ticket
          </button>
          <Link
            to="/explore"
            className="flex-1 flex items-center justify-center gap-2 bg-sky-600 text-white font-medium py-3 rounded-2xl hover:bg-sky-700 transition shadow-sm"
          >
            <span>✈</span> Book Another Flight
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
