// src/types/index.ts
// All TypeScript interfaces for the NovaWings Flight Booking System

/** Response returned from login/register endpoints */
export interface AuthResponse {
  token: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  message: string;
}

/** Represents the currently authenticated user stored in context */
export interface AuthUser {
  token: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

/** Flight entity returned from the API */
export interface Flight {
  id: string;
  flightNumber: string;
  airlineName: string;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
}

/** Booking response returned from the API */
export interface BookingResponse {
  id: string;
  userId: string;
  flightId: string;
  flightNumber: string;
  airlineName: string;
  source: string;
  destination: string;
  numberOfSeats: number;
  totalPrice: number;
  status: "CONFIRMED" | "CANCELLED";
  bookingDate: string;
}

/** Form values for the login form */
export interface LoginFormValues {
  email: string;
  password: string;
}

/** Form values for the register form */
export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
}

/** Form values for add/edit flight forms */
export interface FlightFormValues {
  flightNumber: string;
  airlineName: string;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
}

/** Form values for the booking form */
export interface BookingFormValues {
  flightId: string;
  numberOfSeats: number;
}

/** User info returned from admin GET /users/all endpoint */
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

/** Route configuration for homepage sections */
export interface RouteConfig {
  source: string;
  destination: string;
  label?: string;
  active: boolean;
}

/** Homepage configuration managed by admin */
export interface HomeConfig {
  id?: string;
  popularRoutes: RouteConfig[];
  dealRoutes: RouteConfig[];
  heroTitle: string;
  heroSubtitle: string;
  updatedAt?: string;
  updatedBy?: string;
}

/** Location entity returned from the API */
export interface Location {
  id: string;
  city: string;
  state: string;
  country: string;
  airportCode: string;
  airportName: string;
  type: "metro" | "city" | "town";
  active: boolean;
  displayOrder: number;
  showOnExplore: boolean;
  showOnHome: boolean;
  totalFlights: number;
  activeFlights: number;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

/** Spring Page response wrapper */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

/** Destination card for homepage */
export interface DestinationCard {
  id: string;
  title: string;
  destination: string;
  state: string;
  tagline: string;
  description: string;
  imageUrl: string;
  category: string;
  badge: string;
  active: boolean;
  featured: boolean;
  displayOrder: number;
  updatedAt?: string;
  updatedBy?: string;
}
