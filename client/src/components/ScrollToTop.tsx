// src/components/ScrollToTop.tsx
// Resets scroll on every route change + shows a FAB "back to top" button

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import Fab from "@mui/material/Fab";
import Zoom from "@mui/material/Zoom";
import Tooltip from "@mui/material/Tooltip";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

/**
 * ScrollToTop has two responsibilities:
 *  1. Scrolls window to (0, 0) on every route change via useLocation.
 *  2. Renders a floating "Back to Top" FAB that appears after scrolling
 *     more than 400 px and smoothly scrolls back to top on click.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  // ── Scroll to top on route change ──────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  // ── Show / hide FAB based on scroll position ────────────
  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Zoom in={visible} unmountOnExit>
      <Tooltip title="Back to top" placement="left">
        <Fab
          size="small"
          onClick={handleClick}
          aria-label="scroll back to top"
          sx={{
            position: "fixed",
            bottom: 28,
            right: 24,
            zIndex: 1200,
            background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
            color: "#fff",
            boxShadow: "0 4px 16px rgba(249,115,22,0.45)",
            "&:hover": {
              background: "linear-gradient(135deg, #FB923C 0%, #F97316 100%)",
              boxShadow: "0 6px 22px rgba(249,115,22,0.6)",
              transform: "translateY(-2px)",
            },
            transition: "all 0.2s ease",
          }}
        >
          <KeyboardArrowUpIcon fontSize="small" />
        </Fab>
      </Tooltip>
    </Zoom>
  );
}
