// src/pages/ExplorePage.tsx
// Smart flight browser — progressive city→route→flights flow
// All cities from API — NO hardcoded data. Visual layer redesigned with MUI dark theme.

import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useQuery, useQueries } from "@tanstack/react-query";
import { searchFlights } from "../services/flightService";
import locationService from "../services/locationService";
import CityCombobox from "../components/CityCombobox";
import FlightCard from "../components/FlightCard";
import DateInput from "../components/ui/DateInput";
import SkeletonCard from "../components/ui/SkeletonCard";
import type { Flight, Location } from "../types";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Skeleton from "@mui/material/Skeleton";

import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import StarIcon from "@mui/icons-material/Star";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

/** Route summary returned by the select transform in useQueries */
interface RouteSummary {
  destination: string;
  cheapestPrice: number;
  airline: string;
  flightCount: number;
  earliestDep: string;
}

type SortKey = "cheapest" | "earliest" | "fastest";

// ── City card gradient palette (deterministic hash → color) ─
const CITY_GRADIENTS = [
  "linear-gradient(145deg,#0d1b2a 0%,#1c3a5c 100%)",
  "linear-gradient(145deg,#1a0800 0%,#4a1800 100%)",
  "linear-gradient(145deg,#0a1a0a 0%,#1a4a1a 100%)",
  "linear-gradient(145deg,#1a1028 0%,#3d2060 100%)",
  "linear-gradient(145deg,#1a1500 0%,#4a3800 100%)",
  "linear-gradient(145deg,#001a1a 0%,#004040 100%)",
  "linear-gradient(145deg,#1a0010 0%,#4a0030 100%)",
  "linear-gradient(145deg,#001020 0%,#002050 100%)",
];

function getCityGradient(city: string) {
  let h = 0;
  for (let i = 0; i < city.length; i++) h = city.charCodeAt(i) + ((h << 5) - h);
  return CITY_GRADIENTS[Math.abs(h) % CITY_GRADIENTS.length];
}

