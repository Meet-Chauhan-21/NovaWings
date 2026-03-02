// src/pages/BookingDetail.tsx
// Displays full booking details with cancel option

import { useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBookingById, cancelBooking } from "../services/bookingService";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import BackButton from "../components/ui/BackButton";

/**
 * BookingDetail page fetches a single booking by ID, shows all details,
 * and provides a cancel button with confirmation modal for confirmed bookings.
 */
export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => getBookingById(id!),
    enabled: !!id,
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

  /** Format an ISO date string */
  const formatDate = (iso: string): string => {
    return new Date(iso).toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message="Failed to load booking details." />;
  if (!booking) return <ErrorMessage message="Booking not found." />;

  const statusClasses =
    booking.status === "CONFIRMED"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 page-enter">
      <div className="mb-4">
        <BackButton to="/my-bookings" label="My Bookings" />
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Booking #{booking.id}</h1>
          <span className={`rounded-full px-4 py-1 text-sm font-medium ${statusClasses}`}>
            {booking.status}
          </span>
        </div>

        {/* Flight Info */}
        <div className="mb-6">
          <h2 className="text-sm uppercase tracking-wide text-gray-400 mb-3">Flight Details</h2>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sky-600 font-bold">{booking.airlineName}</span>
              <span className="text-gray-500 font-mono text-sm">{booking.flightNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <span>{booking.source}</span>
              <span className="text-sky-500">→</span>
              <span>{booking.destination}</span>
            </div>
          </div>
        </div>

        {/* Booking Info */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Booking Date</p>
            <p className="text-gray-800 font-medium">{formatDate(booking.bookingDate)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Seats Booked</p>
            <p className="text-gray-800 font-medium">{booking.numberOfSeats}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 col-span-2">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Total Price</p>
            <p className="text-2xl font-bold text-sky-600">₹{booking.totalPrice.toLocaleString("en-IN")}</p>
          </div>
        </div>

        {/* Cancel Button */}
        {booking.status === "CONFIRMED" && (
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 transition hover:scale-105 font-medium"
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
