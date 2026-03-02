// src/pages/ExplorePage.tsx
// Smart flight browser — never loads all flights at once.
// User picks from → to progressively; works like Google Flights browse mode.
// All cities are fetched from the API — NO hardcoded data.

import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useQuery, useQueries } from "@tanstack/react-query";
import { searchFlights } from "../services/flightService";
import locationService from "../services/locationService";
import CityCombobox from "../components/CityCombobox";
import FlightCard from "../components/FlightCard";
import BackButton from "../components/ui/BackButton";
import DateInput from "../components/ui/DateInput";
import type { Flight } from "../types";

/** Route summary returned by the select transform in useQueries */
interface RouteSummary {
  destination: string;
  cheapestPrice: number;
  airline: string;
  flightCount: number;
  earliestDep: string;
}

type SortKey = "cheapest" | "earliest" | "fastest";

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

    // Only update URL if params actually changed
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
  useEffect(() => {
    setVisibleCount(10);
  }, [fromCity, toCity, dateFilter]);

  // Determine page state
  const pageState: "CITY_SELECT" | "ROUTE_SELECT" | "FLIGHT_LIST" =
    !fromCity && !toCity
      ? "CITY_SELECT"
      : fromCity && !toCity
        ? "ROUTE_SELECT"
        : "FLIGHT_LIST";

  // ── State B: fetch cheapest flight per destination ──
  const destinationCities = useMemo(
    () => exploreCities.filter((c) => c.city.toLowerCase() !== fromCity.toLowerCase()),
    [fromCity, exploreCities],
  );

  const routeQueries = useQueries({
    queries: destinationCities.map((loc) => ({
      queryKey: ["explore", fromCity, loc.city],
      queryFn: () => searchFlights(fromCity, loc.city),
      staleTime: 10 * 60 * 1000,
      enabled: pageState === "ROUTE_SELECT",
      select: (data: Flight[]): RouteSummary | null => {
        if (!data || data.length === 0) return null;
        const cheapest = [...data].sort((a, b) => a.price - b.price)[0];
        return {
          destination: loc.city,
          cheapestPrice: cheapest.price,
          airline: cheapest.airlineName,
          flightCount: data.length,
          earliestDep: cheapest.departureTime,
        };
      },
    })),
  });

  const routesLoading = routeQueries.some((q) => q.isLoading);

  // ── State C: fetch flights for selected route ──
  const {
    data: flights = [],
    isLoading: flightsLoading,
  } = useQuery({
    queryKey: ["explore", "flights", fromCity, toCity, dateFilter],
    queryFn: () => searchFlights(fromCity, toCity),
    staleTime: 5 * 60 * 1000,
    enabled: pageState === "FLIGHT_LIST",
  });

  // Sort & filter flights
  const sortedFlights = useMemo(() => {
    let list = [...flights];

    // Optional date filter
    if (dateFilter) {
      list = list.filter((f) => f.departureTime.startsWith(dateFilter));
    }

    switch (sortBy) {
      case "cheapest":
        list.sort((a, b) => a.price - b.price);
        break;
      case "earliest":
        list.sort(
          (a, b) =>
            new Date(a.departureTime).getTime() -
            new Date(b.departureTime).getTime(),
        );
        break;
      case "fastest": {
        const duration = (f: Flight) =>
          new Date(f.arrivalTime).getTime() -
          new Date(f.departureTime).getTime();
        list.sort((a, b) => duration(a) - duration(b));
        break;
      }
    }
    return list;
  }, [flights, dateFilter, sortBy]);

  const visibleFlights = sortedFlights.slice(0, visibleCount);
  const today = new Date().toISOString().split("T")[0];

  // ── Filter bar search handler ──
  const handleFind = () => {
    if (!fromCity.trim() && !toCity.trim()) {
      toast.error("Please select at least a From city");
      return;
    }
    // if only to is set, swap — treat as "from"
    if (!fromCity.trim() && toCity.trim()) {
      setFromCity(toCity);
      setToCity("");
    }
  };

  // ── Breadcrumb helpers ──
  const clearFrom = () => {
    setFromCity("");
    setToCity("");
  };
  const clearTo = () => {
    setToCity("");
  };

  return (
    <div className="page-enter">
      {/* ─── Hero Header ─── */}
      <section className="bg-gradient-to-r from-sky-600 to-blue-700 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Explore Flights ✈
          </h1>
          <p className="text-sky-100 text-lg">
            Discover flights from your city
          </p>
        </div>
      </section>

      {/* ─── Quick Filter Bar ─── */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-4 -mt-6 relative z-10">
          <div className="mb-3">
            <BackButton to="/" label="Home" />
          </div>
          <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[160px]">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
              🏙️ From
            </label>
            <CityCombobox
              value={fromCity}
              onChange={setFromCity}
              placeholder="Departure city"
              excludeCity={toCity}
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
              🏙️ To
            </label>
            <CityCombobox
              value={toCity}
              onChange={setToCity}
              placeholder="Destination city"
              excludeCity={fromCity}
            />
          </div>
          <div className="min-w-[150px]">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
              📅 Date
            </label>
            <DateInput
              value={dateFilter}
              onChange={setDateFilter}
              min={today}
            />
          </div>
          <button
            onClick={handleFind}
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            🔍 Find Flights
          </button>
          {fromCity && toCity && (
            <button
              onClick={() =>
                navigate(
                  `/search?source=${encodeURIComponent(fromCity)}&destination=${encodeURIComponent(toCity)}${dateFilter ? `&date=${encodeURIComponent(dateFilter)}` : ""}`,
                )
              }
              className="border border-sky-600 text-sky-600 hover:bg-sky-50 font-semibold px-5 py-3 rounded-xl transition"
            >
              Search Full Results
            </button>
          )}
          </div>
        </div>
      </div>

      {/* ─── Content Area ─── */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button
            onClick={clearFrom}
            className={`font-medium ${!fromCity ? "text-gray-800" : "text-sky-600 hover:underline"}`}
          >
            All Cities
          </button>
          {fromCity && (
            <>
              <span className="text-gray-400">›</span>
              <span className="text-sky-600 font-medium flex items-center gap-1">
                {fromCity}
                <button
                  onClick={clearFrom}
                  className="text-gray-400 hover:text-red-500 ml-1"
                >
                  ✕
                </button>
              </span>
            </>
          )}
          {toCity && (
            <>
              <span className="text-gray-400">›</span>
              <span className="text-sky-600 font-medium flex items-center gap-1">
                {toCity}
                <button
                  onClick={clearTo}
                  className="text-gray-400 hover:text-red-500 ml-1"
                >
                  ✕
                </button>
              </span>
            </>
          )}
        </div>

        {/* ── State A: City Select ── */}
        {pageState === "CITY_SELECT" && (
          <div className="animate-fadeIn" key="city-select">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Where are you flying from?
            </h2>
            {citiesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-28" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {exploreCities.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => setFromCity(loc.city)}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-sky-300 hover:-translate-y-1 transition-all cursor-pointer p-5 text-center"
                  >
                    <span className="text-3xl block mb-2">
                      {loc.type === "metro" ? "🌆" : "🏙️"}
                    </span>
                    <span className="font-bold text-gray-800 block">
                      {loc.city}
                    </span>
                    <span className="text-xs text-gray-400 mt-1 block">
                      {loc.activeFlights ?? 0} routes from here
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── State B: Route Select ── */}
        {pageState === "ROUTE_SELECT" && (
          <div className="animate-fadeIn" key="route-select">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Flights from {fromCity} to…
            </h2>

            {routesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-200 rounded-2xl h-44"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {routeQueries.map((q) => {
                  const route = q.data as RouteSummary | null | undefined;
                  if (!route) return null;
                  return (
                    <div
                      key={route.destination}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-sky-300 transition-all p-5 cursor-pointer"
                      onClick={() => setToCity(route.destination)}
                    >
                      <p className="font-bold text-gray-800 mb-2">
                        {fromCity}{" "}
                        <span className="text-sky-500">→</span>{" "}
                        {route.destination}
                      </p>
                      <p className="text-sm text-gray-500 mb-1">
                        ✈ {route.airline}
                      </p>
                      <p className="text-lg font-bold text-sky-600 mb-1">
                        From ₹{route.cheapestPrice.toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-gray-400 mb-3">
                        {route.flightCount} flights available
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/search?source=${encodeURIComponent(fromCity)}&destination=${encodeURIComponent(route.destination)}`,
                          );
                        }}
                        className="text-sky-600 hover:text-sky-700 text-sm font-semibold"
                      >
                        View Flights →
                      </button>
                    </div>
                  );
                })}
                {/* If all routes came back null */}
                {routeQueries.every((q) => !q.isLoading && !q.data) && (
                  <p className="text-gray-400 col-span-full text-center py-8">
                    No flights found from {fromCity}.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── State C: Flight List ── */}
        {pageState === "FLIGHT_LIST" && (
          <div className="animate-fadeIn" key="flight-list">
            {/* Route header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  ✈ {fromCity}{" "}
                  <span className="text-sky-500">→</span> {toCity}
                </h2>
                <p className="text-sm text-gray-500">
                  {sortedFlights.length} flights found
                </p>
              </div>
              <button
                onClick={clearTo}
                className="text-sky-600 hover:text-sky-700 text-sm font-semibold"
              >
                ← Change Destination
              </button>
            </div>

            {/* Sort pills */}
            <div className="flex gap-2 mb-6">
              {(
                [
                  ["cheapest", "Cheapest"],
                  ["earliest", "Earliest"],
                  ["fastest", "Fastest"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSortBy(key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    sortBy === key
                      ? "bg-sky-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {flightsLoading ? (
              <div className="flex flex-col gap-3 max-w-4xl">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-200 rounded-2xl h-48"
                  />
                ))}
              </div>
            ) : sortedFlights.length === 0 ? (
              <p className="text-gray-400 text-center py-12">
                No flights found for this route
                {dateFilter ? ` on ${dateFilter}` : ""}.
              </p>
            ) : (
              <div className="flex flex-col gap-3 max-w-4xl">
                {visibleFlights.map((flight) => (
                  <FlightCard key={flight.id} flight={flight} />
                ))}
                {visibleCount < sortedFlights.length && (
                  <button
                    onClick={() => setVisibleCount((c) => c + 10)}
                    className="mx-auto mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl transition"
                  >
                    Load More ({sortedFlights.length - visibleCount} remaining)
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
