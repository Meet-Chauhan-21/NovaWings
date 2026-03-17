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
            <Box key={i} sx={{ flex: 1, height: 80, background: "var(--nw-border-soft)", borderRadius: "12px", animation: "pulse 1.5s ease-in-out infinite" }} />
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
          sx={{ mb: 3, color: "var(--nw-text-secondary)", background: "var(--nw-border-soft)", border: "1px solid var(--nw-border-strong)" }}
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
    <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 3 }, pt: { xs: 3, md: 4 }, pb: { xs: 5, md: 7 } }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: { xs: 3, md: 4 }, flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              onClick={() => navigate("/")}
              sx={{
                color: "var(--nw-text-secondary)",
                background: "var(--nw-border-soft)",
                border: "1px solid var(--nw-border-strong)",
                "&:hover": { background: "var(--nw-primary-10)", color: "var(--nw-primary)" },
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Box>
              <Typography sx={{ fontSize: { xs: "1.5rem", md: "1.8rem" }, fontWeight: 800, color: "var(--nw-text-primary)" }}>
                My Bookings
              </Typography>
              <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.85rem" }}>
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
              background: "linear-gradient(135deg, var(--nw-primary), var(--nw-primary-dark))",
              "&:hover": { background: "linear-gradient(135deg, var(--nw-primary-dark), var(--nw-error))" },
            }}
          >
            New Booking
          </Button>
        </Box>
      </motion.div>

      {/* Stats Chips */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Box sx={{ display: "flex", gap: 1.5, mb: { xs: 3, md: 4 }, flexWrap: "wrap" }}>
          {[
            { label: "Total", value: stats.total, color: "var(--nw-info)" },
            { label: "Confirmed", value: stats.confirmed, color: "var(--nw-success-bright)" },
            { label: "Cancelled", value: stats.cancelled, color: "var(--nw-error)" },
            { label: "Spent", value: `₹${stats.totalSpent.toLocaleString("en-IN")}`, color: "var(--nw-primary)" },
          ].map((stat) => (
            <Paper
              key={stat.label}
              sx={{
                background: "var(--nw-card)",
                border: "1px solid var(--nw-border)",
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
                <Typography sx={{ color: "var(--nw-text-primary)", fontWeight: 700, fontSize: "1rem" }}>
                  {stat.value}
                </Typography>
                <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.7rem" }}>
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
            background: "var(--nw-card)",
            border: "1px solid var(--nw-border)",
            borderRadius: "16px",
            p: { xs: 2, md: 2.5 },
            mb: { xs: 3, md: 4 },
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
                  background: "linear-gradient(90deg, var(--nw-primary), var(--nw-secondary))",
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                },
                "& .MuiTab-root": {
                  color: "var(--nw-text-muted)",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  textTransform: "none",
                  minHeight: 40,
                  px: 2,
                  "&.Mui-selected": { color: "var(--nw-primary)" },
                },
              }}
            >
              <Tab
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    All
                    <Badge badgeContent={stats.total} sx={{
                      "& .MuiBadge-badge": { background: activeTab === 0 ? "var(--nw-primary)" : "var(--nw-border-strong)", color: activeTab === 0 ? "var(--nw-text-primary)" : "var(--nw-text-muted)", fontSize: "0.65rem", minWidth: 20, height: 20 },
                    }}><Box /></Badge>
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    Confirmed
                    <Badge badgeContent={stats.confirmed} sx={{
                      "& .MuiBadge-badge": { background: activeTab === 1 ? "var(--nw-success-bright)" : "var(--nw-border-strong)", color: activeTab === 1 ? "var(--nw-text-primary)" : "var(--nw-text-muted)", fontSize: "0.65rem", minWidth: 20, height: 20 },
                    }}><Box /></Badge>
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    Cancelled
                    <Badge badgeContent={stats.cancelled} sx={{
                      "& .MuiBadge-badge": { background: activeTab === 2 ? "var(--nw-error)" : "var(--nw-border-strong)", color: activeTab === 2 ? "var(--nw-text-primary)" : "var(--nw-text-muted)", fontSize: "0.65rem", minWidth: 20, height: 20 },
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
                    background: "var(--nw-glass)",
                    borderRadius: "10px",
                    fontSize: "0.85rem",
                    color: "var(--nw-text-primary)",
                    "& fieldset": { borderColor: "var(--nw-border-strong)" },
                    "&:hover fieldset": { borderColor: "var(--nw-border-strong)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--nw-primary)" },
                  },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "var(--nw-text-muted)", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: search ? (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearch("")} sx={{ color: "var(--nw-text-muted)" }}>
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
                    color: "var(--nw-text-primary)",
                    background: "var(--nw-glass)",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--nw-border-strong)" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--nw-border-strong)" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--nw-primary)" },
                    "& .MuiSvgIcon-root": { color: "var(--nw-text-muted)" },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        background: "var(--nw-elevated)",
                        border: "1px solid var(--nw-border-strong)",
                        borderRadius: "10px",
                      },
                    },
                  }}
                >
                  {SORT_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value} sx={{ fontSize: "0.85rem", color: "var(--nw-text-primary)" }}>
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
        <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.85rem", mb: 2.5 }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "
          <Box component="span" sx={{ color: "var(--nw-text-primary)", fontWeight: 500 }}>
            {search}
          </Box>
          "
        </Typography>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <Paper
          sx={{
            background: "var(--nw-card)",
            border: "1px solid var(--nw-border)",
            borderRadius: "16px",
            py: 12,
            textAlign: "center",
          }}
        >
          <FlightTakeoffIcon sx={{ fontSize: 48, color: "var(--nw-text-disabled)", mb: 2 }} />
          <Typography sx={{ color: "var(--nw-text-primary)", fontWeight: 600, fontSize: "1.1rem", mb: 0.5 }}>
            No bookings found
          </Typography>
          <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.85rem" }}>
            Try adjusting your search or filters
          </Typography>
          {search && (
            <Button
              onClick={() => setSearch("")}
              sx={{ mt: 2, color: "var(--nw-primary)", textTransform: "none", fontSize: "0.85rem" }}
            >
              Clear search
            </Button>
          )}
        </Paper>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", xl: "1fr 1fr 1fr" }, gap: { xs: 2, md: 3 }, alignItems: "stretch" }}>
          {filtered.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              style={{ display: "flex" }}
            >
              <BookingCard booking={b} />
            </motion.div>
          ))}
        </Box>
      )}
    </Box>
  );
}



