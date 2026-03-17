// src/components/Footer.tsx
// Professional theme-aware footer for NovaWings

import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useThemeColors } from "../hooks/useThemeColors";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import MuiLink from "@mui/material/Link";
import Grid from "@mui/material/Grid";

// MUI Icons
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import XIcon from "@mui/icons-material/X";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import AppleIcon from "@mui/icons-material/Apple";
import ShopOutlinedIcon from "@mui/icons-material/ShopOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";

// ── Data ────────────────────────────────────
const QUICK_LINKS = [
  { label: "Home", path: "/" },
  { label: "Search Flights", path: "/search" },
  { label: "Explore", path: "/explore" },
  { label: "My Bookings", path: "/my-bookings" },
  { label: "Register", path: "/register" },
];

const SUPPORT_LINKS = [
  { label: "Help Center" },
  { label: "Terms of Service" },
  { label: "Privacy Policy" },
  { label: "Refund Policy" },
  { label: "Contact Us" },
];

const CONTACT_INFO = [
  {
    icon: <PhoneOutlinedIcon sx={{ fontSize: 16, color: "#F97316" }} />,
    label: "+91 1800-NOVA-FLY",
    sub: "Mon–Sat, 8AM–10PM",
  },
  {
    icon: <EmailOutlinedIcon sx={{ fontSize: 16, color: "#F97316" }} />,
    label: "support@novawings.in",
    sub: "24/7 Support",
  },
  {
    icon: <LocationOnOutlinedIcon sx={{ fontSize: 16, color: "#F97316" }} />,
    label: "Surat, Gujarat, India",
    sub: "",
  },
];

const SOCIAL_ICONS = [
  { icon: <XIcon sx={{ fontSize: 16 }} />, label: "X" },
  { icon: <LinkedInIcon sx={{ fontSize: 16 }} />, label: "LinkedIn" },
  { icon: <InstagramIcon sx={{ fontSize: 16 }} />, label: "Instagram" },
  { icon: <FacebookIcon sx={{ fontSize: 16 }} />, label: "Facebook" },
];

const FOOTER_STATS = [
  { value: "90+", label: "Destinations" },
  { value: "5", label: "Airlines" },
  { value: "100K+", label: "Passengers" },
  { value: "99.9%", label: "Uptime" },
];

