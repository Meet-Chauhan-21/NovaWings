// src/components/Navbar.tsx
// Top navigation bar with links, auth state awareness, theme toggle, and responsive drawer

import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useThemeContext } from "../context/ThemeContext";
import { isAdmin } from "../utils/roleHelper";
import { useTheme } from "@mui/material/styles";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";

import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import FlightIcon from "@mui/icons-material/Flight";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";

// ── Nav links ────────────────────────────
const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Explore", path: "/explore" },
  { label: "Flights", path: "/search" },
  { label: "Contact", path: "/contact" },
];

export default function Navbar() {
  const { user, logout } = useAuthContext();
  const { mode, toggleTheme } = useThemeContext();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const userIsAdmin = isAdmin(user?.role);
  const isDark = mode === "dark";

  // ── Mobile drawer ────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = useCallback(() => setDrawerOpen((p) => !p), []);

  // ── Avatar menu ──────────────────────────
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const openMenu = useCallback((e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget), []);
  const closeMenu = useCallback(() => setAnchorEl(null), []);

  // ── Scroll detection ─────────────────────
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Handlers ─────────────────────────────
  const handleLogout = useCallback(() => {
    closeMenu();
    setDrawerOpen(false);
    logout();
  }, [logout, closeMenu]);

  const handleNavigate = useCallback(
    (path: string) => {
      closeMenu();
      setDrawerOpen(false);
      navigate(path);
    },
    [navigate, closeMenu]
  );

  const isActive = (path: string) => location.pathname === path;

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "U";

  // ── Theme-aware colors ───────────────────
  const navBg = scrolled
    ? isDark ? "rgba(10,10,10,0.95)" : "rgba(255,255,255,0.95)"
    : isDark ? "rgba(10,10,10,0.85)" : "rgba(255,255,255,0.85)";
  const borderColor = scrolled
    ? "rgba(249,115,22,0.15)"
    : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const textSecondary = theme.palette.text.secondary;
  const textMuted = isDark ? "#8892A0" : "#7A8290";

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: navBg,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: `1px solid ${borderColor}`,
          height: 70,
          transition: "all 0.3s ease",
        }}
      >
        <Toolbar
          sx={{
            maxWidth: 1280,
            width: "100%",
            mx: "auto",
            height: 70,
            px: { xs: 2, md: 3 },
          }}
        >
          {/* ── Logo ──────────────────────────── */}
          <Box
            onClick={() => navigate("/")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              cursor: "pointer",
              mr: { md: 6 },
            }}
          >
            <FlightTakeoffIcon sx={{ color: "#F97316", fontSize: 30 }} />
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontSize: "1.2rem",
                  lineHeight: 1.1,
                  background: "linear-gradient(135deg, #F97316 0%, #F59E0B 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                NovaWings
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.6rem",
                  color: textMuted,
                  letterSpacing: "0.08em",
                  lineHeight: 1,
                  display: { xs: "none", md: "block" },
                }}
              >
                Fly Smarter
              </Typography>
            </Box>
          </Box>

          {/* ── Center Nav Links (desktop) ─────── */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 4,
              flex: 1,
              justifyContent: "center",
            }}
          >
            {NAV_LINKS.map((link) => (
              <Box
                key={link.label}
                onClick={() => handleNavigate(link.path)}
                sx={{
                  position: "relative",
                  cursor: "pointer",
                  py: 0.5,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: isActive(link.path) ? "#F97316" : textSecondary,
                    fontWeight: isActive(link.path) ? 600 : 400,
                    transition: "color 0.2s ease",
                    "&:hover": { color: "#F97316" },
                  }}
                >
                  {link.label}
                </Typography>
                <Box
                  sx={{
                    position: "absolute",
                    bottom: -2,
                    left: 0,
                    width: isActive(link.path) ? "100%" : "0%",
                    height: 2,
                    background: "linear-gradient(90deg, #F97316, #F59E0B)",
                    borderRadius: 1,
                    transition: "width 0.2s ease",
                  }}
                />
              </Box>
            ))}

            {userIsAdmin && (
              <Box
                onClick={() => handleNavigate("/admin")}
                sx={{ position: "relative", cursor: "pointer", py: 0.5 }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: isActive("/admin") ? "#F97316" : textSecondary,
                    fontWeight: isActive("/admin") ? 600 : 400,
                    transition: "color 0.2s ease",
                    "&:hover": { color: "#F97316" },
                  }}
                >
                  Dashboard
                </Typography>
                <Box
                  sx={{
                    position: "absolute",
                    bottom: -2,
                    left: 0,
                    width: isActive("/admin") ? "100%" : "0%",
                    height: 2,
                    background: "linear-gradient(90deg, #F97316, #F59E0B)",
                    borderRadius: 1,
                    transition: "width 0.2s ease",
                  }}
                />
              </Box>
            )}
          </Box>

          {/* ── Right Side (desktop) ──────────── */}
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
            {/* Theme Toggle */}
            <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              <IconButton
                onClick={toggleTheme}
                sx={{
                  color: textSecondary,
                  width: 40,
                  height: 40,
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                  borderRadius: "10px",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "#F97316",
                    borderColor: "rgba(249,115,22,0.3)",
                    background: "rgba(249,115,22,0.08)",
                  },
                }}
              >
                {isDark ? <LightModeOutlinedIcon sx={{ fontSize: 20 }} /> : <DarkModeOutlinedIcon sx={{ fontSize: 20 }} />}
              </IconButton>
            </Tooltip>

            {!user ? (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate("/login")}
                  sx={{ borderRadius: "10px" }}
                >
                  Sign In
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate("/register")}
                  sx={{ borderRadius: "10px" }}
                >
                  Get Started
                </Button>
              </>
            ) : (
              <>
                {/* Notifications */}
                <IconButton sx={{ color: textSecondary, "&:hover": { color: "#F97316" } }}>
                  <Badge
                    badgeContent={2}
                    sx={{
                      "& .MuiBadge-badge": {
                        background: "linear-gradient(135deg, #F97316, #EA580C)",
                        color: "#fff",
                        fontSize: "0.65rem",
                        minWidth: 18,
                        height: 18,
                      },
                    }}
                  >
                    <NotificationsNoneOutlinedIcon sx={{ fontSize: 22 }} />
                  </Badge>
                </IconButton>

                {/* Avatar */}
                <IconButton onClick={openMenu} sx={{ p: 0.5 }}>
                  <Avatar
                    sx={{
                      width: 38,
                      height: 38,
                      background: "linear-gradient(135deg, #F97316, #EA580C)",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                    }}
                  >
                    {userInitial}
                  </Avatar>
                </IconButton>

                {/* Dropdown Menu */}
                <Menu
                  anchorEl={anchorEl}
                  open={menuOpen}
                  onClose={closeMenu}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  slotProps={{
                    paper: {
                      sx: {
                        background: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: "14px",
                        minWidth: 220,
                        p: 1,
                        mt: 1,
                      },
                    },
                  }}
                >
                  {/* User info header */}
                  <Box sx={{ px: 2, py: 1.2 }}>
                    <Typography sx={{ color: theme.palette.text.primary, fontWeight: 600, fontSize: "0.9rem" }}>
                      {user.name}
                    </Typography>
                    <Typography sx={{ color: textMuted, fontSize: "0.75rem" }}>
                      {user.email}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 0.5 }} />

                  <MenuItem
                    onClick={() => handleNavigate("/profile")}
                    sx={{ borderRadius: "8px" }}
                  >
                    <PersonOutlineIcon sx={{ fontSize: 20, mr: 1.5, color: textSecondary }} />
                    <Typography variant="body2">My Profile</Typography>
                  </MenuItem>

                  <MenuItem
                    onClick={() => handleNavigate("/my-bookings")}
                    sx={{ borderRadius: "8px" }}
                  >
                    <FlightIcon sx={{ fontSize: 20, mr: 1.5, color: textSecondary }} />
                    <Typography variant="body2">My Bookings</Typography>
                  </MenuItem>

                  <MenuItem disabled sx={{ opacity: 0.4, borderRadius: "8px" }}>
                    <SettingsOutlinedIcon sx={{ fontSize: 20, mr: 1.5, color: textSecondary }} />
                    <Typography variant="body2">Settings</Typography>
                  </MenuItem>

                  <Divider sx={{ my: 0.5 }} />

                  <MenuItem onClick={handleLogout} sx={{ borderRadius: "8px" }}>
                    <LogoutIcon sx={{ fontSize: 20, mr: 1.5, color: "#EF4444" }} />
                    <Typography variant="body2" sx={{ color: "#EF4444" }}>
                      Sign Out
                    </Typography>
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>

          {/* ── Mobile Right Side ──────────────── */}
          <Box sx={{ display: { xs: "flex", md: "none" }, ml: "auto", alignItems: "center", gap: 0.5 }}>
            <Tooltip title={isDark ? "Light Mode" : "Dark Mode"}>
              <IconButton
                onClick={toggleTheme}
                sx={{
                  color: textSecondary,
                  width: 36,
                  height: 36,
                }}
              >
                {isDark ? <LightModeOutlinedIcon sx={{ fontSize: 20 }} /> : <DarkModeOutlinedIcon sx={{ fontSize: 20 }} />}
              </IconButton>
            </Tooltip>
            <IconButton onClick={toggleDrawer} sx={{ color: textSecondary }}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Spacer to push content below fixed AppBar */}
      <Box sx={{ height: 70 }} />

      {/* ── Mobile Drawer ─────────────────── */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        PaperProps={{
          sx: {
            width: 280,
            background: theme.palette.background.default,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        {/* Drawer Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <FlightTakeoffIcon sx={{ color: "#F97316", fontSize: 26 }} />
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "1.1rem",
                background: "linear-gradient(135deg, #F97316 0%, #F59E0B 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              NovaWings
            </Typography>
          </Box>
          <IconButton onClick={toggleDrawer} sx={{ color: textMuted }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider />

        {/* Nav Links */}
        <List sx={{ px: 1.5, py: 1 }}>
          {NAV_LINKS.map((link) => (
            <ListItemButton
              key={link.label}
              onClick={() => handleNavigate(link.path)}
              sx={{
                borderRadius: "10px",
                mb: 0.5,
                color: isActive(link.path) ? "#F97316" : textSecondary,
                "&:hover": { background: "rgba(249,115,22,0.08)" },
              }}
            >
              <ListItemText
                primary={link.label}
                primaryTypographyProps={{ fontWeight: isActive(link.path) ? 600 : 400, fontSize: "0.9rem" }}
              />
            </ListItemButton>
          ))}

          {userIsAdmin && (
            <ListItemButton
              onClick={() => handleNavigate("/admin")}
              sx={{
                borderRadius: "10px",
                mb: 0.5,
                color: isActive("/admin") ? "#F97316" : textSecondary,
                "&:hover": { background: "rgba(249,115,22,0.08)" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                <DashboardOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Dashboard"
                primaryTypographyProps={{ fontWeight: isActive("/admin") ? 600 : 400, fontSize: "0.9rem" }}
              />
            </ListItemButton>
          )}
        </List>

        <Divider sx={{ mx: 2 }} />

        {/* Auth section */}
        <Box sx={{ p: 2 }}>
          {!user ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => handleNavigate("/login")}
                sx={{ borderRadius: "10px" }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={() => handleNavigate("/register")}
                sx={{ borderRadius: "10px" }}
              >
                Get Started
              </Button>
            </Box>
          ) : (
            <Box>
              {/* User info */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    background: "linear-gradient(135deg, #F97316, #EA580C)",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                  }}
                >
                  {userInitial}
                </Avatar>
                <Box>
                  <Typography sx={{ color: theme.palette.text.primary, fontWeight: 600, fontSize: "0.85rem", lineHeight: 1.2 }}>
                    {user.name}
                  </Typography>
                  <Typography sx={{ color: textMuted, fontSize: "0.7rem" }}>
                    {user.email}
                  </Typography>
                </Box>
              </Box>

              <List sx={{ p: 0 }}>
                <ListItemButton
                  onClick={() => handleNavigate("/profile")}
                  sx={{ borderRadius: "10px", mb: 0.5, color: textSecondary, "&:hover": { background: "rgba(249,115,22,0.08)" } }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                    <PersonOutlineIcon sx={{ fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText primary="My Profile" primaryTypographyProps={{ fontSize: "0.9rem" }} />
                </ListItemButton>

                <ListItemButton
                  onClick={() => handleNavigate("/my-bookings")}
                  sx={{ borderRadius: "10px", mb: 0.5, color: textSecondary, "&:hover": { background: "rgba(249,115,22,0.08)" } }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                    <FlightIcon sx={{ fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText primary="My Bookings" primaryTypographyProps={{ fontSize: "0.9rem" }} />
                </ListItemButton>

                <ListItemButton
                  onClick={handleLogout}
                  sx={{ borderRadius: "10px", color: "#EF4444", "&:hover": { background: "rgba(239,68,68,0.08)" } }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                    <LogoutIcon sx={{ fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText primary="Sign Out" primaryTypographyProps={{ fontSize: "0.9rem" }} />
                </ListItemButton>
              </List>
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
}
