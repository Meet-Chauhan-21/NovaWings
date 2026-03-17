// src/pages/Register.tsx
// Registration form using Formik + Yup with validation — redesigned two-column MUI layout

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import type { FieldProps } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { registerUser } from "../services/authService";
import { useAuthContext } from "../context/AuthContext";
import type { RegisterFormValues } from "../types";

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
import LinearProgress from "@mui/material/LinearProgress";

import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";

/** Extended form values for registration (confirmPassword / phone / terms are UI-only) */
interface RegisterExtendedValues extends RegisterFormValues {
  confirmPassword: string;
  phone: string;
  terms: boolean;
}

/** Yup validation schema for the register form */
const registerSchema = Yup.object().shape({
  name: Yup.string().min(2, "Name must be at least 2 characters").required("Name is required"),
  email: Yup.string().email("Invalid email format").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
  phone: Yup.string().matches(/^[0-9+\-\s]{7,15}$/, "Invalid phone number").optional(),
  terms: Yup.boolean().oneOf([true], "You must accept the Terms & Conditions").required(),
});

const FEATURES = [
  "100,000+ Smart Travelers",
  "Instant E-Tickets",
  "Secure Payments",
  "24/7 Support",
];

/** Returns 0–100 password strength score */
function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 6) score += 20;
  if (password.length >= 10) score += 20;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[0-9]/.test(password)) score += 20;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;
  return score;
}

function getStrengthLabel(score: number): { label: string; color: string } {
  if (score <= 20) return { label: "Very Weak", color: "var(--nw-error)" };
  if (score <= 40) return { label: "Weak", color: "var(--nw-primary)" };
  if (score <= 60) return { label: "Fair", color: "var(--nw-secondary)" };
  if (score <= 80) return { label: "Strong", color: "var(--nw-success-bright)" };
  return { label: "Very Strong", color: "var(--nw-success)" };
}

/**
 * Register page renders a Formik-based form with name, email, and password fields.
 * On success, stores auth data via context and redirects to home.
 */