// ── Animation variants ───────────────────────────────────
const gridContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };
const gridItem = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function ExplorePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── State — initialized from URL so reload restores selections ──
  const [fromCity, setFromCity] = useState(searchParams.get("source") || "");
  const [toCity, setToCity] = useState(searchParams.get("destination") || "");
  const [dateFilter, setDateFilter] = useState(searchParams.get("date") || "");
  const [sortBy, setSortBy] = useState<SortKey>("cheapest");
  const [visibleCount, setVisibleCount] = useState(10);

  // Sync URL → state (browser back/forward, external URL change)
  useEffect(() => {
    setFromCity(searchParams.get("source") || "");
    setToCity(searchParams.get("destination") || "");
    setDateFilter(searchParams.get("date") || "");
  }, [searchParams]);

  // Sync state → URL (user clicks persist to URL for reload survival)
  useEffect(() => {
    const params = new URLSearchParams();
    if (fromCity) params.set("source", fromCity);
    if (toCity) params.set("destination", toCity);
    if (dateFilter) params.set("date", dateFilter);
    if (searchParams.toString() !== params.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [fromCity, toCity, dateFilter, searchParams, setSearchParams]);

  // ── Fetch explore cities from API (dynamic) ──
  const { data: exploreCities = [], isLoading: citiesLoading } = useQuery({
    queryKey: ["exploreCities"],
    queryFn: locationService.getExploreCities,
    staleTime: 10 * 60 * 1000,
  });

  // Reset visible count when filters change
  useEffect(() => { setVisibleCount(10); }, [fromCity, toCity, dateFilter]);

  const pageState: "CITY_SELECT" | "ROUTE_SELECT" | "FLIGHT_LIST" =
    !fromCity && !toCity ? "CITY_SELECT"
    : fromCity && !toCity ? "ROUTE_SELECT"
    : "FLIGHT_LIST";

  // ── State B: fetch cheapest flight per destination ──
  const destinationCities = useMemo(
    () => exploreCities.filter((c: Location) => c.city.toLowerCase() !== fromCity.toLowerCase()),
    [fromCity, exploreCities]
  );

  const routeQueries = useQueries({
    queries: destinationCities.map((loc: Location) => ({
      queryKey: ["explore", fromCity, loc.city],
      queryFn: () => searchFlights(fromCity, loc.city),
      staleTime: 10 * 60 * 1000,
      enabled: pageState === "ROUTE_SELECT",
      select: (data: Flight[]): RouteSummary | null => {
        if (!data || data.length === 0) return null;
        const cheapest = [...data].sort((a, b) => a.price - b.price)[0];
        return { destination: loc.city, cheapestPrice: cheapest.price, airline: cheapest.airlineName, flightCount: data.length, earliestDep: cheapest.departureTime };
      },
    })),
  });

  const routesLoading = routeQueries.some((q) => q.isLoading);

  // ── State C: fetch flights for selected route ──
  const { data: flights = [], isLoading: flightsLoading } = useQuery({
    queryKey: ["explore", "flights", fromCity, toCity, dateFilter],
    queryFn: () => searchFlights(fromCity, toCity),
    staleTime: 5 * 60 * 1000,
    enabled: pageState === "FLIGHT_LIST",
  });

  // Sort & filter flights
  const sortedFlights = useMemo(() => {
    let list = [...flights];
    if (dateFilter) list = list.filter((f) => f.departureTime.startsWith(dateFilter));
    switch (sortBy) {
      case "cheapest": list.sort((a, b) => a.price - b.price); break;
      case "earliest": list.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()); break;
      case "fastest": {
        const dur = (f: Flight) => new Date(f.arrivalTime).getTime() - new Date(f.departureTime).getTime();
        list.sort((a, b) => dur(a) - dur(b));
        break;
      }
    }
    return list;
  }, [flights, dateFilter, sortBy]);

  const visibleFlights = sortedFlights.slice(0, visibleCount);
  const today = new Date().toISOString().split("T")[0];

  // ── Filter bar search handler ──
  const handleFind = () => {
    if (!fromCity.trim() && !toCity.trim()) { toast.error("Please select at least a From city"); return; }
    if (!fromCity.trim() && toCity.trim()) { setFromCity(toCity); setToCity(""); }
  };

  // ── Breadcrumb helpers ──
  const clearFrom = () => { setFromCity(""); setToCity(""); };
  const clearTo = () => setToCity("");

  // ────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: "100vh", background: "#0A0A0A" }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <Box
        sx={{
          background: "linear-gradient(160deg,#0A0A0A 0%,#1A0800 50%,#0A0A0A 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          pt: 6,
          pb: 10,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "absolute", top: "60%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse,rgba(249,115,22,0.12) 0%,transparent 70%)", pointerEvents: "none" }} />

        <Box sx={{ maxWidth: 720, mx: "auto", px: 3, textAlign: "center", position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)", borderRadius: "100px", px: 2, py: 0.75, mb: 3 }}>
            <FlightTakeoffIcon sx={{ fontSize: 14, color: "#F97316" }} />
            <Typography sx={{ color: "#F97316", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Explore Mode
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ color: "#FFFFFF", fontWeight: 800, mb: 1.5, fontSize: { xs: "1.875rem", md: "2.5rem" } }}>
            Explore{" "}
            <Box component="span" sx={{ background: "linear-gradient(90deg,#F97316,#F59E0B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Destinations
            </Box>
          </Typography>
          <Typography sx={{ color: "#9CA3AF", fontSize: "1.0625rem", lineHeight: 1.7 }}>
            Discover amazing routes from your city — no destination needed to start
          </Typography>
        </Box>
      </Box>

      {/* ── Filter Bar ────────────────────────────────────── */}
      <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2, md: 3 }, mt: -5, position: "relative", zIndex: 10 }}>
        <Box sx={{ background: "#111111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", p: { xs: 2.5, sm: 3 }, boxShadow: "0 16px 48px rgba(0,0,0,0.4)" }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
            <Box sx={{ flex: "1 1 180px", minWidth: 160 }}>
              <Typography sx={{ color: "#6B7280", fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.75 }}>From</Typography>
              <CityCombobox value={fromCity} onChange={setFromCity} placeholder="Departure city" excludeCity={toCity} type="departure" />
            </Box>
            {/* Swap cities button */}
            <Box sx={{ display: "flex", alignItems: "flex-end", pb: "1px", flexShrink: 0 }}>
              <IconButton
                onClick={() => { const t = fromCity; setFromCity(toCity); setToCity(t); }}
                size="small"
                sx={{
                  border: "1px solid rgba(249,115,22,0.3)",
                  color: "#F97316",
                  mt: "22px",
                  "&:hover": { background: "rgba(249,115,22,0.1)", transform: "rotate(180deg)" },
                  transition: "all 0.2s",
                }}
              >
                <SwapHorizIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ flex: "1 1 180px", minWidth: 160 }}>
              <Typography sx={{ color: "#6B7280", fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.75 }}>To</Typography>
              <CityCombobox value={toCity} onChange={setToCity} placeholder="Destination city" excludeCity={fromCity} type="arrival" />
            </Box>
            <Box sx={{ minWidth: 150 }}>
              <Typography sx={{ color: "#6B7280", fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.75 }}>Date</Typography>
              <DateInput value={dateFilter} onChange={setDateFilter} min={today} showQuickButtons />
            </Box>
            <Button onClick={handleFind} variant="contained" startIcon={<SearchIcon />} sx={{ px: 3, py: 1.4, borderRadius: "12px", fontWeight: 700, background: "linear-gradient(135deg,#F97316,#EA580C)", boxShadow: "0 4px 16px rgba(249,115,22,0.35)", "&:hover": { boxShadow: "0 6px 22px rgba(249,115,22,0.5)" }, whiteSpace: "nowrap" }}>
              Find Flights
            </Button>
            {fromCity && toCity && (
              <Button
                onClick={() => navigate(`/search?source=${encodeURIComponent(fromCity)}&destination=${encodeURIComponent(toCity)}${dateFilter ? `&date=${encodeURIComponent(dateFilter)}` : ""}`)}
                variant="outlined"
                endIcon={<OpenInNewIcon sx={{ fontSize: "14px !important" }} />}
                sx={{ px: 2.5, py: 1.4, borderRadius: "12px", fontWeight: 600, borderColor: "rgba(249,115,22,0.35)", color: "#F97316", "&:hover": { borderColor: "#F97316", background: "rgba(249,115,22,0.06)" }, whiteSpace: "nowrap" }}
              >
                Full Search
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* ── Content ───────────────────────────────────────── */}
      <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 3 }, py: 5 }}>

        {/* Breadcrumb */}
        <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14, color: "#4B5563" }} />} sx={{ mb: 4 }}>
          <Typography
            onClick={clearFrom}
            sx={{ color: !fromCity ? "#FFFFFF" : "#F97316", fontWeight: fromCity ? 600 : 500, cursor: fromCity ? "pointer" : "default", fontSize: "0.875rem", "&:hover": fromCity ? { textDecoration: "underline" } : {} }}
          >
            Explore
          </Typography>
          {fromCity && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Typography sx={{ color: "#F97316", fontWeight: 600, fontSize: "0.875rem" }}>{fromCity}</Typography>
              <Box component="button" onClick={clearFrom} sx={{ border: "none", background: "none", cursor: "pointer", color: "#4B5563", "&:hover": { color: "#EF4444" }, display: "flex", p: 0 }}>
                <CloseIcon sx={{ fontSize: 14 }} />
              </Box>
            </Box>
          )}
          {toCity && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Typography sx={{ color: "#F97316", fontWeight: 600, fontSize: "0.875rem" }}>{toCity}</Typography>
              <Box component="button" onClick={clearTo} sx={{ border: "none", background: "none", cursor: "pointer", color: "#4B5563", "&:hover": { color: "#EF4444" }, display: "flex", p: 0 }}>
                <CloseIcon sx={{ fontSize: 14 }} />
              </Box>
            </Box>
          )}
        </Breadcrumbs>

        <AnimatePresence mode="wait">

          {/* ══ State A: City Select ════════════════════════ */}
          {pageState === "CITY_SELECT" && (
            <motion.div key="city-select" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
              <Typography variant="h5" sx={{ color: "#FFFFFF", fontWeight: 700, mb: 1 }}>Where are you flying from?</Typography>
              <Typography sx={{ color: "#6B7280", fontSize: "0.9375rem", mb: 4 }}>Pick a city to see all available routes</Typography>

              {citiesLoading ? (
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2,1fr)", sm: "repeat(3,1fr)", md: "repeat(4,1fr)", lg: "repeat(5,1fr)" }, gap: 2 }}>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} animation="wave" variant="rounded" height={160} sx={{ borderRadius: "16px" }} />
                  ))}
                </Box>
              ) : (
                <motion.div variants={gridContainer} initial="hidden" animate="visible" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "16px" }}>
                  {exploreCities.map((loc: Location) => (
                    <motion.div key={loc.id} variants={gridItem}>
                      <Box
                        onClick={() => setFromCity(loc.city)}
                        sx={{
                          position: "relative",
                          height: 160,
                          borderRadius: "16px",
                          cursor: "pointer",
                          background: getCityGradient(loc.city),
                          border: "1px solid rgba(255,255,255,0.06)",
                          overflow: "hidden",
                          transition: "all 0.25s ease",
                          "&:hover": { border: "1px solid rgba(249,115,22,0.5)", boxShadow: "0 8px 28px rgba(249,115,22,0.15)", transform: "translateY(-3px) scale(1.01)" },
                          "&:hover .city-overlay": { opacity: 1 },
                        }}
                      >
                        {/* Airport code watermark */}
                        <Typography sx={{ position: "absolute", bottom: -8, right: 8, fontSize: "4rem", fontWeight: 900, fontFamily: '"JetBrains Mono",monospace', color: "rgba(255,255,255,0.07)", lineHeight: 1, userSelect: "none", letterSpacing: "-0.04em" }}>
                          {loc.airportCode}
                        </Typography>
                        {/* Hover overlay */}
                        <Box className="city-overlay" sx={{ position: "absolute", inset: 0, background: "rgba(249,115,22,0.06)", opacity: 0, transition: "opacity 0.25s ease" }} />
                        {/* Routes badge */}
                        <Box sx={{ position: "absolute", top: 10, right: 10 }}>
                          <Chip label={`${loc.activeFlights ?? 0} routes`} size="small" sx={{ background: "rgba(0,0,0,0.5)", color: "#D1D5DB", fontSize: "0.6875rem", fontWeight: 600, height: 20, "& .MuiChip-label": { px: 1 } }} />
                        </Box>
                        {/* City info */}
                        <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, p: 1.75, background: "linear-gradient(to top,rgba(0,0,0,0.75) 0%,transparent 100%)" }}>
                          <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.9375rem", lineHeight: 1.2 }}>{loc.city}</Typography>
                          <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.6875rem" }}>{loc.state}</Typography>
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ══ State B: Route Select ════════════════════════ */}
          {pageState === "ROUTE_SELECT" && (
            <motion.div key="route-select" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
              <Typography variant="h5" sx={{ color: "#FFFFFF", fontWeight: 700, mb: 1 }}>
                Flights from{" "}
                <Box component="span" sx={{ background: "linear-gradient(90deg,#F97316,#F59E0B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{fromCity}</Box>{" "}
                to…
              </Typography>
              <Typography sx={{ color: "#6B7280", fontSize: "0.9375rem", mb: 4 }}>Choose a destination to see available flights</Typography>

              {routesLoading ? (
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", lg: "repeat(3,1fr)" }, gap: 2 }}>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <Skeleton key={i} animation="wave" variant="rounded" height={160} sx={{ borderRadius: "16px" }} />
                  ))}
                </Box>
              ) : (
                <motion.div variants={gridContainer} initial="hidden" animate="visible" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "16px" }}>
                  {routeQueries.map((q, idx) => {
                    const route = q.data as RouteSummary | null | undefined;
                    if (!route) return null;
                    return (
                      <motion.div key={`${route.destination}-${idx}`} variants={gridItem}>
                        <Box
                          onClick={() => setToCity(route.destination)}
                          sx={{ background: "#111111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", p: 2.5, cursor: "pointer", transition: "all 0.25s ease", "&:hover": { border: "1px solid rgba(249,115,22,0.35)", boxShadow: "0 8px 28px rgba(249,115,22,0.1)", transform: "translateY(-2px)" } }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                            <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "1.0625rem" }}>{fromCity}</Typography>
                            <FlightTakeoffIcon sx={{ color: "#F97316", fontSize: 16, mx: 0.25 }} />
                            <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "1.0625rem" }}>{route.destination}</Typography>
                            <Box sx={{ ml: "auto" }}><StarIcon sx={{ fontSize: 14, color: "rgba(249,115,22,0.4)" }} /></Box>
                          </Box>
                          <Typography sx={{ color: "#6B7280", fontSize: "0.8125rem", mb: 1.5 }}>{route.airline}</Typography>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Box>
                              <Typography sx={{ color: "#4B5563", fontSize: "0.6875rem" }}>from</Typography>
                              <Typography sx={{ color: "#F97316", fontWeight: 800, fontSize: "1.25rem", lineHeight: 1 }}>
                                ₹{route.cheapestPrice.toLocaleString("en-IN")}
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5 }}>
                              <Chip label={`${route.flightCount} flights`} size="small" sx={{ background: "rgba(249,115,22,0.1)", color: "#F97316", border: "1px solid rgba(249,115,22,0.2)", fontSize: "0.6875rem", fontWeight: 600, height: 20, "& .MuiChip-label": { px: 1 } }} />
                              <Button
                                size="small"
                                onClick={(e) => { e.stopPropagation(); navigate(`/search?source=${encodeURIComponent(fromCity)}&destination=${encodeURIComponent(route.destination)}`); }}
                                sx={{ color: "#F97316", fontSize: "0.75rem", fontWeight: 600, p: 0, minWidth: 0, "&:hover": { background: "none", textDecoration: "underline" } }}
                              >
                                View all →
                              </Button>
                            </Box>
                          </Box>
                        </Box>
                      </motion.div>
                    );
                  })}
                  {routeQueries.every((q) => !q.isLoading && !q.data) && (
                    <Box sx={{ gridColumn: "1/-1", textAlign: "center", py: 8 }}>
                      <Typography sx={{ color: "#4B5563", fontSize: "1rem" }}>No flights found from {fromCity}.</Typography>
                    </Box>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ══ State C: Flight List ═════════════════════════ */}
          {pageState === "FLIGHT_LIST" && (
            <motion.div key="flight-list" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
              {/* Route header */}
              <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 3 }}>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                    <Typography variant="h5" sx={{ color: "#FFFFFF", fontWeight: 800 }}>{fromCity}</Typography>
                    <FlightTakeoffIcon sx={{ color: "#F97316", fontSize: 22 }} />
                    <Typography variant="h5" sx={{ color: "#FFFFFF", fontWeight: 800 }}>{toCity}</Typography>
                  </Box>
                  <Typography sx={{ color: "#6B7280", fontSize: "0.875rem" }}>
                    {sortedFlights.length} flights found{dateFilter ? ` on ${dateFilter}` : ""}
                  </Typography>
                </Box>
                <Button
                  onClick={clearTo}
                  variant="outlined"
                  size="small"
                  sx={{ borderRadius: "8px", borderColor: "rgba(255,255,255,0.1)", color: "#9CA3AF", "&:hover": { borderColor: "rgba(249,115,22,0.3)", color: "#F97316", background: "rgba(249,115,22,0.04)" } }}
                >
                  ← Change Destination
                </Button>
              </Box>

              {/* Sort toggle buttons */}
              <ToggleButtonGroup
                value={sortBy}
                exclusive
                onChange={(_, v) => v && setSortBy(v as SortKey)}
                sx={{ mb: 3, "& .MuiToggleButton-root": { border: "1px solid rgba(255,255,255,0.08)", color: "#9CA3AF", borderRadius: "100px !important", px: 2.5, py: 0.75, fontSize: "0.8125rem", fontWeight: 600, mx: 0.5, textTransform: "none", transition: "all 0.2s ease", "&.Mui-selected": { background: "rgba(249,115,22,0.15)", color: "#F97316", borderColor: "rgba(249,115,22,0.4)" }, "&:hover": { background: "rgba(255,255,255,0.04)" } } }}
              >
                <ToggleButton value="cheapest">Cheapest</ToggleButton>
                <ToggleButton value="earliest">Earliest</ToggleButton>
                <ToggleButton value="fastest">Fastest</ToggleButton>
              </ToggleButtonGroup>

              {/* Flights */}
              {flightsLoading ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 860 }}>
                  <SkeletonCard count={4} variant="flight" />
                </Box>
              ) : sortedFlights.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 10 }}>
                  <Typography sx={{ color: "#4B5563", fontSize: "1rem" }}>
                    No flights found for this route{dateFilter ? ` on ${dateFilter}` : ""}.
                  </Typography>
                </Box>
              ) : (
                <motion.div variants={gridContainer} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: 860 }}>
                  {visibleFlights.map((flight) => (
                    <motion.div key={flight.id} variants={gridItem}>
                      <FlightCard flight={flight} />
                    </motion.div>
                  ))}
                  {visibleCount < sortedFlights.length && (
                    <Button
                      onClick={() => setVisibleCount((c) => c + 10)}
                      variant="outlined"
                      sx={{ alignSelf: "center", mt: 1, borderRadius: "10px", borderColor: "rgba(255,255,255,0.1)", color: "#9CA3AF", px: 4, "&:hover": { borderColor: "rgba(249,115,22,0.3)", color: "#F97316", background: "rgba(249,115,22,0.04)" } }}
                    >
                      Load More ({sortedFlights.length - visibleCount} remaining)
                    </Button>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </Box>
    </Box>
  );
}
