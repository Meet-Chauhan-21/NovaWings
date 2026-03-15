// src/pages/admin/AdminDashboard.tsx
// Admin dashboard — thin shell that owns shared queries and renders sidebar + tab components.

import { useState } from "react";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllFlights } from "../../services/flightService";
import { getAllBookings } from "../../services/bookingService";
import { getAllUsers } from "../../services/userService";
import paymentService from "../../services/paymentService";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuthContext } from "../../context/AuthContext";
import type { Flight, BookingResponse, UserResponse, PaymentRecord } from "../../types";

import OverviewTab from "./tabs/OverviewTab";
import FlightsTab from "./tabs/FlightsTab";
import BookingsTab from "./tabs/BookingsTab";
import UsersTab from "./tabs/UsersTab";
import LocationsTab from "./tabs/LocationsTab";
import FoodTab from "./tabs/FoodTab";
import AnalyticsTab from "./tabs/AnalyticsTab";
import PaymentsTab from "./tabs/PaymentsTab";
import HomepageTab from "./tabs/HomepageTab";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import DashboardIcon from "@mui/icons-material/Dashboard";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import PeopleIcon from "@mui/icons-material/People";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import PaymentIcon from "@mui/icons-material/Payment";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import LogoutIcon from "@mui/icons-material/Logout";

type TabType = "overview" | "flights" | "bookings" | "users" | "locations" | "food" | "analytics" | "payments" | "homepage";

const TAB_ICONS: Record<TabType, React.ReactNode> = {
  overview: <DashboardIcon sx={{ fontSize: 20 }} />,
  flights: <FlightTakeoffIcon sx={{ fontSize: 20 }} />,
  bookings: <BookOnlineIcon sx={{ fontSize: 20 }} />,
  users: <PeopleIcon sx={{ fontSize: 20 }} />,
  locations: <LocationOnIcon sx={{ fontSize: 20 }} />,
  food: <RestaurantMenuIcon sx={{ fontSize: 20 }} />,
  analytics: <AnalyticsIcon sx={{ fontSize: 20 }} />,
  payments: <PaymentIcon sx={{ fontSize: 20 }} />,
  homepage: <HomeRepairServiceIcon sx={{ fontSize: 20 }} />,
};

interface Tab {
  id: TabType;
  label: string;
}

const tabs: Tab[] = [
  { id: "overview", label: "Overview" },
  { id: "flights", label: "Flights" },
  { id: "bookings", label: "All Bookings" },
  { id: "users", label: "Users" },
  { id: "locations", label: "Locations" },
  { id: "food", label: "Food Menu" },
  { id: "analytics", label: "Analytics" },
  { id: "payments", label: "Payments" },
  { id: "homepage", label: "Homepage" },
];

/**
 * Admin Dashboard — thin shell. Owns shared data queries and renders
 * the sidebar + delegates each tab to its own component.
 */
