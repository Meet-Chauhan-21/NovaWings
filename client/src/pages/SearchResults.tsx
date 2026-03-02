// src/pages/SearchResults.tsx
// Professional IRCTC / MakeMyTrip style search results with filters, sort, and flight cards

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { searchFlights } from "../services/flightService";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import CityCombobox from "../components/CityCombobox";
import BackButton from "../components/ui/BackButton";
import DateInput from "../components/ui/DateInput";
import NumberInput from "../components/ui/NumberInput";
import type { Flight } from "../types";

/* ───────── Helper functions ───────── */

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

function airlineColor(name: string): string {
  const colors = [
    "bg-red-500",
    "bg-blue-600",
    "bg-emerald-600",
    "bg-purple-600",
    "bg-orange-500",
    "bg-pink-600",
    "bg-teal-600",
    "bg-indigo-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

type SortKey = "cheapest" | "fastest" | "earliest" | "seats";
type TimeSlot = "early" | "morning" | "afternoon" | "evening";

/* ───────── Component ───────── */

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const source = searchParams.get("source") || "";
  const destination = searchParams.get("destination") || "";
  const date = searchParams.get("date") || "";
  const passengers = parseInt(searchParams.get("passengers") || "1");

  /* ── Editable search bar state ── */
  const [from, setFrom] = useState(source);
  const [to, setTo] = useState(destination);
  const [searchDate, setSearchDate] = useState(date);
  const [searchPassengers, setSearchPassengers] = useState(passengers);

  // Sync draft inputs when URL changes (reload, back/forward)
  useEffect(() => {
    setFrom(searchParams.get("source") || "");
    setTo(searchParams.get("destination") || "");
    setSearchDate(searchParams.get("date") || "");
    setSearchPassengers(parseInt(searchParams.get("passengers") || "1"));
  }, [searchParams]);

  // Save last search to sessionStorage as backup
  useEffect(() => {
    if (source && destination) {
      sessionStorage.setItem(
        "lastSearch",
        JSON.stringify({ source, destination, date, passengers })
      );
    }
  }, [source, destination, date, passengers]);

  // On mount with NO URL params — restore from sessionStorage
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

  /* ── API — uses committed URL values as query key ── */
  const { data: flights, isLoading, isError } = useQuery({
    queryKey: ["flights", "search", source, destination, date, passengers],
    queryFn: () => searchFlights(source, destination),
    enabled: !!(source && destination),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev: Flight[] | undefined) => prev,
  });

  /* ── State ── */
  const [sort, setSort] = useState<SortKey>("cheapest");
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: Infinity });
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [minSeats, setMinSeats] = useState(passengers);
  const [maxDuration, setMaxDuration] = useState<number | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [openFilterSections, setOpenFilterSections] = useState<Record<string, boolean>>({
    price: true,
    time: true,
    airlines: true,
    seats: true,
    duration: true,
  });

  /* ── Derived: date-filtered base list ── */
  const baseFlights = useMemo(() => {
    if (!flights) return [];
    if (!date) return flights;
    return flights.filter((f) => f.departureTime.split("T")[0] === date);
  }, [flights, date]);

  /* ── Price bounds ── */
  const priceBounds = useMemo(() => {
    if (baseFlights.length === 0) return { min: 0, max: 50000 };
    const prices = baseFlights.map((f) => f.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [baseFlights]);

  /* ── Airlines with counts ── */
  const airlineCounts = useMemo(() => {
    const map: Record<string, number> = {};
    baseFlights.forEach((f) => {
      map[f.airlineName] = (map[f.airlineName] || 0) + 1;
    });
    return map;
  }, [baseFlights]);

  const allAirlines = useMemo(() => Object.keys(airlineCounts).sort(), [airlineCounts]);

  /* ── Filtered + sorted ── */
  const filteredAndSortedFlights = useMemo(() => {
    let result = baseFlights;

    // seats
    result = result.filter((f) => f.availableSeats >= minSeats);

    // price
    const effectiveMin = priceRange.min || 0;
    const effectiveMax = priceRange.max === Infinity ? Infinity : priceRange.max;
    result = result.filter((f) => f.price >= effectiveMin && f.price <= effectiveMax);

    // time slots
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

    // airlines
    if (selectedAirlines.length > 0) {
      result = result.filter((f) => selectedAirlines.includes(f.airlineName));
    }

    // duration
    if (maxDuration !== null) {
      result = result.filter((f) => getDurationMs(f.departureTime, f.arrivalTime) <= maxDuration * 3600000);
    }

    // sort
    result = [...result].sort((a, b) => {
      if (sort === "cheapest") return a.price - b.price;
      if (sort === "earliest")
        return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      if (sort === "fastest") {
        return getDurationMs(a.departureTime, a.arrivalTime) - getDurationMs(b.departureTime, b.arrivalTime);
      }
      if (sort === "seats") return b.availableSeats - a.availableSeats;
      return 0;
    });

    return result;
  }, [baseFlights, minSeats, priceRange, selectedTimeSlots, selectedAirlines, maxDuration, sort]);

  /* ── Reset all filters ── */
  const resetFilters = useCallback(() => {
    setPriceRange({ min: 0, max: Infinity });
    setSelectedTimeSlots([]);
    setSelectedAirlines([]);
    setMinSeats(passengers);
    setMaxDuration(null);
  }, [passengers]);

  /* ── Toggle helpers ── */
  const toggleTimeSlot = (slot: TimeSlot) =>
    setSelectedTimeSlots((prev) => (prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]));

  const toggleAirline = (name: string) =>
    setSelectedAirlines((prev) => (prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]));

  const toggleSection = (key: string) =>
    setOpenFilterSections((prev) => ({ ...prev, [key]: !prev[key] }));

  /* ── Loading / Error ── */
  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message="Failed to search flights. Please try again." />;

  /* ── Filter panel (shared desktop + mobile) ── */
  const filterPanel = (
    <div className="space-y-5">
      {/* Price Range */}
      <FilterSection title="Price Range" sectionKey="price" open={openFilterSections.price} toggle={toggleSection}>
        <p className="text-xs text-gray-500 mb-2">
          {formatPrice(priceRange.min || priceBounds.min)} – {formatPrice(priceRange.max === Infinity ? priceBounds.max : priceRange.max)}
        </p>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Min</label>
          <input
            type="text"
            inputMode="numeric"
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            placeholder={String(priceBounds.min)}
            value={priceRange.min || ""}
            onChange={(e) => setPriceRange((p) => ({ ...p, min: Number(e.target.value) || 0 }))}
          />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <label className="text-xs text-gray-500">Max</label>
          <input
            type="text"
            inputMode="numeric"
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            placeholder={String(priceBounds.max)}
            value={priceRange.max === Infinity ? "" : priceRange.max}
            onChange={(e) =>
              setPriceRange((p) => ({ ...p, max: e.target.value ? Number(e.target.value) : Infinity }))
            }
          />
        </div>
      </FilterSection>

      {/* Departure Time */}
      <FilterSection title="Departure Time" sectionKey="time" open={openFilterSections.time} toggle={toggleSection}>
        <div className="grid grid-cols-2 gap-2">
          {([
            { key: "early" as TimeSlot, label: "🌅 Early Morning", sub: "00–06" },
            { key: "morning" as TimeSlot, label: "☀️ Morning", sub: "06–12" },
            { key: "afternoon" as TimeSlot, label: "🌤️ Afternoon", sub: "12–18" },
            { key: "evening" as TimeSlot, label: "🌙 Evening", sub: "18–24" },
          ]).map((slot) => (
            <button
              key={slot.key}
              onClick={() => toggleTimeSlot(slot.key)}
              className={`rounded-xl px-3 py-2 text-xs font-medium transition text-center ${
                selectedTimeSlots.includes(slot.key)
                  ? "bg-sky-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span className="block">{slot.label}</span>
              <span className="block text-[10px] opacity-70">{slot.sub}</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Airlines */}
      <FilterSection title="Airlines" sectionKey="airlines" open={openFilterSections.airlines} toggle={toggleSection}>
        <div className="flex justify-between mb-2">
          <button
            onClick={() => setSelectedAirlines([...allAirlines])}
            className="text-xs text-sky-600 hover:underline"
          >
            Select All
          </button>
          <button onClick={() => setSelectedAirlines([])} className="text-xs text-sky-600 hover:underline">
            Clear All
          </button>
        </div>
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {allAirlines.map((airline) => (
            <label key={airline} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1">
              <input
                type="checkbox"
                checked={selectedAirlines.length === 0 || selectedAirlines.includes(airline)}
                onChange={() => toggleAirline(airline)}
                className="accent-sky-600 rounded"
              />
              <span className="text-gray-700 flex-1">{airline}</span>
              <span className="text-xs text-gray-400">({airlineCounts[airline]})</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Available Seats */}
      <FilterSection title="Available Seats" sectionKey="seats" open={openFilterSections.seats} toggle={toggleSection}>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">Min seats:</span>
          <input
            type="text"
            inputMode="numeric"
            min={1}
            className="w-20 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
            value={minSeats}
            onChange={(e) => setMinSeats(Math.max(1, Number(e.target.value) || 1))}
          />
        </div>
      </FilterSection>

      {/* Journey Duration */}
      <FilterSection
        title="Journey Duration"
        sectionKey="duration"
        open={openFilterSections.duration}
        toggle={toggleSection}
      >
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Under 2h", val: 2 },
            { label: "2h – 5h", val: 5 },
            { label: "5h – 10h", val: 10 },
            { label: "Any", val: null },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => setMaxDuration(opt.val)}
              className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                maxDuration === opt.val ? "bg-sky-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Reset */}
      <button
        onClick={resetFilters}
        className="w-full border border-gray-300 text-gray-600 rounded-xl py-2 text-sm hover:bg-gray-50 transition"
      >
        Reset All Filters
      </button>
    </div>
  );

  /* ── Sort options ── */
  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "cheapest", label: "Cheapest" },
    { key: "fastest", label: "Fastest" },
    { key: "earliest", label: "Earliest" },
    { key: "seats", label: "Most Seats" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 page-enter">
      {/* ── Sticky Editable Search Bar ── */}
      <div className="sticky top-0 z-40 bg-sky-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
            {/* FROM */}
            <div className="flex-1 min-w-0">
              <CityCombobox
                label="🛫 From"
                labelClassName="text-xs font-semibold text-white/80 uppercase tracking-wide mb-1 block"
                value={from}
                onChange={setFrom}
                excludeCity={to}
                placeholder="Departure city"
              />
            </div>

            {/* SWAP */}
            <button
              type="button"
              onClick={() => { setFrom(to); setTo(from); }}
              className="hidden md:flex items-center justify-center w-10 h-10 mb-0.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors shrink-0"
              title="Swap cities"
            >
              ⇄
            </button>

            {/* TO */}
            <div className="flex-1 min-w-0">
              <CityCombobox
                label="🛬 To"
                labelClassName="text-xs font-semibold text-white/80 uppercase tracking-wide mb-1 block"
                value={to}
                onChange={setTo}
                excludeCity={from}
                placeholder="Destination city"
              />
            </div>

            {/* DATE */}
            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-xs font-semibold text-white/80 uppercase tracking-wide">📅 Date</label>
              <DateInput
                value={searchDate}
                onChange={setSearchDate}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* PASSENGERS */}
            <div className="flex flex-col gap-1 min-w-[120px]">
              <label className="text-xs font-semibold text-white/80 uppercase tracking-wide">👤 Passengers</label>
              <NumberInput
                value={searchPassengers}
                onChange={setSearchPassengers}
                min={1}
                max={9}
              />
            </div>

            {/* SEARCH BUTTON */}
            <button
              type="button"
              onClick={handleSearch}
              className="bg-white text-sky-700 font-bold px-8 py-2.5 rounded-xl hover:bg-sky-50 transition-colors shrink-0 shadow-sm flex items-center gap-2"
            >
              🔍 Search
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Filter/Sort bar ── */}
      <div className="md:hidden sticky top-[116px] z-30 bg-white border-b border-gray-200 px-4 py-2 flex gap-2">
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="flex-1 border border-gray-300 rounded-xl py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          🔍 Filters
        </button>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="flex-1 border border-gray-300 rounded-xl py-2 text-sm font-medium text-gray-700 bg-white px-3"
        >
          {sortOptions.map((o) => (
            <option key={o.key} value={o.key}>
              Sort: {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilterOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto p-5 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Filters</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">
                ✕
              </button>
            </div>
            {filterPanel}
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full mt-4 bg-sky-600 text-white rounded-xl py-3 font-semibold hover:bg-sky-700 transition"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4">
          <BackButton to="/" label="Home" />
        </div>
        <div className="flex gap-6">
          {/* ── Desktop Filter Sidebar ── */}
          <aside className="hidden md:block w-72 shrink-0">
            <div className="sticky top-[100px] bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h3 className="text-base font-bold text-gray-800 mb-4">Filters</h3>
              {filterPanel}
            </div>
          </aside>

          {/* ── Main Results Column ── */}
          <main className="flex-1 min-w-0">
            {/* Sort Bar */}
            <div className="hidden md:flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-3 mb-4">
              <div className="flex gap-2">
                {sortOptions.map((o) => (
                  <button
                    key={o.key}
                    onClick={() => setSort(o.key)}
                    className={`px-4 py-1.5 rounded-xl text-sm font-medium transition ${
                      sort === o.key ? "bg-sky-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {filteredAndSortedFlights.length} flight{filteredAndSortedFlights.length !== 1 ? "s" : ""} found
              </span>
            </div>

            {/* Results */}
            {filteredAndSortedFlights.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-6xl mb-4">✈️</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No flights found</h3>
                <p className="text-gray-500 mb-2">
                  {source} → {destination}
                  {date && ` on ${new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  Try changing your travel date or selecting a different route above
                </p>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
                >
                  ↑ Modify Search
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAndSortedFlights.map((flight) => (
                  <FlightResultCard
                    key={flight.id}
                    flight={flight}
                    passengers={passengers}
                    expanded={expandedCard === flight.id}
                    onToggleExpand={() => setExpandedCard(expandedCard === flight.id ? null : flight.id)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Collapsible Filter Section
   ═══════════════════════════════════════════ */

function FilterSection({
  title,
  sectionKey,
  open,
  toggle,
  children,
}: {
  title: string;
  sectionKey: string;
  open: boolean;
  toggle: (key: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-100 pb-4">
      <button
        onClick={() => toggle(sectionKey)}
        className="flex items-center justify-between w-full text-sm font-semibold text-gray-800 mb-2"
      >
        {title}
        <span className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
      </button>
      {open && children}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Flight Result Card
   ═══════════════════════════════════════════ */

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
  const duration = getFlightDuration(flight.departureTime, flight.arrivalTime);
  const seatColor =
    flight.availableSeats > 10 ? "text-emerald-600" : flight.availableSeats >= 5 ? "text-orange-500" : "text-red-500";
  const totalPrice = flight.price * passengers;
  const baseFare = flight.price * passengers;
  const tax = Math.round(baseFare * 0.18);
  const total = baseFare + tax;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-sky-200 transition">
      <div className="p-5">
        {/* Top row: airline info */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-9 h-9 ${airlineColor(flight.airlineName)} rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}
          >
            {flight.airlineName.charAt(0)}
          </div>
          <div>
            <span className="font-semibold text-gray-800">{flight.airlineName}</span>
            <span className="ml-2 text-sm text-gray-400">{flight.flightNumber}</span>
          </div>
        </div>

        {/* Middle: times & route */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Departure */}
          <div className="text-center min-w-[80px]">
            <p className="text-xl md:text-2xl font-bold text-gray-800">{formatTime(flight.departureTime)}</p>
            <p className="text-xs text-gray-500 mt-0.5">{flight.source}</p>
          </div>

          {/* Arrow line */}
          <div className="flex-1 flex flex-col items-center px-2">
            <span className="text-[10px] text-gray-400 font-medium mb-1">{duration}</span>
            <div className="w-full flex items-center">
              <div className="h-[2px] flex-1 bg-gray-300" />
              <span className="mx-1 text-sky-500 text-sm">✈</span>
              <div className="h-[2px] flex-1 bg-gray-300" />
            </div>
            <span className="text-[10px] text-emerald-600 font-medium mt-1">Non-stop</span>
          </div>

          {/* Arrival */}
          <div className="text-center min-w-[80px]">
            <p className="text-xl md:text-2xl font-bold text-gray-800">{formatTime(flight.arrivalTime)}</p>
            <p className="text-xs text-gray-500 mt-0.5">{flight.destination}</p>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-wrap items-end justify-between mt-4 pt-3 border-t border-gray-50 gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-sm font-medium ${seatColor}`}>🪑 {flight.availableSeats} seats left</span>
            <span className="bg-blue-50 text-blue-600 rounded px-2 py-0.5 text-xs font-medium">Economy</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xl md:text-2xl font-bold text-sky-600">{formatPrice(flight.price)}</p>
              <p className="text-[11px] text-gray-400">per person</p>
              {passengers > 1 && (
                <p className="text-[10px] text-gray-400">{formatPrice(totalPrice)} total</p>
              )}
            </div>
            <Link
              to={`/book/${flight.id}?passengers=${passengers}`}
              className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl px-5 py-2 text-sm font-semibold transition whitespace-nowrap"
            >
              Book Now →
            </Link>
          </div>
        </div>

        {/* View Details toggle */}
        <button
          onClick={onToggleExpand}
          className="mt-3 text-sm text-sky-600 hover:text-sky-800 font-medium transition"
        >
          {expanded ? "Hide Details ▲" : "View Details ▼"}
        </button>
      </div>

      {/* Accordion */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/50 rounded-b-2xl px-5 py-4">
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            {/* Flight Info */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Flight Info</h4>
              <div className="space-y-1 text-gray-600">
                <p>Airline: {flight.airlineName}</p>
                <p>Flight: {flight.flightNumber}</p>
                <p>Departure: {formatDate(flight.departureTime)}</p>
                <p>Arrival: {formatDate(flight.arrivalTime)}</p>
                <p>Duration: {duration}</p>
              </div>
            </div>

            {/* Fare Breakdown */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Fare Breakdown</h4>
              <div className="space-y-1 text-gray-600">
                <p className="flex justify-between">
                  <span>Base Fare ({passengers}×)</span> <span>{formatPrice(baseFare)}</span>
                </p>
                <p className="flex justify-between">
                  <span>Taxes (18%)</span> <span>{formatPrice(tax)}</span>
                </p>
                <div className="border-t border-gray-200 pt-1 mt-1 flex justify-between font-semibold text-gray-800">
                  <span>Total</span> <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Amenities</h4>
              <div className="space-y-1 text-gray-600">
                <p>🎒 Cabin: 7 kg</p>
                <p>🧳 Check-in: 15 kg</p>
                <p>🍽️ Meals: Available (paid)</p>
                <p>💺 Seat Selection: Available</p>
              </div>
            </div>
          </div>

          <div className="text-right mt-4">
            <Link
              to={`/book/${flight.id}?passengers=${passengers}`}
              className="inline-block bg-sky-600 hover:bg-sky-700 text-white rounded-xl px-6 py-2 text-sm font-semibold transition"
            >
              Book Now →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
