// src/components/FlightCard.tsx
// Displays a single flight as a styled card with key info

import React from "react";
import { Link } from "react-router-dom";
import type { Flight } from "../types";

interface FlightCardProps {
  flight: Flight;
}

/**
 * FlightCard renders a card showing airline, route, times, price, and seats.
 * Includes a "View Details" button linking to the flight detail page.
 */
const FlightCard: React.FC<FlightCardProps> = React.memo(({ flight }) => {
  /** Format an ISO date string to a readable short format */
  const formatTime = (iso: string): string => {
    const date = new Date(iso);
    return date.toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sky-600 font-bold text-lg">{flight.airlineName}</span>
          <span className="text-gray-500 text-sm font-mono">{flight.flightNumber}</span>
        </div>

        <div className="flex items-center gap-2 mb-4 text-gray-800 font-medium text-base">
          <span>{flight.source}</span>
          <span className="text-sky-500">→</span>
          <span>{flight.destination}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div>
            <p className="text-xs uppercase tracking-wide">Departure</p>
            <p className="text-gray-700 font-medium">{formatTime(flight.departureTime)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide">Arrival</p>
            <p className="text-gray-700 font-medium">{formatTime(flight.arrivalTime)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-sky-600">₹{flight.price.toLocaleString("en-IN")}</span>
          <span className="text-gray-500 text-sm flex items-center gap-1">
            💺 {flight.availableSeats} seats
          </span>
        </div>
      </div>

      <Link
        to={`/flights/${flight.id}`}
        className="block text-center bg-sky-500 text-white py-2.5 rounded-xl hover:bg-sky-600 transition hover:scale-105 font-medium"
      >
        View Details
      </Link>
    </div>
  );
});

FlightCard.displayName = "FlightCard";

export default FlightCard;
