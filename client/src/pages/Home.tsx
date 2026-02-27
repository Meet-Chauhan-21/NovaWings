// src/pages/Home.tsx
// Landing page with hero section, flight search form, and features section

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Home page displays a hero banner, a search form to find flights
 * by source and destination, and three feature highlight cards.
 */
export default function Home() {
  const navigate = useNavigate();
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");

  /** Navigate to search results with query params */
  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (source.trim() && destination.trim()) {
        navigate(`/search?source=${encodeURIComponent(source.trim())}&destination=${encodeURIComponent(destination.trim())}`);
      }
    },
    [source, destination, navigate]
  );

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sky-500 to-sky-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Flight</h1>
          <p className="text-lg md:text-xl text-sky-100 mb-10">
            Search, compare, and book flights at the best prices with NovaWings.
          </p>

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-4 max-w-3xl mx-auto"
          >
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1 text-left">From</label>
              <input
                type="text"
                placeholder="Source city"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1 text-left">To</label>
              <input
                type="text"
                placeholder="Destination city"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-sky-500 text-white px-8 py-3 rounded-xl hover:bg-sky-600 transition hover:scale-105 font-medium mt-4 md:mt-6 w-full md:w-auto"
            >
              Search Flights
            </button>
          </form>
        </div>
      </section>

      {/* Features Section */}
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

/** Feature highlight card shown on the home page */
function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-8 text-center">
      <span className="text-4xl mb-4 block">{icon}</span>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  );
}