const BOTTOM_LINKS = ["Privacy", "Terms", "Sitemap", "Cookies"];

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, footerBg, footerBottom, textPrimary, textMuted, textDisabled, textSecondary, border, socialBg, overlayBg, comingSoonBg, comingSoonBorder } = useThemeColors();

  // Hide footer on admin pages
  if (location.pathname.startsWith("/admin")) return null;

  const headingSx = {
    fontSize: "0.6875rem",
    textTransform: "uppercase" as const,
    color: "#F97316",
    letterSpacing: "0.12em",
    fontWeight: 700,
    mb: 2.5,
  };

  const linkSx = {
    color: textSecondary,
    fontSize: "0.85rem",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    transition: "all 0.2s ease",
    cursor: "pointer",
    py: 0.5,
    "&:hover": {
      color: "#F97316",
      transform: "translateX(4px)",
      textDecoration: "none",
    },
  };

  return (
    <motion.footer
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Box
        component="footer"
        sx={{
          background: footerBg,
          borderTop: `1px solid ${border}`,
        }}
      >
        {/* ── Upper Section ─────────────────── */}
        <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 3, md: 4 }, pt: 8, pb: 6 }}>
          <Grid container spacing={{ xs: 4, md: 5 }}>
            {/* Column 1 — Brand */}
            <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
              {/* Logo */}
              <Box
                onClick={() => navigate("/")}
                sx={{ display: "flex", alignItems: "center", gap: 1.2, cursor: "pointer", mb: 2 }}
              >
                <FlightTakeoffIcon sx={{ color: "#F97316", fontSize: 28 }} />
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "1.2rem",
                    background: "linear-gradient(135deg, #F97316 0%, #F59E0B 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  NovaWings
                </Typography>
              </Box>

              <Typography sx={{ color: "#F97316", fontSize: "0.8rem", fontWeight: 500, mb: 1.5 }}>
                India's smartest flight booking platform
              </Typography>

              <Typography sx={{ color: textMuted, fontSize: "0.85rem", lineHeight: 1.7, mb: 3, maxWidth: 280 }}>
                Smart search, transparent pricing, and instant booking across 90+ Indian cities.
                Your journey starts here.
              </Typography>

              {/* Social icons */}
              <Box sx={{ display: "flex", gap: 1 }}>
                {SOCIAL_ICONS.map((s) => (
                  <IconButton
                    key={s.label}
                    aria-label={s.label}
                    sx={{
                      width: 36,
                      height: 36,
                      background: socialBg,
                      color: textSecondary,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        background: "rgba(249,115,22,0.15)",
                        color: "#F97316",
                        transform: "scale(1.1)",
                      },
                    }}
                  >
                    {s.icon}
                  </IconButton>
                ))}
              </Box>
            </Grid>

            {/* Column 2 — Quick Links */}
            <Grid size={{ xs: 6, sm: 3, md: 2 }}>
              <Typography sx={headingSx}>Quick Links</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
                {QUICK_LINKS.map((link) => (
                  <MuiLink
                    key={link.label}
                    component={RouterLink}
                    to={link.path}
                    sx={linkSx}
                  >
                    <ChevronRightIcon sx={{ fontSize: 14, opacity: 0.5 }} />
                    {link.label}
                  </MuiLink>
                ))}
              </Box>
            </Grid>

            {/* Column 3 — Support */}
            <Grid size={{ xs: 6, sm: 3, md: 2 }}>
              <Typography sx={headingSx}>Support</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
                {SUPPORT_LINKS.map((link) => (
                  <Typography
                    key={link.label}
                    sx={{
                      color: textDisabled,
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      py: 0.5,
                      cursor: "default",
                    }}
                  >
                    <ChevronRightIcon sx={{ fontSize: 14, opacity: 0.3 }} />
                    {link.label}
                  </Typography>
                ))}
              </Box>
            </Grid>

            {/* Column 4 — Contact */}
            <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
              <Typography sx={headingSx}>Contact</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {CONTACT_INFO.map((item) => (
                  <Box key={item.label} sx={{ display: "flex", gap: 1.2, alignItems: "flex-start" }}>
                    <Box sx={{ mt: 0.3 }}>{item.icon}</Box>
                    <Box>
                      <Typography sx={{ color: textPrimary, fontSize: "0.875rem" }}>
                        {item.label}
                      </Typography>
                      {item.sub && (
                        <Typography sx={{ color: textMuted, fontSize: "0.75rem" }}>
                          {item.sub}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>

            {/* Column 5 — Download App */}
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Typography sx={headingSx}>NovaWings App</Typography>
              <Typography sx={{ color: textMuted, fontSize: "0.8rem", mb: 2 }}>
                Coming soon on iOS and Android
              </Typography>

              {/* App Store buttons */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                {[
                  { icon: <AppleIcon sx={{ fontSize: 20 }} />, store: "App Store" },
                  { icon: <ShopOutlinedIcon sx={{ fontSize: 20 }} />, store: "Google Play" },
                ].map((app) => (
                  <Box
                    key={app.store}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.2,
                      background: comingSoonBg,
                      border: `1px solid ${comingSoonBorder}`,
                      borderRadius: "10px",
                      px: 2,
                      py: 1.2,
                      width: 150,
                      cursor: "default",
                      position: "relative",
                      overflow: "hidden",
                      "&:hover .coming-soon-overlay": { opacity: 1 },
                    }}
                  >
                    <Box sx={{ color: textSecondary }}>{app.icon}</Box>
                    <Box>
                      <Typography sx={{ color: textMuted, fontSize: "0.55rem", lineHeight: 1 }}>
                        GET IT ON
                      </Typography>
                      <Typography sx={{ color: textPrimary, fontSize: "0.75rem", fontWeight: 600, lineHeight: 1.2 }}>
                        {app.store}
                      </Typography>
                    </Box>
                    {/* Coming soon overlay */}
                    <Box
                      className="coming-soon-overlay"
                      sx={{
                        position: "absolute",
                        inset: 0,
                        background: overlayBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0,
                        transition: "opacity 0.2s ease",
                        borderRadius: "10px",
                      }}
                    >
                      <Typography sx={{ color: "#F97316", fontSize: "0.7rem", fontWeight: 600 }}>
                        Coming Soon
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* ── Middle Section — Stats Ribbon ──── */}
        <Divider sx={{ borderColor: border }} />
        <Box
          sx={{
            background: "rgba(249,115,22,0.03)",
            py: 3.5,
          }}
        >
          <Box
            sx={{
              maxWidth: 1280,
              mx: "auto",
              px: { xs: 3, md: 4 },
              display: "flex",
              justifyContent: "center",
              gap: { xs: 4, md: 10 },
              flexWrap: "wrap",
            }}
          >
            {FOOTER_STATS.map((stat) => (
              <Box key={stat.label} sx={{ textAlign: "center" }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "1.3rem", md: "1.5rem" },
                    background: "linear-gradient(135deg, #F97316, #F59E0B)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    lineHeight: 1.2,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography sx={{ color: textMuted, fontSize: "0.75rem", fontWeight: 500 }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <Divider sx={{ borderColor: border }} />

        {/* ── Lower Section — Bottom Bar ────── */}
        <Box
          sx={{
            background: footerBottom,
            py: 2.5,
          }}
        >
          <Box
            sx={{
              maxWidth: 1280,
              mx: "auto",
              px: { xs: 3, md: 4 },
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.5,
            }}
          >
            {/* Left */}
            <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
              <Typography sx={{ color: textDisabled, fontSize: "0.75rem" }}>
                &copy; 2025 NovaWings. All rights reserved.
              </Typography>
              <Typography sx={{ color: textDisabled, fontSize: "0.7rem", display: "flex", alignItems: "center", gap: 0.5, justifyContent: { xs: "center", md: "flex-start" } }}>
                Made with <FavoriteIcon sx={{ fontSize: 12, color: "#EF4444" }} /> in India
              </Typography>
            </Box>

            {/* Right — links */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {BOTTOM_LINKS.map((link, idx) => (
                <Box key={link} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {idx > 0 && (
                    <Typography sx={{ color: isDark ? "#2a2a2a" : "#D1D5DB", fontSize: "0.75rem" }}>|</Typography>
                  )}
                  <MuiLink
                    sx={{
                      color: textDisabled,
                      fontSize: "0.75rem",
                      textDecoration: "none",
                      cursor: "pointer",
                      transition: "color 0.2s ease",
                      "&:hover": { color: "#F97316", textDecoration: "none" },
                    }}
                  >
                    {link}
                  </MuiLink>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </motion.footer>
  );
}
