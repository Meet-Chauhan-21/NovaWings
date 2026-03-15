// tabs/UsersTab.tsx
import { useState, useMemo, useEffect } from "react";
import BookingStatusDropdown from "../../../components/BookingStatusDropdown";
import LoadingSpinner from "../../../components/LoadingSpinner";
import Pagination from "../../../components/Pagination";
import type { UserResponse, BookingResponse } from "../../../types";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";

interface UsersTabProps {
  users: UserResponse[];
  bookings: BookingResponse[];
  usersQuery: { isLoading: boolean };
  handleBookingStatusSaved: () => void;
}

export default function UsersTab({
  users,
  bookings,
  usersQuery,
  handleBookingStatusSaved,
}: UsersTabProps) {
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | "USER" | "ADMIN">("all");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPageSize, setUsersPageSize] = useState(20);

  const userBookingCountMap = useMemo(() => {
    const map = new Map<string, number>();
    bookings.forEach((b) => {
      map.set(b.userId, (map.get(b.userId) || 0) + 1);
    });
    return map;
  }, [bookings]);

  const filteredUsers = useMemo(() => {
    let result = users;
    if (userRoleFilter !== "all") {
      result = result.filter((u) => u.role === userRoleFilter);
    }
    if (userSearch) {
      const q = userSearch.toLowerCase();
      result = result.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    return [...result].reverse();
  }, [users, userRoleFilter, userSearch]);

  useEffect(() => { setUsersPage(1); }, [userRoleFilter, userSearch, usersPageSize]);

  const paginatedUsers = useMemo(() => {
    const start = (usersPage - 1) * usersPageSize;
    return filteredUsers.slice(start, start + usersPageSize);
  }, [filteredUsers, usersPage, usersPageSize]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <Typography sx={{ fontSize: "1.4rem", fontWeight: 800, color: "#FFFFFF" }}>Users</Typography>

      {/* Filters */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: "16px" }}>
        <Box sx={{ flex: 1 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search by name or email..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                background: "rgba(255,255,255,0.03)",
                borderRadius: "10px",
                fontSize: "0.85rem",
                color: "#FFFFFF",
                "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
                "&:hover fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                "&.Mui-focused fieldset": { borderColor: "#F97316" },
              },
            }}
          />
        </Box>
        <Box sx={{ display: "flex", gap: "8px" }}>
          {(["all", "USER", "ADMIN"] as const).map((role) => (
            <Chip
              key={role}
              label={role === "all" ? "All" : role}
              onClick={() => setUserRoleFilter(role)}
              sx={
                userRoleFilter === role
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

      {usersQuery.isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
        <Paper sx={{ background: "#111111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden" }}>
          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ color: "#6B7280", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" as const, background: "rgba(255,255,255,0.04)", padding: "12px 20px", textAlign: "left" as const, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>#</th>
                  <th style={{ color: "#6B7280", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" as const, background: "rgba(255,255,255,0.04)", padding: "12px 20px", textAlign: "left" as const, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Name</th>
                  <th style={{ color: "#6B7280", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" as const, background: "rgba(255,255,255,0.04)", padding: "12px 20px", textAlign: "left" as const, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Email</th>
                  <th style={{ color: "#6B7280", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" as const, background: "rgba(255,255,255,0.04)", padding: "12px 20px", textAlign: "left" as const, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Role</th>
                  <th style={{ color: "#6B7280", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" as const, background: "rgba(255,255,255,0.04)", padding: "12px 20px", textAlign: "left" as const, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Total Bookings</th>
                  <th style={{ color: "#6B7280", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" as const, background: "rgba(255,255,255,0.04)", padding: "12px 20px", textAlign: "left" as const, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u, idx) => {
                  const isExpanded = expandedUserId === u.id;
                  const userBookings = bookings.filter((b) => b.userId === u.id);
                  const roleBadge =
                    u.role === "ADMIN"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-sky-100 text-sky-700";
                  return (
                    <UserRow
                      key={u.id}
                      user={u}
                      index={(usersPage - 1) * usersPageSize + idx + 1}
                      roleBadge={roleBadge}
                      bookingCount={userBookingCountMap.get(u.id) || 0}
                      isExpanded={isExpanded}
                      userBookings={userBookings}
                      onToggleExpand={() =>
                        setExpandedUserId(isExpanded ? null : u.id)
                      }
                      onStatusSaved={handleBookingStatusSaved}
                    />
                  );
                })}
              </tbody>
            </table>
          </Box>
        </Paper>
        <Pagination
          currentPage={usersPage}
          totalItems={filteredUsers.length}
          itemsPerPage={usersPageSize}
          onPageChange={setUsersPage}
          onItemsPerPageChange={(size) => setUsersPageSize(size)}
        />
        </>
      )}
    </Box>
  );
}

/** Expandable user row with accordion bookings table */
function UserRow({
  user: u,
  index,
  roleBadge,
  bookingCount,
  isExpanded,
  userBookings,
  onToggleExpand,
  onStatusSaved,
}: {
  user: UserResponse;
  index: number;
  roleBadge: string;
  bookingCount: number;
  isExpanded: boolean;
  userBookings: BookingResponse[];
  onToggleExpand: () => void;
  onStatusSaved: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const visibleBookings = showAll ? userBookings : userBookings.slice(0, 5);

  const tdStyle: React.CSSProperties = {
    color: "#FFFFFF",
    fontSize: "0.85rem",
    padding: "14px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  };

  const isAdmin = u.role === "ADMIN";

  return (
    <>
      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <td style={{ ...tdStyle, color: "#6B7280" }}>{index}</td>
        <td style={{ ...tdStyle, fontWeight: 600 }}>{u.name}</td>
        <td style={{ ...tdStyle, color: "#9CA3AF", fontSize: "0.75rem" }}>{u.email}</td>
        <td style={tdStyle}>
          <Chip
            size="small"
            label={u.role}
            sx={{
              fontWeight: 600,
              fontSize: "0.7rem",
              color: "#FFFFFF",
              backgroundColor: isAdmin ? "rgba(139,92,246,0.25)" : "rgba(59,130,246,0.25)",
              border: isAdmin ? "1px solid rgba(139,92,246,0.4)" : "1px solid rgba(59,130,246,0.4)",
            }}
          />
        </td>
        <td style={{ ...tdStyle, fontWeight: 600 }}>{bookingCount}</td>
        <td style={tdStyle}>
          {bookingCount > 0 && (
            <Button
              onClick={onToggleExpand}
              size="small"
              sx={{
                textTransform: "none",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#F97316",
                border: "1px solid rgba(249,115,22,0.3)",
                borderRadius: "8px",
                px: 1.5,
                py: 0.5,
                "&:hover": { backgroundColor: "rgba(249,115,22,0.1)" },
              }}
            >
              {isExpanded ? "Hide" : "View Bookings"}
            </Button>
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={6} style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>
            <Box sx={{ background: "#0A0A0A", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["Flight No", "Route", "Seats", "Total Price", "Status", "Date"].map((h) => (
                      <th key={h} style={{ padding: "10px 14px", fontSize: "0.7rem", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleBookings.map((b) => {
                    const innerTd: React.CSSProperties = {
                      padding: "10px 14px",
                      fontSize: "0.8rem",
                      color: "#FFFFFF",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    };
                    return (
                      <tr key={b.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ ...innerTd, fontFamily: "monospace", fontSize: "0.75rem" }}>{b.flightNumber}</td>
                        <td style={innerTd}>
                          {b.source} &rarr; {b.destination}
                        </td>
                        <td style={innerTd}>{b.numberOfSeats}</td>
                        <td style={{ ...innerTd, fontWeight: 700, color: "#F97316" }}>
                          &#8377;{b.totalPrice.toLocaleString("en-IN")}
                        </td>
                        <td style={innerTd}>
                          <BookingStatusDropdown
                            bookingId={b.id}
                            currentStatus={b.status as "CONFIRMED" | "CANCELLED"}
                            onSaved={onStatusSaved}
                          />
                        </td>
                        <td style={{ ...innerTd, color: "#6B7280", fontSize: "0.75rem" }}>
                          {new Date(b.bookingDate).toLocaleDateString("en-IN")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {userBookings.length > 5 && (
                <Box sx={{ px: 2, py: 1.5, borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
                  <Button
                    onClick={() => setShowAll(!showAll)}
                    size="small"
                    sx={{
                      textTransform: "none",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#F97316",
                      "&:hover": { backgroundColor: "rgba(249,115,22,0.1)" },
                    }}
                  >
                    {showAll ? "Show less" : `Show all ${userBookings.length} bookings`}
                  </Button>
                </Box>
              )}
            </Box>
          </td>
        </tr>
      )}
    </>
  );
}
