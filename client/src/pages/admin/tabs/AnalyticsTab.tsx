// tabs/AnalyticsTab.tsx
import { useMemo } from "react";
import {
  LineChart,
  Line,
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
import type { Flight, BookingResponse, UserResponse, PaymentRecord } from "../../../types";

import BookOnlineIcon from "@mui/icons-material/BookOnline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

interface AnalyticsTabProps {
  flights: Flight[];
  bookings: BookingResponse[];
  users: UserResponse[];
  allPayments: PaymentRecord[];
  totalRevenueFromPayments: number;
}

export default function AnalyticsTab({
  flights,
  bookings,
  users,
  allPayments,
  totalRevenueFromPayments,
}: AnalyticsTabProps) {
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

  const bookingStatusData = useMemo(() => {
    return [
      { name: "Confirmed", value: stats.confirmed, fill: "#10b981" },
      { name: "Cancelled", value: stats.cancelled, fill: "#ef4444" },
    ];
  }, [stats]);

  const revenueData = useMemo(() => {
    const dateMap = new Map<string, number>();
    bookings
      .filter((b) => b.status === "CONFIRMED")
      .forEach((b) => {
        const date = new Date(b.bookingDate).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        });
        dateMap.set(date, (dateMap.get(date) || 0) + b.totalPrice);
      });
    return Array.from(dateMap.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);
  }, [bookings]);

  const topFlightsData = useMemo(() => {
    const flightMap = new Map<string, number>();
    bookings.forEach((b) => {
      flightMap.set(b.flightNumber, (flightMap.get(b.flightNumber) || 0) + 1);
    });
    return Array.from(flightMap.entries())
      .map(([flight, count]) => ({ flight, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [bookings]);

  const paymentRevenueData = useMemo(() => {
    const dateMap = new Map<string, number>();
    allPayments
      .filter((p) => p.status === "SUCCESS")
      .forEach((p) => {
        const date = new Date(p.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
        dateMap.set(date, (dateMap.get(date) || 0) + p.totalAmount);
      });
    return Array.from(dateMap.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .slice(-14);
  }, [allPayments]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box>
        <Typography sx={{ color: "var(--nw-text-primary)", fontWeight: 800, fontSize: "1.5rem" }}>Analytics</Typography>
        <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.85rem", mt: 0.5 }}>Performance overview and key business metrics</Typography>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2.5 }}>
        {[
          { label: "Total Bookings", value: stats.totalBookings, icon: <BookOnlineIcon sx={{ fontSize: 18, color: "var(--nw-accent-indigo)" }} />, accent: "var(--nw-accent-indigo)", sub: "All time" },
          { label: "Confirmed", value: stats.confirmed, icon: <CheckCircleOutlineIcon sx={{ fontSize: 18, color: "var(--nw-success-bright)" }} />, accent: "var(--nw-success-bright)", sub: `${stats.totalBookings > 0 ? Math.round((stats.confirmed / stats.totalBookings) * 100) : 0}% confirmation rate` },
          { label: "Cancelled", value: stats.cancelled, icon: <CancelOutlinedIcon sx={{ fontSize: 18, color: "var(--nw-error)" }} />, accent: "var(--nw-error)", sub: `${stats.totalBookings > 0 ? Math.round((stats.cancelled / stats.totalBookings) * 100) : 0}% cancellation rate` },
          { label: "Total Revenue", value: `₹${totalRevenueFromPayments.toLocaleString("en-IN")}`, icon: <CurrencyRupeeIcon sx={{ fontSize: 18, color: "var(--nw-success)" }} />, accent: "var(--nw-success)", sub: "Actual payments" },
        ].map((card) => (
          <Paper key={card.label} elevation={0} sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", p: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: "10px", background: `${card.accent}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>{card.icon}</Box>
              <Box sx={{ height: 3, width: "35%", borderRadius: 2, background: card.accent, opacity: 0.5 }} />
            </Box>
            <Typography sx={{ color: "var(--nw-text-primary)", fontSize: "1.5rem", fontWeight: 800 }}>{card.value}</Typography>
            <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", mt: 0.3 }}>{card.label}</Typography>
            <Typography sx={{ color: card.accent, fontSize: "0.72rem", mt: 0.5 }}>{card.sub}</Typography>
          </Paper>
        ))}
      </Box>

      {/* Charts Row 1: Revenue + Status */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 3 }}>
        <Paper sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", p: 3 }}>
          <Typography sx={{ color: "var(--nw-text-primary)", fontWeight: 700, mb: 2, fontSize: "1rem" }}>Revenue Trend (Last 7 Days)</Typography>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueData}>
              <CartesianGrid stroke="var(--nw-border)" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: "var(--nw-text-muted)", fontSize: 11 }} axisLine={{ stroke: "var(--nw-border)" }} tickLine={false} />
              <YAxis tick={{ fill: "var(--nw-text-muted)", fontSize: 11 }} axisLine={{ stroke: "var(--nw-border)" }} tickLine={false} tickFormatter={(v) => `₹${((v as number) / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`₹${(v as number).toLocaleString("en-IN")}`, "Revenue"]} contentStyle={{ background: "var(--nw-elevated)", border: "1px solid var(--nw-border-strong)", borderRadius: 8, color: "var(--nw-text-primary)", fontSize: "0.8rem" }} />
              <Line type="monotone" dataKey="revenue" stroke="var(--nw-primary)" strokeWidth={2.5} dot={{ fill: "var(--nw-primary)", r: 3 }} activeDot={{ r: 5 }} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        <Paper sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", p: 3 }}>
          <Typography sx={{ color: "var(--nw-text-primary)", fontWeight: 700, mb: 1.5, fontSize: "1rem" }}>Booking Status</Typography>
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={bookingStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {bookingStatusData.map((_entry, i) => <Cell key={i} fill={bookingStatusData[i].fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--nw-elevated)", border: "1px solid var(--nw-border-strong)", borderRadius: 8, color: "var(--nw-text-primary)", fontSize: "0.8rem" }} />
            </PieChart>
          </ResponsiveContainer>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {bookingStatusData.map((d) => (
              <Box key={d.name} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: d.fill }} />
                  <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.75rem" }}>{d.name}</Typography>
                </Box>
                <Typography sx={{ color: "var(--nw-text-primary)", fontWeight: 700, fontSize: "0.75rem" }}>{d.value}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>

      {/* Charts Row 2: Top Flights + Payment Revenue */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>
        <Paper sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", p: 3 }}>
          <Typography sx={{ color: "var(--nw-text-primary)", fontWeight: 700, mb: 2, fontSize: "1rem" }}>Top 5 Most Booked Flights</Typography>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topFlightsData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
              <CartesianGrid stroke="var(--nw-border)" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fill: "var(--nw-text-muted)", fontSize: 11 }} axisLine={{ stroke: "var(--nw-border)" }} tickLine={false} />
              <YAxis dataKey="flight" type="category" width={75} tick={{ fill: "var(--nw-text-secondary)", fontSize: 11 }} axisLine={{ stroke: "var(--nw-border)" }} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--nw-elevated)", border: "1px solid var(--nw-border-strong)", borderRadius: 8, color: "var(--nw-text-primary)", fontSize: "0.8rem" }} />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {topFlightsData.map((_entry, i) => <Cell key={i} fill={["var(--nw-primary)","var(--nw-accent-indigo)","var(--nw-accent-blue)","var(--nw-success-bright)","var(--nw-accent-violet)"][i % 5]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        <Paper sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", p: 3 }}>
          <Typography sx={{ color: "var(--nw-text-primary)", fontWeight: 700, mb: 2, fontSize: "1rem" }}>Payment Revenue (Last 14 Days)</Typography>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={paymentRevenueData}>
              <CartesianGrid stroke="var(--nw-border)" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: "var(--nw-text-muted)", fontSize: 10 }} axisLine={{ stroke: "var(--nw-border)" }} tickLine={false} />
              <YAxis tick={{ fill: "var(--nw-text-muted)", fontSize: 11 }} axisLine={{ stroke: "var(--nw-border)" }} tickLine={false} tickFormatter={(v) => `₹${((v as number) / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`₹${(v as number).toLocaleString("en-IN")}`, "Revenue"]} contentStyle={{ background: "var(--nw-elevated)", border: "1px solid var(--nw-border-strong)", borderRadius: 8, color: "var(--nw-text-primary)", fontSize: "0.8rem" }} />
              <Bar dataKey="revenue" fill="var(--nw-success)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 3 }}>
        <Paper sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", p: 3, borderTop: "3px solid var(--nw-primary)" }}>
          <Typography sx={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--nw-text-muted)", fontWeight: 600, mb: 1 }}>Avg Booking Value</Typography>
          <Typography sx={{ fontSize: "1.875rem", fontWeight: 800, color: "var(--nw-primary)" }}>₹{stats.avgBookingValue.toLocaleString("en-IN")}</Typography>
          <Typography sx={{ fontSize: "0.72rem", color: "var(--nw-text-muted)", mt: 0.5 }}>Average per confirmed booking</Typography>
        </Paper>
        <Paper sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", p: 3, borderTop: "3px solid var(--nw-success-bright)" }}>
          <Typography sx={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--nw-text-muted)", fontWeight: 600, mb: 1 }}>Total Revenue</Typography>
          <Typography sx={{ fontSize: "1.875rem", fontWeight: 800, color: "var(--nw-success-bright)" }}>₹{stats.totalRevenue.toLocaleString("en-IN")}</Typography>
          <Typography sx={{ fontSize: "0.72rem", color: "var(--nw-text-muted)", mt: 0.5 }}>From {stats.confirmed} confirmed bookings</Typography>
        </Paper>
        <Paper sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", p: 3, borderTop: "3px solid var(--nw-accent-indigo)" }}>
          <Typography sx={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--nw-text-muted)", fontWeight: 600, mb: 1 }}>Registered Users</Typography>
          <Typography sx={{ fontSize: "1.875rem", fontWeight: 800, color: "var(--nw-accent-indigo)" }}>{stats.totalUsers.toLocaleString("en-IN")}</Typography>
          <Typography sx={{ fontSize: "0.72rem", color: "var(--nw-text-muted)", mt: 0.5 }}>Total users on platform</Typography>
        </Paper>
      </Box>
    </Box>
  );
}



