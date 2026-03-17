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
        <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--nw-text-primary)", mb: 2 }}>
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
                  background: "var(--nw-border-soft)",
                  borderRadius: "12px",
                  color: "var(--nw-text-primary)",
                  "& fieldset": { borderColor: "var(--nw-border-strong)" },
                  "&:hover fieldset": { borderColor: "var(--nw-primary-40)" },
                  "&.Mui-focused fieldset": { borderColor: "var(--nw-primary)" },
                },
                "& .MuiOutlinedInput-input::placeholder": { color: "var(--nw-text-muted)", opacity: 1 },
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
                  background: "var(--nw-border-soft)",
                  borderRadius: "12px",
                  color: "var(--nw-text-primary)",
                  "& fieldset": { borderColor: "var(--nw-border-strong)" },
                  "&:hover fieldset": { borderColor: "var(--nw-primary-40)" },
                  "&.Mui-focused fieldset": { borderColor: "var(--nw-primary)" },
                },
                "& .MuiOutlinedInput-input::placeholder": { color: "var(--nw-text-muted)", opacity: 1 },
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
                        background: "var(--nw-primary-15)",
                        color: "var(--nw-primary)",
                        border: "1px solid var(--nw-primary-30)",
                        fontWeight: 600,
                        cursor: "pointer",
                      }
                    : {
                        background: "var(--nw-border-soft)",
                        color: "var(--nw-text-muted)",
                        cursor: "pointer",
                      }
                }
              />
            ))}
          </Box>
        </Box>
      </Box>

      <Paper sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", overflow: "hidden" }}>
        <Box sx={{ overflowX: "auto" }}>
          <table style={{ width: "100%", textAlign: "left", fontSize: "0.875rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--nw-glass)", borderBottom: "1px solid var(--nw-border)" }}>
                {["ID", "Booked By", "Email", "Flight", "Route", "Seats", "Total", "Status", "Date"].map((h) => (
                  <th key={h} style={{ padding: "12px 24px", fontWeight: 600, color: "var(--nw-text-secondary)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedBookings.map((booking) => {
                const bookedByUser = userMap.get(booking.userId);
                const roleBadgeStyle = bookedByUser?.role === "ADMIN"
                  ? { background: "rgba(168,85,247,0.15)", color: "var(--nw-accent-violet)", border: "1px solid rgba(168,85,247,0.3)" }
                  : { background: "rgba(56,189,248,0.15)", color: "var(--nw-accent-sky)", border: "1px solid rgba(56,189,248,0.3)" };
                return (
                  <tr key={booking.id} style={{ borderBottom: "1px solid var(--nw-border-soft)", transition: "background 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--nw-glass)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "12px 24px", fontFamily: "monospace", fontSize: "0.75rem", color: "var(--nw-text-secondary)" }}>#{booking.id.slice(0, 8)}</td>
                    <td style={{ padding: "12px 24px" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography sx={{ fontWeight: 500, color: "var(--nw-text-primary)", fontSize: "0.875rem" }}>
                          {bookedByUser?.name || `User #${booking.userId.slice(0, 6)}`}
                        </Typography>
                        {bookedByUser && (
                          <span style={{ ...roleBadgeStyle, borderRadius: "9999px", padding: "2px 8px", fontSize: "0.7rem", fontWeight: 500 }}>
                            {bookedByUser.role}
                          </span>
                        )}
                      </Box>
                    </td>
                    <td style={{ padding: "12px 24px", color: "var(--nw-text-muted)", fontSize: "0.75rem" }}>
                      {bookedByUser?.email || "\u2014"}
                    </td>
                    <td style={{ padding: "12px 24px", fontFamily: "monospace", fontSize: "0.75rem", color: "var(--nw-text-secondary)" }}>{booking.flightNumber}</td>
                    <td style={{ padding: "12px 24px", color: "var(--nw-text-secondary)" }}>
                      {booking.source} → {booking.destination}
                    </td>
                    <td style={{ padding: "12px 24px", color: "var(--nw-text-secondary)" }}>{booking.numberOfSeats}</td>
                    <td style={{ padding: "12px 24px", fontWeight: 700, color: "var(--nw-primary)", whiteSpace: "nowrap" }}>
                      ₹{booking.totalPrice.toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: "12px 24px" }}>
                      <BookingStatusDropdown
                        bookingId={booking.id}
                        currentStatus={booking.status as "CONFIRMED" | "CANCELLED"}
                        onSaved={handleBookingStatusSaved}
                      />
                    </td>
                    <td style={{ padding: "12px 24px", color: "var(--nw-text-muted)" }}>
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



