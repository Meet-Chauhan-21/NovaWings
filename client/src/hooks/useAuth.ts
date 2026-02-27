// src/hooks/useAuth.ts
// Hook to retrieve the current authenticated user from cookie + JWT decode

import Cookies from "js-cookie";
import type { AuthUser } from "../types";

const COOKIE_KEY = "auth_token";

/**
 * Reads JWT from cookie and decodes user info.
 * Useful for quick checks outside of React component tree.
 * For reactive state, prefer useAuthContext() instead.
 */
export function useAuth(): AuthUser | null {
  const token = Cookies.get(COOKIE_KEY);
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    const { name, email, role } = decoded;
    if (name && email && role) {
      return { token, name, email, role };
    }
    return null;
  } catch {
    return null;
  }
}
