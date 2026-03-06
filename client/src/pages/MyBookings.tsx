// src/pages/MyBookings.tsx

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
  { key: "all",       label: "All",       icon: "📋" },
  { key: "confirmed", label: "Confirmed", icon: "✅" },
  { key: "cancelled", label: "Cancelled", icon: "❌" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const SORT_OPTIONS = [
  { value: "date_desc",  label: "Newest First"      },
  { value: "date_asc",   label: "Oldest First"      },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "price_asc",  label: "Price: Low → High" },
];

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  CONFIRMED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  CANCELLED: { bg: "bg-rose-50",    text: "text-rose-600",    border: "border-rose-200",    dot: "bg-rose-500"    },
};

export default function MyBookings() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [search, setSearch]       = useState("");
  const [sort, setSort]           = useState("date_desc");
  const [viewMode, setViewMode]   = useState<"grid" | "list">("grid");

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

  const filtered = useMemo(() => {
    if (!bookings) return [];
    let list = [...bookings];
    if (activeTab === "confirmed") list = list.filter((b) => b.status === "CONFIRMED");
    if (activeTab === "cancelled") list = list.filter((b) => b.status === "CANCELLED");
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.flightNumber.toLowerCase().includes(q) ||
          b.airlineName.toLowerCase().includes(q)  ||
          b.source.toLowerCase().includes(q)       ||
          b.destination.toLowerCase().includes(q)
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
      <div className="max-w-7xl mx-auto px-4 py-10 page-enter">
        <div className="h-9 bg-gray-200 rounded-lg w-52 animate-pulse mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5"><SkeletonCard count={4} /></div>
      </div>
    );
  }

  if (isError) return <ErrorMessage message="Failed to load your bookings." />;
  if (!bookings || bookings.length === 0) {
    return (
      <div className="page-enter">
        <div className="max-w-7xl mx-auto px-4 pt-6"><BackButton to="/" label="Home" /></div>
        <EmptyState icon="✈️" heading="No Bookings Yet" subtext="Start your journey — search for flights and book your next adventure!" actionLabel="Explore Flights" actionPath="/explore" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 page-enter">

        {/* ── Hero Header ── */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-8 mb-8 shadow-xl shadow-blue-200">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-8 -right-8 w-64 h-64 bg-white/5 rounded-full" />
            <div className="absolute -bottom-12 -left-12 w-80 h-80 bg-white/5 rounded-full" />
            <svg className="absolute right-0 bottom-0 opacity-10 w-96" viewBox="0 0 400 300" fill="none">
              <path d="M380 250 L80 250 L200 50 Z" fill="white" />
              <circle cx="340" cy="80" r="60" fill="white" />
            </svg>
          </div>
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <BackButton to="/" label="Home" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-3xl">✈️</span>
                  <h1 className="text-3xl font-bold text-white">My Bookings</h1>
                </div>
                <p className="text-blue-200 text-sm">
                  {stats.total} booking{stats.total !== 1 ? "s" : ""} across {stats.routes} unique route{stats.routes !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-sm font-semibold px-5 py-2.5 rounded-xl border border-white/20 transition-all duration-200 self-start sm:self-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Booking
            </Link>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Bookings", value: stats.total,     icon: "📋", cls: "bg-blue-50 text-blue-700 border-blue-100"         },
            { label: "Confirmed",      value: stats.confirmed, icon: "✅", cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
            { label: "Cancelled",      value: stats.cancelled, icon: "❌", cls: "bg-rose-50 text-rose-700 border-rose-100"           },
            { label: "Total Spent",    value: `₹${stats.totalSpent.toLocaleString("en-IN")}`, icon: "💰", cls: "bg-amber-50 text-amber-700 border-amber-100" },
          ].map((s) => (
            <div key={s.label} className={`rounded-2xl border p-5 shadow-sm ${s.cls}`}>
              <span className="text-2xl block mb-3">{s.icon}</span>
              <p className="text-2xl font-bold mb-0.5">{s.value}</p>
              <p className="text-xs font-medium opacity-60">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Controls Bar ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit shrink-0">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <span className="text-xs">{tab.icon}</span>
                  {tab.label}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-500"
                  }`}>
                    {tab.key === "all" ? stats.total : tab.key === "confirmed" ? stats.confirmed : stats.cancelled}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-1 items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search airline, flight, route…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
                )}
              </div>

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-sm border border-gray-200 rounded-xl bg-gray-50 px-3 py-2.5 focus:bg-white focus:border-blue-400 outline-none cursor-pointer text-gray-700 shrink-0"
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              {/* View Toggle */}
              <div className="flex gap-1 p-1 bg-gray-100 rounded-xl shrink-0">
                {(["grid", "list"] as const).map((mode) => (
                  <button key={mode} onClick={() => setViewMode(mode)}
                    className={`p-2 rounded-lg transition-all ${viewMode === mode ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    {mode === "grid" ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zm6-8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zm0 8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {search && (
          <p className="text-sm text-gray-500 mb-4">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "<span className="font-medium text-gray-700">{search}</span>"
          </p>
        )}

        {/* ── Results ── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-700 font-semibold text-lg mb-1">No bookings found</p>
            <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
            {search && <button onClick={() => setSearch("")} className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">Clear search</button>}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((b) => <BookingCard key={b.id} booking={b} />)}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((b) => <BookingListRow key={b.id} booking={b} />)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Grid Card ─────────────────────────────────────────────── */
function BookingCard({ booking }: { booking: BookingResponse }) {
  const s = STATUS_CONFIG[booking.status] ?? { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", dot: "bg-gray-400" };
  return (
    <Link to={`/bookings/${booking.id}`}
      className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
    >
      <div className="h-1.5 bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500" />
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-sm shadow-blue-200">✈️</div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{booking.airlineName}</p>
              <p className="text-[11px] text-gray-400 font-mono tracking-wider mt-0.5">{booking.flightNumber}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold ${s.bg} ${s.text} ${s.border}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{booking.status}
          </div>
        </div>

        {/* Route */}
        <div className="flex items-center gap-2 mb-5">
          <div className="flex-1 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-3.5 border border-slate-100">
            <p className="text-xl font-black text-gray-900">{booking.source}</p>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mt-0.5">Origin</p>
          </div>
          <div className="flex flex-col items-center gap-1 px-1">
            <div className="w-12 h-px bg-gradient-to-r from-gray-200 via-blue-300 to-gray-200" />
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </div>
            <div className="w-12 h-px bg-gradient-to-r from-gray-200 via-blue-300 to-gray-200" />
          </div>
          <div className="flex-1 bg-gradient-to-r from-indigo-50 to-slate-50 rounded-xl p-3.5 border border-slate-100 text-right">
            <p className="text-xl font-black text-gray-900">{booking.destination}</p>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mt-0.5">Destination</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(booking.bookingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {booking.numberOfSeats} seat{booking.numberOfSeats > 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-xl font-black text-gray-900">₹{booking.totalPrice.toLocaleString("en-IN")}</p>
        </div>
      </div>
      {/* Hover arrow */}
      <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

/* ─── List Row ──────────────────────────────────────────────── */
function BookingListRow({ booking }: { booking: BookingResponse }) {
  const s = STATUS_CONFIG[booking.status] ?? { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", dot: "bg-gray-400" };
  return (
    <Link to={`/bookings/${booking.id}`}
      className="group flex items-center gap-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200 p-5"
    >
      <div className={`w-1 self-stretch rounded-full ${booking.status === "CONFIRMED" ? "bg-emerald-400" : "bg-rose-400"}`} />
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-2xl shadow-sm shrink-0">✈️</div>
      <div className="shrink-0 w-36">
        <p className="font-bold text-gray-900 text-sm">{booking.airlineName}</p>
        <p className="text-xs text-gray-400 font-mono tracking-wide">{booking.flightNumber}</p>
      </div>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="text-center shrink-0">
          <p className="text-lg font-black text-gray-900">{booking.source}</p>
          <p className="text-[10px] uppercase tracking-widest text-gray-400">From</p>
        </div>
        <div className="flex-1 flex items-center gap-2 px-2">
          <div className="flex-1 h-px bg-gray-200" />
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </div>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="text-center shrink-0">
          <p className="text-lg font-black text-gray-900">{booking.destination}</p>
          <p className="text-[10px] uppercase tracking-widest text-gray-400">To</p>
        </div>
      </div>
      <div className="shrink-0 text-center hidden md:block">
        <p className="text-xs text-gray-500">{new Date(booking.bookingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
        <p className="text-xs text-gray-400 mt-0.5">{booking.numberOfSeats} seat{booking.numberOfSeats > 1 ? "s" : ""}</p>
      </div>
      <div className="shrink-0 text-right ml-auto">
        <p className="text-xl font-black text-gray-900">₹{booking.totalPrice.toLocaleString("en-IN")}</p>
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold mt-1 ${s.bg} ${s.text} ${s.border}`}>
          <div className={`w-1 h-1 rounded-full ${s.dot}`} />{booking.status}
        </div>
      </div>
      <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}