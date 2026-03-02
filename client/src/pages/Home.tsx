// src/pages/Home.tsx
// Fully dynamic landing page — all data fetched from backend

import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useQuery, useQueries } from "@tanstack/react-query";
import homeService from "../services/homeService";
import { searchFlights } from "../services/flightService";
import CityCombobox from "../components/CityCombobox";
import DateInput from "../components/ui/DateInput";
import NumberInput from "../components/ui/NumberInput";
import type { Flight, RouteConfig } from "../types";

const AIRLINE_COLORS: Record<string, string> = {
  IndiGo: "bg-indigo-600",
  "Air India": "bg-red-600",
  Vistara: "bg-purple-600",
  SpiceJet: "bg-orange-500",
  "Akasa Air": "bg-yellow-500",
  GoAir: "bg-green-600",
  AirAsia: "bg-red-500",
};

export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [source, setSource] = useState(searchParams.get("source") || "");
  const [destination, setDestination] = useState(searchParams.get("destination") || "");
  const [date, setDate] = useState(searchParams.get("date") || "");
  const [passengers, setPassengers] = useState(
    parseInt(searchParams.get("passengers") || "1")
  );

  // Sync if URL changes (e.g. user uses back button to home)
  useEffect(() => {
    setSource(searchParams.get("source") || "");
    setDestination(searchParams.get("destination") || "");
    setDate(searchParams.get("date") || "");
    setPassengers(parseInt(searchParams.get("passengers") || "1"));
  }, [searchParams]);

  // ── Fetch homepage config ──
  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ["homeConfig"],
    queryFn: homeService.getConfig,
    staleTime: 5 * 60 * 1000,
  });

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

  const activeRoutes = config?.popularRoutes?.filter((r) => r.active) ?? [];
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

  return (
    <div className="page-enter">
      {/* ─── Hero Section ─── */}
      <section className="bg-gradient-to-br from-sky-500 to-sky-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {configLoading ? (
            <>
              <div className="animate-pulse bg-white/20 h-12 w-80 rounded-xl mx-auto mb-4" />
              <div className="animate-pulse bg-white/20 h-6 w-64 rounded-xl mx-auto mb-10" />
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {config?.heroTitle ?? "Where do you want to fly?"}
              </h1>
              <p className="text-lg md:text-xl text-sky-100 mb-10">
                {config?.heroSubtitle ?? "Search and book flights at the best prices"}
              </p>
            </>
          )}

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">
                  🛫 From
                </label>
                <CityCombobox
                  value={source}
                  onChange={setSource}
                  placeholder="Enter city or airport"
                  excludeCity={destination}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">
                  🛬 To
                </label>
                <CityCombobox
                  value={destination}
                  onChange={setDestination}
                  placeholder="Enter city or airport"
                  excludeCity={source}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">
                  📅 Date
                </label>
                <DateInput
                  value={date}
                  onChange={setDate}
                  min={today}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">
                  👤 Passengers
                </label>
                <NumberInput
                  value={passengers}
                  onChange={setPassengers}
                  min={1}
                  max={9}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={!source.trim() || !destination.trim()}
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-8 py-3 rounded-xl transition w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔍 Search Flights
            </button>
          </form>
        </div>
      </section>

      {/* ─── Popular Routes Section ─── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Popular Routes</h2>
        <p className="text-gray-500 text-center mb-10">Most searched flight routes by our travellers</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {configLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-gray-200 rounded-2xl h-32"
                />
              ))
            : activeRoutes.map((route, index) => (
                <RouteCard
                  key={index}
                  source={route.source}
                  destination={route.destination}
                  label={route.label}
                  onClick={() =>
                    navigate(
                      `/search?source=${encodeURIComponent(route.source)}&destination=${encodeURIComponent(route.destination)}&date=${today}&passengers=1`
                    )
                  }
                />
              ))}
        </div>
        {!configLoading && activeRoutes.length === 0 && (
          <p className="text-gray-400 text-center mt-4">No popular routes configured yet.</p>
        )}
      </section>

      {/* ─── Hot Deals Section ─── */}
      {dealRoutes.length > 0 && (
        <section className="bg-gray-50 py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">🔥 Hot Deals</h2>
            <p className="text-gray-500 text-center mb-10">
              Cheapest flights on trending routes — prices from real-time data
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {dealQueries.map((query, index) => {
                if (query.isLoading) return <DealCardSkeleton key={index} />;
                if (!query.data) return null;
                return (
                  <DealCard
                    key={index}
                    flight={query.data}
                    route={dealRoutes[index]}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── Airlines Section ─── */}
      {(airlinesLoading || airlines.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Our Airlines</h2>
          <p className="text-gray-500 text-center mb-10">
            Browse flights from top airlines operating on NovaWings
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {airlinesLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-200 rounded-2xl h-24"
                  />
                ))
              : airlines.map((airline) => (
                  <button
                    key={airline}
                    onClick={() =>
                      navigate(`/search?source=Delhi&destination=Mumbai`)
                    }
                    className={`${
                      AIRLINE_COLORS[airline] ?? "bg-sky-600"
                    } text-white rounded-2xl p-5 text-center font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all`}
                  >
                    <span className="text-2xl block mb-1">✈</span>
                    <span className="text-sm">{airline}</span>
                  </button>
                ))}
          </div>
        </section>
      )}

      {/* ─── Features Section ─── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-10">Why Choose NovaWings?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon="⚡"
            title="Fast Booking"
            description="Book your flight in just a few clicks with our streamlined booking process."
          />
          <FeatureCard
            icon="💰"
            title="Best Prices"
            description="We offer competitive prices and transparent pricing with no hidden fees."
          />
          <FeatureCard
            icon="❌"
            title="Easy Cancellation"
            description="Plans changed? Cancel your booking hassle-free from your dashboard."
          />
        </div>
      </section>
    </div>
  );
}

/** Route card for popular routes */
function RouteCard({
  source,
  destination,
  label,
  onClick,
}: {
  source: string;
  destination: string;
  label?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] p-5 text-left border border-gray-100 group"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sky-500 text-lg">✈</span>
        <span className="font-bold text-gray-800 text-sm">
          {source} → {destination}
        </span>
      </div>
      {label && (
        <span className="inline-block bg-sky-100 text-sky-700 text-xs font-medium px-2 py-0.5 rounded-full">
          {label}
        </span>
      )}
      <p className="text-xs text-gray-400 mt-2 group-hover:text-sky-600 transition">
        View flights →
      </p>
    </button>
  );
}

/** Deal card showing real cheapest flight data */
function DealCard({ flight, route }: { flight: Flight; route: RouteConfig }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2">
        <span className="text-white text-xs font-bold uppercase tracking-wide">
          {route.label || "Hot Deal"}
        </span>
      </div>
      <div className="p-5">
        <p className="text-xs text-gray-500 font-medium mb-1">{flight.airlineName}</p>
        <p className="font-bold text-gray-800 mb-1">
          {route.source} → {route.destination}
        </p>
        <p className="text-xs text-gray-400 mb-3">Flight {flight.flightNumber}</p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-gray-500">Starting from</p>
            <p className="text-xl font-bold text-sky-600">
              ₹{flight.price.toLocaleString("en-IN")}
            </p>
          </div>
          <button
            onClick={() => navigate(`/book/${flight.id}?passengers=1`)}
            className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

/** Skeleton placeholder for deal cards */
function DealCardSkeleton() {
  return (
    <div className="animate-pulse bg-gray-200 rounded-2xl h-48" />
  );
}

/** Feature highlight card */
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-8 text-center">
      <span className="text-4xl mb-4 block">{icon}</span>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  );
}
