// src/utils/roleHelper.ts
// Helper functions for role normalization and checks

/**
 * Check if a role is admin.
 * Handles both "ADMIN" and "ROLE_ADMIN" formats from JWT.
 */
export function isAdmin(role: string | undefined): boolean {
  return role === "ADMIN" || role === "ROLE_ADMIN";
}

/**
 * Normalize role to standard format.
 * Converts "ROLE_ADMIN" → "ADMIN", "ROLE_USER" → "USER", etc.
 */
export function normalizeRole(role: string | undefined): "ADMIN" | "USER" {
  if (role === "ADMIN" || role === "ROLE_ADMIN") return "ADMIN";
  return "USER";
}
