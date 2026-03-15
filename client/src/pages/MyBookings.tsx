// src/pages/MyBookings.tsx
// User's booking history page — dark theme with MUI components

import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getMyBookings } from "../services/bookingService";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import SkeletonCard from "../components/ui/SkeletonCard";
import BookingCard from "../components/BookingCard";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";

import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";

const SORT_OPTIONS = [
  { value: "date_desc",  label: "Newest First" },
  { value: "date_asc",   label: "Oldest First" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "price_asc",  label: "Price: Low → High" },
];

export default function MyBookings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch]       = useState("");
  const [sort, setSort]           = useState("date_desc");

  const { data: bookings, isLoading, isError } = useQuery({
    queryKey: ["myBookings"],
    queryFn: getMyBookings,
  });

  const stats = useMemo(() => {
    if (!bookings) return { total: 0, confirmed: 0, cancelled: 0, totalSpent: 0, routes: 0 };
    const confirmed = bookings.filter((b) => b.status === "CONFIRMED");
    return {
      total:      bookings.length,
      confirmed:  confirmed.length,
      cancelled:  bookings.filter((b) => b.status === "CANCELLED").length,
      totalSpent: confirmed.reduce((s, b) => s + b.totalPrice, 0),
      routes:     new Set(bookings.map((b) => `${b.source}-${b.destination}`)).size,
    };
  }, [bookings]);

  const tabKeys = ["all", "confirmed", "cancelled"] as const;

  const filtered = useMemo(() => {
    if (!bookings) return [];
    let list = [...bookings];
    const tabKey = tabKeys[activeTab];
    if (tabKey === "confirmed") list = list.filter((b) => b.status === "CONFIRMED");
    if (tabKey === "cancelled") list = list.filter((b) => b.status === "CANCELLED");
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.flightNumber.toLowerCase().includes(q) ||
          b.airlineName.toLowerCase().includes(q)  ||
          b.source.toLowerCase().includes(q)       ||
          b.destination.toLowerCase().includes(q)   ||
          b.id.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (sort === "date_desc")  return new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime();
      if (sort === "date_asc")   return new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime();
      if (sort === "price_desc") return b.totalPrice - a.totalPrice;
      if (sort === "price_asc")  return a.totalPrice - b.totalPrice;
      return 0;
    });
    return list;
  }, [bookings, activeTab, search, sort]);

  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 3 }, py: 6 }}>
        <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
          {[...Array(3)].map((_, i) => (
            <Box key={i} sx={{ flex: 1, height: 80, background: "rgba(255,255,255,0.04)", borderRadius: "12px", animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>
          <SkeletonCard count={4} />
        </Box>
      </Box>
    );
  }

  if (isError) return <ErrorMessage message="Failed to load your bookings." />;
  if (!bookings || bookings.length === 0) {
    return (
      <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 3 }, py: 4 }}>
        <IconButton
          onClick={() => navigate("/")}
          sx={{ mb: 3, color: "#9CA3AF", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <EmptyState
          icon={<FlightTakeoffIcon />}
          title="No Bookings Yet"
          description="Start your journey — search for flights and book your next adventure!"
          actionLabel="Explore Flights"
          onAction={() => navigate("/explore")}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 3 }, py: { xs: 4, md: 6 } }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4, flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              onClick={() => navigate("/")}
              sx={{
                color: "#9CA3AF",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                "&:hover": { background: "rgba(249,115,22,0.1)", color: "#F97316" },
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Box>
              <Typography sx={{ fontSize: { xs: "1.5rem", md: "1.8rem" }, fontWeight: 800, color: "#FFFFFF" }}>
                My Bookings
              </Typography>
              <Typography sx={{ color: "#6B7280", fontSize: "0.85rem" }}>
                {stats.total} booking{stats.total !== 1 ? "s" : ""} across {stats.routes} route{stats.routes !== 1 ? "s" : ""}
              </Typography>
            </Box>
          </Box>
          <Button
            component={Link}
            to="/explore"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "0.85rem",
              background: "linear-gradient(135deg, #F97316, #EA580C)",
              "&:hover": { background: "linear-gradient(135deg, #EA580C, #DC2626)" },
            }}
          >
            New Booking
          </Button>
        </Box>
      </motion.div>

      {/* Stats Chips */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Box sx={{ display: "flex", gap: 1.5, mb: 4, flexWrap: "wrap" }}>
          {[
            { label: "Total", value: stats.total, color: "#3B82F6" },
            { label: "Confirmed", value: stats.confirmed, color: "#22C55E" },
            { label: "Cancelled", value: stats.cancelled, color: "#EF4444" },
            { label: "Spent", value: `₹${stats.totalSpent.toLocaleString("en-IN")}`, color: "#F97316" },
          ].map((stat) => (
            <Paper
              key={stat.label}
              sx={{
                background: "#111111",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "12px",
                px: 2.5,
                py: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                minWidth: 120,
              }}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: stat.color, flexShrink: 0 }} />
              <Box>
                <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "1rem" }}>
                  {stat.value}
                </Typography>
                <Typography sx={{ color: "#6B7280", fontSize: "0.7rem" }}>
                  {stat.label}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      </motion.div>

      {/* Controls */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
        <Paper
          sx={{
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "16px",
            p: 2.5,
            mb: 4,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, alignItems: { lg: "center" }, gap: 2 }}>
            {/* Tabs */}
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{
                minHeight: 40,
                "& .MuiTabs-indicator": {
                  background: "linear-gradient(90deg, #F97316, #F59E0B)",
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                },
                "& .MuiTab-root": {
                  color: "#6B7280",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  textTransform: "none",
                  minHeight: 40,
                  px: 2,
                  "&.Mui-selected": { color: "#F97316" },
                },
              }}
            >
              <Tab
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    All
                    <Badge badgeContent={stats.total} sx={{
                      "& .MuiBadge-badge": { background: activeTab === 0 ? "#F97316" : "rgba(255,255,255,0.1)", color: activeTab === 0 ? "#fff" : "#6B7280", fontSize: "0.65rem", minWidth: 20, height: 20 },
                    }}><Box /></Badge>
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    Confirmed
                    <Badge badgeContent={stats.confirmed} sx={{
                      "& .MuiBadge-badge": { background: activeTab === 1 ? "#22C55E" : "rgba(255,255,255,0.1)", color: activeTab === 1 ? "#fff" : "#6B7280", fontSize: "0.65rem", minWidth: 20, height: 20 },
                    }}><Box /></Badge>
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    Cancelled
                    <Badge badgeContent={stats.cancelled} sx={{
                      "& .MuiBadge-badge": { background: activeTab === 2 ? "#EF4444" : "rgba(255,255,255,0.1)", color: activeTab === 2 ? "#fff" : "#6B7280", fontSize: "0.65rem", minWidth: 20, height: 20 },
                    }}><Box /></Badge>
                  </Box>
                }
              />
            </Tabs>

            <Box sx={{ display: "flex", gap: 1.5, flex: 1, alignItems: "center" }}>
              {/* Search */}
              <TextField
                placeholder="Search by booking ID, destination..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                sx={{
                  flex: 1,
                  maxWidth: 360,
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
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#6B7280", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: search ? (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearch("")} sx={{ color: "#6B7280" }}>
                          <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </InputAdornment>
                    ) : undefined,
                  },
                }}
              />

              {/* Sort */}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  sx={{
                    borderRadius: "10px",
                    fontSize: "0.85rem",
                    color: "#FFFFFF",
                    background: "rgba(255,255,255,0.03)",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.08)" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#F97316" },
                    "& .MuiSvgIcon-root": { color: "#6B7280" },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        background: "#1A1A1A",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "10px",
                      },
                    },
                  }}
                >
                  {SORT_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value} sx={{ fontSize: "0.85rem", color: "#FFFFFF" }}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Paper>
      </motion.div>

      {/* Search results count */}
      {search && (
        <Typography sx={{ color: "#6B7280", fontSize: "0.85rem", mb: 2 }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "<span style={{ color: "#FFFFFF", fontWeight: 500 }}>{search}</span>"
        </Typography>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <Paper
          sx={{
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "16px",
            py: 12,
            textAlign: "center",
          }}
        >
          <FlightTakeoffIcon sx={{ fontSize: 48, color: "#4B5563", mb: 2 }} />
          <Typography sx={{ color: "#FFFFFF", fontWeight: 600, fontSize: "1.1rem", mb: 0.5 }}>
            No bookings found
          </Typography>
          <Typography sx={{ color: "#6B7280", fontSize: "0.85rem" }}>
            Try adjusting your search or filters
          </Typography>
          {search && (
            <Button
              onClick={() => setSearch("")}
              sx={{ mt: 2, color: "#F97316", textTransform: "none", fontSize: "0.85rem" }}
            >
              Clear search
            </Button>
          )}
        </Paper>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", xl: "1fr 1fr 1fr" }, gap: 2.5 }}>
          {filtered.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <BookingCard booking={b} />
            </motion.div>
          ))}
        </Box>
      )}
    </Box>
  );
}
