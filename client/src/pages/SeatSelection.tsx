// src/pages/SeatSelection.tsx
// Airplane seat selection page with visual cabin layout

import { useState, useMemo, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getFlightById } from "../services/flightService";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import BookingProgress from "../components/BookingProgress";

const SEATS_PER_ROW = 6;
const BUSINESS_ROWS = 2;
const AISLE_POSITION = 3;

interface SeatInfo {
  id: string;
  row: number;
  position: number;
  label: string;
  isBooked: boolean;
  isBusiness: boolean;
}

/**
 * Seeded random number generator for consistent booked seat selection.
 * Same flightId will always generate the same booked seats.
 */
function seededRandom(seed: string): number {
  const x = Math.sin(seed.split("").reduce((a, b) => a + b.charCodeAt(0), 0)) * 10000;
  return x - Math.floor(x);
}

/**
 * Generate airplane seat layout with random booked seats.
 */
function generateSeats(totalSeats: number, flightId: string): SeatInfo[] {
  const seats: SeatInfo[] = [];
  const totalRows = Math.ceil(totalSeats / SEATS_PER_ROW);
  const bookedCount = Math.ceil(totalSeats * 0.3);
  const bookedIndices = new Set<number>();

  // Generate random booked seat indices (seeded by flightId)
  let generated = 0;
  let attempt = 0;
  while (generated < bookedCount && attempt < totalSeats * 2) {
    const idx = Math.floor(seededRandom(`${flightId}-${attempt}`) * totalSeats);
    if (!bookedIndices.has(idx)) {
      bookedIndices.add(idx);
      generated++;
    }
    attempt++;
  }

  // Create seat objects
  let seatIndex = 0;
  for (let row = 1; row <= totalRows; row++) {
    for (let pos = 0; pos < SEATS_PER_ROW; pos++) {
      if (seatIndex >= totalSeats) break;
      const label = String.fromCharCode(65 + pos) + row;
      seats.push({
        id: label,
        row,
        position: pos,
        label,
        isBooked: bookedIndices.has(seatIndex),
        isBusiness: row <= BUSINESS_ROWS,
      });
      seatIndex++;
    }
  }

  return seats;
}

/**
 * SeatSelection page — interactive airplane seat picker before confirming booking.
 */
