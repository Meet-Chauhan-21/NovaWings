// src/pages/Home.tsx
// Fully dynamic landing page — all data fetched from backend

import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useQuery, useQueries } from "@tanstack/react-query";
import { motion } from "framer-motion";
import homeService from "../services/homeService";
import { searchFlights } from "../services/flightService";
import destinationService from "../services/destinationService";
import CityCombobox from "../components/CityCombobox";
import DateInput from "../components/ui/DateInput";
import NumberInput from "../components/ui/NumberInput";
import type { Flight, RouteConfig } from "../types";

// MUI
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Skeleton from "@mui/material/Skeleton";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";

// MUI Icons
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import SearchIcon from "@mui/icons-material/Search";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import AirlineSeatReclineNormalIcon from "@mui/icons-material/AirlineSeatReclineNormal";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HeadsetMicOutlinedIcon from "@mui/icons-material/HeadsetMicOutlined";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import FlightIcon from "@mui/icons-material/Flight";
import VerifiedIcon from "@mui/icons-material/Verified";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";

// ── Date helpers ───────────────────────────
const getTomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

// ── Animation variants ─────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay: number) => ({
    opacity: 1,
    transition: { delay, duration: 0.6 },
  }),
};

const fadeRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

// ── Airline color helper ────────────────────
function getAirlineColor(name: string): string {
  const colors = ["#EF4444", "#3B82F6", "#10B981", "#8B5CF6", "#F97316", "#EC4899", "#14B8A6", "#6366F1", "#F59E0B", "#06B6D4"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ── Testimonial data ───────────────────────
const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    route: "Mumbai → Delhi",
    stars: 5,
    text: "Booked a last-minute flight and the whole process was incredibly smooth. Best prices I found anywhere!",
    initial: "P",
  },
  {
    name: "Rahul Mehta",
    route: "Bangalore → Kolkata",
    stars: 5,
    text: "NovaWings made my family trip so easy. The seat selection and meal booking features are fantastic.",
    initial: "R",
  },
  {
    name: "Ananya Das",
    route: "Chennai → Jaipur",
    stars: 4,
    text: "Love the transparent pricing — no hidden fees. I've already recommended NovaWings to all my friends.",
    initial: "A",
  },
];

// ── Feature data ───────────────────────────
const FEATURES = [
  {
    icon: <BoltOutlinedIcon sx={{ fontSize: 28 }} />,
    title: "Instant Booking",
    description: "Book your flight in just a few clicks with our streamlined real-time booking engine.",
  },
  {
    icon: <LocalOfferOutlinedIcon sx={{ fontSize: 28 }} />,
    title: "Best Prices",
    description: "Competitive pricing with no hidden fees. We compare fares across all partner airlines.",
  },
  {
    icon: <ShieldOutlinedIcon sx={{ fontSize: 28 }} />,
    title: "Secure Payments",
    description: "Your transactions are protected with bank-grade encryption and secure payment gateways.",
  },
  {
    icon: <SupportAgentOutlinedIcon sx={{ fontSize: 28 }} />,
    title: "24/7 Support",
    description: "Our dedicated support team is available around the clock to assist you with anything.",
  },
];

// ── Steps data ─────────────────────────────
const STEPS = [
  { icon: <SearchIcon sx={{ fontSize: 28 }} />, label: "Search Flights", num: "01" },
  { icon: <AirlineSeatReclineNormalIcon sx={{ fontSize: 28 }} />, label: "Choose Seats", num: "02" },
  { icon: <RestaurantMenuOutlinedIcon sx={{ fontSize: 28 }} />, label: "Add Meals", num: "03" },
  { icon: <FlightTakeoffIcon sx={{ fontSize: 28 }} />, label: "Pay & Fly", num: "04" },
];

// ── Stats data ─────────────────────────────
const STATS = [
  { value: "90+", label: "Cities" },
  { value: "5", label: "Airlines" },
  { value: "10K+", label: "Bookings" },
];

// ── Trust badges ───────────────────────────
const TRUST_BADGES = [
  { icon: <LockOutlinedIcon sx={{ fontSize: 14 }} />, text: "SSL Secured" },
  { icon: <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />, text: "Instant Confirmation" },
  { icon: <HeadsetMicOutlinedIcon sx={{ fontSize: 14 }} />, text: "24/7 Support" },
];

