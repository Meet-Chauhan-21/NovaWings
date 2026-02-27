// src/services/authService.ts
// Service for authentication API calls (login and register)

import axiosInstance from "../api/axiosInstance";
import type { AuthResponse, LoginFormValues, RegisterFormValues } from "../types";

/**
 * Registers a new user account.
 * @param data - name, email, password
 * @returns AuthResponse with token and user info
 */
export async function registerUser(data: RegisterFormValues): Promise<AuthResponse> {
  const response = await axiosInstance.post<AuthResponse>("/auth/register", data);
  return response.data;
}

/**
 * Logs in an existing user.
 * @param data - email, password
 * @returns AuthResponse with token and user info
 */
export async function loginUser(data: LoginFormValues): Promise<AuthResponse> {
  const response = await axiosInstance.post<AuthResponse>("/auth/login", data);
  return response.data;
}
