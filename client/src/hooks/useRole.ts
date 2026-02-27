// src/hooks/useRole.ts
// Hook to check the current user's role (ADMIN or USER)

import { useAuthContext } from "../context/AuthContext";

/**
 * Returns helper booleans for role-based rendering.
 * isAdmin is true when the logged-in user has the ADMIN role.
 * isUser is true when the logged-in user has the USER role.
 */
export function useRole() {
  const { user } = useAuthContext();
  return {
    isAdmin: user?.role === "ADMIN",
    isUser: user?.role === "USER",
    role: user?.role ?? null,
  };
}