export default function SeatSelection() {
  const navigate = useNavigate();
  const { flightId } = useParams<{ flightId: string }>();
  const [searchParams] = useSearchParams();

  const numberOfSeats = parseInt(searchParams.get("seats") || "1");
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());

  const { data: flight, isLoading, isError } = useQuery({
    queryKey: ["flight", flightId],
    queryFn: () => getFlightById(flightId!),
    enabled: !!flightId,
  });

  const seats = useMemo(
    () => generateSeats(flight?.availableSeats ?? 0, flightId!),
    [flight?.availableSeats, flightId]
  );

  const totalPrice = (flight?.price ?? 0) * numberOfSeats;
  const taxPrice = Math.ceil(totalPrice * 0.18);
  const convenienceFee = 199;
  const grandTotal = totalPrice + taxPrice + convenienceFee;

  const handleConfirmBooking = useCallback(() => {
    if (selectedSeats.size !== numberOfSeats) {
      toast.error(`Please select exactly ${numberOfSeats} seats`);
      return;
    }
    if (!flight) return;

    navigate(`/select-food/${flightId}`, {
      state: {
        flightId,
        flightNumber: flight.flightNumber,
        airlineName: flight.airlineName,
        source: flight.source,
        destination: flight.destination,
        departureTime: flight.departureTime,
        numberOfSeats,
        selectedSeats: Array.from(selectedSeats).sort(),
        cabinClass: "Economy",
        basePrice: flight.price,
        totalBeforeFood: grandTotal,
      },
    });
  }, [selectedSeats, numberOfSeats, flight, flightId, navigate, grandTotal]);

  const handleSeatClick = useCallback(
    (seatId: string, isBooked: boolean) => {
      if (isBooked) {
        toast("This seat is already booked");
        return;
      }

      setSelectedSeats((prev) => {
        const next = new Set(prev);
        if (next.has(seatId)) {
          next.delete(seatId);
        } else {
          if (next.size >= numberOfSeats) {
            toast.error(`You can only select ${numberOfSeats} seat${numberOfSeats > 1 ? "s" : ""}`);
            return prev;
          }
          next.add(seatId);
        }
        return next;
      });
    },
    [numberOfSeats]
  );

  const isFull = selectedSeats.size === numberOfSeats;

  if (isLoading) return <LoadingSpinner />;
  if (isError || !flight) return <ErrorMessage message="Failed to load flight details." />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <BookingProgress activeStep={2} />
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Select Your Seats</h1>
      <p className="text-gray-600 mb-8">Choose {numberOfSeats} seat{numberOfSeats > 1 ? "s" : ""} for your flight</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Airplane Seat Grid */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Airplane nose */}
            <div className="flex justify-center mb-8">
              <div className="text-4xl">✈️</div>
            </div>

            {/* Seats grid */}
            <div className="space-y-4">
              {Array.from({ length: Math.ceil(seats.length / SEATS_PER_ROW) }).map((_, rowIdx) => {
                const rowSeats = seats.slice(rowIdx * SEATS_PER_ROW, (rowIdx + 1) * SEATS_PER_ROW);
                return (
                  <div key={rowIdx} className="flex items-center justify-center gap-1">
                    <span className="w-8 text-center text-sm font-medium text-gray-600">{rowIdx + 1}</span>
                    <div className="flex gap-1">
                      {rowSeats.map((seat, _posIdx) => {
                        const isSelected = selectedSeats.has(seat.id);
                        const isBusiness = seat.isBusiness;
                        const isBookedSeat = seat.isBooked;

                        let classes = "w-10 h-10 rounded border-2 font-bold text-sm cursor-pointer transition-all ";

                        if (isBookedSeat) {
                          classes += "bg-gray-300 border-gray-400 text-gray-400 cursor-not-allowed opacity-60";
                        } else if (isSelected) {
                          classes += isBusiness
                            ? "bg-amber-500 border-amber-600 text-white scale-110"
                            : "bg-sky-600 border-sky-700 text-white scale-110";
                        } else if (isBusiness) {
                          classes += "bg-amber-100 border-amber-400 text-amber-700 hover:bg-amber-200";
                        } else {
                          classes += "bg-sky-100 border-sky-400 text-sky-700 hover:bg-sky-200";
                        }

                        return (
                          <button
                            key={seat.id}
                            onClick={() => handleSeatClick(seat.id, isBookedSeat)}
                            disabled={isBookedSeat}
                            className={classes}
                          >
                            {seat.label}
                          </button>
                        );
                      })}
                      {/* Aisle */}
                      {rowSeats.length > AISLE_POSITION && (
                        <div className="w-2 h-10 mx-2 border-l-2 border-dashed border-gray-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Airplane tail */}
            <div className="flex justify-center mt-8 text-2xl">📍</div>

            {/* Legend */}
            <div className="mt-8 pt-8 border-t border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-sky-100 border-2 border-sky-400 rounded" />
                <span className="text-sm text-gray-600">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-sky-600 border-2 border-sky-700 rounded" />
                <span className="text-sm text-gray-600">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-amber-100 border-2 border-amber-400 rounded" />
                <span className="text-sm text-gray-600">Business</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-300 border-2 border-gray-400 rounded" />
                <span className="text-sm text-gray-600">Booked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4 space-y-6">
            {/* Flight summary */}
            <div className="space-y-3 pb-6 border-b border-gray-200">
              <h3 className="font-bold text-gray-800">Flight Summary</h3>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">From:</span>
                  <span className="font-medium text-gray-800">{flight.source}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">To:</span>
                  <span className="font-medium text-gray-800">{flight.destination}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Airline:</span>
                  <span className="font-medium text-gray-800">{flight.airlineName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Price/Seat:</span>
                  <span className="font-medium text-sky-600">₹{flight.price.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Selected seats */}
            <div className="space-y-2 pb-6 border-b border-gray-200">
              <h3 className="font-bold text-gray-800">Selected Seats</h3>
              {selectedSeats.size === 0 ? (
                <p className="text-sm text-gray-500 italic">No seats selected yet</p>
              ) : (
                <p className="text-sm font-medium text-gray-700">
                  {Array.from(selectedSeats)
                    .sort()
                    .join(", ")}
                </p>
              )}
              <p className="text-xs text-gray-500">
                {selectedSeats.size}/{numberOfSeats} seat{numberOfSeats > 1 ? "s" : ""}
              </p>
            </div>

            {/* Price breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Seat Price:</span>
                <span className="font-medium">
                  ₹{flight.price.toLocaleString("en-IN")} × {numberOfSeats}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Taxes & Fees (18%):</span>
                <span className="font-medium">₹{taxPrice.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Convenience Fee:</span>
                <span className="font-medium">₹{convenienceFee.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span className="text-sky-600">₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Confirm button */}
            <button
              onClick={handleConfirmBooking}
              disabled={!isFull}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                isFull
                  ? "bg-sky-600 text-white hover:bg-sky-700 active:scale-95"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <>Continue to Meals</>
            </button>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 mt-3">
              <span className="text-xs text-gray-500 flex items-center gap-1">256-bit SSL</span>
              <span className="text-xs text-gray-500 flex items-center gap-1">Razorpay Secured</span>
              <span className="text-xs text-gray-500 flex items-center gap-1">All cards accepted</span>
            </div>

            {!isFull && selectedSeats.size > 0 && (
              <p className="text-xs text-amber-600 text-center">
                Select {numberOfSeats - selectedSeats.size} more seat{numberOfSeats - selectedSeats.size > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
