// src/components/FlightCard.tsx
// Primary flight card — MUI dark theme, supports list / grid / compact variants

import React from "react";
import { Link } from "react-router-dom";
import type { Flight } from "../types";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";

import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import AirlineStopsIcon from "@mui/icons-material/AirlineStops";
import AirlineSeatReclineNormalIcon from "@mui/icons-material/AirlineSeatReclineNormal";

interface FlightCardProps {
  flight: Flight;
  passengers?: number;
  /** Layout variant. Defaults to "list" (horizontal). */
  variant?: "list" | "grid" | "compact";
  /** Optional callback — if provided the CTA fires it instead of navigating. */
  onSelect?: (flight: Flight) => void;
}

// ── Helpers ─────────────────────────────────────────────
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

function calcDuration(dep: string, arr: string): string {
  const ms = new Date(arr).getTime() - new Date(dep).getTime();
  if (ms <= 0) return "—";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${h}h ${m}m`;
}

const CARD_BASE = {
  background: "#111111",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "16px",
  transition: "all 0.25s ease",
  "&:hover": {
    border: "1px solid rgba(249,115,22,0.28)",
    boxShadow: "0 8px 32px rgba(249,115,22,0.08)",
    transform: "translateY(-1px)",
  },
} as const;

// ── Card ─────────────────────────────────────────────────
const FlightCard: React.FC<FlightCardProps> = React.memo(
  ({ flight, passengers, variant = "list", onSelect }) => {
    const detailHref = `/flights/${flight.id}${passengers ? `?passengers=${passengers}` : ""}`;
    const duration = calcDuration(flight.departureTime, flight.arrivalTime);
    const seatsLow = flight.availableSeats <= 5;

    // Build CTA props once — avoids repetition in each variant
    const ctaButtonProps = onSelect
      ? ({ component: "button" as const, onClick: () => onSelect(flight) } as const)
      : ({ component: Link as React.ElementType, to: detailHref } as const);

    // ── Compact ────────────────────────────────────────
    if (variant === "compact") {
      return (
        <Box
          sx={{
            ...CARD_BASE,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            px: 2,
            py: 1.5,
            cursor: "pointer",
          }}
          onClick={() => onSelect ? onSelect(flight) : undefined}
        >
          <Typography sx={{ color: "#FFFFFF", fontWeight: 600, fontSize: "0.875rem" }}>
            {flight.source} → {flight.destination}
          </Typography>
          <Typography sx={{ color: "#9CA3AF", fontSize: "0.8125rem" }}>
            {fmtTime(flight.departureTime)}
          </Typography>
          <Typography sx={{ color: "#F97316", fontWeight: 700, fontSize: "0.9375rem", flexShrink: 0 }}>
            ₹{flight.price.toLocaleString("en-IN")}
          </Typography>
        </Box>
      );
    }

    // ── Grid (vertical card) ───────────────────────────
    if (variant === "grid") {
      return (
        <Box sx={{ ...CARD_BASE, p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Airline + flight number */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box>
              <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "1rem", lineHeight: 1.2 }}>
                {flight.airlineName}
              </Typography>
              <Typography sx={{ color: "#F97316", fontSize: "0.75rem", fontFamily: '"JetBrains Mono",monospace', fontWeight: 600, mt: 0.25 }}>
                {flight.flightNumber}
              </Typography>
            </Box>
            {seatsLow && (
              <Chip label={`${flight.availableSeats} left`} size="small" sx={{ background: "rgba(239,68,68,0.12)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)", fontSize: "0.7rem", fontWeight: 600 }} />
            )}
          </Box>

          {/* Route + times */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "1.125rem", lineHeight: 1 }}>{fmtTime(flight.departureTime)}</Typography>
              <Typography sx={{ color: "#9CA3AF", fontSize: "0.75rem" }}>{flight.source}</Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: "center" }}>
              <Typography sx={{ color: "#4B5563", fontSize: "0.6875rem", mb: 0.25 }}>{duration}</Typography>
              <Box sx={{ position: "relative", height: "1px", background: "rgba(255,255,255,0.1)" }}>
                <AirlineStopsIcon sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 16, color: "#F97316" }} />
              </Box>
              <Typography sx={{ color: "#4B5563", fontSize: "0.6875rem", mt: 0.25 }}>Direct</Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "1.125rem", lineHeight: 1 }}>{fmtTime(flight.arrivalTime)}</Typography>
              <Typography sx={{ color: "#9CA3AF", fontSize: "0.75rem" }}>{flight.destination}</Typography>
            </Box>
          </Box>

          {/* Price + Book */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "auto" }}>
            <Box>
              <Typography sx={{ color: "#6B7280", fontSize: "0.6875rem" }}>from</Typography>
              <Typography sx={{ color: "#F97316", fontWeight: 800, fontSize: "1.375rem", lineHeight: 1 }}>
                ₹{flight.price.toLocaleString("en-IN")}
              </Typography>
            </Box>
            <Button {...ctaButtonProps} variant="contained" size="small" sx={{ borderRadius: "8px", fontWeight: 600, background: "linear-gradient(135deg,#F97316,#EA580C)", boxShadow: "0 4px 12px rgba(249,115,22,0.3)" }}>
              Book
            </Button>
          </Box>
        </Box>
      );
    }

    // ── List (horizontal — default) ────────────────────
    return (
      <Box sx={{ ...CARD_BASE, px: { xs: 2, sm: 3 }, py: 2.5, display: "flex", alignItems: "center", gap: { xs: 2, sm: 3 }, flexWrap: { xs: "wrap", sm: "nowrap" } }}>
        {/* Airline info */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: { sm: "180px" } }}>
          <Box sx={{ width: 44, height: 44, borderRadius: "10px", background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FlightTakeoffIcon sx={{ color: "#F97316", fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.9375rem", lineHeight: 1.2 }}>{flight.airlineName}</Typography>
            <Typography sx={{ color: "#6B7280", fontSize: "0.75rem", fontFamily: '"JetBrains Mono",monospace', fontWeight: 600 }}>{flight.flightNumber}</Typography>
          </Box>
        </Box>

        {/* Route + times */}
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 }, justifyContent: "center" }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "1.125rem", lineHeight: 1 }}>{fmtTime(flight.departureTime)}</Typography>
            <Typography sx={{ color: "#9CA3AF", fontSize: "0.75rem", mt: 0.25 }}>{flight.source}</Typography>
            <Typography sx={{ color: "#4B5563", fontSize: "0.6875rem" }}>{fmtDate(flight.departureTime)}</Typography>
          </Box>
          <Box sx={{ textAlign: "center", px: 1 }}>
            <Typography sx={{ color: "#4B5563", fontSize: "0.6875rem", mb: 0.5 }}>{duration}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ width: 20, height: "1px", background: "rgba(255,255,255,0.15)" }} />
              <FlightTakeoffIcon sx={{ fontSize: 14, color: "#F97316" }} />
              <Box sx={{ width: 20, height: "1px", background: "rgba(255,255,255,0.15)" }} />
            </Box>
            <Typography sx={{ color: "#4B5563", fontSize: "0.6875rem", mt: 0.5 }}>Direct</Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "1.125rem", lineHeight: 1 }}>{fmtTime(flight.arrivalTime)}</Typography>
            <Typography sx={{ color: "#9CA3AF", fontSize: "0.75rem", mt: 0.25 }}>{flight.destination}</Typography>
            <Typography sx={{ color: "#4B5563", fontSize: "0.6875rem" }}>{fmtDate(flight.arrivalTime)}</Typography>
          </Box>
        </Box>

        {/* Seats */}
        <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", alignItems: "center", gap: 0.5 }}>
          <AirlineSeatReclineNormalIcon sx={{ color: seatsLow ? "#EF4444" : "#6B7280", fontSize: 18 }} />
          <Typography sx={{ color: seatsLow ? "#EF4444" : "#6B7280", fontSize: "0.75rem", fontWeight: 500 }}>
            {flight.availableSeats} seats
          </Typography>
        </Box>

        {/* Price + CTA */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1, flexShrink: 0 }}>
          <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ color: "#6B7280", fontSize: "0.6875rem" }}>per person</Typography>
            <Typography sx={{ color: "#F97316", fontWeight: 800, fontSize: "1.375rem", lineHeight: 1 }}>
              ₹{flight.price.toLocaleString("en-IN")}
            </Typography>
          </Box>
          <Button
            {...ctaButtonProps}
            variant="contained"
            size="small"
            endIcon={<FlightLandIcon sx={{ fontSize: "14px !important" }} />}
            sx={{ borderRadius: "8px", fontWeight: 600, fontSize: "0.8125rem", px: 2, background: "linear-gradient(135deg,#F97316,#EA580C)", boxShadow: "0 4px 12px rgba(249,115,22,0.3)", "&:hover": { boxShadow: "0 6px 16px rgba(249,115,22,0.45)", transform: "translateY(-1px)" } }}
          >
            View Details
          </Button>
        </Box>
      </Box>
    );
  }
);

FlightCard.displayName = "FlightCard";

export default FlightCard;
