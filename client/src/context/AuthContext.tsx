// src/context/AuthContext.tsx
// Global authentication context — stores JWT in cookie, decodes user info

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { normalizeRole } from "../utils/roleHelper";
import type { AuthResponse, AuthUser } from "../types";

const COOKIE_KEY = "auth_token";

interface AuthContextType {
  user: AuthUser | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Reads persisted JWT from cookie and decodes user info synchronously.
 * Checks token expiration — removes cookie and returns null if expired.
 * Handles base64url padding edge cases.
 * Returns an AuthUser object if a valid, non-expired token exists, otherwise null.
 *
 * This function is the KEY FIX for the page-reload logout bug:
 * it runs synchronously as the useState initializer, so user is
 * NEVER null on page reload if a valid cookie exists.
 */
function readUserFromCookie(): AuthUser | null {
  try {
    const token = Cookies.get(COOKIE_KEY);
    if (!token) return null;

    // Decode JWT payload (middle part between the two dots)
    const base64Payload = token.split(".")[1];
    if (!base64Payload) return null;

    // Fix base64url padding — JWT sometimes strips trailing '=' characters
    const paddedPayload = base64Payload.padEnd(
      base64Payload.length + ((4 - (base64Payload.length % 4)) % 4),
      "="
    );

    const decoded = JSON.parse(atob(paddedPayload));

    // Check if token is expired
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < nowInSeconds) {
      Cookies.remove(COOKIE_KEY);
      return null;
    }

    // Read fields from JWT claims — keys must match backend claims
    const name = decoded.name || decoded.sub || "User";
    const email = decoded.email || decoded.sub || "";
    const role = normalizeRole(decoded.role);

    if (name && email && role) {
      return { token, name, email, role };
    }
    return null;
  } catch (err) {
    console.error("Failed to decode token:", err);
    Cookies.remove(COOKIE_KEY);
    return null;
  }
}

/**
 * AuthProvider wraps the entire app and exposes user state,
 * login (persists JWT to cookie), and logout (clears cookie and navigates).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // Pass function reference to useState — runs once synchronously before first render.
  // On EVERY page load/reload, user is restored from cookie immediately — no flash, no logout.
  const [user, setUser] = useState<AuthUser | null>(readUserFromCookie);
  const navigate = useNavigate();

  /** Persist JWT to cookie and update state after successful login/register */
  const login = useCallback((data: AuthResponse) => {
    // Save token in cookie (secure: false for dev on HTTP; set true in production with HTTPS)
    Cookies.set(COOKIE_KEY, data.token, { expires: 7, secure: false, sameSite: "Strict" });

    // Set user state directly from API response — no need to decode token here
    const normalizedRole = normalizeRole(data.role);

    setUser({
      token: data.token,
      name: data.name,
      email: data.email,
      role: normalizedRole,
    });
  }, []);

  /** Clear cookie and redirect to login */
  const logout = useCallback(() => {
    Cookies.remove(COOKIE_KEY);
    setUser(null);
    navigate("/login");
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to consume the AuthContext.
 * Throws if used outside of an AuthProvider.
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
