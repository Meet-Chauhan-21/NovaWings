// src/pages/SearchResults.tsx
// Dark-themed search results with MUI filter sidebar, sort controls, and flight cards

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { searchFlights } from "../services/flightService";
import CityCombobox from "../components/CityCombobox";
import DateInput from "../components/ui/DateInput";
import NumberInput from "../components/ui/NumberInput";
import type { Flight } from "../types";

// MUI
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Slider from "@mui/material/Slider";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import Collapse from "@mui/material/Collapse";
import Skeleton from "@mui/material/Skeleton";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

// Icons
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ViewListIcon from "@mui/icons-material/ViewList";
import GridViewIcon from "@mui/icons-material/GridView";
import AirplanemodeInactiveIcon from "@mui/icons-material/AirplanemodeInactive";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LuggageOutlinedIcon from "@mui/icons-material/LuggageOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import AirlineSeatReclineNormalIcon from "@mui/icons-material/AirlineSeatReclineNormal";
import EventSeatOutlinedIcon from "@mui/icons-material/EventSeatOutlined";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import LightModeIcon from "@mui/icons-material/LightMode";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import AirlinesIcon from "@mui/icons-material/Airlines";
import ScheduleIcon from "@mui/icons-material/Schedule";

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

function getDurationMs(dep: string, arr: string): number {
  return new Date(arr).getTime() - new Date(dep).getTime();
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function airlineColorHex(name: string): string {
  const colors = ["#EF4444", "#3B82F6", "#10B981", "#8B5CF6", "#F97316", "#EC4899", "#14B8A6", "#6366F1"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

type SortKey = "cheapest" | "fastest" | "earliest" | "seats";
type TimeSlot = "early" | "morning" | "afternoon" | "evening";

const TIME_SLOTS: { key: TimeSlot; label: string; sub: string }[] = [
  { key: "early", label: "Early Morning", sub: "00–06" },
  { key: "morning", label: "Morning", sub: "06–12" },
  { key: "afternoon", label: "Afternoon", sub: "12–18" },
  { key: "evening", label: "Evening", sub: "18–24" },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "cheapest", label: "Cheapest First" },
  { key: "fastest", label: "Fastest First" },
  { key: "earliest", label: "Departure Time" },
  { key: "seats", label: "Most Seats" },
];

const DURATION_OPTIONS: { label: string; val: number | null }[] = [
  { label: "Under 2h", val: 2 },
  { label: "2h – 5h", val: 5 },
  { label: "5h – 10h", val: 10 },
  { label: "Any", val: null },
];

// ── Component ────────────────────────────────
export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const source = searchParams.get("source") || "";
  const destination = searchParams.get("destination") || "";
  const date = searchParams.get("date") || "";
  const passengers = parseInt(searchParams.get("passengers") || "1");

  // Editable search bar state
  const [from, setFrom] = useState(source);
  const [to, setTo] = useState(destination);
  const [searchDate, setSearchDate] = useState(date);
  const [searchPassengers, setSearchPassengers] = useState(passengers);

  useEffect(() => {
    setFrom(searchParams.get("source") || "");
    setTo(searchParams.get("destination") || "");
    setSearchDate(searchParams.get("date") || "");
    setSearchPassengers(parseInt(searchParams.get("passengers") || "1"));
  }, [searchParams]);

  useEffect(() => {
    if (source && destination) {
      sessionStorage.setItem(
        "lastSearch",
        JSON.stringify({ source, destination, date, passengers })
      );
    }
  }, [source, destination, date, passengers]);

  useEffect(() => {
    if (!source && !destination) {
      const saved = sessionStorage.getItem("lastSearch");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          navigate(
            `/search?source=${encodeURIComponent(parsed.source)}&destination=${encodeURIComponent(parsed.destination)}&date=${parsed.date || ""}&passengers=${parsed.passengers || 1}`,
            { replace: true }
          );
        } catch {
          sessionStorage.removeItem("lastSearch");
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch() {
    if (!from.trim()) { toast.error("Please enter departure city"); return; }
    if (!to.trim()) { toast.error("Please enter destination city"); return; }
    if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
      toast.error("From and To city cannot be same"); return;
    }
    if (!searchDate) { toast.error("Please select travel date"); return; }
    navigate(
      `/search?source=${encodeURIComponent(from.trim())}&destination=${encodeURIComponent(to.trim())}&date=${searchDate}&passengers=${searchPassengers}`
    );
  }

  // API
  const { data: flights, isLoading, isError } = useQuery({
    queryKey: ["flights", "search", source, destination, date, passengers],
    queryFn: () => searchFlights(source, destination),
    enabled: !!(source && destination),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev: Flight[] | undefined) => prev,
  });

  // State
  const [sort, setSort] = useState<SortKey>("cheapest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [priceCommitted, setPriceCommitted] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [minSeats, setMinSeats] = useState(passengers);
  const [maxDuration, setMaxDuration] = useState<number | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchBarExpanded, setSearchBarExpanded] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    price: true,
    time: true,
    airlines: true,
    duration: true,
  });

  // Derived: date-filtered
  const baseFlights = useMemo(() => {
    if (!flights) return [];
    if (!date) return flights;
    return flights.filter((f) => f.departureTime.split("T")[0] === date);
  }, [flights, date]);

  // Price bounds
  const priceBounds = useMemo(() => {
    if (baseFlights.length === 0) return { min: 0, max: 50000 };
    const prices = baseFlights.map((f) => f.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [baseFlights]);

  // Set initial price range from data
  useEffect(() => {
    if (!priceCommitted && baseFlights.length > 0) {
      setPriceRange([priceBounds.min, priceBounds.max]);
    }
  }, [priceBounds, baseFlights.length, priceCommitted]);

  // Airlines with counts
  const airlineCounts = useMemo(() => {
    const map: Record<string, number> = {};
    baseFlights.forEach((f) => {
      map[f.airlineName] = (map[f.airlineName] || 0) + 1;
    });
    return map;
  }, [baseFlights]);

  const allAirlines = useMemo(() => Object.keys(airlineCounts).sort(), [airlineCounts]);

  // Filtered + sorted
  const filteredAndSortedFlights = useMemo(() => {
    let result = baseFlights;

    result = result.filter((f) => f.availableSeats >= minSeats);
    result = result.filter((f) => f.price >= priceRange[0] && f.price <= priceRange[1]);

    if (selectedTimeSlots.length > 0) {
      result = result.filter((f) => {
        const hour = new Date(f.departureTime).getHours();
        return selectedTimeSlots.some((slot) => {
          if (slot === "early") return hour >= 0 && hour < 6;
          if (slot === "morning") return hour >= 6 && hour < 12;
          if (slot === "afternoon") return hour >= 12 && hour < 18;
          if (slot === "evening") return hour >= 18 && hour < 24;
          return true;
        });
      });
    }

    if (selectedAirlines.length > 0) {
      result = result.filter((f) => selectedAirlines.includes(f.airlineName));
    }

    if (maxDuration !== null) {
      result = result.filter((f) => getDurationMs(f.departureTime, f.arrivalTime) <= maxDuration * 3600000);
    }

    result = [...result].sort((a, b) => {
      if (sort === "cheapest") return a.price - b.price;
      if (sort === "earliest")
        return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      if (sort === "fastest")
        return getDurationMs(a.departureTime, a.arrivalTime) - getDurationMs(b.departureTime, b.arrivalTime);
      if (sort === "seats") return b.availableSeats - a.availableSeats;
      return 0;
    });

    return result;
  }, [baseFlights, minSeats, priceRange, selectedTimeSlots, selectedAirlines, maxDuration, sort]);

  const resetFilters = useCallback(() => {
    setPriceRange([priceBounds.min, priceBounds.max]);
    setPriceCommitted(false);
    setSelectedTimeSlots([]);
    setSelectedAirlines([]);
    setMinSeats(passengers);
    setMaxDuration(null);
  }, [passengers, priceBounds]);

  const toggleTimeSlot = (slot: TimeSlot) =>
    setSelectedTimeSlots((prev) => (prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]));

  const toggleAirline = (name: string) =>
    setSelectedAirlines((prev) => (prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]));

  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const hasActiveFilters = selectedTimeSlots.length > 0 || selectedAirlines.length > 0 || maxDuration !== null || priceCommitted;
  const activeFilterCount = selectedTimeSlots.length + selectedAirlines.length + (maxDuration !== null ? 1 : 0) + (priceCommitted ? 1 : 0);

  const today = new Date().toISOString().split("T")[0];

  // ── Filter Panel (shared desktop + mobile) ──
  const filterPanel = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Price Range */}
      <FilterSection
        title="Price Range"
        icon={<CurrencyRupeeIcon sx={{ fontSize: 14 }} />}
        sectionKey="price"
        open={openSections.price}
        toggle={toggleSection}
        activeCount={priceCommitted ? 1 : 0}
      >
        <Box sx={{ px: 0.5 }}>
          <Slider
            value={priceRange}
            onChange={(_, val) => { setPriceRange(val as [number, number]); setPriceCommitted(true); }}
            min={priceBounds.min}
            max={priceBounds.max || 50000}
            step={500}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => `₹${v.toLocaleString("en-IN")}`}
            sx={{
              color: "#F97316",
              "& .MuiSlider-thumb": {
                width: 16, height: 16,
                border: "2px solid #F97316",
                background: "#0A0A0A",
                "&:hover, &.Mui-focusVisible": { boxShadow: "0 0 0 8px rgba(249,115,22,0.16)" },
              },
              "& .MuiSlider-rail": { background: "rgba(255,255,255,0.08)", opacity: 1 },
              "& .MuiSlider-valueLabel": { background: "#F97316", borderRadius: "8px", fontSize: "0.65rem" },
            }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
            <Box sx={{ flex: 1, textAlign: "center", py: 0.8, px: 1, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: "8px" }}>
              <Typography sx={{ color: "#F97316", fontSize: "0.72rem", fontWeight: 700 }}>{formatPrice(priceRange[0])}</Typography>
              <Typography sx={{ color: "#6B7280", fontSize: "0.6rem", mt: 0.2 }}>Min</Typography>
            </Box>
            <Typography sx={{ color: "#3F4756", fontSize: "0.75rem" }}>–</Typography>
            <Box sx={{ flex: 1, textAlign: "center", py: 0.8, px: 1, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", borderRadius: "8px" }}>
              <Typography sx={{ color: "#F97316", fontSize: "0.72rem", fontWeight: 700 }}>{formatPrice(priceRange[1])}</Typography>
              <Typography sx={{ color: "#6B7280", fontSize: "0.6rem", mt: 0.2 }}>Max</Typography>
            </Box>
          </Box>
        </Box>
      </FilterSection>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />

      {/* Departure Time */}
      <FilterSection
        title="Departure Time"
        icon={<ScheduleIcon sx={{ fontSize: 14 }} />}
        sectionKey="time"
        open={openSections.time}
        toggle={toggleSection}
        activeCount={selectedTimeSlots.length}
      >
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
          {[
            { key: "early" as TimeSlot, label: "Early", sub: "00–06", icon: <DarkModeOutlinedIcon sx={{ fontSize: 18 }} /> },
            { key: "morning" as TimeSlot, label: "Morning", sub: "06–12", icon: <WbSunnyIcon sx={{ fontSize: 18 }} /> },
            { key: "afternoon" as TimeSlot, label: "Afternoon", sub: "12–18", icon: <LightModeIcon sx={{ fontSize: 18 }} /> },
            { key: "evening" as TimeSlot, label: "Evening", sub: "18–24", icon: <NightsStayIcon sx={{ fontSize: 18 }} /> },
          ].map((slot) => {
            const active = selectedTimeSlots.includes(slot.key);
            return (
              <Box
                key={slot.key}
                onClick={() => toggleTimeSlot(slot.key)}
                sx={{
                  borderRadius: "10px",
                  px: 1,
                  py: 1.2,
                  textAlign: "center",
                  cursor: "pointer",
                  border: active ? "1px solid rgba(249,115,22,0.5)" : "1px solid rgba(255,255,255,0.07)",
                  background: active ? "rgba(249,115,22,0.1)" : "rgba(255,255,255,0.02)",
                  transition: "all 0.18s ease",
                  "&:hover": {
                    borderColor: "rgba(249,115,22,0.35)",
                    background: active ? "rgba(249,115,22,0.12)" : "rgba(249,115,22,0.04)",
                  },
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "center", mb: 0.5, color: active ? "#F97316" : "#4B5563" }}>
                  {slot.icon}
                </Box>
                <Typography sx={{ color: active ? "#F97316" : "#9CA3AF", fontSize: "0.72rem", fontWeight: 600, lineHeight: 1.2 }}>
                  {slot.label}
                </Typography>
                <Typography sx={{ color: active ? "rgba(249,115,22,0.7)" : "#374151", fontSize: "0.6rem", mt: 0.2 }}>
                  {slot.sub}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </FilterSection>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />

      {/* Airlines */}
      <FilterSection
        title="Airlines"
        icon={<AirlinesIcon sx={{ fontSize: 14 }} />}
        sectionKey="airlines"
        open={openSections.airlines}
        toggle={toggleSection}
        activeCount={selectedAirlines.length}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.2 }}>
          <Typography
            onClick={() => setSelectedAirlines([...allAirlines])}
            sx={{ color: "#F97316", fontSize: "0.7rem", fontWeight: 500, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
          >
            Select All
          </Typography>
          <Typography
            onClick={() => setSelectedAirlines([])}
            sx={{ color: "#6B7280", fontSize: "0.7rem", cursor: "pointer", "&:hover": { color: "#F97316" } }}
          >
            Clear
          </Typography>
        </Box>
        <Box sx={{
          maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 0.4,
          "&::-webkit-scrollbar": { width: 3 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.08)", borderRadius: 2 },
        }}>
          {allAirlines.map((airline) => {
            const isChecked = selectedAirlines.length === 0 || selectedAirlines.includes(airline);
            const color = airlineColorHex(airline);
            return (
              <Box
                key={airline}
                onClick={() => toggleAirline(airline)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1,
                  py: 0.8,
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  border: isChecked && selectedAirlines.length > 0 ? `1px solid ${color}30` : "1px solid transparent",
                  background: isChecked && selectedAirlines.length > 0 ? `${color}0D` : "transparent",
                  "&:hover": { background: "rgba(249,115,22,0.04)", borderColor: "rgba(249,115,22,0.12)" },
                }}
              >
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0, opacity: isChecked ? 1 : 0.25 }} />
                <Typography sx={{ flex: 1, color: isChecked ? "#D1D5DB" : "#4B5563", fontSize: "0.8rem", fontWeight: isChecked && selectedAirlines.length > 0 ? 600 : 400 }}>
                  {airline}
                </Typography>
                <Box sx={{
                  minWidth: 24, height: 20, borderRadius: "6px", px: 0.8,
                  background: isChecked ? `${color}20` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isChecked ? color + "40" : "rgba(255,255,255,0.06)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Typography sx={{ color: isChecked ? color : "#4B5563", fontSize: "0.65rem", fontWeight: 700 }}>
                    {airlineCounts[airline]}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </FilterSection>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />

      {/* Duration */}
      <FilterSection
        title="Max Duration"
        icon={<TimerOutlinedIcon sx={{ fontSize: 14 }} />}
        sectionKey="duration"
        open={openSections.duration}
        toggle={toggleSection}
        activeCount={maxDuration !== null ? 1 : 0}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.7 }}>
          {DURATION_OPTIONS.map((opt) => {
            const active = maxDuration === opt.val;
            return (
              <Box
                key={opt.label}
                onClick={() => setMaxDuration(opt.val)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                  px: 1.5,
                  py: 0.9,
                  borderRadius: "10px",
                  cursor: "pointer",
                  border: active ? "1px solid rgba(249,115,22,0.4)" : "1px solid rgba(255,255,255,0.06)",
                  background: active ? "rgba(249,115,22,0.1)" : "rgba(255,255,255,0.02)",
                  transition: "all 0.15s",
                  "&:hover": { borderColor: "rgba(249,115,22,0.3)", background: active ? "rgba(249,115,22,0.12)" : "rgba(249,115,22,0.04)" },
                }}
              >
                <Box sx={{
                  width: 14, height: 14, borderRadius: "50%",
                  border: `2px solid ${active ? "#F97316" : "rgba(255,255,255,0.15)"}`,
                  background: active ? "#F97316" : "transparent",
                  flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                }}>
                  {active && <Box sx={{ width: 5, height: 5, borderRadius: "50%", background: "#fff" }} />}
                </Box>
                <Typography sx={{ color: active ? "#F97316" : "#9CA3AF", fontSize: "0.8rem", fontWeight: active ? 600 : 400, flex: 1 }}>
                  {opt.label}
                </Typography>
                {opt.val !== null && (
                  <Typography sx={{ color: "#4B5563", fontSize: "0.65rem" }}>≤ {opt.val}h</Typography>
                )}
              </Box>
            );
          })}
        </Box>
      </FilterSection>
    </Box>
  );

  // ── Loading ──
  if (isLoading) {
    return (
      <Box sx={{ background: "#0A0A0A", minHeight: "100vh", pt: 4, pb: 8 }}>
        <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 4 } }}>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Box sx={{ width: 280, display: { xs: "none", md: "block" } }}>
              <Skeleton variant="rounded" height={500} sx={{ bgcolor: "rgba(255,255,255,0.06)", borderRadius: "16px" }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  height={140}
                  sx={{ bgcolor: "rgba(255,255,255,0.06)", borderRadius: "16px", mb: 2 }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  // ── Error ──
  if (isError) {
    return (
      <Box sx={{ background: "#0A0A0A", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Box sx={{ textAlign: "center" }}>
          <AirplanemodeInactiveIcon sx={{ fontSize: 64, color: "#EF4444", mb: 2 }} />
          <Typography variant="h5" sx={{ color: "#fff", mb: 1 }}>Something went wrong</Typography>
          <Typography sx={{ color: "#6B7280", mb: 3 }}>Failed to search flights. Please try again.</Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>Retry</Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ background: "#0A0A0A", minHeight: "100vh" }}>

      {/* ── Sticky Search Bar ── */}
      <Box
        sx={{
          position: "sticky",
          top: 70,
          zIndex: 30,
          background: "rgba(10,10,10,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 4 }, py: 1.5 }}>
          {/* Summary row */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
              <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem" }}>
                {source} <ArrowForwardIcon sx={{ fontSize: 14, mx: 0.5, color: "#F97316" }} /> {destination}
              </Typography>
              {date && (
                <Chip
                  label={formatDate(date + "T00:00:00")}
                  size="small"
                  sx={{ background: "rgba(249,115,22,0.1)", color: "#F97316", fontSize: "0.7rem" }}
                />
              )}
              <Chip
                label={`${passengers} Passenger${passengers > 1 ? "s" : ""}`}
                size="small"
                sx={{ background: "rgba(255,255,255,0.05)", color: "#9CA3AF", fontSize: "0.7rem" }}
              />
              <IconButton
                size="small"
                onClick={() => setSearchBarExpanded((p) => !p)}
                sx={{ color: "#F97316" }}
              >
                {searchBarExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
              </IconButton>
            </Box>

            {/* Sort (desktop) */}
            <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1.5 }}>
              <Typography sx={{ color: "#6B7280", fontSize: "0.8rem" }}>Sort by:</Typography>
              <Select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                size="small"
                sx={{
                  minWidth: 160,
                  ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.1)" },
                  ".MuiSelect-select": { py: 0.8, fontSize: "0.8rem" },
                }}
              >
                {SORT_OPTIONS.map((o) => (
                  <MenuItem key={o.key} value={o.key}>{o.label}</MenuItem>
                ))}
              </Select>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, v) => v && setViewMode(v)}
                size="small"
                sx={{
                  "& .MuiToggleButton-root": {
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#6B7280",
                    px: 1,
                    "&.Mui-selected": { background: "rgba(249,115,22,0.12)", color: "#F97316" },
                  },
                }}
              >
                <ToggleButton value="list"><ViewListIcon fontSize="small" /></ToggleButton>
                <ToggleButton value="grid"><GridViewIcon fontSize="small" /></ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>

          {/* Expandable search form */}
          <Collapse in={searchBarExpanded}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr auto 1fr 1fr 1fr auto" },
                gap: 2,
                alignItems: "end",
                mt: 2,
                pb: 1,
              }}
            >
              <Box>
                <Typography sx={{ color: "#6B7280", fontSize: "0.65rem", fontWeight: 600, mb: 0.5, textTransform: "uppercase", letterSpacing: "0.08em" }}>From</Typography>
                <CityCombobox value={from} onChange={setFrom} excludeCity={to} placeholder="Departure city" />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", alignSelf: "center", pb: { md: "1px" } }}>
                <IconButton
                  onClick={() => { const t = from; setFrom(to); setTo(t); }}
                  size="small"
                  sx={{
                    border: "1px solid rgba(249,115,22,0.3)",
                    color: "#F97316",
                    "&:hover": { background: "rgba(249,115,22,0.1)", transform: "rotate(180deg)" },
                    transition: "all 0.2s",
                  }}
                >
                  <SwapHorizIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box>
                <Typography sx={{ color: "#6B7280", fontSize: "0.65rem", fontWeight: 600, mb: 0.5, textTransform: "uppercase", letterSpacing: "0.08em" }}>To</Typography>
                <CityCombobox value={to} onChange={setTo} excludeCity={from} placeholder="Destination city" />
              </Box>
              <Box>
                <Typography sx={{ color: "#6B7280", fontSize: "0.65rem", fontWeight: 600, mb: 0.5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Date</Typography>
                <DateInput value={searchDate} onChange={setSearchDate} min={today} />
              </Box>
              <Box>
                <Typography sx={{ color: "#6B7280", fontSize: "0.65rem", fontWeight: 600, mb: 0.5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Passengers</Typography>
                <NumberInput value={searchPassengers} onChange={setSearchPassengers} min={1} max={9} />
              </Box>
              <Button variant="contained" onClick={handleSearch} startIcon={<SearchIcon />} sx={{ borderRadius: "12px", height: 42 }}>
                Search
              </Button>
            </Box>
          </Collapse>
        </Box>
      </Box>

      {/* ── Mobile Filter/Sort Bar ── */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          position: "sticky",
          top: 140,
          zIndex: 25,
          background: "rgba(17,17,17,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          px: 2,
          py: 1,
          gap: 1,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<TuneIcon />}
          onClick={() => setMobileFilterOpen(true)}
          size="small"
          sx={{ flex: 1, borderRadius: "10px", fontSize: "0.8rem" }}
        >
          Filters {hasActiveFilters && `(${selectedTimeSlots.length + selectedAirlines.length + (maxDuration !== null ? 1 : 0)})`}
        </Button>
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          size="small"
          sx={{
            flex: 1,
            ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.1)" },
            ".MuiSelect-select": { py: 0.8, fontSize: "0.8rem" },
          }}
        >
          {SORT_OPTIONS.map((o) => (
            <MenuItem key={o.key} value={o.key}>{o.label}</MenuItem>
          ))}
        </Select>
      </Box>

      {/* ── Mobile Filter Drawer ── */}
      <Drawer
        anchor="bottom"
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        PaperProps={{
          sx: {
            background: "#111111",
            borderRadius: "20px 20px 0 0",
            maxHeight: "80vh",
            p: 3,
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem" }}>Filters</Typography>
          <IconButton onClick={() => setMobileFilterOpen(false)} sx={{ color: "#6B7280" }}>
            <CloseIcon />
          </IconButton>
        </Box>
        {filterPanel}
        <Button
          variant="contained"
          fullWidth
          onClick={() => setMobileFilterOpen(false)}
          sx={{ mt: 3, borderRadius: "12px", py: 1.5 }}
        >
          Apply Filters
        </Button>
      </Drawer>

      {/* ── Main Layout ── */}
      <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 4 }, py: 3 }}>
        <Box sx={{ display: "flex", gap: 3 }}>

          {/* ── Desktop Filter Sidebar ── */}
          <Box sx={{ width: 280, flexShrink: 0, display: { xs: "none", md: "block" } }}>
            <Paper
              sx={{
                position: "sticky",
                top: 160,
                background: "linear-gradient(180deg, #141414 0%, #111111 100%)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "18px",
                overflow: "hidden",
                maxHeight: "calc(100vh - 180px)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Sidebar Header */}
              <Box sx={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                px: 2.5, py: 1.8,
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                background: "rgba(255,255,255,0.02)",
              }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TuneIcon sx={{ fontSize: 17, color: "#F97316" }} />
                  <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.9rem" }}>Filters</Typography>
                  {activeFilterCount > 0 && (
                    <Box sx={{
                      background: "linear-gradient(135deg, #F97316, #EA580C)",
                      borderRadius: "10px", px: 0.9, py: 0.15,
                      display: "flex", alignItems: "center",
                    }}>
                      <Typography sx={{ color: "#fff", fontSize: "0.62rem", fontWeight: 700 }}>{activeFilterCount}</Typography>
                    </Box>
                  )}
                </Box>
                {hasActiveFilters && (
                  <Button
                    size="small"
                    onClick={resetFilters}
                    sx={{
                      color: "#EF4444", fontSize: "0.7rem", textTransform: "none",
                      px: 1, py: 0.3, borderRadius: "8px",
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.15)",
                      "&:hover": { background: "rgba(239,68,68,0.15)" },
                    }}
                  >
                    Clear All
                  </Button>
                )}
              </Box>
              {/* Filter Panel */}
              <Box sx={{
                px: 2.5, pb: 2, overflowY: "auto", flex: 1,
                "&::-webkit-scrollbar": { width: 3 },
                "&::-webkit-scrollbar-track": { background: "transparent" },
                "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.08)", borderRadius: 2 },
              }}>
                {filterPanel}
              </Box>
            </Paper>
          </Box>

          {/* ── Results Column ── */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Results summary */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
              <Typography sx={{ color: "#6B7280", fontSize: "0.85rem" }}>
                Showing {filteredAndSortedFlights.length} flight{filteredAndSortedFlights.length !== 1 ? "s" : ""}
              </Typography>
              {hasActiveFilters && (
                <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap", alignItems: "center" }}>
                  {selectedTimeSlots.map((ts) => (
                    <Chip
                      key={ts}
                      label={TIME_SLOTS.find((s) => s.key === ts)?.label}
                      size="small"
                      onDelete={() => toggleTimeSlot(ts)}
                      sx={{ background: "rgba(249,115,22,0.1)", color: "#F97316", fontSize: "0.7rem" }}
                    />
                  ))}
                  {selectedAirlines.map((a) => (
                    <Chip
                      key={a}
                      label={a}
                      size="small"
                      onDelete={() => toggleAirline(a)}
                      sx={{ background: "rgba(249,115,22,0.1)", color: "#F97316", fontSize: "0.7rem" }}
                    />
                  ))}
                  {maxDuration !== null && (
                    <Chip
                      label={DURATION_OPTIONS.find((d) => d.val === maxDuration)?.label}
                      size="small"
                      onDelete={() => setMaxDuration(null)}
                      sx={{ background: "rgba(249,115,22,0.1)", color: "#F97316", fontSize: "0.7rem" }}
                    />
                  )}
                  <Button size="small" onClick={resetFilters} sx={{ color: "#6B7280", fontSize: "0.7rem", textTransform: "none" }}>
                    Clear all
                  </Button>
                </Box>
              )}
            </Box>

            {/* Empty state */}
            {filteredAndSortedFlights.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 12 }}>
                <AirplanemodeInactiveIcon sx={{ fontSize: 72, color: "#4B5563", mb: 2 }} />
                <Typography variant="h5" sx={{ color: "#fff", fontWeight: 600, mb: 1 }}>
                  No flights found
                </Typography>
                <Typography sx={{ color: "#6B7280", mb: 1 }}>
                  {source} → {destination}
                  {date && ` on ${formatDate(date + "T00:00:00")}`}
                </Typography>
                <Typography sx={{ color: "#4B5563", fontSize: "0.85rem", mb: 3 }}>
                  Try modifying your search or clearing filters
                </Typography>
                <Button variant="outlined" onClick={resetFilters}>
                  Clear Filters
                </Button>
              </Box>
            ) : viewMode === "list" ? (
              /* List view */
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {filteredAndSortedFlights.map((flight) => (
                  <FlightResultCard
                    key={flight.id}
                    flight={flight}
                    passengers={passengers}
                    expanded={expandedCard === flight.id}
                    onToggleExpand={() => setExpandedCard(expandedCard === flight.id ? null : flight.id)}
                  />
                ))}
              </Box>
            ) : (
              /* Grid view */
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }, gap: 2 }}>
                {filteredAndSortedFlights.map((flight) => (
                  <FlightGridCard key={flight.id} flight={flight} passengers={passengers} />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ── Collapsible Filter Section ─────────────
function FilterSection({
  title,
  icon,
  sectionKey,
  open,
  toggle,
  children,
  activeCount = 0,
}: {
  title: string;
  icon?: React.ReactNode;
  sectionKey: string;
  open: boolean;
  toggle: (key: string) => void;
  children: React.ReactNode;
  activeCount?: number;
}) {
  return (
    <Box sx={{ py: 1.5 }}>
      <Box
        onClick={() => toggle(sectionKey)}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          mb: open ? 1.5 : 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
          {icon && (
            <Box sx={{ color: activeCount > 0 ? "#F97316" : "#6B7280", display: "flex", alignItems: "center" }}>
              {icon}
            </Box>
          )}
          <Typography sx={{ color: activeCount > 0 ? "#F97316" : "#D1D5DB", fontWeight: 600, fontSize: "0.82rem" }}>
            {title}
          </Typography>
          {activeCount > 0 && (
            <Box sx={{
              width: 17, height: 17, borderRadius: "50%",
              background: "linear-gradient(135deg, #F97316, #EA580C)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Typography sx={{ color: "#fff", fontSize: "0.58rem", fontWeight: 700 }}>{activeCount}</Typography>
            </Box>
          )}
        </Box>
        {open ? (
          <ExpandLessIcon sx={{ fontSize: 15, color: "#4B5563" }} />
        ) : (
          <ExpandMoreIcon sx={{ fontSize: 15, color: "#4B5563" }} />
        )}
      </Box>
      <Collapse in={open}>{children}</Collapse>
    </Box>
  );
}

// ── Flight Result Card (List View) ─────────
function FlightResultCard({
  flight,
  passengers,
  expanded,
  onToggleExpand,
}: {
  flight: Flight;
  passengers: number;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const navigate = useNavigate();
  const duration = getFlightDuration(flight.departureTime, flight.arrivalTime);
  const totalPrice = flight.price * passengers;
  const baseFare = flight.price * passengers;
  const tax = Math.round(baseFare * 0.18);
  const total = baseFare + tax;
  const goToDetail = () => navigate(`/flights/${flight.id}?passengers=${passengers}`);
  const color = airlineColorHex(flight.airlineName);

  return (
    <Card
      sx={{
        background: "#111111",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "16px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: "rgba(249,115,22,0.25)",
          boxShadow: "0 4px 20px rgba(249,115,22,0.06)",
        },
      }}
      onClick={goToDetail}
    >
      <Box sx={{ p: { xs: 2.5, md: 3 } }}>
        {/* Main row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2, md: 3 }, flexWrap: { xs: "wrap", md: "nowrap" } }}>

          {/* Airline info */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: { md: 140 } }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                background: `${color}20`,
                border: `1px solid ${color}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: color,
                fontWeight: 700,
                fontSize: "0.85rem",
                flexShrink: 0,
              }}
            >
              {flight.airlineName.substring(0, 2)}
            </Box>
            <Box>
              <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.85rem", lineHeight: 1.2 }}>
                {flight.airlineName}
              </Typography>
              <Typography sx={{ color: "#4B5563", fontSize: "0.7rem" }}>
                {flight.flightNumber}
              </Typography>
            </Box>
          </Box>

          {/* Route */}
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: { xs: 1.5, md: 3 } }}>
            {/* Departure */}
            <Box sx={{ textAlign: "center", minWidth: 70 }}>
              <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: { xs: "1.2rem", md: "1.5rem" } }}>
                {formatTime(flight.departureTime)}
              </Typography>
              <Typography sx={{ color: "#6B7280", fontSize: "0.7rem" }}>
                {flight.source}
              </Typography>
            </Box>

            {/* Duration line */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", px: 1 }}>
              <Typography sx={{ color: "#6B7280", fontSize: "0.65rem", mb: 0.5 }}>
                {duration}
              </Typography>
              <Box sx={{ width: "100%", display: "flex", alignItems: "center" }}>
                <Box sx={{ height: 1, flex: 1, background: "rgba(255,255,255,0.1)", borderStyle: "dashed" }} />
                <FlightTakeoffIcon sx={{ fontSize: 14, color: "#F97316", mx: 0.5 }} />
                <Box sx={{ height: 1, flex: 1, background: "rgba(255,255,255,0.1)", borderStyle: "dashed" }} />
              </Box>
              <Chip
                label="NON-STOP"
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.55rem",
                  fontWeight: 700,
                  mt: 0.5,
                  background: "rgba(16,185,129,0.1)",
                  color: "#10B981",
                  letterSpacing: "0.05em",
                }}
              />
            </Box>

            {/* Arrival */}
            <Box sx={{ textAlign: "center", minWidth: 70 }}>
              <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: { xs: "1.2rem", md: "1.5rem" } }}>
                {formatTime(flight.arrivalTime)}
              </Typography>
              <Typography sx={{ color: "#6B7280", fontSize: "0.7rem" }}>
                {flight.destination}
              </Typography>
            </Box>
          </Box>

          {/* Pricing */}
          <Box sx={{ textAlign: "right", minWidth: { md: 160 } }}>
            <Chip
              label="Economy"
              size="small"
              sx={{ mb: 0.5, height: 20, fontSize: "0.6rem", background: "rgba(255,255,255,0.05)", color: "#6B7280" }}
            />
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "1.4rem",
                background: "linear-gradient(135deg, #F97316, #F59E0B)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                lineHeight: 1.2,
              }}
            >
              {formatPrice(flight.price)}
            </Typography>
            <Typography sx={{ color: "#4B5563", fontSize: "0.65rem" }}>per person</Typography>
            {flight.availableSeats < 5 && (
              <Typography sx={{ color: "#F97316", fontSize: "0.7rem", fontWeight: 600, mt: 0.3 }}>
                Only {flight.availableSeats} left!
              </Typography>
            )}
            <Button
              variant="contained"
              size="small"
              onClick={(e) => { e.stopPropagation(); goToDetail(); }}
              sx={{ mt: 1, borderRadius: "10px", fontSize: "0.8rem", px: 3 }}
            >
              Select
            </Button>
          </Box>
        </Box>

        {/* Expand toggle */}
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Button
            size="small"
            onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ color: "#6B7280", fontSize: "0.75rem", textTransform: "none" }}
          >
            {expanded ? "Hide Details" : "Flight Details"}
          </Button>
        </Box>
      </Box>

      {/* Expanded details */}
      <Collapse in={expanded}>
        <Box
          sx={{
            borderTop: "1px solid rgba(255,255,255,0.04)",
            background: "rgba(255,255,255,0.02)",
            px: { xs: 2.5, md: 3 },
            py: 2.5,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 3 }}>
            {/* Flight Info */}
            <Box>
              <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.85rem", mb: 1.5 }}>Flight Info</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                {[
                  `Airline: ${flight.airlineName}`,
                  `Flight: ${flight.flightNumber}`,
                  `Departure: ${formatDate(flight.departureTime)}`,
                  `Arrival: ${formatDate(flight.arrivalTime)}`,
                  `Duration: ${duration}`,
                ].map((line) => (
                  <Typography key={line} sx={{ color: "#6B7280", fontSize: "0.8rem" }}>{line}</Typography>
                ))}
              </Box>
            </Box>

            {/* Fare Breakdown */}
            <Box>
              <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.85rem", mb: 1.5 }}>Fare Breakdown</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ color: "#6B7280", fontSize: "0.8rem" }}>Base Fare ({passengers}x)</Typography>
                  <Typography sx={{ color: "#9CA3AF", fontSize: "0.8rem" }}>{formatPrice(baseFare)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ color: "#6B7280", fontSize: "0.8rem" }}>Taxes (18%)</Typography>
                  <Typography sx={{ color: "#9CA3AF", fontSize: "0.8rem" }}>{formatPrice(tax)}</Typography>
                </Box>
                <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.85rem" }}>Total</Typography>
                  <Typography sx={{ color: "#F97316", fontWeight: 700, fontSize: "0.9rem" }}>{formatPrice(total)}</Typography>
                </Box>
              </Box>
            </Box>

            {/* Amenities */}
            <Box>
              <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.85rem", mb: 1.5 }}>Amenities</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {[
                  { icon: <LuggageOutlinedIcon sx={{ fontSize: 16 }} />, text: "Cabin: 7 kg" },
                  { icon: <LuggageOutlinedIcon sx={{ fontSize: 16 }} />, text: "Check-in: 15 kg" },
                  { icon: <RestaurantOutlinedIcon sx={{ fontSize: 16 }} />, text: "Meals: Available (paid)" },
                  { icon: <EventSeatOutlinedIcon sx={{ fontSize: 16 }} />, text: "Seat Selection: Available" },
                ].map((item) => (
                  <Box key={item.text} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ color: "#F97316" }}>{item.icon}</Box>
                    <Typography sx={{ color: "#6B7280", fontSize: "0.8rem" }}>{item.text}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          <Box sx={{ textAlign: "right", mt: 2.5 }}>
            <Button variant="contained" onClick={goToDetail} sx={{ borderRadius: "12px", px: 4 }}>
              Book Now
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Card>
  );
}

// ── Flight Grid Card ───────────────────────
function FlightGridCard({ flight, passengers }: { flight: Flight; passengers: number }) {
  const navigate = useNavigate();
  const duration = getFlightDuration(flight.departureTime, flight.arrivalTime);
  const goToDetail = () => navigate(`/flights/${flight.id}?passengers=${passengers}`);
  const color = airlineColorHex(flight.airlineName);

  return (
    <Card
      onClick={goToDetail}
      sx={{
        background: "#111111",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "16px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: "rgba(249,115,22,0.25)",
          transform: "translateY(-2px)",
          boxShadow: "0 8px 24px rgba(249,115,22,0.08)",
        },
      }}
    >
      <Box sx={{ p: 2.5 }}>
        {/* Airline */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              background: `${color}20`,
              border: `1px solid ${color}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: color,
              fontWeight: 700,
              fontSize: "0.7rem",
            }}
          >
            {flight.airlineName.substring(0, 2)}
          </Box>
          <Box>
            <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.8rem", lineHeight: 1.1 }}>
              {flight.airlineName}
            </Typography>
            <Typography sx={{ color: "#4B5563", fontSize: "0.65rem" }}>{flight.flightNumber}</Typography>
          </Box>
        </Box>

        {/* Times */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem" }}>
            {formatTime(flight.departureTime)}
          </Typography>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ color: "#6B7280", fontSize: "0.6rem" }}>{duration}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, my: 0.3 }}>
              <Box sx={{ height: 1, width: 20, background: "rgba(255,255,255,0.1)" }} />
              <FlightTakeoffIcon sx={{ fontSize: 10, color: "#F97316" }} />
              <Box sx={{ height: 1, width: 20, background: "rgba(255,255,255,0.1)" }} />
            </Box>
            <Chip label="Non-stop" size="small" sx={{ height: 16, fontSize: "0.5rem", background: "rgba(16,185,129,0.1)", color: "#10B981" }} />
          </Box>
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem" }}>
            {formatTime(flight.arrivalTime)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography sx={{ color: "#6B7280", fontSize: "0.7rem" }}>{flight.source}</Typography>
          <Typography sx={{ color: "#6B7280", fontSize: "0.7rem" }}>{flight.destination}</Typography>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.04)", mb: 2 }} />

        {/* Price + CTA */}
        <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "1.2rem",
                background: "linear-gradient(135deg, #F97316, #F59E0B)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {formatPrice(flight.price)}
            </Typography>
            <Typography sx={{ color: "#4B5563", fontSize: "0.6rem" }}>per person</Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={(e) => { e.stopPropagation(); goToDetail(); }}
            sx={{ borderRadius: "10px", fontSize: "0.75rem", px: 2.5 }}
          >
            Select
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
