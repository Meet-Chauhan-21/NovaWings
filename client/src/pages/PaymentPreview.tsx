// src/pages/PaymentPreview.tsx
// Payment review and checkout page — dark theme with MUI components

import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BookingProgress from "../components/BookingProgress";
import { useRazorpay } from "../hooks/useRazorpay";
import type { FoodOrder } from "../types";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FlightIcon from "@mui/icons-material/Flight";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VerifiedIcon from "@mui/icons-material/Verified";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PaymentIcon from "@mui/icons-material/Payment";

interface PaymentPreviewState {
  flightId: string;
  flightNumber: string;
  airlineName: string;
  source: string;
  destination: string;
  departureTime: string;
  numberOfSeats: number;
  selectedSeats: string[];
  cabinClass: string;
  basePrice: number;
  totalBeforeFood: number;
  foodOrders?: FoodOrder[];
  foodTotal?: number;
  mealSkipped?: boolean;
}

export default function PaymentPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { initiatePayment, isProcessing } = useRazorpay();
  const state = location.state as PaymentPreviewState | undefined;

  const [acceptTerms, setAcceptTerms] = useState(true);
  const [acceptRefundRule, setAcceptRefundRule] = useState(true);

  if (!state) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", px: 3, py: 12, textAlign: "center" }}>
        <Typography sx={{ color: "var(--nw-text-muted)", mb: 3 }}>Booking information not found.</Typography>
        <Button variant="contained" onClick={() => navigate("/")} sx={{ borderRadius: "10px" }}>
          Go Home
        </Button>
      </Box>
    );
  }

  const confirmedState = state;

  const baseFare = confirmedState.basePrice * confirmedState.numberOfSeats;
  const taxes = Math.round(baseFare * 0.18);
  const convenienceFee = 199;
  const meals = confirmedState.foodTotal || 0;
  const grandTotal = confirmedState.totalBeforeFood + meals;

  const selectedMeals = useMemo(
    () => (confirmedState.foodOrders || []).filter((order) => order.items.length > 0),
    [confirmedState.foodOrders]
  );

  async function handlePay() {
    await initiatePayment({
      flightId: confirmedState.flightId,
      numberOfSeats: confirmedState.numberOfSeats,
      selectedSeats: confirmedState.selectedSeats,
      totalAmount: grandTotal,
      foodOrders: confirmedState.foodOrders || [],
      foodTotal: meals,
      mealSkipped: !!confirmedState.mealSkipped,
      flightDetails: {
        flightNumber: confirmedState.flightNumber,
        source: confirmedState.source,
        destination: confirmedState.destination,
        airlineName: confirmedState.airlineName,
      },
    });
  }

  const canPay = acceptTerms && acceptRefundRule && !isProcessing;

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2, md: 3 }, py: { xs: 3, md: 5 } }}>
      {/* Back button */}
      <IconButton
        onClick={() => navigate(`/select-food/${confirmedState.flightId}`)}
        sx={{
          mb: 2,
          color: "var(--nw-text-secondary)",
          background: "var(--nw-border-soft)",
          border: "1px solid var(--nw-border-strong)",
          "&:hover": { background: "var(--nw-primary-10)", color: "var(--nw-primary)" },
        }}
      >
        <ArrowBackIcon fontSize="small" />
      </IconButton>

      <BookingProgress activeStep={4} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Typography sx={{ fontSize: { xs: "1.4rem", md: "1.7rem" }, fontWeight: 800, color: "var(--nw-text-primary)", mb: 3 }}>
          Review Your Booking
        </Typography>
      </motion.div>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 380px" }, gap: 3 }}>
        {/* Left column — details */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Flight Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <Paper
              sx={{
                background: "var(--nw-card)",
                border: "1px solid var(--nw-border)",
                borderRadius: "16px",
                p: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <FlightIcon sx={{ color: "var(--nw-primary)", fontSize: 20 }} />
                <Typography sx={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--nw-primary)", fontWeight: 700 }}>
                  Flight Summary
                </Typography>
              </Box>
              <Typography sx={{ color: "var(--nw-text-primary)", fontWeight: 600, fontSize: "1rem", mb: 0.5 }}>
                {state.airlineName} {state.flightNumber}
              </Typography>
              <Typography sx={{ color: "var(--nw-text-primary)", fontSize: "0.9rem", mb: 1 }}>
                {state.source} → {state.destination}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.85rem" }}>
                  {new Date(confirmedState.departureTime).toLocaleString("en-IN")}
                </Typography>
                <Chip
                  label={confirmedState.cabinClass}
                  size="small"
                  sx={{
                    background: "var(--nw-primary-10)",
                    border: "1px solid var(--nw-primary-20)",
                    color: "var(--nw-primary)",
                    fontSize: "0.7rem",
                    height: 22,
                  }}
                />
              </Box>
              <Divider sx={{ borderColor: "var(--nw-border)", my: 2 }} />
              <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.85rem" }}>
                Seats: {confirmedState.selectedSeats.join(", ")}
              </Typography>
            </Paper>
          </motion.div>

          {/* Meal Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
            <Paper
              sx={{
                background: "var(--nw-card)",
                border: "1px solid var(--nw-border)",
                borderRadius: "16px",
                p: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <RestaurantMenuIcon sx={{ color: "var(--nw-primary)", fontSize: 20 }} />
                <Typography sx={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--nw-primary)", fontWeight: 700 }}>
                  Meal Summary
                </Typography>
              </Box>
              {confirmedState.mealSkipped || selectedMeals.length === 0 ? (
                <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.85rem" }}>
                  No meals selected for this flight.
                </Typography>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {selectedMeals.map((order) => (
                    <Box
                      key={order.seatNumber}
                      sx={{
                        background: "var(--nw-primary-04)",
                        border: "1px solid var(--nw-primary-10)",
                        borderRadius: "12px",
                        p: 2.5,
                      }}
                    >
                      <Typography sx={{ color: "var(--nw-text-primary)", fontWeight: 600, fontSize: "0.9rem", mb: 1 }}>
                        Seat {order.seatNumber} — {order.passengerLabel}
                      </Typography>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                        {order.items.map((item) => (
                          <Box key={item.foodItemId} sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.85rem" }}>
                              {item.foodItemName} x {item.quantity}
                            </Typography>
                            <Typography sx={{ color: "var(--nw-text-primary)", fontSize: "0.85rem" }}>
                              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                      <Divider sx={{ borderColor: "var(--nw-border)", my: 1.5 }} />
                      <Typography sx={{ color: "var(--nw-primary)", fontSize: "0.85rem", fontWeight: 600, textAlign: "right" }}>
                        Subtotal: ₹{order.subtotal.toLocaleString("en-IN")}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </motion.div>
        </Box>

        {/* Right column — payment */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Price Breakdown */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
            <Paper
              sx={{
                background: "var(--nw-card)",
                border: "1px solid var(--nw-border)",
                borderRadius: "16px",
                p: 3,
                position: "sticky",
                top: 86,
              }}
            >
              <Typography sx={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--nw-primary)", fontWeight: 700, mb: 2.5 }}>
                Price Breakdown
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.85rem" }}>
                    Base Fare ({confirmedState.numberOfSeats} × ₹{confirmedState.basePrice.toLocaleString("en-IN")})
                  </Typography>
                  <Typography sx={{ color: "var(--nw-text-primary)", fontSize: "0.85rem" }}>
                    ₹{baseFare.toLocaleString("en-IN")}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.85rem" }}>Taxes & Fees (18%)</Typography>
                  <Typography sx={{ color: "var(--nw-text-primary)", fontSize: "0.85rem" }}>₹{taxes.toLocaleString("en-IN")}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.85rem" }}>Convenience Fee</Typography>
                  <Typography sx={{ color: "var(--nw-text-primary)", fontSize: "0.85rem" }}>₹{convenienceFee.toLocaleString("en-IN")}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.85rem" }}>Meals</Typography>
                  <Typography sx={{ color: "var(--nw-text-primary)", fontSize: "0.85rem" }}>₹{meals.toLocaleString("en-IN")}</Typography>
                </Box>

                <Divider sx={{ borderColor: "var(--nw-border-strong)", my: 1 }} />

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ color: "var(--nw-text-primary)", fontWeight: 700, fontSize: "1.1rem" }}>Total Amount</Typography>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: "1.3rem",
                      background: "linear-gradient(135deg, var(--nw-primary), var(--nw-secondary))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: "var(--nw-border)", my: 2.5 }} />

              {/* Payment Methods */}
              <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.8rem", fontWeight: 600, mb: 1.5 }}>
                Payment Methods
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2.5, flexWrap: "wrap" }}>
                {[
                  { icon: <CreditCardIcon sx={{ fontSize: 14 }} />, label: "Card" },
                  { icon: <PaymentIcon sx={{ fontSize: 14 }} />, label: "UPI" },
                  { label: "Net Banking" },
                ].map((method) => (
                  <Chip
                    key={method.label}
                    icon={method.icon}
                    label={method.label}
                    size="small"
                    sx={{
                      background: "var(--nw-border-soft)",
                      border: "1px solid var(--nw-border-strong)",
                      color: "var(--nw-text-secondary)",
                      fontSize: "0.75rem",
                      "& .MuiChip-icon": { color: "var(--nw-text-secondary)" },
                    }}
                  />
                ))}
              </Box>
              <Typography sx={{ color: "var(--nw-text-disabled)", fontSize: "0.75rem", mb: 2.5 }}>
                All methods are processed securely by Razorpay.
              </Typography>

              {/* Terms checkboxes */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 2.5 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      size="small"
                      sx={{
                        color: "var(--nw-text-disabled)",
                        "&.Mui-checked": { color: "var(--nw-primary)" },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.8rem" }}>
                      I agree to the Terms & Conditions.
                    </Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={acceptRefundRule}
                      onChange={(e) => setAcceptRefundRule(e.target.checked)}
                      size="small"
                      sx={{
                        color: "var(--nw-text-disabled)",
                        "&.Mui-checked": { color: "var(--nw-primary)" },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.8rem" }}>
                      No refund for cancellation less than 24 hours before departure.
                    </Typography>
                  }
                />
              </Box>

              {/* Pay button */}
              <Button
                onClick={handlePay}
                disabled={!canPay}
                variant="contained"
                fullWidth
                sx={{
                  py: 1.8,
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "1rem",
                  background: canPay
                    ? "linear-gradient(135deg, var(--nw-primary), var(--nw-primary-dark))"
                    : "var(--nw-border)",
                  color: canPay ? "var(--nw-text-primary)" : "var(--nw-text-disabled)",
                  "&:hover": {
                    background: canPay
                      ? "linear-gradient(135deg, var(--nw-primary-dark), var(--nw-error))"
                      : "var(--nw-border)",
                  },
                  "&.Mui-disabled": {
                    color: "var(--nw-text-disabled)",
                  },
                  mb: 2,
                }}
              >
                {isProcessing ? "Processing..." : `Pay ₹${grandTotal.toLocaleString("en-IN")} Securely`}
              </Button>

              {/* Trust badges */}
              <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                {[
                  { icon: <LockOutlinedIcon sx={{ fontSize: 12 }} />, label: "256-bit SSL" },
                  { icon: <VerifiedIcon sx={{ fontSize: 12 }} />, label: "Razorpay" },
                  { label: "PCI DSS" },
                ].map((badge) => (
                  <Box key={badge.label} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {badge.icon && <Box sx={{ color: "var(--nw-text-disabled)" }}>{badge.icon}</Box>}
                    <Typography sx={{ color: "var(--nw-text-disabled)", fontSize: "0.7rem" }}>{badge.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}



