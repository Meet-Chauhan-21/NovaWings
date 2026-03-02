// src/components/Navbar.tsx
// Top navigation bar with links, auth state awareness, and responsive hamburger menu

import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { isAdmin } from "../utils/roleHelper";

/**
 * Navbar displays navigation links, login/logout buttons,
 * admin badge only for admins, and a responsive mobile hamburger menu.
 */
export default function Navbar() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const userIsAdmin = isAdmin(user?.role);

  /** Toggle the mobile hamburger menu */
  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);

  /** Handle logout and close menus */
  const handleLogout = useCallback(() => {
    logout();
    setMenuOpen(false);
  }, [logout]);

  /** Navigate and close mobile menu */
  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path);
      setMenuOpen(false);
    },
    [navigate]
  );

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-sky-600 font-bold text-xl">
          ✈ SkyBook
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/explore" className="text-gray-700 hover:text-sky-600 transition font-medium">
            Explore
          </Link>
          <Link to="/search" className="text-gray-700 hover:text-sky-600 transition font-medium">
            Search
          </Link>

          {userIsAdmin && (
            <Link to="/admin" className="text-gray-700 hover:text-sky-600 transition font-medium">
              Dashboard
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-gray-700 font-medium">Hi, {user.name}</span>
              {userIsAdmin && (
                <span className="bg-purple-100 text-purple-700 rounded-full px-3 py-1 text-xs font-medium">
                  Admin
                </span>
              )}
              <Link to="/my-bookings" className="text-gray-700 hover:text-sky-600 transition font-medium">
                My Bookings
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition hover:scale-105 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sky-600 hover:text-sky-700 transition font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-sky-500 text-white px-4 py-2 rounded-xl hover:bg-sky-600 transition hover:scale-105 text-sm font-medium"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button onClick={toggleMenu} className="md:hidden text-gray-700 p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 pb-4 space-y-2">
          <button onClick={() => handleNavigate("/explore")} className="block w-full text-left py-2 text-gray-700 hover:text-sky-600">
            Explore
          </button>
          <button onClick={() => handleNavigate("/search")} className="block w-full text-left py-2 text-gray-700 hover:text-sky-600">
            Search
          </button>
          {user ? (
            <>
              {userIsAdmin && (
                <button onClick={() => handleNavigate("/admin")} className="block w-full text-left py-2 text-gray-700 hover:text-sky-600">
                  Dashboard
                </button>
              )}
              <button onClick={() => handleNavigate("/my-bookings")} className="block w-full text-left py-2 text-gray-700 hover:text-sky-600">
                My Bookings
              </button>
              <div className="flex items-center gap-2 py-2">
                <span className="text-gray-700 font-medium">{user.name}</span>
                {userIsAdmin && (
                  <span className="bg-purple-100 text-purple-700 rounded-full px-3 py-1 text-xs font-medium">
                    Admin
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition text-sm font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => handleNavigate("/login")} className="block w-full text-left py-2 text-sky-600 font-medium">
                Login
              </button>
              <button onClick={() => handleNavigate("/register")} className="block w-full text-left py-2 text-sky-600 font-medium">
                Register
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
