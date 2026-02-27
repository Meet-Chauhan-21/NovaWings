// src/components/BookingCard.tsx
// Displays a single booking as a styled card

import React from "react";
import { Link } from "react-router-dom";
import type { BookingResponse } from "../types";

interface BookingCardProps {
  booking: BookingResponse;
}

/**
 * BookingCard renders a card showing flight route, airline, booking date,
 * seats, total price, and a colored status badge.
 */
const BookingCard: React.FC<BookingCardProps> = React.memo(({ booking }) => {
  /** Format an ISO date string to a readable date */
  const formatDate = (iso: string): string => {
    return new Date(iso).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const statusClasses =
    booking.status === "CONFIRMED"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sky-600 font-bold">{booking.airlineName}</span>
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusClasses}`}>
            {booking.status}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-3 text-gray-800 font-medium">
          <span>{booking.source}</span>
          <span className="text-sky-500">→</span>
          <span>{booking.destination}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Flight</p>
            <p className="font-medium text-gray-700">{booking.flightNumber}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Date</p>
            <p className="font-medium text-gray-700">{formatDate(booking.bookingDate)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Seats</p>
            <p className="font-medium text-gray-700">{booking.numberOfSeats}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Total</p>
            <p className="font-bold text-sky-600">₹{booking.totalPrice.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      <Link
        to={`/bookings/${booking.id}`}
        className="block text-center bg-sky-500 text-white py-2.5 rounded-xl hover:bg-sky-600 transition hover:scale-105 font-medium"
      >
        View Details
      </Link>
    </div>
  );
});

BookingCard.displayName = "BookingCard";

export default BookingCard;
