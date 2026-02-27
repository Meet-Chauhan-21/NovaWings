// src/components/AdminRoute.tsx
// Redirects non-admin users away from admin-only pages

import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { isAdmin } from "../utils/roleHelper";

/**
 * AdminRoute reads user from AuthContext and checks for ADMIN role.
 * Redirects to /login if not authenticated, or to / if not admin.
 */
export default function AdminRoute() {
  const { user } = useAuthContext();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