export default function Register() {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const initialValues: RegisterExtendedValues = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    terms: false,
  };

  /** Handle form submission: call API, update context, navigate */
  const handleSubmit = async (
    values: RegisterExtendedValues,
    { setSubmitting }: { setSubmitting: (b: boolean) => void }
  ) => {
    setApiError(null);
    try {
      const apiPayload: RegisterFormValues = {
        name: values.name,
        email: values.email,
        password: values.password,
      };
      const response = await registerUser(apiPayload);
      login(response);
      toast.success(response.message || "Registration successful!");
      navigate("/");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; error?: string } | string } };
      const message =
        (typeof err?.response?.data === "string"
          ? err.response.data
          : (err?.response?.data as { message?: string; error?: string })?.message ||
            (err?.response?.data as { message?: string; error?: string })?.error) ||
        "Registration failed. Please try again.";
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "var(--nw-bg)" }}>
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
              Join{" "}
              <Box
                component="span"
                sx={{
                  background: "linear-gradient(90deg, var(--nw-primary), var(--nw-secondary))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                100,000+
              </Box>{" "}
              Smart Travelers
            </Typography>
            <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "1.05rem", lineHeight: 1.7 }}>
              Create your free account and start booking in seconds.
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
          }}
        >
          <FormatQuoteIcon sx={{ color: "var(--nw-primary)", fontSize: 28, mb: 1, opacity: 0.8 }} />
          <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.9rem", lineHeight: 1.7, fontStyle: "italic" }}>
            "Signing up was free and the very first booking saved me ₹2,400 over other platforms. Zero regrets."
          </Typography>
          <Typography sx={{ color: "var(--nw-primary)", fontSize: "0.8rem", fontWeight: 600, mt: 1.5 }}>
            — Rahul K., Bengaluru
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
          overflowY: "auto",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400, py: 4 }}>
          {/* Mobile logo */}
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1, mb: 4 }}>
            <FlightTakeoffIcon sx={{ color: "var(--nw-primary)", fontSize: 24 }} />
            <Typography sx={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--nw-primary)" }}>
              NovaWings
            </Typography>
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 800, color: "var(--nw-text-primary)", mb: 0.75 }}>
            Create Account
          </Typography>
          <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.9375rem", mb: 4 }}>
            Join 100,000+ smart travelers today
          </Typography>

          <Formik initialValues={initialValues} validationSchema={registerSchema} onSubmit={handleSubmit}>
            {({ isSubmitting, touched, errors, values }) => {
              const strength = getPasswordStrength(values.password);
              const { label: strengthLabel, color: strengthColor } = getStrengthLabel(strength);

              return (
                <Form>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

                    {/* Full Name */}
                    <Field name="name">
                      {({ field }: FieldProps) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Full Name"
                          placeholder="John Doe"
                          error={touched.name && Boolean(errors.name)}
                          helperText={touched.name && errors.name}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PersonOutlineIcon sx={{ color: "var(--nw-text-muted)", fontSize: 20 }} />
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      )}
                    </Field>

                    {/* Email */}
                    <Field name="email">
                      {({ field }: FieldProps) => (
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
                          {/* Password strength indicator */}
                          {values.password.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={strength}
                                sx={{
                                  height: 5,
                                  borderRadius: 3,
                                  background: "var(--nw-border)",
                                  "& .MuiLinearProgress-bar": {
                                    background: strengthColor,
                                    borderRadius: 3,
                                    transition: "width 0.4s ease",
                                  },
                                }}
                              />
                              <Typography sx={{ color: strengthColor, fontSize: "0.75rem", mt: 0.5, fontWeight: 500 }}>
                                {strengthLabel}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Field>

                    {/* Confirm Password */}
                    <Field name="confirmPassword">
                      {({ field }: FieldProps) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Confirm Password"
                          type={showConfirm ? "text" : "password"}
                          placeholder="••••••••"
                          error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                          helperText={touched.confirmPassword && errors.confirmPassword}
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
                                    onClick={() => setShowConfirm((s) => !s)}
                                    edge="end"
                                    size="small"
                                    sx={{ color: "var(--nw-text-muted)" }}
                                  >
                                    {showConfirm ? (
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
                      )}
                    </Field>

                    {/* Phone (optional) */}
                    <Field name="phone">
                      {({ field }: FieldProps) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Phone Number (Optional)"
                          placeholder="+91 98765 43210"
                          error={touched.phone && Boolean(errors.phone)}
                          helperText={touched.phone && errors.phone}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PhoneOutlinedIcon sx={{ color: "var(--nw-text-muted)", fontSize: 20 }} />
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      )}
                    </Field>

                    {/* Terms checkbox */}
                    <Field name="terms">
                      {({ field, meta }: FieldProps) => (
                        <Box>
                          <FormControlLabel
                            control={
                              <Checkbox
                                {...field}
                                checked={field.value}
                                size="small"
                                sx={{
                                  color: meta.touched && meta.error ? "var(--nw-error)" : "var(--nw-text-disabled)",
                                  "&.Mui-checked": { color: "var(--nw-primary)" },
                                }}
                              />
                            }
                            label={
                              <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.8125rem" }}>
                                I agree to the{" "}
                                <Box
                                  component="span"
                                  sx={{ color: "var(--nw-primary)", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                                >
                                  Terms & Conditions
                                </Box>{" "}
                                and{" "}
                                <Box
                                  component="span"
                                  sx={{ color: "var(--nw-primary)", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                                >
                                  Privacy Policy
                                </Box>
                              </Typography>
                            }
                          />
                          {meta.touched && meta.error && (
                            <Typography sx={{ color: "var(--nw-error)", fontSize: "0.75rem", ml: 1.5 }}>
                              {meta.error}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Field>

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
                        "Create Account"
                      )}
                    </Button>

                    {/* Login link */}
                    <Typography sx={{ textAlign: "center", color: "var(--nw-text-muted)", fontSize: "0.9rem" }}>
                      Already have an account?{" "}
                      <Box
                        component={Link}
                        to="/login"
                        sx={{
                          color: "var(--nw-primary)",
                          fontWeight: 600,
                          textDecoration: "none",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        Sign In
                      </Box>
                    </Typography>

                  </Box>
                </Form>
              );
            }}
          </Formik>
        </Box>
      </Box>
    </Box>
  );
}




