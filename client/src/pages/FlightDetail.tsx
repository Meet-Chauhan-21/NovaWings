// src/pages/FlightDetail.tsx
// Professional MakeMyTrip-style flight detail page with fare summary

import { useParams, useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFlightById } from "../services/flightService";
import { useAuthContext } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import BackButton from "../components/ui/BackButton";

/* ───────── Helper functions ───────── */

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getFlightDuration(dep: string, arr: string): string {
  const diff = new Date(arr).getTime() - new Date(dep).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

/* ───────── Component ───────── */

export default function FlightDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const [searchParams] = useSearchParams();
  const passengers = parseInt(searchParams.get("passengers") || "1");

  const {
    data: flight,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["flight", id],
    queryFn: () => getFlightById(id!),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message="Failed to load flight details." />;
  if (!flight) return <ErrorMessage message="Flight not found." />;

  const duration = getFlightDuration(flight.departureTime, flight.arrivalTime);
  const baseFare = flight.price * passengers;
  const tax = Math.round(baseFare * 0.18);
  const convenienceFee = 199;
  const total = baseFare + tax + convenienceFee;
  const totalSeats = 180;
  const seatPercent = Math.min(((totalSeats - flight.availableSeats) / totalSeats) * 100, 100);
  const seatBarColor =
    flight.availableSeats > 10 ? "bg-green-500" : flight.availableSeats >= 5 ? "bg-orange-500" : "bg-red-500";
  const seatTextColor =
    flight.availableSeats > 10
      ? "text-emerald-600"
      : flight.availableSeats >= 5
        ? "text-orange-500"
        : "text-red-500";

  return (
    <div className="min-h-screen bg-gray-50 page-enter">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ── Back ── */}
        <div className="mb-4">
          <BackButton label="Back to Results" />
        </div>

        {/* ═══════ Flight Header Card ═══════ */}
        <div className="bg-gradient-to-r from-sky-600 to-blue-700 rounded-2xl text-white p-6 md:p-8 mb-6">
          {/* Row 1 */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <h1 className="text-2xl md:text-3xl font-bold">{flight.airlineName}</h1>
            <span className="text-white/70 font-mono text-lg">{flight.flightNumber}</span>
            <span className="ml-auto bg-white/20 backdrop-blur rounded-full px-3 py-1 text-xs font-medium">
              ✈ Non-stop
            </span>
          </div>

          {/* Row 2: times */}
          <div className="flex items-center gap-4 md:gap-8">
            {/* Departure */}
            <div className="text-center min-w-[100px]">
              <p className="text-3xl md:text-4xl font-bold">{formatTime(flight.departureTime)}</p>
              <p className="text-white/80 font-medium mt-1">{flight.source}</p>
              <p className="text-white/60 text-xs mt-0.5">{formatDate(flight.departureTime)}</p>
            </div>

            {/* Arrow */}
            <div className="flex-1 flex flex-col items-center">
              <span className="text-sm text-white/70 font-medium mb-1">{duration}</span>
              <div className="w-full flex items-center">
                <div className="h-[2px] flex-1 bg-white/30" />
                <span className="mx-2 text-lg">✈</span>
                <div className="h-[2px] flex-1 bg-white/30" />
              </div>
            </div>

            {/* Arrival */}
            <div className="text-center min-w-[100px]">
              <p className="text-3xl md:text-4xl font-bold">{formatTime(flight.arrivalTime)}</p>
              <p className="text-white/80 font-medium mt-1">{flight.destination}</p>
              <p className="text-white/60 text-xs mt-0.5">{formatDate(flight.arrivalTime)}</p>
            </div>
          </div>

          {/* Bottom chips */}
          <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-white/20">
            <span className="bg-white/15 backdrop-blur rounded-full px-3 py-1 text-xs">✈ Non-stop</span>
            <span className="bg-white/15 backdrop-blur rounded-full px-3 py-1 text-xs">
              🪑 {flight.availableSeats} seats left
            </span>
            <span className="bg-white/15 backdrop-blur rounded-full px-3 py-1 text-xs">Economy Class</span>
          </div>
        </div>

        {/* ═══════ Two Column Layout ═══════ */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Left Column: Details ── */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Section 1: Journey Details */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="text-lg font-bold text-gray-800 mb-5">Journey Details</h2>
              <div className="relative pl-8">
                {/* Vertical line */}
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-sky-300" />

                {/* Departure */}
                <div className="relative mb-12">
                  <div className="absolute -left-5 top-1 w-3 h-3 bg-sky-500 rounded-full border-2 border-white shadow" />
                  <p className="font-bold text-gray-800 text-lg">
                    {flight.source}
                  </p>
                  <p className="text-sm text-gray-500">{formatTime(flight.departureTime)} · {formatDate(flight.departureTime)}</p>
                </div>

                {/* Duration label */}
                <div className="absolute left-8 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium flex items-center gap-1.5">
                  <span>✈</span> {flight.airlineName} {flight.flightNumber} · {duration}
                </div>

                {/* Arrival */}
                <div className="relative">
                  <div className="absolute -left-5 top-1 w-3 h-3 bg-sky-500 rounded-full border-2 border-white shadow" />
                  <p className="font-bold text-gray-800 text-lg">
                    {flight.destination}
                  </p>
                  <p className="text-sm text-gray-500">{formatTime(flight.arrivalTime)} · {formatDate(flight.arrivalTime)}</p>
                </div>
              </div>
            </div>

            {/* Section 2: Flight Information */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Flight Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Aircraft", value: "Boeing 737" },
                  { label: "Class", value: "Economy" },
                  { label: "Flight No", value: flight.flightNumber },
                  { label: "Airline", value: flight.airlineName },
                  { label: "Departure", value: `${formatTime(flight.departureTime)}, ${formatDate(flight.departureTime)}` },
                  { label: "Arrival", value: `${formatTime(flight.arrivalTime)}, ${formatDate(flight.arrivalTime)}` },
                  { label: "Duration", value: duration },
                  { label: "Seats Left", value: String(flight.availableSeats) },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">{item.label}</p>
                    <p className="text-sm font-medium text-gray-800">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Baggage Policy */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Baggage Policy</h2>
              <div className="space-y-3">
                {[
                  { icon: "🎒", label: "Cabin Baggage", value: "7 kg (1 piece)" },
                  { icon: "🧳", label: "Check-in Baggage", value: "15 kg (1 piece)" },
                  { icon: "⚠️", label: "Note", value: "Excess baggage charges apply" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 text-sm">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-gray-500 w-36">{item.label}</span>
                    <span className="text-gray-800 font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Cancellation Policy */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Cancellation Policy</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-4 py-2.5 font-semibold text-gray-700 rounded-tl-xl">
                        Time Before Departure
                      </th>
                      <th className="text-left px-4 py-2.5 font-semibold text-gray-700 rounded-tr-xl">
                        Cancellation Fee
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { time: "> 24 hours", fee: "₹3,000 per person", rowClass: "bg-white" },
                      { time: "3 – 24 hours", fee: "₹5,000 per person", rowClass: "bg-gray-50" },
                      { time: "< 3 hours", fee: "Non-refundable", rowClass: "bg-white" },
                    ].map((row) => (
                      <tr key={row.time} className={row.rowClass}>
                        <td className="px-4 py-2.5 text-gray-700">{row.time}</td>
                        <td className="px-4 py-2.5 text-gray-700 font-medium">{row.fee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 5: Amenities */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { icon: "✅", label: "In-flight Meals (paid)" },
                  { icon: "✅", label: "USB Charging" },
                  { icon: "✅", label: "Entertainment" },
                  { icon: "✅", label: "Seat Selection" },
                  { icon: "❌", label: "Free Wi-Fi" },
                  { icon: "✅", label: "Blanket Available" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 text-sm bg-gray-50 rounded-xl px-3 py-2.5"
                  >
                    <span>{item.icon}</span>
                    <span className={item.icon === "❌" ? "text-gray-400" : "text-gray-700"}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right Column: Fare Summary (sticky) ── */}
          <div className="lg:w-[380px] shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl shadow-lg border border-gray-100 p-5 space-y-5">
              <h2 className="text-lg font-bold text-gray-800">Fare Summary</h2>

              {/* Passenger row */}
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-2.5">
                <span>👤</span>
                <span>
                  {passengers} × Economy
                </span>
              </div>

              {/* Price breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>
                    Base Fare ({formatPrice(flight.price)} × {passengers})
                  </span>
                  <span className="font-medium text-gray-800">{formatPrice(baseFare)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Taxes &amp; Surcharges (18%)</span>
                  <span className="font-medium text-gray-800">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Convenience Fee</span>
                  <span className="font-medium text-gray-800">{formatPrice(convenienceFee)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-bold text-gray-800">Total Amount</span>
                  <span className="font-bold text-xl text-sky-600">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Seat availability bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>Seat Availability</span>
                  <span className={`font-semibold ${seatTextColor}`}>{flight.availableSeats} seats remaining</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className={`${seatBarColor} h-full rounded-full transition-all`} style={{ width: `${seatPercent}%` }} />
                </div>
              </div>

              {/* Book CTA */}
              {user ? (
                <Link
                  to={`/book/${flight.id}?passengers=${passengers}`}
                  className="block text-center bg-sky-600 hover:bg-sky-700 text-white w-full py-3 rounded-xl font-bold text-lg transition"
                >
                  Book Now for {formatPrice(total)}
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="block text-center bg-sky-600 hover:bg-sky-700 text-white w-full py-3 rounded-xl font-bold text-lg transition"
                >
                  Login to Book
                </Link>
              )}

              {/* Trust badges */}
              <div className="flex justify-center gap-4 text-xs text-gray-400">
                <span>✅ Secure Booking</span>
                <span>✅ Instant Confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
