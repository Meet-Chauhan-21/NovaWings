// src/pages/Profile.tsx
// Professional user profile page with settings and account management

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthContext } from "../context/AuthContext";
import { useThemeColors } from "../hooks/useThemeColors";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Switch from "@mui/material/Switch";
import LinearProgress from "@mui/material/LinearProgress";

import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import VerifiedIcon from "@mui/icons-material/Verified";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";

import type { BookingResponse } from "../types";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <AnimatePresence mode="wait">
      {value === index && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Profile() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const { isDark, theme } = useThemeColors();

  const [activeTab, setActiveTab] = useState(0);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const res = await axiosInstance.get<BookingResponse[]>("/bookings/my");
      setBookings(res.data);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "U";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <Box sx={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography>Please log in to view your profile.</Typography>
      </Box>
    );
  }

  const cardBg = isDark ? "rgba(18, 18, 18, 0.9)" : "rgba(255, 255, 255, 0.95)";
  const cardBgSecondary = isDark ? "rgba(25, 25, 25, 0.8)" : "rgba(250, 250, 250, 0.9)";
  const borderColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const textMuted = isDark ? "#71717A" : "#71717A";
  const hoverBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";

  // Stats calculations
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED").length;
  const totalSpent = bookings
    .filter((b) => b.status === "CONFIRMED")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const stats = [
    {
      icon: <ConfirmationNumberOutlinedIcon sx={{ fontSize: 22 }} />,
      label: "Total Bookings",
      value: totalBookings.toString(),
      color: "#F97316",
    },
    {
      icon: <FlightTakeoffIcon sx={{ fontSize: 22 }} />,
      label: "Completed Trips",
      value: confirmedBookings.toString(),
      color: "#10B981",
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 22 }} />,
      label: "Total Spent",
      value: `₹${totalSpent.toLocaleString("en-IN")}`,
      color: "#8B5CF6",
    },
  ];


  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 70px)",
        background: isDark
          ? "linear-gradient(180deg, rgba(249,115,22,0.03) 0%, transparent 30%)"
          : "linear-gradient(180deg, rgba(249,115,22,0.04) 0%, transparent 30%)",
        py: { xs: 3, md: 5 },
        px: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Grid container spacing={3}>
          {/* Left Sidebar - Profile Card */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Profile Header Card */}
              <Card
                sx={{
                  background: cardBg,
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${borderColor}`,
                  borderRadius: "24px",
                  overflow: "hidden",
                  mb: 3,
                }}
              >
                {/* Gradient Banner */}
                <Box
                  sx={{
                    height: 100,
                    background: "linear-gradient(135deg, #F97316 0%, #EA580C 50%, #DC2626 100%)",
                    position: "relative",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      inset: 0,
                      background: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                      opacity: 0.5,
                    },
                  }}
                />

                <Box sx={{ px: 3, pb: 3, textAlign: "center", mt: -6 }}>
                  {/* Avatar */}
                  <Avatar
                    sx={{
                      width: 96,
                      height: 96,
                      background: "linear-gradient(135deg, #F97316, #EA580C)",
                      fontSize: "2.2rem",
                      fontWeight: 700,
                      border: `4px solid ${isDark ? "#121212" : "#fff"}`,
                      boxShadow: "0 8px 32px rgba(249,115,22,0.35)",
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    {userInitial}
                  </Avatar>

                  {/* Name & Badge */}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 0.5 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "1.35rem",
                        color: theme.palette.text.primary,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {user.name}
                    </Typography>
                    <VerifiedIcon sx={{ fontSize: 20, color: "#F97316" }} />
                  </Box>

                  {/* Email */}
                  <Typography sx={{ color: textMuted, fontSize: "0.875rem", mb: 2 }}>
                    {user.email}
                  </Typography>

                  {/* Role Badge */}
                  <Chip
                    icon={
                      user.role === "ADMIN" ? (
                        <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 16 }} />
                      ) : (
                        <ShieldOutlinedIcon sx={{ fontSize: 16 }} />
                      )
                    }
                    label={user.role === "ADMIN" ? "Administrator" : "Verified Member"}
                    size="small"
                    sx={{
                      background: user.role === "ADMIN"
                        ? "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(234,88,12,0.15))"
                        : isDark
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.04)",
                      color: user.role === "ADMIN" ? "#F97316" : textMuted,
                      border: `1px solid ${user.role === "ADMIN" ? "rgba(249,115,22,0.25)" : borderColor}`,
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      height: 28,
                      "& .MuiChip-icon": {
                        color: "inherit",
                      },
                    }}
                  />

                  {/* Profile Completion */}
                  <Box sx={{ mt: 3, px: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography sx={{ fontSize: "0.75rem", color: textMuted, fontWeight: 500 }}>
                        Profile Completion
                      </Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: "#F97316", fontWeight: 600 }}>
                        85%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={85}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 3,
                          background: "linear-gradient(90deg, #F97316, #F59E0B)",
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Card>

              {/* Stats Cards */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                  >
                    <Card
                      sx={{
                        background: cardBg,
                        backdropFilter: "blur(20px)",
                        border: `1px solid ${borderColor}`,
                        borderRadius: "16px",
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: "12px",
                          background: `${stat.color}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: stat.color,
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: textMuted, fontSize: "0.75rem", fontWeight: 500 }}>
                          {stat.label}
                        </Typography>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: "1.1rem",
                            color: theme.palette.text.primary,
                          }}
                        >
                          {loading ? "..." : stat.value}
                        </Typography>
                      </Box>
                    </Card>
                  </motion.div>
                ))}
              </Box>

              {/* Quick Actions */}
              <Card
                sx={{
                  background: cardBg,
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${borderColor}`,
                  borderRadius: "20px",
                  p: 2,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    px: 1,
                    mb: 1.5,
                  }}
                >
                  Quick Actions
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  <Button
                    fullWidth
                    startIcon={<FlightTakeoffIcon />}
                    onClick={() => navigate("/my-bookings")}
                    sx={{
                      justifyContent: "flex-start",
                      borderRadius: "12px",
                      textTransform: "none",
                      color: theme.palette.text.primary,
                      fontWeight: 500,
                      py: 1.25,
                      px: 2,
                      "&:hover": { background: hoverBg },
                    }}
                  >
                    View My Bookings
                  </Button>
                  {user.role === "ADMIN" && (
                    <Button
                      fullWidth
                      startIcon={<AdminPanelSettingsOutlinedIcon />}
                      onClick={() => navigate("/admin")}
                      sx={{
                        justifyContent: "flex-start",
                        borderRadius: "12px",
                        textTransform: "none",
                        color: "#F97316",
                        fontWeight: 500,
                        py: 1.25,
                        px: 2,
                        "&:hover": { background: "rgba(249,115,22,0.08)" },
                      }}
                    >
                      Admin Dashboard
                    </Button>
                  )}
                  <Button
                    fullWidth
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{
                      justifyContent: "flex-start",
                      borderRadius: "12px",
                      textTransform: "none",
                      color: "#EF4444",
                      fontWeight: 500,
                      py: 1.25,
                      px: 2,
                      "&:hover": { background: "rgba(239,68,68,0.08)" },
                    }}
                  >
                    Sign Out
                  </Button>
                </Box>
              </Card>
            </motion.div>
          </Grid>

          {/* Right Content - Settings */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card
                sx={{
                  background: cardBg,
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${borderColor}`,
                  borderRadius: "24px",
                  overflow: "hidden",
                }}
              >
                {/* Tabs */}
                <Box sx={{ borderBottom: `1px solid ${borderColor}` }}>
                  <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      px: 2,
                      "& .MuiTab-root": {
                        textTransform: "none",
                        fontWeight: 500,
                        fontSize: "0.9rem",
                        minHeight: 56,
                        color: textMuted,
                        "&.Mui-selected": {
                          color: "#F97316",
                        },
                      },
                      "& .MuiTabs-indicator": {
                        backgroundColor: "#F97316",
                        height: 3,
                        borderRadius: "3px 3px 0 0",
                      },
                    }}
                  >
                    <Tab icon={<PersonOutlineIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Personal" />
                    <Tab icon={<SecurityOutlinedIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Security" />
                    <Tab icon={<NotificationsOutlinedIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Notifications" />
                    <Tab icon={<SettingsOutlinedIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Preferences" />
                  </Tabs>
                </Box>

                {/* Tab Content */}
                <Box sx={{ p: { xs: 2, md: 4 } }}>
                  {/* Personal Information Tab */}
                  <TabPanel value={activeTab} index={0}>
                    <Typography sx={{ fontWeight: 700, fontSize: "1.25rem", mb: 0.5, color: theme.palette.text.primary }}>
                      Personal Information
                    </Typography>
                    <Typography sx={{ color: textMuted, fontSize: "0.875rem", mb: 4 }}>
                      Manage your personal details and contact information
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      {/* Info Row */}
                      {[
                        { icon: <PersonOutlineIcon />, label: "Full Name", value: user.name },
                        { icon: <EmailOutlinedIcon />, label: "Email Address", value: user.email, verified: true },
                        { icon: <BadgeOutlinedIcon />, label: "Account Type", value: user.role === "ADMIN" ? "Administrator" : "Standard User" },
                        { icon: <CalendarTodayOutlinedIcon />, label: "Member Since", value: "January 2024" },
                      ].map((item) => (
                        <Box
                          key={item.label}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            p: 2,
                            borderRadius: "14px",
                            background: cardBgSecondary,
                            border: `1px solid ${borderColor}`,
                          }}
                        >
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: "12px",
                              background: "rgba(249,115,22,0.1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#F97316",
                            }}
                          >
                            {item.icon}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ color: textMuted, fontSize: "0.75rem", fontWeight: 500 }}>
                              {item.label}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                                {item.value}
                              </Typography>
                              {item.verified && (
                                <Chip
                                  icon={<CheckCircleOutlineIcon sx={{ fontSize: 14 }} />}
                                  label="Verified"
                                  size="small"
                                  sx={{
                                    height: 22,
                                    fontSize: "0.65rem",
                                    fontWeight: 600,
                                    background: "rgba(16,185,129,0.1)",
                                    color: "#10B981",
                                    border: "1px solid rgba(16,185,129,0.2)",
                                    "& .MuiChip-icon": { color: "#10B981" },
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                          <IconButton
                            size="small"
                            sx={{
                              color: textMuted,
                              "&:hover": { color: "#F97316", background: "rgba(249,115,22,0.1)" },
                            }}
                          >
                            <ArrowForwardIosIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>

                    <Button
                      variant="outlined"
                      sx={{
                        mt: 4,
                        borderRadius: "12px",
                        textTransform: "none",
                        fontWeight: 600,
                        px: 3,
                        py: 1.25,
                      }}
                      onClick={() => toast.success("Edit feature coming soon!")}
                    >
                      Edit Information
                    </Button>
                  </TabPanel>

                  {/* Security Tab */}
                  <TabPanel value={activeTab} index={1}>
                    <Typography sx={{ fontWeight: 700, fontSize: "1.25rem", mb: 0.5, color: theme.palette.text.primary }}>
                      Security Settings
                    </Typography>
                    <Typography sx={{ color: textMuted, fontSize: "0.875rem", mb: 4 }}>
                      Manage your password and account security
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {[
                        {
                          icon: <KeyOutlinedIcon />,
                          label: "Password",
                          description: "Last changed 30 days ago",
                          action: "Change",
                        },
                        {
                          icon: <ShieldOutlinedIcon />,
                          label: "Two-Factor Authentication",
                          description: "Add an extra layer of security",
                          action: "Enable",
                          badge: "Recommended",
                        },
                        {
                          icon: <CreditCardOutlinedIcon />,
                          label: "Saved Payment Methods",
                          description: "Manage your payment cards",
                          action: "Manage",
                        },
                      ].map((item) => (
                        <Box
                          key={item.label}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            p: 2.5,
                            borderRadius: "14px",
                            background: cardBgSecondary,
                            border: `1px solid ${borderColor}`,
                            transition: "all 0.2s ease",
                            cursor: "pointer",
                            "&:hover": { borderColor: "rgba(249,115,22,0.3)" },
                          }}
                          onClick={() => toast.success(`${item.label} - Coming soon!`)}
                        >
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: "12px",
                              background: "rgba(249,115,22,0.1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#F97316",
                            }}
                          >
                            {item.icon}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                                {item.label}
                              </Typography>
                              {item.badge && (
                                <Chip
                                  label={item.badge}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: "0.6rem",
                                    fontWeight: 600,
                                    background: "rgba(249,115,22,0.1)",
                                    color: "#F97316",
                                    border: "none",
                                  }}
                                />
                              )}
                            </Box>
                            <Typography sx={{ color: textMuted, fontSize: "0.8rem" }}>
                              {item.description}
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            sx={{
                              borderRadius: "10px",
                              textTransform: "none",
                              fontWeight: 600,
                              color: "#F97316",
                              "&:hover": { background: "rgba(249,115,22,0.08)" },
                            }}
                          >
                            {item.action}
                          </Button>
                        </Box>
                      ))}
                    </Box>
                  </TabPanel>

                  {/* Notifications Tab */}
                  <TabPanel value={activeTab} index={2}>
                    <Typography sx={{ fontWeight: 700, fontSize: "1.25rem", mb: 0.5, color: theme.palette.text.primary }}>
                      Notification Preferences
                    </Typography>
                    <Typography sx={{ color: textMuted, fontSize: "0.875rem", mb: 4 }}>
                      Choose how you want to receive updates
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {[
                        {
                          label: "Email Notifications",
                          description: "Receive booking confirmations and updates via email",
                          checked: emailNotifications,
                          onChange: setEmailNotifications,
                        },
                        {
                          label: "SMS Notifications",
                          description: "Get text messages for flight updates and reminders",
                          checked: smsNotifications,
                          onChange: setSmsNotifications,
                        },
                        {
                          label: "Marketing Emails",
                          description: "Receive special offers and promotions",
                          checked: marketingEmails,
                          onChange: setMarketingEmails,
                        },
                      ].map((item) => (
                        <Box
                          key={item.label}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            p: 2.5,
                            borderRadius: "14px",
                            background: cardBgSecondary,
                            border: `1px solid ${borderColor}`,
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                              {item.label}
                            </Typography>
                            <Typography sx={{ color: textMuted, fontSize: "0.8rem" }}>
                              {item.description}
                            </Typography>
                          </Box>
                          <Switch
                            checked={item.checked}
                            onChange={(e) => item.onChange(e.target.checked)}
                            sx={{
                              "& .MuiSwitch-switchBase.Mui-checked": {
                                color: "#F97316",
                              },
                              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                backgroundColor: "#F97316",
                              },
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </TabPanel>

                  {/* Preferences Tab */}
                  <TabPanel value={activeTab} index={3}>
                    <Typography sx={{ fontWeight: 700, fontSize: "1.25rem", mb: 0.5, color: theme.palette.text.primary }}>
                      App Preferences
                    </Typography>
                    <Typography sx={{ color: textMuted, fontSize: "0.875rem", mb: 4 }}>
                      Customize your experience
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {[
                        {
                          icon: <LanguageOutlinedIcon />,
                          label: "Language",
                          value: "English (US)",
                        },
                        {
                          icon: <DarkModeOutlinedIcon />,
                          label: "Appearance",
                          value: isDark ? "Dark Mode" : "Light Mode",
                        },
                      ].map((item) => (
                        <Box
                          key={item.label}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            p: 2.5,
                            borderRadius: "14px",
                            background: cardBgSecondary,
                            border: `1px solid ${borderColor}`,
                            cursor: "pointer",
                            "&:hover": { borderColor: "rgba(249,115,22,0.3)" },
                          }}
                          onClick={() => toast.success(`${item.label} settings - Coming soon!`)}
                        >
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: "12px",
                              background: "rgba(249,115,22,0.1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#F97316",
                            }}
                          >
                            {item.icon}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                              {item.label}
                            </Typography>
                            <Typography sx={{ color: textMuted, fontSize: "0.8rem" }}>
                              {item.value}
                            </Typography>
                          </Box>
                          <ArrowForwardIosIcon sx={{ fontSize: 14, color: textMuted }} />
                        </Box>
                      ))}
                    </Box>
                  </TabPanel>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
