// src/pages/MyBookings.tsx
// Displays all bookings for the currently authenticated user

import { useQuery } from "@tanstack/react-query";
import { getMyBookings } from "../services/bookingService";
import BookingCard from "../components/BookingCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";

/**
 * MyBookings page fetches the current user's bookings and
 * renders them in a responsive grid of BookingCard components.
 */
export default function MyBookings() {
  const { data: bookings, isLoading, isError } = useQuery({
    queryKey: ["myBookings"],
    queryFn: getMyBookings,
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message="Failed to load your bookings." />;
  if (!bookings || bookings.length === 0) {
    return (
      <EmptyState
        icon="📋"
        heading="No Bookings Yet"
        subtext="You haven't made any bookings. Start exploring flights and book your next trip!"
        actionLabel="Browse Flights"
        actionPath="/flights"
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Bookings</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
      </div>
    </div>
  );
}