export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchRef = useRef<HTMLDivElement>(null);

  const [source, setSource] = useState(searchParams.get("source") || "");
  const [destination, setDestination] = useState(searchParams.get("destination") || "");
  const [date, setDate] = useState(searchParams.get("date") || getTomorrow());
  const [passengers, setPassengers] = useState(
    parseInt(searchParams.get("passengers") || "1")
  );

  // Sync if URL changes (e.g. user uses back button to home)
  useEffect(() => {
    setSource(searchParams.get("source") || "");
    setDestination(searchParams.get("destination") || "");
    setDate(searchParams.get("date") || getTomorrow());
    setPassengers(parseInt(searchParams.get("passengers") || "1"));
  }, [searchParams]);

  // ── Fetch homepage config ──
  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ["homeConfig"],
    queryFn: homeService.getConfig,
    staleTime: 5 * 60 * 1000,
  });

  // ── Fetch destination cards ──
  const { data: allCards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ["destinationCards"],
    queryFn: destinationService.getAll,
    staleTime: 10 * 60 * 1000,
  });

  // ── Category filter state ──
  const [activeCategory, setActiveCategory] = useState("All");

  // ── Filter cards by category ──
  const filteredCards =
    activeCategory === "All"
      ? allCards
      : allCards.filter((c) => c.category === activeCategory);

  const featuredCards = filteredCards.filter((c) => c.featured);
  const regularCards = filteredCards.filter((c) => !c.featured);

  const categories = [
    "All",
    "Beach",
    "Hills",
    "Heritage",
    "Honeymoon",
    "Adventure",
    "Spiritual",
    "Weekend Getaway",
  ];

  // ── Fetch distinct airlines ──
  const { data: airlines = [], isLoading: airlinesLoading } = useQuery({
    queryKey: ["airlines"],
    queryFn: homeService.getAirlines,
    staleTime: 30 * 60 * 1000,
  });

  // ── Fetch cheapest flight for each active deal route ──
  const dealRoutes = config?.dealRoutes?.filter((r) => r.active) ?? [];

  const dealQueries = useQueries({
    queries: dealRoutes.map((route) => ({
      queryKey: ["deal", route.source, route.destination],
      queryFn: () => searchFlights(route.source, route.destination),
      staleTime: 10 * 60 * 1000,
      enabled: !!config,
      select: (data: Flight[]) => {
        if (!data || data.length === 0) return null;
        return [...data].sort((a, b) => a.price - b.price)[0];
      },
    })),
  });

  const today = new Date().toISOString().split("T")[0];

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!source.trim()) { toast.error("Please enter departure city"); return; }
      if (!destination.trim()) { toast.error("Please enter destination city"); return; }
      if (source.trim().toLowerCase() === destination.trim().toLowerCase()) {
        toast.error("From and To cannot be same city"); return;
      }
      if (!date) { toast.error("Please select a travel date"); return; }
      navigate(
        `/search?source=${encodeURIComponent(source.trim())}&destination=${encodeURIComponent(destination.trim())}&date=${encodeURIComponent(date)}&passengers=${passengers}`
      );
    },
    [source, destination, date, passengers, navigate]
  );

  const openDestinationSearch = useCallback(
    (destinationCity: string) => {
      navigate(
        `/search?destination=${encodeURIComponent(
          destinationCity
        )}&date=${today}&passengers=1`
      );
    },
    [navigate, today]
  );

  const swapCities = useCallback(() => {
    setSource((prev) => {
      const old = prev;
      setDestination(old);
      return destination;
    });
  }, [destination]);

  const scrollToSearch = () => {
    searchRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // ── Newsletter state ──
  const [email, setEmail] = useState("");
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Subscribed successfully!");
    setEmail("");
  };

  // ── Category tab index ──
  const categoryIndex = categories.indexOf(activeCategory);

  return (
    <Box sx={{ background: "#0A0A0A", minHeight: "100vh" }}>

      {/* ═══════════════════════════════════════
          SECTION 1 — HERO
          ═══════════════════════════════════════ */}
      <Box
        component="section"
        sx={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          pt: { xs: 8, md: 0 },
          pb: { xs: 16, md: 20 },
        }}
      >
        {/* Background effects */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "20%",
            right: "10%",
            width: { xs: 300, md: 600 },
            height: { xs: 300, md: 600 },
            background:
              "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(80px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "10%",
            left: "-5%",
            width: 400,
            height: 400,
            background:
              "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(100px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "5%",
            left: "30%",
            width: 250,
            height: 250,
            background:
              "radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(60px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Content */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1280,
            mx: "auto",
            px: { xs: 3, md: 4 },
            width: "100%",
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            alignItems: "center",
            gap: { xs: 6, lg: 8 },
          }}
        >
          {/* Left column */}
          <Box sx={{ flex: { lg: "0 0 55%" }, maxWidth: { lg: "55%" } }}>
            {/* Badge pill */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              <Chip
                icon={<FlightTakeoffIcon sx={{ fontSize: 14, color: "#F97316 !important" }} />}
                label="India's Premier Flight Experience"
                sx={{
                  background: "rgba(249,115,22,0.1)",
                  border: "1px solid rgba(249,115,22,0.25)",
                  color: "#F97316",
                  fontWeight: 500,
                  fontSize: "0.8rem",
                  mb: 3,
                  mt: 3,
                  height: 34,
                }}
              />
            </motion.div>

            {/* Headline */}
            {configLoading ? (
              <Box sx={{ mb: 3 }}>
                <Skeleton variant="text" width="80%" height={60} sx={{ bgcolor: "rgba(255,255,255,0.06)" }} />
                <Skeleton variant="text" width="60%" height={60} sx={{ bgcolor: "rgba(255,255,255,0.06)" }} />
              </Box>
            ) : (
              <Box sx={{ mb: 3 }}>
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
                  <Typography
                    sx={{
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      fontWeight: 800,
                      fontSize: "clamp(2.5rem, 5vw, 4rem)",
                      lineHeight: 1.1,
                      color: "#FFFFFF",
                      mb: 0.5,
                    }}
                  >
                    Fly Anywhere,
                  </Typography>
                </motion.div>
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
                  <Typography
                    sx={{
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      fontWeight: 800,
                      fontSize: "clamp(2.5rem, 5vw, 4rem)",
                      lineHeight: 1.1,
                      background: "linear-gradient(135deg, #F97316 0%, #F59E0B 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      mb: 0.5,
                    }}
                  >
                    Anytime.
                  </Typography>
                </motion.div>
                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
                  <Typography
                    sx={{
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      fontWeight: 800,
                      fontSize: "clamp(2.5rem, 5vw, 4rem)",
                      lineHeight: 1.1,
                      color: "#FFFFFF",
                    }}
                  >
                    Your Way.
                  </Typography>
                </motion.div>
              </Box>
            )}

            {/* Subtitle */}
            <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={0.3}>
              <Typography
                sx={{
                  color: "#9CA3AF",
                  fontSize: { xs: "1rem", md: "1.1rem" },
                  lineHeight: 1.7,
                  maxWidth: 500,
                  mb: 4,
                }}
              >
                Book flights across 90+ Indian destinations with NovaWings.
                Smart search, instant booking, unbeatable prices.
              </Typography>
            </motion.div>

            {/* Stats row */}
            <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={0.4}>
              <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 3, md: 4 }, mb: 4 }}>
                {STATS.map((stat, idx) => (
                  <Box key={stat.label} sx={{ display: "flex", alignItems: "center", gap: { xs: 3, md: 4 } }}>
                    {idx > 0 && (
                      <Box
                        sx={{
                          width: 1,
                          height: 36,
                          background: "rgba(255,255,255,0.1)",
                          mr: { xs: 0, md: 0 },
                        }}
                      />
                    )}
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: "1.5rem",
                          background: "linear-gradient(135deg, #F97316, #F59E0B)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                          lineHeight: 1.2,
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography sx={{ color: "#6B7280", fontSize: "0.75rem", fontWeight: 500 }}>
                        {stat.label}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </motion.div>

            {/* CTA buttons */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5}>
              <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={scrollToSearch}
                    startIcon={<SearchIcon />}
                  >
                    Search Flights
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/explore")}
                    startIcon={<ExploreOutlinedIcon />}
                  >
                    Explore Destinations
                  </Button>
                </motion.div>
              </Box>
            </motion.div>

            {/* Trust badges */}
            <motion.div variants={fadeIn} initial="hidden" animate="visible" custom={0.6}>
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                {TRUST_BADGES.map((badge) => (
                  <Box key={badge.text} sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                    <Box sx={{ color: "#4B5563" }}>{badge.icon}</Box>
                    <Typography sx={{ color: "#6B7280", fontSize: "0.7rem", fontWeight: 500 }}>
                      {badge.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </motion.div>
          </Box>

          {/* Right column — decorative hero graphic */}
          <motion.div
            variants={fadeRight}
            initial="hidden"
            animate="visible"
            style={{ flex: "0 0 45%", maxWidth: "45%", display: "flex", justifyContent: "center" }}
          >
            <Box
              sx={{
                display: { xs: "none", lg: "flex" },
                position: "relative",
                width: 420,
                height: 420,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Orbit rings */}
              {[180, 260, 340].map((size, i) => (
                <Box
                  key={i}
                  sx={{
                    position: "absolute",
                    width: size,
                    height: size,
                    border: `1px solid rgba(249,115,22,${0.12 - i * 0.03})`,
                    borderRadius: "50%",
                    animation: `spin ${20 + i * 10}s linear infinite${i % 2 === 1 ? " reverse" : ""}`,
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }}
                />
              ))}
              {/* Center plane */}
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(249,115,22,0.2), rgba(245,158,11,0.1))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(249,115,22,0.3)",
                  boxShadow: "0 0 60px rgba(249,115,22,0.15)",
                }}
              >
                <FlightTakeoffIcon sx={{ fontSize: 44, color: "#F97316" }} />
              </Box>
              {/* Floating HUD cards */}
              {[
                { top: "8%", right: "5%", text: "DEL → BOM", sub: "₹3,299" },
                { bottom: "15%", left: "0%", text: "BLR → GOI", sub: "₹2,499" },
                { top: "40%", right: "-10%", text: "Live Tracking", sub: "On Time" },
              ].map((card, i) => (
                <Box
                  key={i}
                  sx={{
                    position: "absolute",
                    ...card,
                    background: "rgba(17,17,17,0.9)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    px: 2,
                    py: 1.2,
                    backdropFilter: "blur(12px)",
                    animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                    "@keyframes float": {
                      "0%, 100%": { transform: "translateY(0px)" },
                      "50%": { transform: `translateY(${-8 - i * 2}px)` },
                    },
                  }}
                >
                  <Typography sx={{ color: "#fff", fontSize: "0.75rem", fontWeight: 600 }}>
                    {card.text}
                  </Typography>
                  <Typography sx={{ color: "#F97316", fontSize: "0.65rem", fontWeight: 500 }}>
                    {card.sub}
                  </Typography>
                </Box>
              ))}
            </Box>
          </motion.div>
        </Box>
      </Box>

      {/* ═══════════════════════════════════════
          SECTION 2 — SEARCH CARD
          ═══════════════════════════════════════ */}
      <Box
        ref={searchRef}
        sx={{
          maxWidth: 1180,
          mx: "auto",
          px: { xs: 2, md: 4 },
          mt: { xs: -10, md: -14 },
          position: "relative",
          zIndex: 10,
          mb: 10,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            background: "#111111",
            border: "1px solid rgba(249,115,22,0.2)",
            borderRadius: "24px",
            p: { xs: 3, md: 5 },
            boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(249,115,22,0.1)",
          }}
        >
          {/* Trip type tabs */}
          <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
            <Chip
              label="One Way"
              sx={{
                background: "rgba(249,115,22,0.15)",
                color: "#F97316",
                border: "1px solid rgba(249,115,22,0.3)",
                fontWeight: 600,
              }}
            />
            <Tooltip title="Coming Soon" arrow>
              <Chip
                label="Round Trip"
                variant="outlined"
                sx={{ borderColor: "rgba(255,255,255,0.1)", color: "#6B7280" }}
              />
            </Tooltip>
            <Tooltip title="Coming Soon" arrow>
              <Chip
                label="Multi-City"
                variant="outlined"
                sx={{ borderColor: "rgba(255,255,255,0.1)", color: "#6B7280" }}
              />
            </Tooltip>
          </Box>

          {/* Search form */}
          <form onSubmit={handleSearch}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr auto 1fr 1.2fr 1.1fr" },
                gap: { xs: 2, md: 2.5 },
                alignItems: "flex-start",
                mb: 2,
              }}
            >
              {/* From */}
              <Box>
                <Typography sx={{ color: "#6B7280", fontSize: "0.7rem", fontWeight: 600, mb: 0.8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  From
                </Typography>
                <CityCombobox
                  value={source}
                  onChange={setSource}
                  placeholder="Enter city or airport"
                  excludeCity={destination}
                />
              </Box>

              {/* Swap */}
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", alignSelf: "stretch" }}>
                <Box
                  onClick={swapCities}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: "1px solid rgba(249,115,22,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background: "rgba(249,115,22,0.1)",
                      borderColor: "#F97316",
                      transform: "rotate(180deg)",
                    },
                  }}
                >
                  <SwapHorizIcon sx={{ color: "#F97316", fontSize: 20 }} />
                </Box>
              </Box>

              {/* To */}
              <Box>
                <Typography sx={{ color: "#6B7280", fontSize: "0.7rem", fontWeight: 600, mb: 0.8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  To
                </Typography>
                <CityCombobox
                  value={destination}
                  onChange={setDestination}
                  placeholder="Enter city or airport"
                  excludeCity={source}
                />
              </Box>

              {/* Date */}
              <Box>
                <Typography sx={{ color: "#6B7280", fontSize: "0.7rem", fontWeight: 600, mb: 0.8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Date
                </Typography>
                <DateInput value={date} onChange={setDate} min={today} showQuickButtons />
              </Box>

              {/* Passengers */}
              <Box>
                <Typography sx={{ color: "#6B7280", fontSize: "0.7rem", fontWeight: 600, mb: 0.8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Passengers
                </Typography>
                <NumberInput value={passengers} onChange={setPassengers} min={1} max={9} />
              </Box>
            </Box>

            {/* Search button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={!source.trim() || !destination.trim()}
              startIcon={<SearchIcon />}
              sx={{
                mt: 1,
                py: 1.6,
                fontSize: "1rem",
                fontWeight: 700,
                borderRadius: "14px",
              }}
            >
              Search Flights
            </Button>
          </form>
        </Paper>
      </Box>

      {/* ═══════════════════════════════════════
          SECTION 3 — AIRLINE PARTNERS
          ═══════════════════════════════════════ */}
      {(airlinesLoading || airlines.length > 0) && (
        <Box component="section" sx={{ py: 10, overflow: "hidden", position: "relative" }}>
          {/* Subtle radial background */}
          <Box sx={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(249,115,22,0.04), transparent)",
            pointerEvents: "none",
          }} />

          {/* Section Header */}
          <Box sx={{ textAlign: "center", mb: 8, position: "relative" }}>
            <Box sx={{
              display: "inline-flex", alignItems: "center", gap: 0.8, mb: 2,
              background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)",
              borderRadius: "20px", px: 2, py: 0.7,
            }}>
              <VerifiedIcon sx={{ fontSize: 13, color: "#F97316" }} />
              <Typography sx={{ color: "#F97316", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Trusted Partners
              </Typography>
            </Box>
            <Typography variant="h4" sx={{
              fontWeight: 800, mb: 1.5,
              background: "linear-gradient(135deg, #FFFFFF 0%, #9CA3AF 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Our Airline Partners
            </Typography>
            <Typography sx={{ color: "#6B7280", fontSize: "1rem" }}>
              Search and book from{" "}
              <Box component="span" sx={{ color: "#F97316", fontWeight: 600 }}>
                {airlines.length > 0 ? `${airlines.length}+` : "India's top"} verified airlines
              </Box>
            </Typography>
          </Box>

          {/* Ticker */}
          {airlinesLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", gap: 3, px: 4 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" width={210} height={82}
                  sx={{ bgcolor: "rgba(255,255,255,0.06)", borderRadius: "16px" }} />
              ))}
            </Box>
          ) : (
            <Box sx={{ position: "relative" }}>
              {/* Left fade */}
              <Box sx={{
                position: "absolute", left: 0, top: 0, bottom: 0, width: 140, zIndex: 10,
                background: "linear-gradient(to right, #0A0A0A 20%, transparent)",
                pointerEvents: "none",
              }} />
              {/* Right fade */}
              <Box sx={{
                position: "absolute", right: 0, top: 0, bottom: 0, width: 140, zIndex: 10,
                background: "linear-gradient(to left, #0A0A0A 20%, transparent)",
                pointerEvents: "none",
              }} />
              <Box
                sx={{
                  display: "flex",
                  gap: 3,
                  animation: "marquee 32s linear infinite",
                  width: "max-content",
                  "&:hover": { animationPlayState: "paused" },
                  "@keyframes marquee": {
                    "0%": { transform: "translateX(0)" },
                    "100%": { transform: "translateX(-50%)" },
                  },
                }}
              >
                {[...airlines, ...airlines].map((airline, i) => {
                  const color = getAirlineColor(airline);
                  return (
                    <Box
                      key={`${airline}-${i}`}
                      onClick={() => navigate(`/search?source=Delhi&destination=Mumbai`)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.8,
                        background: `linear-gradient(135deg, ${color}0A 0%, rgba(255,255,255,0.02) 100%)`,
                        border: `1px solid ${color}28`,
                        borderRadius: "16px",
                        px: 2.5,
                        py: 2,
                        cursor: "pointer",
                        transition: "all 0.25s ease",
                        flexShrink: 0,
                        minWidth: 210,
                        "&:hover": {
                          borderColor: `${color}60`,
                          transform: "translateY(-5px)",
                          background: `linear-gradient(135deg, ${color}15 0%, rgba(255,255,255,0.04) 100%)`,
                          boxShadow: `0 16px 40px ${color}18`,
                        },
                      }}
                    >
                      {/* Airline logo / initials */}
                      <Box sx={{
                        width: 46, height: 46, borderRadius: "12px",
                        background: `${color}18`,
                        border: `1.5px solid ${color}40`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <Typography sx={{ color, fontWeight: 800, fontSize: "0.95rem", lineHeight: 1, letterSpacing: "-0.02em" }}>
                          {airline.substring(0, 2).toUpperCase()}
                        </Typography>
                      </Box>

                      {/* Airline details */}
                      <Box>
                        <Typography sx={{
                          color: "#E5E7EB", fontWeight: 700, fontSize: "0.9rem",
                          whiteSpace: "nowrap", lineHeight: 1.3, mb: 0.4,
                        }}>
                          {airline}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                          <VerifiedIcon sx={{ fontSize: 11, color: "#10B981" }} />
                          <Typography sx={{ color: "#6B7280", fontSize: "0.63rem", letterSpacing: "0.02em" }}>
                            Verified Partner
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Bottom CTA */}
          <Box sx={{ textAlign: "center", mt: 8, position: "relative" }}>
            <Typography sx={{ color: "#4B5563", fontSize: "0.85rem", mb: 2.5 }}>
              Expanding our network every month — more airlines coming soon.
            </Typography>
            <Button
              variant="outlined"
              endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
              onClick={() => navigate("/search")}
              sx={{
                borderColor: "rgba(249,115,22,0.3)",
                color: "#F97316",
                borderRadius: "12px",
                px: 3.5,
                py: 1,
                fontWeight: 600,
                "&:hover": { background: "rgba(249,115,22,0.06)", borderColor: "rgba(249,115,22,0.5)" },
              }}
            >
              Search All Flights
            </Button>
          </Box>
        </Box>
      )}

      {/* ═══════════════════════════════════════
          SECTION 4 — WHY NOVAWINGS
          ═══════════════════════════════════════ */}
      <SectionWrapper>
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography variant="h4" sx={{ color: "#FFFFFF", fontWeight: 700, mb: 1 }}>
            Why Choose NovaWings?
          </Typography>
          <Typography sx={{ color: "#6B7280" }}>
            Everything you need for seamless travel
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {FEATURES.map((feat, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={feat.title}>
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                custom={idx}
              >
                <Card
                  className="nova-card-hover"
                  sx={{
                    height: "100%",
                    borderTop: "3px solid transparent",
                    "&:hover": {
                      borderTopColor: "#F97316 !important",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3.5 }}>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: "50%",
                        background: "rgba(249,115,22,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2.5,
                        color: "#F97316",
                      }}
                    >
                      {feat.icon}
                    </Box>
                    <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "1.05rem", mb: 1 }}>
                      {feat.title}
                    </Typography>
                    <Typography sx={{ color: "#6B7280", fontSize: "0.85rem", lineHeight: 1.6 }}>
                      {feat.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </SectionWrapper>

      {/* ═══════════════════════════════════════
          SECTION 5 — HOW IT WORKS
          ═══════════════════════════════════════ */}
      <Box component="section" sx={{ background: "#060606", py: 10 }}>
        <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 3, md: 4 } }}>
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography variant="h4" sx={{ color: "#FFFFFF", fontWeight: 700, mb: 1 }}>
              How It Works
            </Typography>
            <Typography sx={{ color: "#6B7280" }}>
              Your journey in 4 simple steps
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "flex-start", md: "flex-start" },
              justifyContent: "center",
              gap: { xs: 4, md: 0 },
              position: "relative",
            }}
          >
            {/* Connecting line (desktop) */}
            <Box
              sx={{
                display: { xs: "none", md: "block" },
                position: "absolute",
                top: 32,
                left: "15%",
                right: "15%",
                height: 2,
                borderTop: "2px dashed rgba(249,115,22,0.3)",
                zIndex: 0,
              }}
            />

            {STEPS.map((step, idx) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={idx}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}
              >
                {/* Step number badge */}
                <Typography
                  sx={{
                    color: "#F97316",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    mb: 1.5,
                  }}
                >
                  {step.num}
                </Typography>
                {/* Icon circle */}
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "rgba(249,115,22,0.1)",
                    border: "1px solid rgba(249,115,22,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#F97316",
                    mb: 2,
                  }}
                >
                  {step.icon}
                </Box>
                <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.95rem", textAlign: "center" }}>
                  {step.label}
                </Typography>
              </motion.div>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ═══════════════════════════════════════
          SECTION 6 — DESTINATION CARDS
          ═══════════════════════════════════════ */}
      <SectionWrapper>
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="h4" sx={{ color: "#FFFFFF", fontWeight: 700, mb: 1 }}>
            Top Destinations
          </Typography>
          <Typography sx={{ color: "#6B7280", mb: 4 }}>
            Handpicked places for every kind of traveller
          </Typography>
        </Box>

        {/* Category Tabs */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 5 }}>
          <Tabs
            value={categoryIndex >= 0 ? categoryIndex : 0}
            onChange={(_, newVal) => setActiveCategory(categories[newVal])}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTabs-flexContainer": { gap: 0.5 },
            }}
          >
            {categories.map((cat) => (
              <Tab key={cat} label={cat} />
            ))}
          </Tabs>
        </Box>

        {/* Loading Skeletons */}
        {cardsLoading && (
          <Grid container spacing={3}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <Skeleton
                  variant="rounded"
                  height={280}
                  sx={{ bgcolor: "rgba(255,255,255,0.06)", borderRadius: "16px" }}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Featured + Regular Cards */}
        {!cardsLoading && (featuredCards.length > 0 || regularCards.length > 0) && (
          <Grid container spacing={3}>
            {[...featuredCards, ...regularCards].map((card) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={card.id}>
                <Card
                  onClick={() => openDestinationSearch(card.destination)}
                  sx={{
                    cursor: "pointer",
                    overflow: "hidden",
                    position: "relative",
                    height: 300,
                    border: "1px solid rgba(255,255,255,0.06)",
                    "&:hover": {
                      borderColor: "rgba(249,115,22,0.3)",
                      "& .dest-img": { transform: "scale(1.08)" },
                      "& .dest-arrow": { opacity: 1, transform: "translateX(0)" },
                    },
                  }}
                >
                  {/* Image */}
                  <Box
                    component="img"
                    className="dest-img"
                    src={card.imageUrl}
                    alt={card.title}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80";
                    }}
                    sx={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.5s ease",
                    }}
                  />

                  {/* Gradient overlay */}
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
                    }}
                  />

                  {/* Badge chip */}
                  {card.badge && (
                    <Chip
                      label={card.badge}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        background: "linear-gradient(135deg, #F97316, #EA580C)",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        zIndex: 2,
                      }}
                    />
                  )}

                  {/* Category chip */}
                  <Chip
                    label={card.category}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      background: "rgba(0,0,0,0.6)",
                      backdropFilter: "blur(8px)",
                      color: "#fff",
                      fontSize: "0.65rem",
                      zIndex: 2,
                    }}
                  />

                  {/* Content */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      p: 2.5,
                      zIndex: 2,
                    }}
                  >
                    <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.15rem", lineHeight: 1.2, mb: 0.3 }}>
                      {card.title}
                    </Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", mb: 1.5 }}>
                      {card.tagline}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: "rgba(249,115,22,0.4)",
                          color: "#F97316",
                          fontSize: "0.75rem",
                          px: 2,
                          py: 0.5,
                          borderRadius: "8px",
                          "&:hover": {
                            borderColor: "#F97316",
                            background: "rgba(249,115,22,0.1)",
                          },
                        }}
                      >
                        Book Now
                      </Button>
                      <ArrowForwardIcon
                        className="dest-arrow"
                        sx={{
                          color: "#F97316",
                          fontSize: 20,
                          opacity: 0,
                          transform: "translateX(-8px)",
                          transition: "all 0.25s ease",
                        }}
                      />
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Empty State */}
        {!cardsLoading && allCards.length === 0 && (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Typography sx={{ color: "#4B5563" }}>
              No destinations available. Admin can add destinations from the dashboard.
            </Typography>
          </Box>
        )}

        {/* No Results for Filter */}
        {!cardsLoading && allCards.length > 0 && filteredCards.length === 0 && (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Typography sx={{ color: "#4B5563" }}>
              No destinations found in "{activeCategory}" category.
            </Typography>
          </Box>
        )}
      </SectionWrapper>

      {/* ═══════════════════════════════════════
          SECTION — HOT DEALS (if routes exist)
          ═══════════════════════════════════════ */}
      {dealRoutes.length > 0 && (
        <Box component="section" sx={{ background: "#060606", py: 10 }}>
          <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 3, md: 4 } }}>
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Typography variant="h4" sx={{ color: "#FFFFFF", fontWeight: 700, mb: 1 }}>
                Hot Deals
              </Typography>
              <Typography sx={{ color: "#6B7280" }}>
                Cheapest flights on trending routes — prices from real-time data
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {dealQueries.map((query, index) => {
                if (query.isLoading)
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                      <Skeleton variant="rounded" height={200} sx={{ bgcolor: "rgba(255,255,255,0.06)", borderRadius: "16px" }} />
                    </Grid>
                  );
                if (!query.data) return null;
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                    <DealCard flight={query.data} route={dealRoutes[index]} />
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Box>
      )}

      {/* ═══════════════════════════════════════
          SECTION 7 — TESTIMONIALS
          ═══════════════════════════════════════ */}
      <SectionWrapper>
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography variant="h4" sx={{ color: "#FFFFFF", fontWeight: 700, mb: 1 }}>
            Trusted by Travelers
          </Typography>
          <Typography sx={{ color: "#6B7280" }}>
            What our passengers say
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {TESTIMONIALS.map((t, idx) => (
            <Grid size={{ xs: 12, md: 4 }} key={t.name}>
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={idx}
              >
                <Card sx={{ height: "100%", p: 0.5 }}>
                  <CardContent sx={{ p: 3 }}>
                    {/* Stars */}
                    <Box sx={{ display: "flex", gap: 0.3, mb: 2 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarRoundedIcon
                          key={i}
                          sx={{
                            fontSize: 20,
                            color: i < t.stars ? "#F97316" : "#4B5563",
                          }}
                        />
                      ))}
                    </Box>

                    {/* Quote */}
                    <Typography
                      sx={{
                        color: "#9CA3AF",
                        fontSize: "0.9rem",
                        fontStyle: "italic",
                        lineHeight: 1.7,
                        mb: 3,
                      }}
                    >
                      "{t.text}"
                    </Typography>

                    <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.06)" }} />

                    {/* Author */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          background: "linear-gradient(135deg, #F97316, #EA580C)",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                        }}
                      >
                        {t.initial}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.85rem", lineHeight: 1.2 }}>
                          {t.name}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <FlightIcon sx={{ fontSize: 12, color: "#6B7280" }} />
                          <Typography sx={{ color: "#6B7280", fontSize: "0.7rem" }}>
                            {t.route}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        icon={<VerifiedIcon sx={{ fontSize: 12, color: "#10B981 !important" }} />}
                        label="Verified"
                        size="small"
                        sx={{
                          background: "rgba(16,185,129,0.1)",
                          color: "#10B981",
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          height: 24,
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </SectionWrapper>

      {/* ═══════════════════════════════════════
          SECTION 8 — NEWSLETTER CTA BANNER
          ═══════════════════════════════════════ */}
      <Box
        component="section"
        sx={{
          position: "relative",
          py: 10,
          overflow: "hidden",
        }}
      >
        {/* Subtle gradient edges */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(249,115,22,0.04) 0%, transparent 40%, transparent 60%, rgba(245,158,11,0.04) 100%)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "relative",
            maxWidth: 700,
            mx: "auto",
            px: { xs: 3, md: 4 },
            textAlign: "center",
          }}
        >
          <Typography variant="h4" sx={{ color: "#FFFFFF", fontWeight: 700, mb: 1.5 }}>
            Get Exclusive Flight Deals
          </Typography>
          <Typography sx={{ color: "#6B7280", mb: 4 }}>
            Subscribe for early access to sales and special fares
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubscribe}
            sx={{
              display: "flex",
              gap: 1.5,
              maxWidth: 500,
              mx: "auto",
              mb: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <TextField
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size="small"
              fullWidth
              type="email"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{
                borderRadius: "12px",
                px: 4,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              Subscribe
            </Button>
          </Box>

          <Typography sx={{ color: "#4B5563", fontSize: "0.7rem" }}>
            No spam. Unsubscribe anytime.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// ── Section wrapper helper ─────────────────
function SectionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Box component="section" sx={{ py: 10 }}>
      <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 3, md: 4 } }}>
        {children}
      </Box>
    </Box>
  );
}

