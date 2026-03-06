// src/utils/airportHelper.ts
// Helper utilities for airport codes, airline codes, and airline brand colors

const AIRPORT_CODES: Record<string, string> = {
  Mumbai: "BOM",
  Delhi: "DEL",
  "New Delhi": "DEL",
  Bengaluru: "BLR",
  Bangalore: "BLR",
  Chennai: "MAA",
  Kolkata: "CCU",
  Hyderabad: "HYD",
  Ahmedabad: "AMD",
  Pune: "PNQ",
  Kochi: "COK",
  Goa: "GOI",
  Jaipur: "JAI",
  Lucknow: "LKO",
  Srinagar: "SXR",
  Varanasi: "VNS",
  Agra: "AGR",
  Chandigarh: "IXC",
  Guwahati: "GAU",
  "Port Blair": "IXZ",
  Leh: "IXL",
  Patna: "PAT",
  Bhopal: "BHO",
  Indore: "IDR",
  Nagpur: "NAG",
  Coimbatore: "CJB",
  Thiruvananthapuram: "TRV",
  Visakhapatnam: "VTZ",
  Ranchi: "IXR",
  Udaipur: "UDR",
  Dehradun: "DED",
  Amritsar: "ATQ",
  Mangalore: "IXE",
  Madurai: "IXM",
  Raipur: "RPR",
  Bhubaneswar: "BBI",
};

const AIRLINE_CODES: Record<string, string> = {
  IndiGo: "6E",
  "Air India": "AI",
  Vistara: "UK",
  SpiceJet: "SG",
  "Akasa Air": "QP",
  "Air India Express": "IX",
  "Alliance Air": "9I",
  "Star Air": "OG",
};

const AIRLINE_COLORS: Record<string, string> = {
  IndiGo: "#0066CC",
  "Air India": "#E31837",
  Vistara: "#4B2683",
  SpiceJet: "#D2282E",
  "Akasa Air": "#E87722",
  "Air India Express": "#E31837",
};

export function getAirportCode(city: string): string {
  if (!city) return "---";
  return AIRPORT_CODES[city] || city.substring(0, 3).toUpperCase();
}

export function getAirlineCode(airline: string): string {
  if (!airline) return "XX";
  return AIRLINE_CODES[airline] || "XX";
}

export function getAirlineColor(airline: string): string {
  if (!airline) return "#0ea5e9";
  return AIRLINE_COLORS[airline] || "#0ea5e9";
}
