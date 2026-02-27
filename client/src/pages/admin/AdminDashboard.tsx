// src/pages/admin/AdminDashboard.tsx
// Admin dashboard with sidebar navigation and tab-based content

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getAllFlights, deleteFlight } from "../../services/flightService";
import { getAllBookings } from "../../services/bookingService";
import { getAllUsers } from "../../services/userService";
import LoadingSpinner from "../../components/LoadingSpinner";
import BookingStatusDropdown from "../../components/BookingStatusDropdown";
import { useAuthContext } from "../../context/AuthContext";
import type { UserResponse, BookingResponse } from "../../types";

type TabType = "overview" | "flights" | "bookings" | "users" | "analytics";

/** Sidebar tab definition */
interface Tab {
  id: TabType;
  icon: string;
  label: string;
}

const tabs: Tab[] = [
  { id: "overview", icon: "📊", label: "Overview" },
  { id: "flights", icon: "✈", label: "Flights" },
  { id: "bookings", icon: "📋", label: "All Bookings" },
  { id: "users", icon: "👥", label: "Users" },
  { id: "analytics", icon: "📈", label: "Analytics" },
];

/**
 * Admin Dashboard — comprehensive metrics, management, and analytics.
 */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthContext();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Bookings tab filters
  const [seatFilter, setSeatFilter] = useState<"all" | "confirmed" | "cancelled">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingUserSearch, setBookingUserSearch] = useState("");

  // Users tab state
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | "USER" | "ADMIN">("all");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // Parallel queries for flights & bookings
  const [flightsQuery, bookingsQuery] = useQueries({
    queries: [
      { queryKey: ["flights"], queryFn: getAllFlights, staleTime: 5 * 60 * 1000 },
      { queryKey: ["allBookings"], queryFn: getAllBookings, staleTime: 5 * 60 * 1000 },
    ],
  });

  // Users query
  const usersQuery = useQuery({
    queryKey: ["allUsers"],
    queryFn: getAllUsers,
    staleTime: 5 * 60 * 1000,
  });

  const flights = flightsQuery.data ?? [];
  const bookings = bookingsQuery.data ?? [];
  const users = usersQuery.data ?? [];
  const isLoading = flightsQuery.isLoading || bookingsQuery.isLoading;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFlight(id),
    onSuccess: () => {
      toast.success("Flight deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["flights"] });
    },
    onError: () => {
      toast.error("Failed to delete flight.");
    },
  });

  /** Called after BookingStatusDropdown saves successfully */
  function handleBookingStatusSaved() {
    queryClient.invalidateQueries({ queryKey: ["allBookings"] });
  }

  // Build a map of userId → user for fast lookup
  const userMap = useMemo(() => {
    const map = new Map<string, UserResponse>();
    users.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);

  // Build a map of userId → booking count
  const userBookingCountMap = useMemo(() => {
    const map = new Map<string, number>();
    bookings.forEach((b) => {
      map.set(b.userId, (map.get(b.userId) || 0) + 1);
    });
    return map;
  }, [bookings]);

  // ─── Stats ───
  const stats = useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === "CONFIRMED").length;
    const cancelled = bookings.filter((b) => b.status === "CANCELLED").length;
    const totalRevenue = bookings
      .filter((b) => b.status === "CONFIRMED")
      .reduce((sum, b) => sum + b.totalPrice, 0);
    const avgBookingValue = confirmed > 0 ? Math.round(totalRevenue / confirmed) : 0;

    return {
      totalFlights: flights.length,
      totalBookings: bookings.length,
      confirmed,
      cancelled,
      totalRevenue,
      avgBookingValue,
      totalUsers: users.length,
    };
  }, [flights, bookings, users]);

  // ─── Charts Data ───
  const bookingsPerFlightData = useMemo(() => {
    const flightMap = new Map<string, number>();
    bookings.forEach((b) => {
      flightMap.set(b.flightNumber, (flightMap.get(b.flightNumber) || 0) + 1);
    });
    return Array.from(flightMap.entries())
      .map(([flightNumber, count]) => ({ flightNumber, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [bookings]);

  const bookingStatusData = useMemo(() => {
    return [
      { name: "Confirmed", value: stats.confirmed, fill: "#10b981" },
      { name: "Cancelled", value: stats.cancelled, fill: "#ef4444" },
    ];
  }, [stats]);

  const revenueData = useMemo(() => {
    const dateMap = new Map<string, number>();
    bookings
      .filter((b) => b.status === "CONFIRMED")
      .forEach((b) => {
        const date = new Date(b.bookingDate).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        });
        dateMap.set(date, (dateMap.get(date) || 0) + b.totalPrice);
      });
    return Array.from(dateMap.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);
  }, [bookings]);

  const topFlightsData = useMemo(() => {
    const flightMap = new Map<string, number>();
    bookings.forEach((b) => {
      flightMap.set(b.flightNumber, (flightMap.get(b.flightNumber) || 0) + 1);
    });
    return Array.from(flightMap.entries())
      .map(([flight, count]) => ({ flight, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [bookings]);

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
    return result;
  }, [bookings, seatFilter, searchTerm, bookingUserSearch, userMap]);

  // ─── Filtered Users (Users tab) ───
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
    return result;
  }, [users, userRoleFilter, userSearch]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ─── LEFT SIDEBAR ─── */}
      <aside className="w-64 bg-gray-900 text-white fixed h-screen flex flex-col shadow-lg z-40">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold flex items-center gap-2">✈ SkyBook Admin</h1>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-left ${
                activeTab === tab.id
                  ? "bg-sky-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 space-y-3">
          <div className="text-sm text-gray-400">
            <p className="font-medium text-white">{user?.name}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <button
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition font-medium text-sm"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 ml-64 overflow-auto">
        <div className="p-8 space-y-8">
          {/* ─── TAB: OVERVIEW ─── */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard label="Total Flights" value={stats.totalFlights} color="bg-sky-500" icon="✈" />
                <StatCard
                  label="Total Bookings"
                  value={stats.totalBookings}
                  color="bg-indigo-500"
                  icon="📋"
                />
                <StatCard label="Confirmed" value={stats.confirmed} color="bg-green-500" icon="✓" />
                <StatCard label="Cancelled" value={stats.cancelled} color="bg-red-500" icon="✕" />
                <StatCard label="Total Users" value={stats.totalUsers} color="bg-purple-500" icon="👥" />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bookings Per Flight */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Bookings per Flight</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={bookingsPerFlightData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="flightNumber" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Booking Status */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Booking Status</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={bookingStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {bookingStatusData.map((entry) => (
                          <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Bookings Table */}
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800">Recent Bookings</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-gray-700">Flight</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Seats</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Total</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Status</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 5).map((booking) => {
                        const statusColor =
                          booking.status === "CONFIRMED"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700";
                        return (
                          <tr key={booking.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 font-mono text-xs">{booking.flightNumber}</td>
                            <td className="px-6 py-3">{booking.numberOfSeats}</td>
                            <td className="px-6 py-3 font-bold text-sky-600">
                              ₹{booking.totalPrice.toLocaleString("en-IN")}
                            </td>
                            <td className="px-6 py-3">
                              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-gray-600">
                              {new Date(booking.bookingDate).toLocaleDateString("en-IN")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB: FLIGHTS ─── */}
          {activeTab === "flights" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Manage Flights</h2>
                <button
                  onClick={() => navigate("/admin/flights/add")}
                  className="bg-sky-500 text-white px-6 py-2.5 rounded-xl hover:bg-sky-600 transition font-medium"
                >
                  + Add Flight
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-gray-700">Flight</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Airline</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Route</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Departure</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Price</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Seats</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flights.map((flight) => (
                        <tr key={flight.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-3 font-mono text-xs">{flight.flightNumber}</td>
                          <td className="px-6 py-3">{flight.airlineName}</td>
                          <td className="px-6 py-3">
                            {flight.source} → {flight.destination}
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-600">
                            {new Date(flight.departureTime).toLocaleString("en-IN", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-6 py-3 font-bold text-sky-600">₹{flight.price.toLocaleString("en-IN")}</td>
                          <td className="px-6 py-3">{flight.availableSeats}</td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => navigate(`/admin/flights/${flight.id}/edit`)}
                                className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-amber-200 transition"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => {
                                  const confirmed = window.confirm(
                                    `Delete flight ${flight.flightNumber}? This cannot be undone.`
                                  );
                                  if (confirmed) deleteMutation.mutate(flight.id);
                                }}
                                className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-200 transition"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB: ALL BOOKINGS ─── */}
          {activeTab === "bookings" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">All Bookings</h2>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search by flight number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search by user name or email..."
                      value={bookingUserSearch}
                      onChange={(e) => setBookingUserSearch(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    {(["all", "confirmed", "cancelled"] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setSeatFilter(status)}
                        className={`px-4 py-2.5 rounded-xl font-medium transition ${
                          seatFilter === status
                            ? "bg-sky-600 text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:border-sky-500"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-gray-700">ID</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Booked By</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Email</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Flight</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Route</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Seats</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Total</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Status</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((booking) => {
                        const bookedByUser = userMap.get(booking.userId);
                        const roleBadge = bookedByUser?.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-sky-100 text-sky-700";
                        return (
                          <tr key={booking.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 font-mono text-xs">#{booking.id.slice(0, 8)}</td>
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {bookedByUser?.name || `User #${booking.userId.slice(0, 6)}`}
                                </span>
                                {bookedByUser && (
                                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${roleBadge}`}>
                                    {bookedByUser.role}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-3 text-gray-600 text-xs">
                              {bookedByUser?.email || "—"}
                            </td>
                            <td className="px-6 py-3 font-mono text-xs">{booking.flightNumber}</td>
                            <td className="px-6 py-3">
                              {booking.source} → {booking.destination}
                            </td>
                            <td className="px-6 py-3">{booking.numberOfSeats}</td>
                            <td className="px-6 py-3 font-bold text-sky-600">
                              ₹{booking.totalPrice.toLocaleString("en-IN")}
                            </td>
                            <td className="px-6 py-3">
                              <BookingStatusDropdown
                                bookingId={booking.id}
                                currentStatus={booking.status as "CONFIRMED" | "CANCELLED"}
                                onSaved={handleBookingStatusSaved}
                              />
                            </td>
                            <td className="px-6 py-3 text-gray-600">
                              {new Date(booking.bookingDate).toLocaleDateString("en-IN")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB: USERS ─── */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Users</h2>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  {(["all", "USER", "ADMIN"] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => setUserRoleFilter(role)}
                      className={`px-4 py-2.5 rounded-xl font-medium transition ${
                        userRoleFilter === role
                          ? "bg-sky-600 text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:border-sky-500"
                      }`}
                    >
                      {role === "all" ? "All" : role}
                    </button>
                  ))}
                </div>
              </div>

              {usersQuery.isLoading ? (
                <LoadingSpinner />
              ) : (
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 font-semibold text-gray-700">#</th>
                          <th className="px-6 py-3 font-semibold text-gray-700">Name</th>
                          <th className="px-6 py-3 font-semibold text-gray-700">Email</th>
                          <th className="px-6 py-3 font-semibold text-gray-700">Role</th>
                          <th className="px-6 py-3 font-semibold text-gray-700">Total Bookings</th>
                          <th className="px-6 py-3 font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u, idx) => {
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
                              index={idx + 1}
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
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB: ANALYTICS ─── */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Analytics</h2>

              {/* Revenue Chart */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue Over Time (Last 7 Days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => (value ? `₹${(value as number).toLocaleString("en-IN")}` : "₹0")} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6" }}
                      name="Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Top Flights Chart */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Top 5 Most Booked Flights</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={topFlightsData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="flight" type="category" width={90} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h3 className="text-sm uppercase tracking-wide text-gray-500 font-medium mb-2">Average Booking Value</h3>
                  <p className="text-3xl font-bold text-sky-600">₹{stats.avgBookingValue.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-gray-600 mt-2">Average price per confirmed booking</p>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h3 className="text-sm uppercase tracking-wide text-gray-500 font-medium mb-2">Total Revenue</h3>
                  <p className="text-3xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-gray-600 mt-2">From {stats.confirmed} confirmed bookings</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/** Stat card component */
function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-sky-500">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value.toLocaleString("en-IN")}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg text-xl`}>{icon}</div>
      </div>
    </div>
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
  return (
    <>
      <tr className="border-b border-gray-200 hover:bg-gray-50">
        <td className="px-6 py-3 text-gray-500">{index}</td>
        <td className="px-6 py-3 font-medium">{u.name}</td>
        <td className="px-6 py-3 text-gray-600 text-xs">{u.email}</td>
        <td className="px-6 py-3">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${roleBadge}`}>
            {u.role}
          </span>
        </td>
        <td className="px-6 py-3 font-medium">{bookingCount}</td>
        <td className="px-6 py-3">
          {bookingCount > 0 && (
            <button
              onClick={onToggleExpand}
              className="text-xs px-3 py-1.5 rounded-lg font-medium bg-sky-100 text-sky-700 hover:bg-sky-200 transition flex items-center gap-1"
            >
              {isExpanded ? "▲ Hide" : "👁 View Bookings"}
            </button>
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={6} className="px-6 py-4 bg-gray-50">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 font-semibold text-gray-600 text-xs">Flight No</th>
                    <th className="px-4 py-2 font-semibold text-gray-600 text-xs">Route</th>
                    <th className="px-4 py-2 font-semibold text-gray-600 text-xs">Seats</th>
                    <th className="px-4 py-2 font-semibold text-gray-600 text-xs">Total Price</th>
                    <th className="px-4 py-2 font-semibold text-gray-600 text-xs">Status</th>
                    <th className="px-4 py-2 font-semibold text-gray-600 text-xs">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {userBookings.map((b) => {
                    return (
                      <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-2 font-mono text-xs">{b.flightNumber}</td>
                        <td className="px-4 py-2 text-xs">
                          {b.source} → {b.destination}
                        </td>
                        <td className="px-4 py-2 text-xs">{b.numberOfSeats}</td>
                        <td className="px-4 py-2 text-xs font-bold text-sky-600">
                          ₹{b.totalPrice.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-2">
                          <BookingStatusDropdown
                            bookingId={b.id}
                            currentStatus={b.status as "CONFIRMED" | "CANCELLED"}
                            onSaved={onStatusSaved}
                          />
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-500">
                          {new Date(b.bookingDate).toLocaleDateString("en-IN")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