export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { user, logout } = useAuthContext();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // flightsEnabled stays here because it controls the flightsQuery.enabled flag
  const [flightsEnabled, setFlightsEnabled] = useState(false);

  // ── Shared queries ──
  const [flightsQuery, bookingsQuery] = useQueries({
    queries: [
      {
        queryKey: ["flights"],
        queryFn: getAllFlights,
        staleTime: 5 * 60 * 1000,
        enabled: flightsEnabled,
      },
      { queryKey: ["allBookings"], queryFn: getAllBookings, staleTime: 5 * 60 * 1000 },
    ],
  });

  const usersQuery = useQuery({
    queryKey: ["allUsers"],
    queryFn: getAllUsers,
    staleTime: 5 * 60 * 1000,
  });

  const paymentsQuery = useQuery({
    queryKey: ["adminPayments"],
    queryFn: paymentService.getAllPayments,
    staleTime: 2 * 60 * 1000,
  });

  const revenueQuery = useQuery({
    queryKey: ["adminRevenue"],
    queryFn: paymentService.getTotalRevenue,
    staleTime: 2 * 60 * 1000,
  });

  // ── Derived values ──
  const flights: Flight[] = flightsQuery.data ?? [];
  const bookings: BookingResponse[] = bookingsQuery.data ?? [];
  const users: UserResponse[] = usersQuery.data ?? [];
  const allPayments: PaymentRecord[] = paymentsQuery.data ?? [];
  const totalRevenueFromPayments: number = revenueQuery.data ?? 0;

  const isLoading = bookingsQuery.isLoading;

  /** Invalidate booking list after a status change in any tab */
  function handleBookingStatusSaved() {
    queryClient.invalidateQueries({ queryKey: ["allBookings"] });
  }

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#0A0A0A" }}>
      {/* ─── LEFT SIDEBAR ─── */}
      <Box
        component="aside"
        sx={{
          width: 240,
          background: "#0A0A0A",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          position: "fixed",
          top: "70px",
          height: "calc(100vh - 70px)",
          display: "flex",
          flexDirection: "column",
          zIndex: 40,
        }}
      >
        <Box
          component="nav"
          sx={{
            flex: 1,
            p: 2,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              startIcon={TAB_ICONS[tab.id]}
              sx={{
                justifyContent: "flex-start",
                px: 2,
                py: 1.2,
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: "0.85rem",
                color: activeTab === tab.id ? "#F97316" : "#6B7280",
                background: activeTab === tab.id ? "rgba(249,115,22,0.08)" : "transparent",
                borderLeft: activeTab === tab.id ? "3px solid #F97316" : "3px solid transparent",
                "&:hover": {
                  background: activeTab === tab.id ? "rgba(249,115,22,0.12)" : "rgba(255,255,255,0.04)",
                  color: activeTab === tab.id ? "#F97316" : "#9CA3AF",
                },
              }}
            >
              {tab.label}
            </Button>
          ))}
        </Box>
        <Box sx={{ p: 2.5, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <Typography sx={{ color: "#FFFFFF", fontWeight: 600, fontSize: "0.85rem" }}>{user?.name}</Typography>
          <Typography sx={{ color: "#4B5563", fontSize: "0.7rem", mb: 1.5 }}>Administrator</Typography>
          <Button
            onClick={logout}
            fullWidth
            startIcon={<LogoutIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderRadius: "10px",
              py: 1,
              fontSize: "0.8rem",
              fontWeight: 600,
              textTransform: "none",
              color: "#EF4444",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.15)",
              "&:hover": { background: "rgba(239,68,68,0.15)" },
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* ─── MAIN CONTENT ─── */}
      <Box component="main" sx={{ flex: 1, ml: "240px", mt: "70px", px: { xs: 3, md: 4 }, pb: { xs: 3, md: 4 }, minHeight: "calc(100vh - 70px)" }}>
          {activeTab === "overview" && (
            <OverviewTab
              flights={flights}
              bookings={bookings}
              users={users}
              totalRevenueFromPayments={totalRevenueFromPayments}
            />
          )}

          {activeTab === "flights" && (
            <FlightsTab
              flightsEnabled={flightsEnabled}
              setFlightsEnabled={setFlightsEnabled}
              flightsQuery={flightsQuery}
              flights={flights}
            />
          )}

          {activeTab === "bookings" && (
            <BookingsTab
              bookings={bookings}
              users={users}
              handleBookingStatusSaved={handleBookingStatusSaved}
            />
          )}

          {activeTab === "users" && (
            <UsersTab
              users={users}
              bookings={bookings}
              usersQuery={usersQuery}
              handleBookingStatusSaved={handleBookingStatusSaved}
            />
          )}

          {activeTab === "locations" && <LocationsTab />}

          {activeTab === "food" && <FoodTab />}

          {activeTab === "analytics" && (
            <AnalyticsTab
              flights={flights}
              bookings={bookings}
              users={users}
              allPayments={allPayments}
              totalRevenueFromPayments={totalRevenueFromPayments}
            />
          )}

          {activeTab === "payments" && (
            <PaymentsTab
              allPayments={allPayments}
              paymentsQuery={paymentsQuery}
              totalRevenueFromPayments={totalRevenueFromPayments}
            />
          )}

          {activeTab === "homepage" && <HomepageTab />}
      </Box>
    </Box>
  );
}
