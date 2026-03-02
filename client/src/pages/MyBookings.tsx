// src/pages/MyBookings.tsx
// Professional bookings page with tabs, search, and enhanced cards

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getMyBookings } from "../services/bookingService";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import BackButton from "../components/ui/BackButton";
import SkeletonCard from "../components/ui/SkeletonCard";
import type { BookingResponse } from "../types";

const TABS = [
  { key: "all", label: "All Bookings", icon: "📋" },
  { key: "confirmed", label: "Confirmed", icon: "✅" },
  { key: "cancelled", label: "Cancelled", icon: "❌" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
};

export default function MyBookings() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");

  const { data: bookings, isLoading, isError } = useQuery({
    queryKey: ["myBookings"],
    queryFn: getMyBookings,
  });

  // Filter by tab + search
  const filtered = useMemo(() => {
    if (!bookings) return [];
    let list = bookings;
    if (activeTab === "confirmed") list = list.filter((b) => b.status === "CONFIRMED");
    if (activeTab === "cancelled") list = list.filter((b) => b.status === "CANCELLED");
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.flightNumber.toLowerCase().includes(q) ||
          b.airlineName.toLowerCase().includes(q) ||
          b.source.toLowerCase().includes(q) ||
          b.destination.toLowerCase().includes(q)
      );
    }
    return list;
  }, [bookings, activeTab, search]);

  // Stats
  const stats = useMemo(() => {
    if (!bookings) return { total: 0, confirmed: 0, cancelled: 0, totalSpent: 0 };
    return {
      total: bookings.length,
      confirmed: bookings.filter((b) => b.status === "CONFIRMED").length,
      cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
      totalSpent: bookings
        .filter((b) => b.status === "CONFIRMED")
        .reduce((sum, b) => sum + b.totalPrice, 0),
    };
  }, [bookings]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 page-enter">
        <div className="mb-6"><div className="h-8 bg-gray-200 rounded w-48 animate-pulse" /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonCard count={4} />
        </div>
      </div>
    );
  }

  if (isError) return <ErrorMessage message="Failed to load your bookings." />;

  if (!bookings || bookings.length === 0) {
    return (
      <div className="page-enter">
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <BackButton to="/" label="Home" />
        </div>
        <EmptyState
          icon="📋"
          heading="No Bookings Yet"
          subtext="You haven't made any bookings. Start exploring flights and book your next trip!"
          actionLabel="Browse Flights"
          actionPath="/explore"
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <BackButton to="/" label="Home" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {stats.total} booking{stats.total !== 1 ? "s" : ""} &middot; ₹{stats.totalSpent.toLocaleString("en-IN")} total spent
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: stats.total, color: "bg-blue-50 text-blue-700", icon: "📋" },
          { label: "Confirmed", value: stats.confirmed, color: "bg-emerald-50 text-emerald-700", icon: "✅" },
          { label: "Cancelled", value: stats.cancelled, color: "bg-red-50 text-red-600", icon: "❌" },
          {
            label: "Total Spent",
            value: `₹${stats.totalSpent.toLocaleString("en-IN")}`,
            color: "bg-amber-50 text-amber-700",
            icon: "💰",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`${stat.color} rounded-xl p-4 border border-gray-100 shadow-sm`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span>{stat.icon}</span>
              <span className="text-xs font-medium opacity-75">{stat.label}</span>
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="text-xs">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs w-full">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
        </div>
      </div>

      {/* Booking Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg mb-2">No bookings found</p>
          <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((booking) => (
            <BookingCardEnhanced key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Enhanced Booking Card with flight route visual */
function BookingCardEnhanced({ booking }: { booking: BookingResponse }) {
  return (
    <Link
      to={`/bookings/${booking.id}`}
      className="group block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 overflow-hidden"
    >
      {/* Top strip */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500" />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-lg">
              ✈️
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{booking.airlineName}</p>
              <p className="text-xs text-gray-400 font-mono">{booking.flightNumber}</p>
            </div>
          </div>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full border ${
              STATUS_STYLES[booking.status] ?? "bg-gray-50 text-gray-600 border-gray-200"
            }`}
          >
            {booking.status}
          </span>
        </div>

        {/* Flight Route Visual */}
        <div className="flex items-center gap-3 mb-4 bg-gray-50/80 rounded-lg p-3">
          <div className="text-center flex-1">
            <p className="text-lg font-bold text-gray-900">{booking.source}</p>
            <p className="text-[11px] text-gray-400">From</p>
          </div>
          <div className="flex items-center gap-1 text-gray-300 shrink-0">
            <div className="w-6 h-px bg-gray-300" />
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
            <div className="w-6 h-px bg-gray-300" />
          </div>
          <div className="text-center flex-1">
            <p className="text-lg font-bold text-gray-900">{booking.destination}</p>
            <p className="text-[11px] text-gray-400">To</p>
          </div>
        </div>

        {/* Bottom details */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(booking.bookingDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {booking.numberOfSeats} seat{booking.numberOfSeats > 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            ₹{booking.totalPrice.toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </Link>
  );
}
