// src/pages/Flights.tsx
// Lists all available flights in a responsive grid

import { useQuery } from "@tanstack/react-query";
import { getAllFlights } from "../services/flightService";
import FlightCard from "../components/FlightCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";

/**
 * Flights page fetches and displays all flights from the API.
 * Shows loading spinner, error message, or empty state as appropriate.
 */
export default function Flights() {
  const { data: flights, isLoading, isError } = useQuery({
    queryKey: ["flights"],
    queryFn: getAllFlights,
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message="Failed to load flights. Please try again later." />;
  if (!flights || flights.length === 0) {
    return (
      <EmptyState
        heading="No Flights Available"
        subtext="There are currently no flights available. Please check back later."
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">All Flights</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {flights.map((flight) => (
          <FlightCard key={flight.id} flight={flight} />
        ))}
      </div>
    </div>
  );
}
