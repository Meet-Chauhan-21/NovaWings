// src/pages/BookingDetail.tsx
// Displays full booking details with ticket card, download, and cancel option

import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBookingById, cancelBooking } from "../services/bookingService";
import paymentService from "../services/paymentService";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import BackButton from "../components/ui/BackButton";
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

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const { ticketRef, downloadTicket, isDownloading } = useTicketDownload();

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => getBookingById(id!),
    enabled: !!id,
  });

  const { data: payments } = useQuery({
    queryKey: ["myPayments"],
    queryFn: () => paymentService.getMyPayments(),
    enabled: !!booking,
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelBooking(booking!.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["booking", id], updated);
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
      toast.success("Booking cancelled successfully.");
      setShowModal(false);
    },
    onError: () => {
      toast.error("Failed to cancel booking.");
    },
  });

  const ticketData: TicketData | null = useMemo(() => {
    if (!booking) return null;
    const payment = payments?.find((p) => p.bookingId === booking.id);

    const depTime = booking.departureTimeStr || booking.bookingDate;
    const arrTime = booking.arrivalTime || "";

    return {
      bookingId: booking.id,
      bookingDate: formatDateStr(booking.bookingDate),
      status: booking.status,
      passengerName: booking.userName || "Passenger",
      passengerEmail: booking.userEmail || "",
      flightNumber: booking.flightNumber,
      airlineName: booking.airlineName,
      source: booking.source,
      sourceCode: getAirportCode(booking.source),
      destination: booking.destination,
      destinationCode: getAirportCode(booking.destination),
      departureDate: depTime ? formatDateStr(depTime) : formatDateStr(booking.bookingDate),
      departureTime: depTime ? formatTimeStr(depTime) : "--:--",
      arrivalTime: arrTime ? formatTimeStr(arrTime) : "Check Airline",
      duration: booking.duration || "",
      numberOfSeats: booking.numberOfSeats,
      selectedSeats: booking.selectedSeats || [],
      cabinClass: "Economy",
      cabinBaggage: "7 kg per person",
      checkInBaggage: "15 kg per person",
      razorpayPaymentId: payment?.razorpayPaymentId || booking.paymentId || "",
      baseFare: payment?.baseFare || Math.round(booking.totalPrice * 0.82),
      taxes: payment?.taxes || Math.round(booking.totalPrice * 0.15),
      convenienceFee: payment?.convenienceFee || 199,
      totalAmount: booking.totalPrice,
      currency: "INR",
    };
  }, [booking, payments]);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message="Failed to load booking details." />;
  if (!booking) return <ErrorMessage message="Booking not found." />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 page-enter">
      <div className="mb-4">
        <BackButton to="/my-bookings" label="My Bookings" />
      </div>

      {/* Ticket */}
      {ticketData && <TicketCard ref={ticketRef} ticket={ticketData} />}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
        <button
          onClick={() =>
            downloadTicket(
              booking.id.slice(-8),
              booking.userName || "Ticket"
            )
          }
          disabled={isDownloading}
          className="flex items-center gap-3 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl transition shadow-sm disabled:opacity-50"
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

        {booking.status === "CONFIRMED" && (
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 border border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-xl transition"
          >
            Cancel Booking
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Cancel Booking?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium text-gray-700"
              >
                Keep Booking
              </button>
              <button
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-medium disabled:opacity-50"
              >
                {cancelMutation.isPending ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
