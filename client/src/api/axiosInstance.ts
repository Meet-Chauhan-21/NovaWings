// src/api/axiosInstance.ts
// Axios base configuration with JWT interceptor and 401 handler

import axios from "axios";
import Cookies from "js-cookie";

const COOKIE_KEY = "auth_token";

/** Pre-configured Axios instance pointing to the Spring Boot backend */
const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor: attaches JWT token from cookie
 * to every outgoing request's Authorization header.
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get(COOKIE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor: if the server returns 401 Unauthorized,
 * clear cookie and redirect the user to the login page.
 * Auth routes (/auth/login, /auth/register) are excluded so their
 * error responses bubble up to the component catch blocks.
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRoute =
        error.config?.url?.includes("/auth/login") ||
        error.config?.url?.includes("/auth/register");

      if (!isAuthRoute) {
        Cookies.remove(COOKIE_KEY);
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
