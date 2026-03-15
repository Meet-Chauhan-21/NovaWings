// tabs/BookingsTab.tsx
import { useState, useMemo, useEffect } from "react";
import BookingStatusDropdown from "../../../components/BookingStatusDropdown";
import Pagination from "../../../components/Pagination";
import type { BookingResponse, UserResponse } from "../../../types";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";

interface BookingsTabProps {
  bookings: BookingResponse[];
  users: UserResponse[];
  handleBookingStatusSaved: () => void;
}

export default function BookingsTab({
  bookings,
  users,
  handleBookingStatusSaved,
}: BookingsTabProps) {
  const [seatFilter, setSeatFilter] = useState<"all" | "confirmed" | "cancelled">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingUserSearch, setBookingUserSearch] = useState("");
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsPageSize, setBookingsPageSize] = useState(25);

  const userMap = useMemo(() => {
    const map = new Map<string, UserResponse>();
    users.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);

  const filteredBookings = useMemo(() => {
    let result = bookings;
    if (seatFilter !== "all") {
      result = result.filter((b) => b.status === seatFilter.toUpperCase());
    }
    if (searchTerm) {
      result = result.filter((b) =>
        b.flightNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (bookingUserSearch) {
      const q = bookingUserSearch.toLowerCase();
      result = result.filter((b) => {
        const u = userMap.get(b.userId);
        if (!u) return false;
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      });
    }
    return result.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
  }, [bookings, seatFilter, searchTerm, bookingUserSearch, userMap]);

  useEffect(() => { setBookingsPage(1); }, [seatFilter, searchTerm, bookingUserSearch, bookingsPageSize]);

  const paginatedBookings = useMemo(() => {
    const start = (bookingsPage - 1) * bookingsPageSize;
    return filteredBookings.slice(start, start + bookingsPageSize);
  }, [filteredBookings, bookingsPage, bookingsPageSize]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#FFFFFF", mb: 2 }}>
          All Bookings
        </Typography>

        {/* Filters */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search by flight number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: "12px",
                  color: "#FFFFFF",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                  "&:hover fieldset": { borderColor: "rgba(249,115,22,0.4)" },
                  "&.Mui-focused fieldset": { borderColor: "#F97316" },
                },
                "& .MuiOutlinedInput-input::placeholder": { color: "#6B7280", opacity: 1 },
              }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search by user name or email..."
              value={bookingUserSearch}
              onChange={(e) => setBookingUserSearch(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: "12px",
                  color: "#FFFFFF",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                  "&:hover fieldset": { borderColor: "rgba(249,115,22,0.4)" },
                  "&.Mui-focused fieldset": { borderColor: "#F97316" },
                },
                "& .MuiOutlinedInput-input::placeholder": { color: "#6B7280", opacity: 1 },
              }}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            {(["all", "confirmed", "cancelled"] as const).map((status) => (
              <Chip
                key={status}
                label={status.charAt(0).toUpperCase() + status.slice(1)}
                onClick={() => setSeatFilter(status)}
                sx={
                  seatFilter === status
                    ? {
                        background: "rgba(249,115,22,0.15)",
                        color: "#F97316",
                        border: "1px solid rgba(249,115,22,0.3)",
                        fontWeight: 600,
                        cursor: "pointer",
                      }
                    : {
                        background: "rgba(255,255,255,0.04)",
                        color: "#6B7280",
                        cursor: "pointer",
                      }
                }
              />
            ))}
          </Box>
        </Box>
      </Box>

      <Paper sx={{ background: "#111111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden" }}>
        <Box sx={{ overflowX: "auto" }}>
          <table style={{ width: "100%", textAlign: "left", fontSize: "0.875rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["ID", "Booked By", "Email", "Flight", "Route", "Seats", "Total", "Status", "Date"].map((h) => (
                  <th key={h} style={{ padding: "12px 24px", fontWeight: 600, color: "#9CA3AF", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedBookings.map((booking) => {
                const bookedByUser = userMap.get(booking.userId);
                const roleBadgeStyle = bookedByUser?.role === "ADMIN"
                  ? { background: "rgba(168,85,247,0.15)", color: "#A855F7", border: "1px solid rgba(168,85,247,0.3)" }
                  : { background: "rgba(56,189,248,0.15)", color: "#38BDF8", border: "1px solid rgba(56,189,248,0.3)" };
                return (
                  <tr key={booking.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "12px 24px", fontFamily: "monospace", fontSize: "0.75rem", color: "#9CA3AF" }}>#{booking.id.slice(0, 8)}</td>
                    <td style={{ padding: "12px 24px" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography sx={{ fontWeight: 500, color: "#FFFFFF", fontSize: "0.875rem" }}>
                          {bookedByUser?.name || `User #${booking.userId.slice(0, 6)}`}
                        </Typography>
                        {bookedByUser && (
                          <span style={{ ...roleBadgeStyle, borderRadius: "9999px", padding: "2px 8px", fontSize: "0.7rem", fontWeight: 500 }}>
                            {bookedByUser.role}
                          </span>
                        )}
                      </Box>
                    </td>
                    <td style={{ padding: "12px 24px", color: "#6B7280", fontSize: "0.75rem" }}>
                      {bookedByUser?.email || "\u2014"}
                    </td>
                    <td style={{ padding: "12px 24px", fontFamily: "monospace", fontSize: "0.75rem", color: "#9CA3AF" }}>{booking.flightNumber}</td>
                    <td style={{ padding: "12px 24px", color: "#D1D5DB" }}>
                      {booking.source} → {booking.destination}
                    </td>
                    <td style={{ padding: "12px 24px", color: "#D1D5DB" }}>{booking.numberOfSeats}</td>
                    <td style={{ padding: "12px 24px", fontWeight: 700, color: "#F97316", whiteSpace: "nowrap" }}>
                      ₹{booking.totalPrice.toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: "12px 24px" }}>
                      <BookingStatusDropdown
                        bookingId={booking.id}
                        currentStatus={booking.status as "CONFIRMED" | "CANCELLED"}
                        onSaved={handleBookingStatusSaved}
                      />
                    </td>
                    <td style={{ padding: "12px 24px", color: "#6B7280" }}>
                      {new Date(booking.bookingDate).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>
      </Paper>
      <Pagination
        currentPage={bookingsPage}
        totalItems={filteredBookings.length}
        itemsPerPage={bookingsPageSize}
        onPageChange={setBookingsPage}
        onItemsPerPageChange={(size) => setBookingsPageSize(size)}
      />
    </Box>
  );
}
