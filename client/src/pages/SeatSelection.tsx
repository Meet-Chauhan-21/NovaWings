// src/pages/SeatSelection.tsx
// Airplane seat selection page with visual cabin layout — dark theme

import { useState, useMemo, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { getFlightById } from "../services/flightService";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import BookingProgress from "../components/BookingProgress";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";

import FlightIcon from "@mui/icons-material/Flight";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VerifiedIcon from "@mui/icons-material/Verified";

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
    <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 3 }, py: { xs: 3, md: 5 } }}>
      <BookingProgress activeStep={2} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Back button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            mb: 2,
            color: "var(--nw-text-secondary)",
            textTransform: "none",
            fontWeight: 500,
            fontSize: "0.875rem",
            px: 0,
            "&:hover": { color: "var(--nw-primary)", background: "transparent" },
          }}
        >
          Back
        </Button>

        <Typography sx={{ fontSize: { xs: "1.5rem", md: "1.8rem" }, fontWeight: 800, color: "var(--nw-text-primary)", mb: 0.5 }}>
          Select Your Seats
        </Typography>
        <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.9rem", mb: 4 }}>
          Choose {numberOfSeats} seat{numberOfSeats > 1 ? "s" : ""} for your flight
        </Typography>
      </motion.div>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 340px" }, gap: 3 }}>
        {/* Airplane Seat Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Paper
            sx={{
              background: "var(--nw-card)",
              border: "1px solid var(--nw-border)",
              borderRadius: "20px",
              p: { xs: 3, sm: 5 },
              overflow: "hidden",
            }}
          >
            {/* Airplane nose */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--nw-primary-15), rgba(249,115,22,0.05))",
                  border: "1px solid var(--nw-primary-20)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FlightIcon sx={{ color: "var(--nw-primary)", fontSize: 28 }} />
              </Box>
            </Box>

            {/* Column labels */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2, gap: "4px" }}>
              <Box sx={{ width: 32, mr: "4px" }} />
              {["A", "B", "C", "", "D", "E", "F"].map((letter, i) => (
                <Box
                  key={i}
                  sx={{
                    width: letter ? { xs: 36, sm: 42 } : 16,
                    textAlign: "center",
                  }}
                >
                  <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.7rem", fontWeight: 600 }}>
                    {letter}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Seats grid */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {Array.from({ length: Math.ceil(seats.length / SEATS_PER_ROW) }).map((_, rowIdx) => {
                const rowSeats = seats.slice(rowIdx * SEATS_PER_ROW, (rowIdx + 1) * SEATS_PER_ROW);
                const isBizRow = rowIdx < BUSINESS_ROWS;
                return (
                  <Box key={rowIdx} sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                    <Typography
                      sx={{
                        width: 32,
                        textAlign: "center",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        color: "var(--nw-text-muted)",
                      }}
                    >
                      {rowIdx + 1}
                    </Typography>
                    {rowSeats.map((seat, posIdx) => {
                      const isSelected = selectedSeats.has(seat.id);
                      const isBookedSeat = seat.isBooked;

                      let bg = "var(--nw-border-soft)";
                      let border = "1px solid var(--nw-border-strong)";
                      let color = "var(--nw-text-secondary)";
                      let cursor = "pointer";
                      let hoverBg = "var(--nw-primary-10)";
                      let transform = "none";

                      if (isBookedSeat) {
                        bg = "var(--nw-glass)";
                        border = "1px solid var(--nw-border-soft)";
                        color = "var(--nw-text-disabled)";
                        cursor = "not-allowed";
                        hoverBg = bg;
                      } else if (isSelected) {
                        bg = "linear-gradient(135deg, var(--nw-primary), var(--nw-primary-dark))";
                        border = "1px solid var(--nw-primary)";
                        color = "var(--nw-text-primary)";
                        transform = "scale(1.08)";
                        hoverBg = bg;
                      } else if (isBizRow) {
                        bg = "var(--nw-warning-08)";
                        border = "1px solid var(--nw-warning-20)";
                        color = "var(--nw-secondary)";
                        hoverBg = "var(--nw-warning-15)";
                      }

                      return (
                        <Box key={seat.id} sx={{ display: "flex", gap: "4px" }}>
                          {posIdx === AISLE_POSITION && (
                            <Box sx={{ width: 16 }} />
                          )}
                          <Box
                            component="button"
                            onClick={() => handleSeatClick(seat.id, isBookedSeat)}
                            disabled={isBookedSeat}
                            sx={{
                              width: { xs: 36, sm: 42 },
                              height: { xs: 36, sm: 42 },
                              borderRadius: "8px",
                              background: bg,
                              border,
                              color,
                              cursor,
                              transform,
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.2s ease",
                              outline: "none",
                              p: 0,
                              "&:hover:not(:disabled)": {
                                background: hoverBg,
                                transform: isSelected ? "scale(1.08)" : "scale(1.05)",
                              },
                            }}
                          >
                            {seat.label}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                );
              })}
            </Box>

            {/* Airplane tail */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Box sx={{ width: 40, height: 2, background: "var(--nw-border-strong)", borderRadius: 1 }} />
            </Box>

            {/* Legend */}
            <Divider sx={{ borderColor: "var(--nw-border)", my: 3 }} />
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 2 }}>
              {[
                { bg: "var(--nw-border-soft)", border: "var(--nw-border-strong)", label: "Available" },
                { bg: "linear-gradient(135deg, var(--nw-primary), var(--nw-primary-dark))", border: "var(--nw-primary)", label: "Selected" },
                { bg: "var(--nw-warning-08)", border: "var(--nw-warning-20)", label: "Business" },
                { bg: "var(--nw-glass)", border: "var(--nw-border-soft)", label: "Booked" },
              ].map((item) => (
                <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: "6px",
                      background: item.bg,
                      border: `1px solid ${item.border}`,
                      flexShrink: 0,
                    }}
                  />
                  <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.8rem" }}>{item.label}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </motion.div>

        {/* Summary Panel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Paper
            sx={{
              background: "var(--nw-card)",
              border: "1px solid var(--nw-border)",
              borderRadius: "20px",
              p: 3,
              position: "sticky",
              top: 86,
            }}
          >
            {/* Flight summary */}
            <Typography sx={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--nw-primary)", fontWeight: 700, mb: 2 }}>
              Flight Summary
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2, mb: 3 }}>
              {[
                { label: "Route", value: `${flight.source} → ${flight.destination}` },
                { label: "Airline", value: flight.airlineName },
                { label: "Per Seat", value: `₹${flight.price.toLocaleString("en-IN")}`, highlight: true },
              ].map((item) => (
                <Box key={item.label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.85rem" }}>{item.label}</Typography>
                  <Typography
                    sx={{
                      color: item.highlight ? "var(--nw-primary)" : "var(--nw-text-primary)",
                      fontSize: "0.85rem",
                      fontWeight: item.highlight ? 700 : 500,
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ borderColor: "var(--nw-border)", mb: 3 }} />

            {/* Selected seats */}
            <Typography sx={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--nw-primary)", fontWeight: 700, mb: 1.5 }}>
              Selected Seats
            </Typography>
            {selectedSeats.size === 0 ? (
              <Typography sx={{ color: "var(--nw-text-disabled)", fontSize: "0.85rem", fontStyle: "italic", mb: 1.5 }}>
                No seats selected yet
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
                {Array.from(selectedSeats).sort().map((seat) => (
                  <Chip
                    key={seat}
                    label={seat}
                    size="small"
                    sx={{
                      background: "var(--nw-primary-10)",
                      border: "1px solid var(--nw-primary-20)",
                      color: "var(--nw-primary)",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                    }}
                  />
                ))}
              </Box>
            )}

            {/* Progress bar */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.75rem" }}>
                  {selectedSeats.size}/{numberOfSeats} selected
                </Typography>
                <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.75rem" }}>
                  {Math.round((selectedSeats.size / numberOfSeats) * 100)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(selectedSeats.size / numberOfSeats) * 100}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  background: "var(--nw-border)",
                  "& .MuiLinearProgress-bar": {
                    background: "linear-gradient(90deg, var(--nw-primary), var(--nw-secondary))",
                    borderRadius: 3,
                  },
                }}
              />
            </Box>

            <Divider sx={{ borderColor: "var(--nw-border)", mb: 3 }} />

            {/* Price breakdown */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2, mb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.85rem" }}>Seat Price</Typography>
                <Typography sx={{ color: "var(--nw-text-primary)", fontSize: "0.85rem" }}>
                  ₹{flight.price.toLocaleString("en-IN")} × {numberOfSeats}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.85rem" }}>Taxes & Fees (18%)</Typography>
                <Typography sx={{ color: "var(--nw-text-primary)", fontSize: "0.85rem" }}>₹{taxPrice.toLocaleString("en-IN")}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.85rem" }}>Convenience Fee</Typography>
                <Typography sx={{ color: "var(--nw-text-primary)", fontSize: "0.85rem" }}>₹{convenienceFee.toLocaleString("en-IN")}</Typography>
              </Box>
              <Divider sx={{ borderColor: "var(--nw-border)" }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ color: "var(--nw-text-primary)", fontWeight: 700, fontSize: "1rem" }}>Total</Typography>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "1.2rem",
                    background: "linear-gradient(135deg, var(--nw-primary), var(--nw-secondary))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  ₹{grandTotal.toLocaleString("en-IN")}
                </Typography>
              </Box>
            </Box>

            {/* Continue button */}
            <Button
              onClick={handleConfirmBooking}
              disabled={!isFull}
              variant="contained"
              fullWidth
              endIcon={<ArrowForwardIcon />}
              sx={{
                py: 1.8,
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "0.95rem",
                background: isFull
                  ? "linear-gradient(135deg, var(--nw-primary), var(--nw-primary-dark))"
                  : "var(--nw-border)",
                color: isFull ? "var(--nw-text-primary)" : "var(--nw-text-disabled)",
                "&:hover": {
                  background: isFull
                    ? "linear-gradient(135deg, var(--nw-primary-dark), var(--nw-error))"
                    : "var(--nw-border)",
                },
                "&.Mui-disabled": {
                  color: "var(--nw-text-disabled)",
                },
                mb: 2,
              }}
            >
              Continue to Meals
            </Button>

            {/* Trust badges */}
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              {[
                { icon: <LockOutlinedIcon sx={{ fontSize: 12 }} />, label: "256-bit SSL" },
                { icon: <VerifiedIcon sx={{ fontSize: 12 }} />, label: "Razorpay" },
              ].map((badge) => (
                <Box key={badge.label} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box sx={{ color: "var(--nw-text-disabled)" }}>{badge.icon}</Box>
                  <Typography sx={{ color: "var(--nw-text-disabled)", fontSize: "0.7rem" }}>{badge.label}</Typography>
                </Box>
              ))}
            </Box>

            {!isFull && selectedSeats.size > 0 && (
              <Typography sx={{ color: "var(--nw-secondary)", fontSize: "0.8rem", textAlign: "center", mt: 2 }}>
                Select {numberOfSeats - selectedSeats.size} more seat{numberOfSeats - selectedSeats.size > 1 ? "s" : ""}
              </Typography>
            )}
          </Paper>
        </motion.div>
      </Box>
    </Box>
  );
}