// ── Deal Card ──────────────────────────────
function DealCard({ flight, route }: { flight: Flight; route: RouteConfig }) {
  const navigate = useNavigate();
  const goToDetail = () => navigate(`/flights/${flight.id}`);

  return (
    <Card
      onClick={goToDetail}
      sx={{
        cursor: "pointer",
        overflow: "hidden",
        "&:hover": {
          borderColor: "rgba(249,115,22,0.3)",
          transform: "translateY(-3px)",
          boxShadow: "0 12px 40px rgba(249,115,22,0.1)",
        },
      }}
    >
      {/* Top banner */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #F97316, #EA580C)",
          px: 2.5,
          py: 1,
        }}
      >
        <Typography sx={{ color: "#fff", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {route.label || "Hot Deal"}
        </Typography>
      </Box>

      <CardContent>
        <Typography sx={{ color: "#6B7280", fontSize: "0.75rem", fontWeight: 500, mb: 0.5 }}>
          {flight.airlineName}
        </Typography>
        <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1rem", mb: 0.3 }}>
          {route.source} → {route.destination}
        </Typography>
        <Typography sx={{ color: "#4B5563", fontSize: "0.7rem", mb: 2 }}>
          Flight {flight.flightNumber}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <Box>
            <Typography sx={{ color: "#6B7280", fontSize: "0.65rem" }}>Starting from</Typography>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "1.25rem",
                background: "linear-gradient(135deg, #F97316, #F59E0B)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ₹{flight.price.toLocaleString("en-IN")}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => { e.stopPropagation(); goToDetail(); }}
            sx={{
              borderRadius: "8px",
              fontSize: "0.75rem",
              px: 2,
            }}
          >
            Book Now
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
