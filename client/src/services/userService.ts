// src/services/userService.ts
// Service for user-related API calls (admin only)

import axiosInstance from "../api/axiosInstance";
import type { UserResponse } from "../types";

/**
 * Fetches all registered users (ADMIN only).
 * @returns Array of UserResponse (id, name, email, role)
 */
export async function getAllUsers(): Promise<UserResponse[]> {
  const response = await axiosInstance.get<UserResponse[]>("/users/all");
  return response.data;
}
