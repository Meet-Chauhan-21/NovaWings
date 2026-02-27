// src/pages/SearchResults.tsx
// Displays search results for flights filtered by source and destination

import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { searchFlights } from "../services/flightService";
import FlightCard from "../components/FlightCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";

/**
 * SearchResults page reads source and destination from URL query params,
 * fetches matching flights, and displays them in a grid.
 */
export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const source = searchParams.get("source") || "";
  const destination = searchParams.get("destination") || "";

  const { data: flights, isLoading, isError } = useQuery({
    queryKey: ["flights", "search", source, destination],
    queryFn: () => searchFlights(source, destination),
    enabled: !!(source || destination),
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message="Failed to search flights. Please try again." />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Search Results</h1>
      {source && destination && (
        <p className="text-gray-500 mb-8">
          Flights from <span className="font-medium text-gray-700">{source}</span> to{" "}
          <span className="font-medium text-gray-700">{destination}</span>
        </p>
      )}

      {!flights || flights.length === 0 ? (
        <EmptyState
          heading="No Flights Found"
          subtext="We couldn't find any flights matching your search. Try different cities."
          actionLabel="Browse All Flights"
          actionPath="/flights"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {flights.map((flight) => (
            <FlightCard key={flight.id} flight={flight} />
          ))}
        </div>
      )}
    </div>
  );
}
