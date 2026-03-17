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
      <Typography sx={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--nw-text-primary)" }}>
        Dashboard Overview
      </Typography>

      {/* Stat Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(6, 1fr)" }, gap: 3 }}>
        {[
          { label: "Total Flights", value: stats.totalFlights, icon: <FlightTakeoffIcon sx={{ fontSize: 18, color: "var(--nw-accent-blue)" }} />, accent: "var(--nw-accent-blue)" },
          { label: "Total Bookings", value: stats.totalBookings, icon: <BookOnlineIcon sx={{ fontSize: 18, color: "var(--nw-accent-indigo)" }} />, accent: "var(--nw-accent-indigo)" },
          { label: "Confirmed", value: stats.confirmed, icon: <CheckCircleOutlineIcon sx={{ fontSize: 18, color: "var(--nw-success-bright)" }} />, accent: "var(--nw-success-bright)" },
          { label: "Cancelled", value: stats.cancelled, icon: <CancelOutlinedIcon sx={{ fontSize: 18, color: "var(--nw-error)" }} />, accent: "var(--nw-error)" },
          { label: "Total Users", value: stats.totalUsers, icon: <PeopleOutlineIcon sx={{ fontSize: 18, color: "var(--nw-accent-violet)" }} />, accent: "var(--nw-accent-violet)" },
          { label: "Total Revenue", value: `₹${totalRevenueFromPayments.toLocaleString("en-IN")}`, icon: <CurrencyRupeeIcon sx={{ fontSize: 18, color: "var(--nw-success)" }} />, accent: "var(--nw-success)" },
        ].map((card) => (
          <Paper key={card.label} elevation={0} sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", p: 2.5, display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{card.label}</Typography>
              <Box sx={{ width: 32, height: 32, borderRadius: "8px", background: `${card.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>{card.icon}</Box>
            </Box>
            <Typography sx={{ color: "var(--nw-text-primary)", fontSize: "1.5rem", fontWeight: 800 }}>{card.value}</Typography>
            <Box sx={{ height: 3, width: "40%", borderRadius: 2, background: card.accent, opacity: 0.6 }} />
          </Paper>
        ))}
      </Box>

      {/* Charts Row */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>
        {/* Bookings Per Flight */}
        <Paper elevation={0} sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", p: 3 }}>
          <Typography sx={{ color: "var(--nw-text-primary)", fontSize: "1rem", fontWeight: 700, mb: 2.5 }}>Bookings per Flight</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bookingsPerFlightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--nw-border)" />
              <XAxis dataKey="flightNumber" tick={{ fill: "var(--nw-text-muted)", fontSize: 12 }} axisLine={{ stroke: "var(--nw-border)" }} tickLine={false} />
              <YAxis tick={{ fill: "var(--nw-text-muted)", fontSize: 12 }} axisLine={{ stroke: "var(--nw-border)" }} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--nw-elevated)", border: "1px solid var(--nw-border-strong)", borderRadius: "10px", color: "var(--nw-text-primary)", fontSize: "0.8rem" }} />
              <Bar dataKey="count" fill="var(--nw-primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Booking Status */}
        <Paper elevation={0} sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", p: 3 }}>
          <Typography sx={{ color: "var(--nw-text-primary)", fontSize: "1rem", fontWeight: 700, mb: 2.5 }}>Booking Status</Typography>
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
              <Tooltip contentStyle={{ background: "var(--nw-elevated)", border: "1px solid var(--nw-border-strong)", borderRadius: "10px", color: "var(--nw-text-primary)", fontSize: "0.8rem" }} />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* Recent Bookings Table */}
      <Paper elevation={0} sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", overflow: "hidden" }}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid var(--nw-border)" }}>
          <Typography sx={{ color: "var(--nw-text-primary)", fontSize: "1rem", fontWeight: 700 }}>Recent Bookings</Typography>
        </Box>
        <Box sx={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ color: "var(--nw-text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" as const, background: "var(--nw-border-soft)", padding: "12px 20px", textAlign: "left" as const, borderBottom: "1px solid var(--nw-border)", letterSpacing: "0.05em" }}>Flight</th>
                <th style={{ color: "var(--nw-text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" as const, background: "var(--nw-border-soft)", padding: "12px 20px", textAlign: "left" as const, borderBottom: "1px solid var(--nw-border)", letterSpacing: "0.05em" }}>Seats</th>
                <th style={{ color: "var(--nw-text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" as const, background: "var(--nw-border-soft)", padding: "12px 20px", textAlign: "left" as const, borderBottom: "1px solid var(--nw-border)", letterSpacing: "0.05em" }}>Total</th>
                <th style={{ color: "var(--nw-text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" as const, background: "var(--nw-border-soft)", padding: "12px 20px", textAlign: "left" as const, borderBottom: "1px solid var(--nw-border)", letterSpacing: "0.05em" }}>Status</th>
                <th style={{ color: "var(--nw-text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" as const, background: "var(--nw-border-soft)", padding: "12px 20px", textAlign: "left" as const, borderBottom: "1px solid var(--nw-border)", letterSpacing: "0.05em" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 5).map((booking) => (
                <tr key={booking.id} style={{ transition: "background 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--nw-glass)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ color: "var(--nw-text-primary)", fontSize: "0.85rem", padding: "14px 20px", borderBottom: "1px solid var(--nw-border-soft)", fontFamily: "monospace" }}>{booking.flightNumber}</td>
                  <td style={{ color: "var(--nw-text-primary)", fontSize: "0.85rem", padding: "14px 20px", borderBottom: "1px solid var(--nw-border-soft)" }}>{booking.numberOfSeats}</td>
                  <td style={{ color: "var(--nw-primary)", fontSize: "0.85rem", padding: "14px 20px", borderBottom: "1px solid var(--nw-border-soft)", fontWeight: 700 }}>₹{booking.totalPrice.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "14px 20px", borderBottom: "1px solid var(--nw-border-soft)" }}>
                    <Chip
                      label={booking.status}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        borderRadius: "8px",
                        ...(booking.status === "CONFIRMED"
                          ? { background: "var(--nw-success-12)", color: "var(--nw-success-bright)", border: "1px solid var(--nw-success-20)" }
                          : { background: "var(--nw-error-12)", color: "var(--nw-error)", border: "1px solid var(--nw-error-20)" }),
                      }}
                    />
                  </td>
                  <td style={{ color: "var(--nw-text-muted)", fontSize: "0.85rem", padding: "14px 20px", borderBottom: "1px solid var(--nw-border-soft)" }}>{new Date(booking.bookingDate).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Paper>
    </Box>
  );
}




