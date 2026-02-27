// src/services/bookingService.ts
// Service for all booking-related API calls

import axiosInstance from "../api/axiosInstance";
import type { BookingResponse, BookingFormValues } from "../types";

/**
 * Creates a new booking (USER/ADMIN, requires auth).
 * @param data - flightId and numberOfSeats
 * @returns BookingResponse with booking details
 */
export async function createBooking(data: BookingFormValues): Promise<BookingResponse> {
  const response = await axiosInstance.post<BookingResponse>("/bookings", data);
  return response.data;
}

/**
 * Fetches all bookings for the currently authenticated user.
 * @returns Array of BookingResponse
 */
export async function getMyBookings(): Promise<BookingResponse[]> {
  const response = await axiosInstance.get<BookingResponse[]>("/bookings/my");
  return response.data;
}

/**
 * Fetches a single booking by its ID.
 * @param id - Booking ID
 * @returns BookingResponse
 */
export async function getBookingById(id: string): Promise<BookingResponse> {
  const response = await axiosInstance.get<BookingResponse>(`/bookings/${id}`);
  return response.data;
}

/**
 * Cancels a booking by its ID.
 * @param id - Booking ID
 * @returns Updated BookingResponse with CANCELLED status
 */
export async function cancelBooking(id: string): Promise<BookingResponse> {
  const response = await axiosInstance.patch<BookingResponse>(`/bookings/${id}/cancel`);
  return response.data;
}

/**
 * Fetches all bookings across all users (ADMIN only).
 * @returns Array of BookingResponse
 */
export async function getAllBookings(): Promise<BookingResponse[]> {
  const response = await axiosInstance.get<BookingResponse[]>("/bookings/all");
  return response.data;
}

/**
 * Updates a booking's status (ADMIN only).
 * @param id - Booking ID
 * @param status - New status: "CONFIRMED" or "CANCELLED"
 * @returns Updated BookingResponse
 */
export async function updateBookingStatus(
  id: string,
  status: "CONFIRMED" | "CANCELLED"
): Promise<BookingResponse> {
  const response = await axiosInstance.patch<BookingResponse>(
    `/bookings/${id}/status`,
    { status }
  );
  return response.data;
}
