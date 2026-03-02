// src/App.tsx
// Root component — defines all routes with lazy-loaded pages

import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
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
const MyBookings = lazy(() => import("./pages/MyBookings"));
const BookingDetail = lazy(() => import("./pages/BookingDetail"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AddFlight = lazy(() => import("./pages/admin/AddFlight"));
const EditFlight = lazy(() => import("./pages/admin/EditFlight"));

/**
 * App sets up routing, auth context, toast notifications,
 * and wraps all pages in a Suspense boundary with a loading spinner.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "12px",
              padding: "14px 20px",
              fontSize: "14px",
              background: "#fff",
              color: "#1f2937",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            },
            success: {
              iconTheme: { primary: "#10b981", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#fff" },
            },
          }}
        />
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
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
                  <Route path="/my-bookings" element={<MyBookings />} />
                  <Route path="/bookings/:id" element={<BookingDetail />} />
                </Route>

                {/* Admin-only routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/flights/add" element={<AddFlight />} />
                  <Route path="/admin/flights/:id/edit" element={<EditFlight />} />
                </Route>
              </Routes>
            </Suspense>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
