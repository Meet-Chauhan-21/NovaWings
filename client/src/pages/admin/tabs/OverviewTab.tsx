// tabs/OverviewTab.tsx
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import type { Flight, BookingResponse, UserResponse } from "../../../types";

import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

interface OverviewTabProps {
  flights: Flight[];
  bookings: BookingResponse[];
  users: UserResponse[];
  totalRevenueFromPayments: number;
}

export default function OverviewTab({
  flights,
  bookings,
  users,
  totalRevenueFromPayments,
}: OverviewTabProps) {
  const stats = useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === "CONFIRMED").length;
    const cancelled = bookings.filter((b) => b.status === "CANCELLED").length;
    const totalRevenue = bookings
      .filter((b) => b.status === "CONFIRMED")
      .reduce((sum, b) => sum + b.totalPrice, 0);
    const avgBookingValue = confirmed > 0 ? Math.round(totalRevenue / confirmed) : 0;
    return {
      totalFlights: flights.length,
      totalBookings: bookings.length,
      confirmed,
      cancelled,
      totalRevenue,
      avgBookingValue,
      totalUsers: users.length,
    };
  }, [flights, bookings, users]);

  const bookingsPerFlightData = useMemo(() => {
    const flightMap = new Map<string, number>();
    bookings.forEach((b) => {
      flightMap.set(b.flightNumber, (flightMap.get(b.flightNumber) || 0) + 1);
    });
    return Array.from(flightMap.entries())
      .map(([flightNumber, count]) => ({ flightNumber, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [bookings]);

  const bookingStatusData = useMemo(() => {
    return [
      { name: "Confirmed", value: stats.confirmed, fill: "#10b981" },
      { name: "Cancelled", value: stats.cancelled, fill: "#ef4444" },
    ];
  }, [stats]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Header */}
      <Typography sx={{ fontSize: "1.4rem", fontWeight: 800, color: "#FFFFFF" }}>
        Dashboard Overview
      </Typography>

      {/* Stat Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(6, 1fr)" }, gap: 3 }}>
        {[
          { label: "Total Flights", value: stats.totalFlights, icon: <FlightTakeoffIcon sx={{ fontSize: 18, color: "#0EA5E9" }} />, accent: "#0EA5E9" },
          { label: "Total Bookings", value: stats.totalBookings, icon: <BookOnlineIcon sx={{ fontSize: 18, color: "#6366F1" }} />, accent: "#6366F1" },
          { label: "Confirmed", value: stats.confirmed, icon: <CheckCircleOutlineIcon sx={{ fontSize: 18, color: "#22C55E" }} />, accent: "#22C55E" },
          { label: "Cancelled", value: stats.cancelled, icon: <CancelOutlinedIcon sx={{ fontSize: 18, color: "#EF4444" }} />, accent: "#EF4444" },
          { label: "Total Users", value: stats.totalUsers, icon: <PeopleOutlineIcon sx={{ fontSize: 18, color: "#A855F7" }} />, accent: "#A855F7" },
          { label: "Total Revenue", value: `₹${totalRevenueFromPayments.toLocaleString("en-IN")}`, icon: <CurrencyRupeeIcon sx={{ fontSize: 18, color: "#10B981" }} />, accent: "#10B981" },
        ].map((card) => (
          <Paper key={card.label} elevation={0} sx={{ background: "#111111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", p: 2.5, display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography sx={{ color: "#6B7280", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{card.label}</Typography>
              <Box sx={{ width: 32, height: 32, borderRadius: "8px", background: `${card.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>{card.icon}</Box>
            </Box>
            <Typography sx={{ color: "#FFFFFF", fontSize: "1.5rem", fontWeight: 800 }}>{card.value}</Typography>
            <Box sx={{ height: 3, width: "40%", borderRadius: 2, background: card.accent, opacity: 0.6 }} />
          </Paper>
        ))}
      </Box>

      {/* Charts Row */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>
        {/* Bookings Per Flight */}
        <Paper elevation={0} sx={{ background: "#111111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", p: 3 }}>
          <Typography sx={{ color: "#FFFFFF", fontSize: "1rem", fontWeight: 700, mb: 2.5 }}>Bookings per Flight</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bookingsPerFlightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="flightNumber" tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} tickLine={false} />
              <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#FFFFFF", fontSize: "0.8rem" }} />
              <Bar dataKey="count" fill="#F97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Booking Status */}
        <Paper elevation={0} sx={{ background: "#111111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", p: 3 }}>
          <Typography sx={{ color: "#FFFFFF", fontSize: "1rem", fontWeight: 700, mb: 2.5 }}>Booking Status</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={bookingStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {bookingStatusData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#FFFFFF", fontSize: "0.8rem" }} />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* Recent Bookings Table */}
      <Paper elevation={0} sx={{ background: "#111111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden" }}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Typography sx={{ color: "#FFFFFF", fontSize: "1rem", fontWeight: 700 }}>Recent Bookings</Typography>
        </Box>
        <Box sx={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ color: "#6B7280", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" as const, background: "rgba(255,255,255,0.04)", padding: "12px 20px", textAlign: "left" as const, borderBottom: "1px solid rgba(255,255,255,0.06)", letterSpacing: "0.05em" }}>Flight</th>
                <th style={{ color: "#6B7280", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" as const, background: "rgba(255,255,255,0.04)", padding: "12px 20px", textAlign: "left" as const, borderBottom: "1px solid rgba(255,255,255,0.06)", letterSpacing: "0.05em" }}>Seats</th>
                <th style={{ color: "#6B7280", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" as const, background: "rgba(255,255,255,0.04)", padding: "12px 20px", textAlign: "left" as const, borderBottom: "1px solid rgba(255,255,255,0.06)", letterSpacing: "0.05em" }}>Total</th>
                <th style={{ color: "#6B7280", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" as const, background: "rgba(255,255,255,0.04)", padding: "12px 20px", textAlign: "left" as const, borderBottom: "1px solid rgba(255,255,255,0.06)", letterSpacing: "0.05em" }}>Status</th>
                <th style={{ color: "#6B7280", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" as const, background: "rgba(255,255,255,0.04)", padding: "12px 20px", textAlign: "left" as const, borderBottom: "1px solid rgba(255,255,255,0.06)", letterSpacing: "0.05em" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 5).map((booking) => (
                <tr key={booking.id} style={{ transition: "background 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ color: "#FFFFFF", fontSize: "0.85rem", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", fontFamily: "monospace" }}>{booking.flightNumber}</td>
                  <td style={{ color: "#FFFFFF", fontSize: "0.85rem", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{booking.numberOfSeats}</td>
                  <td style={{ color: "#F97316", fontSize: "0.85rem", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", fontWeight: 700 }}>₹{booking.totalPrice.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <Chip
                      label={booking.status}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        borderRadius: "8px",
                        ...(booking.status === "CONFIRMED"
                          ? { background: "rgba(34,197,94,0.12)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.2)" }
                          : { background: "rgba(239,68,68,0.12)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }),
                      }}
                    />
                  </td>
                  <td style={{ color: "#6B7280", fontSize: "0.85rem", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{new Date(booking.bookingDate).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Paper>
    </Box>
  );
}
