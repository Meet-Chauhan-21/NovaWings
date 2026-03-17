// src/App.tsx
// Root component — defines all routes with lazy-loaded pages
// v2: AnimatePresence page transitions, ScrollToTop, conditional Navbar/Footer

import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { useTheme } from "@mui/material/styles";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import LoadingSpinner from "./components/LoadingSpinner";

/* Lazy-loaded page components for code splitting */
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ExplorePage = lazy(() => import("./pages/ExplorePage"));
const FlightDetail = lazy(() => import("./pages/FlightDetail"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const BookFlight = lazy(() => import("./pages/BookFlight"));
const SeatSelection = lazy(() => import("./pages/SeatSelection"));
const FoodSelection = lazy(() => import("./pages/FoodSelection"));
const PaymentPreview = lazy(() => import("./pages/PaymentPreview"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const BookingDetail = lazy(() => import("./pages/BookingDetail"));
const BookingConfirmation = lazy(() => import("./pages/BookingConfirmation"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AddFlight = lazy(() => import("./pages/admin/AddFlight"));
const EditFlight = lazy(() => import("./pages/admin/EditFlight"));

/**
 * AppContent uses useLocation (must be inside BrowserRouter) to:
 *  - Drive AnimatePresence page transitions keyed by pathname
 *  - Hide Navbar / Footer on /admin routes
 */
function AppContent() {
  const location = useLocation();
  const theme = useTheme();
  return (
    <div className="min-h-screen flex flex-col" style={{ background: theme.palette.background.default }}>
      <Navbar />
      <ScrollToTop />

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          className="flex-1"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <Suspense fallback={<LoadingSpinner />}>
            <Routes location={location}>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/flights/:id" element={<FlightDetail />} />
              <Route path="/search" element={<SearchResults />} />

              {/* Protected routes (any logged-in user) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/book/:flightId" element={<BookFlight />} />
                <Route path="/select-seats/:flightId" element={<SeatSelection />} />
                <Route path="/select-food/:flightId" element={<FoodSelection />} />
                <Route path="/payment-preview" element={<PaymentPreview />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/bookings/:id" element={<BookingDetail />} />
                <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmation />} />
              </Route>

              {/* Admin-only routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/flights/add" element={<AddFlight />} />
                <Route path="/admin/flights/:id/edit" element={<EditFlight />} />
              </Route>
            </Routes>
          </Suspense>
        </motion.main>
      </AnimatePresence>

      <Footer />
    </div>
  );
}

/**
 * App sets up routing, auth context, and toast notifications,
 * then renders AppContent inside the router context.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemedToaster />
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

function ThemedToaster() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: "12px",
          padding: "14px 20px",
          fontSize: "14px",
          background: theme.palette.background.paper,
          color: theme.palette.text.primary,
          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          boxShadow: isDark ? "0 8px 30px rgba(0,0,0,0.4)" : "0 8px 30px rgba(0,0,0,0.1)",
        },
        success: {
          iconTheme: { primary: "#10b981", secondary: "#fff" },
        },
        error: {
          iconTheme: { primary: "#ef4444", secondary: "#fff" },
        },
      }}
    />
  );
}
