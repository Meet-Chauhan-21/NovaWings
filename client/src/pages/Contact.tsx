// src/pages/Contact.tsx
// Contact page with form and company contact information

import { useState } from "react";
import { motion } from "framer-motion";
import { useThemeColors } from "../hooks/useThemeColors";
import toast from "react-hot-toast";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import HeadsetMicOutlinedIcon from "@mui/icons-material/HeadsetMicOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";

interface ContactInfo {
  icon: React.ReactNode;
  title: string;
  value: string;
  sub?: string;
}

const CONTACT_INFO: ContactInfo[] = [
  {
    icon: <PhoneOutlinedIcon sx={{ fontSize: 24 }} />,
    title: "Phone",
    value: "+91 1800-NOVA-FLY",
    sub: "Mon - Sat, 8AM - 10PM",
  },
  {
    icon: <EmailOutlinedIcon sx={{ fontSize: 24 }} />,
    title: "Email",
    value: "support@novawings.in",
    sub: "24/7 Support",
  },
  {
    icon: <LocationOnOutlinedIcon sx={{ fontSize: 24 }} />,
    title: "Office",
    value: "Surat, Gujarat, India",
    sub: "Corporate Headquarters",
  },
  {
    icon: <AccessTimeOutlinedIcon sx={{ fontSize: 24 }} />,
    title: "Working Hours",
    value: "Mon - Sat: 8AM - 10PM",
    sub: "Sunday: 10AM - 6PM",
  },
];

const SUPPORT_OPTIONS = [
  {
    icon: <HeadsetMicOutlinedIcon sx={{ fontSize: 32 }} />,
    title: "Customer Support",
    description: "Get help with bookings, cancellations, and refunds",
  },
  {
    icon: <ChatOutlinedIcon sx={{ fontSize: 32 }} />,
    title: "Live Chat",
    description: "Chat with our support team in real-time",
  },
  {
    icon: <SupportAgentOutlinedIcon sx={{ fontSize: 32 }} />,
    title: "Help Center",
    description: "Browse FAQs and self-service options",
  },
];

export default function Contact() {
  const { isDark, theme } = useThemeColors();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success("Message sent successfully! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const cardBg = isDark ? "rgba(20, 20, 20, 0.8)" : "rgba(255, 255, 255, 0.9)";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const textMuted = isDark ? "#8892A0" : "#7A8290";

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 70px)",
        background: isDark
          ? "radial-gradient(ellipse at top, rgba(249,115,22,0.08) 0%, transparent 50%)"
          : "radial-gradient(ellipse at top, rgba(249,115,22,0.06) 0%, transparent 50%)",
        py: { xs: 4, md: 6 },
        px: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 2,
                background: "linear-gradient(135deg, #F97316 0%, #F59E0B 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontSize: { xs: "2rem", md: "2.5rem" },
              }}
            >
              Get in Touch
            </Typography>
            <Typography
              sx={{
                color: textMuted,
                fontSize: { xs: "1rem", md: "1.1rem" },
                maxWidth: 600,
                mx: "auto",
              }}
            >
              Have questions about your booking or need assistance? We're here to help you 24/7.
            </Typography>
          </Box>
        </motion.div>

        {/* Support Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {SUPPORT_OPTIONS.map((option, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={option.title}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                >
                  <Card
                    sx={{
                      background: cardBg,
                      backdropFilter: "blur(20px)",
                      border: `1px solid ${borderColor}`,
                      borderRadius: "20px",
                      p: 4,
                      textAlign: "center",
                      height: "100%",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        borderColor: "rgba(249,115,22,0.3)",
                        boxShadow: "0 12px 40px rgba(249,115,22,0.1)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: "16px",
                        background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(234,88,12,0.15))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#F97316",
                        mx: "auto",
                        mb: 2,
                      }}
                    >
                      {option.icon}
                    </Box>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        color: theme.palette.text.primary,
                        mb: 1,
                      }}
                    >
                      {option.title}
                    </Typography>
                    <Typography sx={{ color: textMuted, fontSize: "0.9rem" }}>
                      {option.description}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Main Content */}
        <Grid container spacing={4}>
          {/* Contact Form */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card
                sx={{
                  background: cardBg,
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${borderColor}`,
                  borderRadius: "20px",
                  p: { xs: 3, md: 4 },
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    mb: 1,
                  }}
                >
                  Send us a Message
                </Typography>
                <Typography sx={{ color: textMuted, mb: 4, fontSize: "0.9rem" }}>
                  Fill out the form below and we'll get back to you within 24 hours.
                </Typography>

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Your Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Your Message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        multiline
                        rows={5}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isSubmitting}
                        startIcon={<SendOutlinedIcon />}
                        sx={{
                          borderRadius: "12px",
                          textTransform: "none",
                          px: 4,
                          py: 1.5,
                          fontSize: "1rem",
                          fontWeight: 600,
                        }}
                      >
                        {isSubmitting ? "Sending..." : "Send Message"}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Card>
            </motion.div>
          </Grid>

          {/* Contact Info Sidebar */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card
                sx={{
                  background: cardBg,
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${borderColor}`,
                  borderRadius: "20px",
                  p: { xs: 3, md: 4 },
                  mb: 3,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    mb: 4,
                  }}
                >
                  Contact Information
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {CONTACT_INFO.map((info) => (
                    <Box key={info.title} sx={{ display: "flex", gap: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "12px",
                          background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(234,88,12,0.15))",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#F97316",
                          flexShrink: 0,
                        }}
                      >
                        {info.icon}
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                            fontSize: "0.95rem",
                          }}
                        >
                          {info.title}
                        </Typography>
                        <Typography sx={{ color: theme.palette.text.primary, fontSize: "0.9rem" }}>
                          {info.value}
                        </Typography>
                        {info.sub && (
                          <Typography sx={{ color: textMuted, fontSize: "0.8rem" }}>
                            {info.sub}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Card>

              {/* Map Placeholder */}
              <Card
                sx={{
                  background: cardBg,
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${borderColor}`,
                  borderRadius: "20px",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: 200,
                    background: "linear-gradient(135deg, rgba(249,115,22,0.1), rgba(234,88,12,0.1))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <LocationOnOutlinedIcon sx={{ fontSize: 40, color: "#F97316" }} />
                  <Typography sx={{ color: textMuted, fontSize: "0.9rem" }}>
                    Surat, Gujarat, India
                  </Typography>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
