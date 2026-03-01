// src/services/flightService.ts
// Service for all flight-related API calls

import axiosInstance from "../api/axiosInstance";
import type { Flight, FlightFormValues, PageResponse } from "../types";

/**
 * Fetches all available flights (public).
 * @returns Array of Flight objects
 */
export async function getAllFlights(): Promise<Flight[]> {
  const response = await axiosInstance.get<Flight[]>("/flights");
  return response.data;
}

/**
 * Fetches a single flight by its ID (public).
 * @param id - Flight ID
 * @returns Flight object
 */
export async function getFlightById(id: string): Promise<Flight> {
  const response = await axiosInstance.get<Flight>(`/flights/${id}`);
  return response.data;
}

/**
 * Searches flights by source and destination (public).
 * @param source - Departure city
 * @param destination - Arrival city
 * @returns Array of matching Flight objects
 */
export async function searchFlights(source: string, destination: string): Promise<Flight[]> {
  const response = await axiosInstance.get<Flight[]>("/flights/search", {
    params: { source, destination },
  });
  return response.data;
}

/**
 * Creates a new flight (ADMIN only).
 * @param data - Flight form values
 * @returns The created Flight
 */
export async function createFlight(data: FlightFormValues): Promise<Flight> {
  const response = await axiosInstance.post<Flight>("/flights", data);
  return response.data;
}

/**
 * Updates an existing flight (ADMIN only).
 * @param id - Flight ID
 * @param data - Updated flight form values
 * @returns The updated Flight
 */
export async function updateFlight(id: string, data: FlightFormValues): Promise<Flight> {
  const response = await axiosInstance.put<Flight>(`/flights/${id}`, data);
  return response.data;
}

/**
 * Deletes a flight by ID (ADMIN only).
 * @param id - Flight ID
 */
export async function deleteFlight(id: string): Promise<void> {
  await axiosInstance.delete(`/flights/${id}`);
}

/**
 * Admin search: server-side paginated, filtered, searchable flights.
 * @param params - Search parameters
 * @returns Page of Flight objects
 */
export async function searchAdmin(params: {
  q?: string;
  source?: string;
  destination?: string;
  airline?: string;
  page?: number;
  size?: number;
}): Promise<PageResponse<Flight>> {
  const response = await axiosInstance.get<PageResponse<Flight>>("/flights/search-admin", {
    params,
  });
  return response.data;
}
