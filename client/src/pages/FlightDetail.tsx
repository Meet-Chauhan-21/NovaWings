// src/pages/FlightDetail.tsx
// Displays detailed information about a single flight with a booking CTA

import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFlightById } from "../services/flightService";
import { useAuthContext } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

/**
 * FlightDetail page fetches a single flight by ID from the URL params
 * and displays all its details. Shows a "Book Now" or "Login to Book" CTA.
 */
export default function FlightDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();

  const { data: flight, isLoading, isError } = useQuery({
    queryKey: ["flight", id],
    queryFn: () => getFlightById(id!),
    enabled: !!id,
  });

  /** Format an ISO date string to a readable format */
  const formatDateTime = (iso: string): string => {
    return new Date(iso).toLocaleString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message="Failed to load flight details." />;
  if (!flight) return <ErrorMessage message="Flight not found." />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{flight.airlineName}</h1>
            <p className="text-gray-500 font-mono">{flight.flightNumber}</p>
          </div>
          <span className="text-3xl font-bold text-sky-600">₹{flight.price.toLocaleString("en-IN")}</span>
        </div>

        {/* Route */}
        <div className="flex items-center gap-4 mb-8 text-lg">
          <div className="text-center">
            <p className="text-xs uppercase tracking-wide text-gray-400">From</p>
            <p className="font-bold text-gray-800 text-xl">{flight.source}</p>
          </div>
          <div className="flex-1 border-t-2 border-dashed border-sky-300 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-sky-500">✈</span>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-wide text-gray-400">To</p>
            <p className="font-bold text-gray-800 text-xl">{flight.destination}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Departure</p>
            <p className="text-gray-800 font-medium">{formatDateTime(flight.departureTime)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Arrival</p>
            <p className="text-gray-800 font-medium">{formatDateTime(flight.arrivalTime)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Available Seats</p>
            <p className="text-gray-800 font-medium">💺 {flight.availableSeats}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Price per Seat</p>
            <p className="text-sky-600 font-bold">₹{flight.price.toLocaleString("en-IN")}</p>
          </div>
        </div>

        {/* Action Button */}
        {user ? (
          <Link
            to={`/book/${flight.id}`}
            className="block text-center bg-sky-500 text-white py-3 rounded-xl hover:bg-sky-600 transition hover:scale-105 font-medium text-lg"
          >
            Book Now
          </Link>
        ) : (
          <Link
            to="/login"
            className="block text-center bg-gray-800 text-white py-3 rounded-xl hover:bg-gray-900 transition hover:scale-105 font-medium text-lg"
          >
            Login to Book
          </Link>
        )}
      </div>
    </div>
  );
}
