// src/pages/Login.tsx
// Login form using Formik + Yup with validation — redesigned two-column MUI layout

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import type { FieldProps } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { loginUser } from "../services/authService";
import { useAuthContext } from "../context/AuthContext";
import type { LoginFormValues } from "../types";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import GoogleIcon from "@mui/icons-material/Google";
import AppleIcon from "@mui/icons-material/Apple";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";

/** Yup validation schema for the login form */
const loginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email format").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

const FEATURES = [
  "90+ Destinations",
  "Instant E-Tickets",
  "Secure Payments",
  "24/7 Support",
];

/**
 * Login page renders a Formik-based form with email and password fields.
 * On success, stores auth data via context and redirects to home.
 */
export default function Login() {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const initialValues: LoginFormValues = { email: "", password: "" };

  /** Handle form submission: call API, update context, navigate */
  const handleSubmit = async (
    values: LoginFormValues,
    { setSubmitting }: { setSubmitting: (b: boolean) => void }
  ) => {
    setApiError(null);
    try {
      const response = await loginUser(values);
      login(response);
      toast.success(response.message || "Login successful!");
      navigate("/");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; error?: string } | string } };
      const message =
        (typeof err?.response?.data === "string"
          ? err.response.data
          : (err?.response?.data as { message?: string; error?: string })?.message ||
            (err?.response?.data as { message?: string; error?: string })?.error) ||
        "Invalid email or password. Please try again.";
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--nw-bg)",
      }}
    >
      {/* ── Left Branding Panel (55%) ─────────────────────────────── */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          width: "55%",
          minHeight: "100vh",
          p: 6,
          background: "linear-gradient(160deg, var(--nw-bg) 0%, var(--nw-warm-bg) 50%, var(--nw-bg) 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Radial orange glow */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(249,115,22,0.18) 0%, var(--nw-primary-06) 45%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, zIndex: 1 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              background: "linear-gradient(135deg, var(--nw-primary) 0%, var(--nw-primary-dark) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px var(--nw-primary-40)",
            }}
          >
            <FlightTakeoffIcon sx={{ color: "var(--nw-text-primary)", fontSize: 22 }} />
          </Box>
          <Typography
            sx={{
              fontSize: "1.5rem",
              fontWeight: 800,
              background: "linear-gradient(90deg, var(--nw-primary), var(--nw-secondary))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.01em",
            }}
          >
            NovaWings
          </Typography>
        </Box>

        {/* Center content */}
        <Box sx={{ zIndex: 1, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 5 }}>
          {/* Tagline */}
          <Box>
            <Typography
              sx={{
                fontSize: "2.75rem",
                fontWeight: 800,
                color: "var(--nw-text-primary)",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                mb: 1.5,
              }}
            >
              Take Flight with{" "}
              <Box
                component="span"
                sx={{
                  background: "linear-gradient(90deg, var(--nw-primary), var(--nw-secondary))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Confidence
              </Box>
            </Typography>
            <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "1.05rem", lineHeight: 1.7 }}>
              Your journey starts here. Discover seamless travel with NovaWings.
            </Typography>
          </Box>

          {/* Feature highlights */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {FEATURES.map((feat) => (
              <Box key={feat} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <CheckCircleOutlinedIcon sx={{ color: "var(--nw-primary)", fontSize: 20 }} />
                <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.9375rem", fontWeight: 500 }}>
                  {feat}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Abstract plane illustration */}
          <Box sx={{ opacity: 0.12 }}>
            <svg viewBox="0 0 400 200" width="340" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20 140 Q80 100 160 110 L340 60 L320 80 L160 130 L200 155 L170 160 L130 140 L80 155 L70 145 L100 130 L60 125 Z"
                fill="var(--nw-primary)"
              />
              <circle cx="345" cy="58" r="6" fill="var(--nw-secondary)" />
              <path d="M350 58 Q380 50 395 55" stroke="var(--nw-secondary)" strokeWidth="2" fill="none" strokeDasharray="4 3" />
            </svg>
          </Box>
        </Box>

        {/* Testimonial quote */}
        <Box
          sx={{
            zIndex: 1,
            p: 3,
            borderRadius: "16px",
            background: "var(--nw-border-soft)",
            border: "1px solid var(--nw-border)",
            backdropFilter: "blur(8px)",
          }}
        >
          <FormatQuoteIcon sx={{ color: "var(--nw-primary)", fontSize: 28, mb: 1, opacity: 0.8 }} />
          <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.9rem", lineHeight: 1.7, fontStyle: "italic" }}>
            "Booked my monsoon getaway in under 3 minutes. NovaWings is the fastest and most reliable booking experience I've tried."
          </Typography>
          <Typography sx={{ color: "var(--nw-primary)", fontSize: "0.8rem", fontWeight: 600, mt: 1.5 }}>
            — Priya S., Mumbai
          </Typography>
        </Box>
      </Box>

      {/* ── Right Form Panel (45%) ─────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: { xs: "100%", md: "45%" },
          minHeight: "100vh",
          background: "var(--nw-panel-dark)",
          p: { xs: 3, sm: 5 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          {/* Mobile logo */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              gap: 1,
              mb: 4,
            }}
          >
            <FlightTakeoffIcon sx={{ color: "var(--nw-primary)", fontSize: 24 }} />
            <Typography sx={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--nw-primary)" }}>
              NovaWings
            </Typography>
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 800, color: "var(--nw-text-primary)", mb: 0.75 }}>
            Welcome Back
          </Typography>
          <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.9375rem", mb: 4 }}>
            Sign in to your NovaWings account
          </Typography>

          <Formik initialValues={initialValues} validationSchema={loginSchema} onSubmit={handleSubmit}>
            {({ isSubmitting, touched, errors }) => (
              <Form>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

                  {/* Email */}
                  <Field name="email">
                    {({ field }: FieldProps) => (
                      <Box>
                        <TextField
                          {...field}
                          fullWidth
                          label="Email Address"
                          type="email"
                          placeholder="you@example.com"
                          error={touched.email && Boolean(errors.email)}
                          helperText={touched.email && errors.email}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <EmailOutlinedIcon sx={{ color: "var(--nw-text-muted)", fontSize: 20 }} />
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      </Box>
                    )}
                  </Field>

                  {/* Password */}
                  <Field name="password">
                    {({ field }: FieldProps) => (
                      <Box>
                        <TextField
                          {...field}
                          fullWidth
                          label="Password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          error={touched.password && Boolean(errors.password)}
                          helperText={touched.password && errors.password}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LockOutlinedIcon sx={{ color: "var(--nw-text-muted)", fontSize: 20 }} />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowPassword((s) => !s)}
                                    edge="end"
                                    size="small"
                                    sx={{ color: "var(--nw-text-muted)" }}
                                  >
                                    {showPassword ? (
                                      <VisibilityOffOutlinedIcon fontSize="small" />
                                    ) : (
                                      <VisibilityOutlinedIcon fontSize="small" />
                                    )}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      </Box>
                    )}
                  </Field>

                  {/* Remember me + Forgot password */}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          size="small"
                          sx={{
                            color: "var(--nw-text-disabled)",
                            "&.Mui-checked": { color: "var(--nw-primary)" },
                          }}
                        />
                      }
                      label={
                        <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.875rem" }}>
                          Remember me
                        </Typography>
                      }
                    />
                    <Typography
                      component={Link}
                      to="/forgot-password"
                      sx={{
                        color: "var(--nw-primary)",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      Forgot Password?
                    </Typography>
                  </Box>

                  {/* API error */}
                  {apiError && (
                    <Alert severity="error" sx={{ borderRadius: "12px" }}>
                      {apiError}
                    </Alert>
                  )}

                  {/* Submit button */}
                  <Button
                    type="submit"
                    fullWidth
                    size="large"
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{
                      py: 1.6,
                      fontSize: "1rem",
                      fontWeight: 700,
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, var(--nw-primary) 0%, var(--nw-primary-dark) 100%)",
                      boxShadow: "0 4px 20px var(--nw-primary-40)",
                      "&:hover": {
                        background: "linear-gradient(135deg, var(--nw-primary-light) 0%, var(--nw-primary) 100%)",
                        boxShadow: "0 6px 24px rgba(249,115,22,0.55)",
                      },
                      "&:disabled": { opacity: 0.6 },
                    }}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={22} sx={{ color: "var(--nw-text-primary)" }} />
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  {/* Social sign-in */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, my: 0.5 }}>
                    <Divider sx={{ flex: 1, borderColor: "var(--nw-border-strong)" }} />
                    <Typography sx={{ color: "var(--nw-text-disabled)", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
                      Or continue with
                    </Typography>
                    <Divider sx={{ flex: 1, borderColor: "var(--nw-border-strong)" }} />
                  </Box>

                  <Box sx={{ display: "flex", gap: 1.5 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      disabled
                      startIcon={<GoogleIcon />}
                      sx={{
                        borderColor: "var(--nw-border-strong)",
                        color: "var(--nw-text-muted)",
                        borderRadius: "10px",
                        py: 1.25,
                        "&:disabled": { borderColor: "var(--nw-border)", color: "var(--nw-text-disabled)" },
                      }}
                    >
                      Google
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      disabled
                      startIcon={<AppleIcon />}
                      sx={{
                        borderColor: "var(--nw-border-strong)",
                        color: "var(--nw-text-muted)",
                        borderRadius: "10px",
                        py: 1.25,
                        "&:disabled": { borderColor: "var(--nw-border)", color: "var(--nw-text-disabled)" },
                      }}
                    >
                      Apple
                    </Button>
                  </Box>

                  {/* Sign up link */}
                  <Typography sx={{ textAlign: "center", color: "var(--nw-text-muted)", fontSize: "0.9rem", mt: 0.5 }}>
                    Don't have an account?{" "}
                    <Box
                      component={Link}
                      to="/register"
                      sx={{
                        color: "var(--nw-primary)",
                        fontWeight: 600,
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      Sign Up
                    </Box>
                  </Typography>

                </Box>
              </Form>
            )}
          </Formik>
        </Box>
      </Box>
    </Box>
  );
}



