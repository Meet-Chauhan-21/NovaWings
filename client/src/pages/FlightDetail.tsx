// src/pages/FlightDetail.tsx
// Dark-themed flight detail page with tabs, hero card, and booking sidebar

import { useState } from "react";
import { useParams, useSearchParams, useNavigate, Link as RouterLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getFlightById } from "../services/flightService";
import { useAuthContext } from "../context/AuthContext";

// MUI
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Divider from "@mui/material/Divider";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import MuiLink from "@mui/material/Link";
import Skeleton from "@mui/material/Skeleton";
import LinearProgress from "@mui/material/LinearProgress";

// Icons
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import LuggageOutlinedIcon from "@mui/icons-material/LuggageOutlined";
import BackpackOutlinedIcon from "@mui/icons-material/BackpackOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AirplanemodeInactiveIcon from "@mui/icons-material/AirplanemodeInactive";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AirlineSeatReclineNormalIcon from "@mui/icons-material/AirlineSeatReclineNormal";
import FlightIcon from "@mui/icons-material/Flight";
import EventSeatOutlinedIcon from "@mui/icons-material/EventSeatOutlined";

// ── Helpers ──────────────────────────────────
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

// ── Component ────────────────────────────────
export default function FlightDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const passengers = parseInt(searchParams.get("passengers") || "1");
  const [activeTab, setActiveTab] = useState(0);

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

  // Loading
  if (isLoading) {
    return (
      <Box sx={{ background: "#0A0A0A", minHeight: "100vh", pt: 4 }}>
        <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 4 } }}>
          <Skeleton variant="rounded" height={240} sx={{ bgcolor: "rgba(255,255,255,0.06)", borderRadius: "20px", mb: 3 }} />
          <Box sx={{ display: "flex", gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="rounded" height={400} sx={{ bgcolor: "rgba(255,255,255,0.06)", borderRadius: "16px" }} />
            </Box>
            <Box sx={{ width: 360, display: { xs: "none", lg: "block" } }}>
              <Skeleton variant="rounded" height={400} sx={{ bgcolor: "rgba(255,255,255,0.06)", borderRadius: "20px" }} />
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  // Error
  if (isError || !flight) {
    return (
      <Box sx={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Box sx={{ textAlign: "center" }}>
          <AirplanemodeInactiveIcon sx={{ fontSize: 64, color: "#EF4444", mb: 2 }} />
          <Typography variant="h5" sx={{ color: "#fff", mb: 1 }}>{isError ? "Something went wrong" : "Flight not found"}</Typography>
          <Typography sx={{ color: "#6B7280", mb: 3 }}>
            {isError ? "Failed to load flight details." : "The flight you're looking for doesn't exist."}
          </Typography>
          <Button variant="contained" onClick={() => navigate(-1)}>Go Back</Button>
        </Box>
      </Box>
    );
  }

  const duration = getFlightDuration(flight.departureTime, flight.arrivalTime);
  const baseFare = flight.price * passengers;
  const tax = Math.round(baseFare * 0.18);
  const convenienceFee = 199;
  const total = baseFare + tax + convenienceFee;
  const totalSeats = 180;
  const seatPercent = Math.min(((totalSeats - flight.availableSeats) / totalSeats) * 100, 100);
  const seatColor = flight.availableSeats > 10 ? "#10B981" : flight.availableSeats >= 5 ? "#F59E0B" : "#EF4444";

  return (
    <Box sx={{ background: "#0A0A0A", minHeight: "100vh", pb: 8 }}>
      <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 4 }, pt: 3 }}>

        {/* ── Breadcrumb ── */}
        <Breadcrumbs
          separator={<NavigateNextIcon sx={{ fontSize: 16, color: "#F97316" }} />}
          sx={{ mb: 3 }}
        >
          <MuiLink component={RouterLink} to="/" sx={{ color: "#6B7280", fontSize: "0.8rem", textDecoration: "none", "&:hover": { color: "#F97316" } }}>
            Home
          </MuiLink>
          <MuiLink component={RouterLink} to="/search" sx={{ color: "#6B7280", fontSize: "0.8rem", textDecoration: "none", "&:hover": { color: "#F97316" } }}>
            Search
          </MuiLink>
          <Typography sx={{ color: "#9CA3AF", fontSize: "0.8rem" }}>Flight Details</Typography>
        </Breadcrumbs>

        {/* ══════════ Hero Card ══════════ */}
        <Card
          sx={{
            background: "linear-gradient(135deg, #111111 0%, #1a1a1a 100%)",
            border: "1px solid rgba(249,115,22,0.15)",
            borderRadius: "20px",
            p: { xs: 3, md: 4 },
            mb: 4,
          }}
        >
          {/* Airline name + badges */}
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5, mb: 4 }}>
            <Typography sx={{ color: "#F97316", fontWeight: 700, fontSize: "1.1rem" }}>
              {flight.airlineName}
            </Typography>
            <Typography sx={{ color: "#4B5563", fontFamily: "monospace", fontSize: "0.85rem" }}>
              {flight.flightNumber}
            </Typography>
            <Box sx={{ ml: "auto" }}>
              <Chip
                label="NON-STOP"
                size="small"
                sx={{
                  background: "rgba(16,185,129,0.1)",
                  color: "#10B981",
                  fontWeight: 700,
                  fontSize: "0.65rem",
                  letterSpacing: "0.05em",
                }}
              />
            </Box>
          </Box>

          {/* Three-column route */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 2, md: 5 },
            }}
          >
            {/* Departure */}
            <Box sx={{ textAlign: { xs: "left", md: "center" }, minWidth: { md: 140 } }}>
              <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: { xs: "1.8rem", md: "2.5rem" }, lineHeight: 1.1 }}>
                {formatTime(flight.departureTime)}
              </Typography>
              <Typography sx={{ color: "#6B7280", fontSize: "0.75rem", mt: 0.5 }}>
                {formatDate(flight.departureTime)}
              </Typography>
              <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "1.1rem", mt: 0.5 }}>
                {flight.source}
              </Typography>
            </Box>

            {/* Center — duration + line */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem", mb: 1 }}>
                {duration}
              </Typography>
              <Box sx={{ width: "100%", display: "flex", alignItems: "center" }}>
                <FlightTakeoffIcon sx={{ fontSize: 16, color: "#F97316" }} />
                <Box sx={{ height: 1, flex: 1, borderTop: "2px dashed rgba(249,115,22,0.3)", mx: 1 }} />
                <FlightIcon sx={{ fontSize: 18, color: "#F97316" }} />
                <Box sx={{ height: 1, flex: 1, borderTop: "2px dashed rgba(249,115,22,0.3)", mx: 1 }} />
                <FlightLandIcon sx={{ fontSize: 16, color: "#F97316" }} />
              </Box>
              <Chip
                label="Direct Flight"
                size="small"
                sx={{ mt: 1, background: "rgba(249,115,22,0.1)", color: "#F97316", fontSize: "0.65rem" }}
              />
            </Box>

            {/* Arrival */}
            <Box sx={{ textAlign: { xs: "right", md: "center" }, minWidth: { md: 140 } }}>
              <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: { xs: "1.8rem", md: "2.5rem" }, lineHeight: 1.1 }}>
                {formatTime(flight.arrivalTime)}
              </Typography>
              <Typography sx={{ color: "#6B7280", fontSize: "0.75rem", mt: 0.5 }}>
                {formatDate(flight.arrivalTime)}
              </Typography>
              <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "1.1rem", mt: 0.5 }}>
                {flight.destination}
              </Typography>
            </Box>
          </Box>

          {/* Bottom chips */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 3, pt: 3, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <Chip
              icon={<EventSeatOutlinedIcon sx={{ fontSize: 14, color: `${seatColor} !important` }} />}
              label={`${flight.availableSeats} seats left`}
              size="small"
              sx={{ background: "rgba(255,255,255,0.04)", color: seatColor, fontSize: "0.7rem" }}
            />
            <Chip
              label="Economy Class"
              size="small"
              sx={{ background: "rgba(255,255,255,0.04)", color: "#9CA3AF", fontSize: "0.7rem" }}
            />
            <Chip
              label="Boeing 737"
              size="small"
              sx={{ background: "rgba(255,255,255,0.04)", color: "#9CA3AF", fontSize: "0.7rem" }}
            />
          </Box>
        </Card>

        {/* ══════════ Two-Column Layout ══════════ */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 3 }}>

          {/* ── Left: Tabs Content ── */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Paper
              sx={{
                background: "#111111",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ borderBottom: "1px solid rgba(255,255,255,0.06)", px: 1 }}
              >
                <Tab label="Flight Details" />
                <Tab label="Fare Breakdown" />
                <Tab label="Baggage Info" />
                <Tab label="Cancellation" />
              </Tabs>

              <Box sx={{ p: { xs: 2.5, md: 3 } }}>
                {/* Tab 0 — Flight Details */}
                {activeTab === 0 && (
                  <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
                    {/* Timeline */}
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem", mb: 3 }}>
                        Journey Timeline
                      </Typography>
                      <Box sx={{ position: "relative", pl: 4 }}>
                        {/* Vertical line */}
                        <Box
                          sx={{
                            position: "absolute",
                            left: 11,
                            top: 8,
                            bottom: 8,
                            width: 2,
                            background: "linear-gradient(180deg, #F97316, rgba(249,115,22,0.2))",
                            borderRadius: 1,
                          }}
                        />

                        {/* Departure */}
                        <Box sx={{ position: "relative", mb: 8 }}>
                          <Box
                            sx={{
                              position: "absolute",
                              left: -26,
                              top: 4,
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              background: "#F97316",
                              border: "2px solid #111111",
                              boxShadow: "0 0 0 3px rgba(249,115,22,0.2)",
                            }}
                          />
                          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>
                            {flight.source}
                          </Typography>
                          <Typography sx={{ color: "#6B7280", fontSize: "0.8rem" }}>
                            {formatTime(flight.departureTime)} · {formatDate(flight.departureTime)}
                          </Typography>
                        </Box>

                        {/* Duration label */}
                        <Box
                          sx={{
                            position: "absolute",
                            left: 36,
                            top: "50%",
                            transform: "translateY(-50%)",
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <FlightIcon sx={{ fontSize: 14, color: "#F97316" }} />
                          <Typography sx={{ color: "#4B5563", fontSize: "0.75rem" }}>
                            {flight.airlineName} · {flight.flightNumber} · {duration}
                          </Typography>
                        </Box>

                        {/* Arrival */}
                        <Box sx={{ position: "relative" }}>
                          <Box
                            sx={{
                              position: "absolute",
                              left: -26,
                              top: 4,
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              background: "#F97316",
                              border: "2px solid #111111",
                              boxShadow: "0 0 0 3px rgba(249,115,22,0.2)",
                            }}
                          />
                          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>
                            {flight.destination}
                          </Typography>
                          <Typography sx={{ color: "#6B7280", fontSize: "0.8rem" }}>
                            {formatTime(flight.arrivalTime)} · {formatDate(flight.arrivalTime)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Flight info grid */}
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem", mb: 3 }}>
                        Flight Information
                      </Typography>
                      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                        {[
                          { label: "Aircraft", value: "Boeing 737" },
                          { label: "Class", value: "Economy" },
                          { label: "Flight No", value: flight.flightNumber },
                          { label: "Airline", value: flight.airlineName },
                          { label: "Duration", value: duration },
                          { label: "Seats Left", value: String(flight.availableSeats) },
                        ].map((item) => (
                          <Box
                            key={item.label}
                            sx={{
                              background: "rgba(255,255,255,0.03)",
                              borderRadius: "10px",
                              p: 1.5,
                              border: "1px solid rgba(255,255,255,0.04)",
                            }}
                          >
                            <Typography sx={{ color: "#4B5563", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", mb: 0.3 }}>
                              {item.label}
                            </Typography>
                            <Typography sx={{ color: "#fff", fontSize: "0.85rem", fontWeight: 500 }}>
                              {item.value}
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      {/* Amenities */}
                      <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem", mt: 3, mb: 2 }}>
                        Amenities
                      </Typography>
                      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                        {[
                          { available: true, label: "In-flight Meals (paid)" },
                          { available: true, label: "USB Charging" },
                          { available: true, label: "Entertainment" },
                          { available: true, label: "Seat Selection" },
                          { available: false, label: "Free Wi-Fi" },
                          { available: true, label: "Blanket Available" },
                        ].map((item) => (
                          <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                            {item.available ? (
                              <CheckCircleOutlineIcon sx={{ fontSize: 14, color: "#10B981" }} />
                            ) : (
                              <CancelOutlinedIcon sx={{ fontSize: 14, color: "#4B5563" }} />
                            )}
                            <Typography sx={{ color: item.available ? "#9CA3AF" : "#4B5563", fontSize: "0.8rem" }}>
                              {item.label}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Tab 1 — Fare Breakdown */}
                {activeTab === 1 && (
                  <Box sx={{ maxWidth: 500 }}>
                    <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem", mb: 3 }}>
                      Fare Breakdown
                    </Typography>
                    {[
                      { label: `Base Fare (${formatPrice(flight.price)} × ${passengers})`, value: formatPrice(baseFare) },
                      { label: "Taxes & Surcharges (18%)", value: formatPrice(tax) },
                      { label: "Convenience Fee", value: formatPrice(convenienceFee) },
                    ].map((row) => (
                      <Box key={row.label} sx={{ display: "flex", justifyContent: "space-between", py: 1.2 }}>
                        <Typography sx={{ color: "#6B7280", fontSize: "0.85rem" }}>{row.label}</Typography>
                        <Typography sx={{ color: "#9CA3AF", fontSize: "0.85rem", fontWeight: 500 }}>{row.value}</Typography>
                      </Box>
                    ))}
                    <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", my: 1.5 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
                      <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>Total</Typography>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: "1.25rem",
                          background: "linear-gradient(135deg, #F97316, #F59E0B)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        {formatPrice(total)}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Tab 2 — Baggage Info */}
                {activeTab === 2 && (
                  <Box>
                    <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem", mb: 3 }}>
                      Baggage Allowance
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {[
                        { icon: <BackpackOutlinedIcon sx={{ fontSize: 20 }} />, label: "Cabin Baggage", value: "7 kg (1 piece)", sub: "Max dimensions: 55 × 35 × 25 cm" },
                        { icon: <LuggageOutlinedIcon sx={{ fontSize: 20 }} />, label: "Check-in Baggage", value: "15 kg (1 piece)", sub: "Economy class allowance" },
                        { icon: <WarningAmberIcon sx={{ fontSize: 20 }} />, label: "Excess Baggage", value: "₹500 per kg", sub: "Charges apply beyond free allowance" },
                      ].map((item) => (
                        <Box
                          key={item.label}
                          sx={{
                            display: "flex",
                            gap: 2,
                            p: 2,
                            background: "rgba(255,255,255,0.03)",
                            borderRadius: "12px",
                            border: "1px solid rgba(255,255,255,0.04)",
                          }}
                        >
                          <Box sx={{ color: "#F97316", mt: 0.3 }}>{item.icon}</Box>
                          <Box>
                            <Typography sx={{ color: "#6B7280", fontSize: "0.75rem" }}>{item.label}</Typography>
                            <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem" }}>{item.value}</Typography>
                            <Typography sx={{ color: "#4B5563", fontSize: "0.75rem" }}>{item.sub}</Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Tab 3 — Cancellation */}
                {activeTab === 3 && (
                  <Box>
                    <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem", mb: 3 }}>
                      Cancellation Policy
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      {[
                        { time: "> 24 hours before departure", fee: "₹3,000 per person", color: "#10B981", bgColor: "rgba(16,185,129,0.08)" },
                        { time: "3 – 24 hours before departure", fee: "₹5,000 per person", color: "#F59E0B", bgColor: "rgba(245,158,11,0.08)" },
                        { time: "< 3 hours before departure", fee: "Non-refundable", color: "#EF4444", bgColor: "rgba(239,68,68,0.08)" },
                      ].map((row) => (
                        <Box
                          key={row.time}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: 2,
                            background: row.bgColor,
                            borderRadius: "12px",
                            border: `1px solid ${row.color}20`,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <AccessTimeIcon sx={{ fontSize: 18, color: row.color }} />
                            <Typography sx={{ color: "#9CA3AF", fontSize: "0.85rem" }}>{row.time}</Typography>
                          </Box>
                          <Typography sx={{ color: row.color, fontWeight: 600, fontSize: "0.85rem" }}>
                            {row.fee}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>

          {/* ── Right: Booking Sidebar ── */}
          <Box sx={{ width: { lg: 360 }, flexShrink: 0 }}>
            <Paper
              sx={{
                position: { lg: "sticky" },
                top: { lg: 86 },
                background: "#111111",
                border: "1px solid rgba(249,115,22,0.2)",
                borderRadius: "20px",
                p: 3,
              }}
            >
              <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem", mb: 2.5 }}>
                Fare Summary
              </Typography>

              {/* Passenger info */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "10px",
                  px: 2,
                  py: 1.2,
                  mb: 2.5,
                }}
              >
                <AirlineSeatReclineNormalIcon sx={{ fontSize: 18, color: "#F97316" }} />
                <Typography sx={{ color: "#9CA3AF", fontSize: "0.85rem" }}>
                  {passengers} × Economy
                </Typography>
              </Box>

              {/* Price rows */}
              <Box sx={{ mb: 2.5 }}>
                {[
                  { label: `Base Fare (${formatPrice(flight.price)} × ${passengers})`, value: formatPrice(baseFare) },
                  { label: "Taxes & Surcharges (18%)", value: formatPrice(tax) },
                  { label: "Convenience Fee", value: formatPrice(convenienceFee) },
                ].map((row) => (
                  <Box key={row.label} sx={{ display: "flex", justifyContent: "space-between", py: 0.8 }}>
                    <Typography sx={{ color: "#6B7280", fontSize: "0.8rem" }}>{row.label}</Typography>
                    <Typography sx={{ color: "#9CA3AF", fontSize: "0.8rem", fontWeight: 500 }}>{row.value}</Typography>
                  </Box>
                ))}
                <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", my: 1.5 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ color: "#fff", fontWeight: 700 }}>Total Amount</Typography>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: "1.3rem",
                      background: "linear-gradient(135deg, #F97316, #F59E0B)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {formatPrice(total)}
                  </Typography>
                </Box>
              </Box>

              {/* Seat availability */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.8 }}>
                  <Typography sx={{ color: "#4B5563", fontSize: "0.75rem" }}>Seat Availability</Typography>
                  <Typography sx={{ color: seatColor, fontSize: "0.75rem", fontWeight: 600 }}>
                    {flight.availableSeats} remaining
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={seatPercent}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.06)",
                    "& .MuiLinearProgress-bar": {
                      background: seatColor,
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>

              {/* Book Now */}
              <Button
                variant="contained"
                fullWidth
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate(user ? `/book/${flight.id}?passengers=${passengers}` : "/login")}
                sx={{
                  borderRadius: "14px",
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 700,
                  mb: 1.5,
                }}
              >
                {user ? `Book Now for ${formatPrice(total)}` : "Login to Book"}
              </Button>

              {/* Wishlist */}
              <Button
                variant="outlined"
                fullWidth
                startIcon={<FavoriteBorderIcon />}
                disabled
                sx={{
                  borderRadius: "14px",
                  py: 1.2,
                  fontSize: "0.85rem",
                  mb: 2.5,
                }}
              >
                Add to Wishlist
              </Button>

              {/* Trust badges */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {[
                  { icon: <LockOutlinedIcon sx={{ fontSize: 14 }} />, text: "Secure Checkout" },
                  { icon: <VerifiedOutlinedIcon sx={{ fontSize: 14 }} />, text: "Instant Confirmation" },
                ].map((badge) => (
                  <Box key={badge.text} sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "center" }}>
                    <Box sx={{ color: "#4B5563" }}>{badge.icon}</Box>
                    <Typography sx={{ color: "#4B5563", fontSize: "0.75rem" }}>{badge.text}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
