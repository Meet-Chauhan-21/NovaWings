// src/components/ProtectedRoute.tsx
// Redirects unauthenticated users to the login page

import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

/**
 * ProtectedRoute reads user from AuthContext.
 * If not authenticated, redirects to /login; otherwise renders child routes.
 */
export default function ProtectedRoute() {
  const { user } = useAuthContext();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
