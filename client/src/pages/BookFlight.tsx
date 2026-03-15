// src/pages/BookFlight.tsx
// Booking form page — shows flight summary and allows seat selection

import { useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useQuery } from "@tanstack/react-query";
import { getFlightById } from "../services/flightService";
import { motion } from "framer-motion";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMsg from "../components/ErrorMessage";
import BookingProgress from "../components/BookingProgress";
import NumberInput from "../components/ui/NumberInput";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import FlightIcon from "@mui/icons-material/Flight";
import AirlineSeatReclineExtraIcon from "@mui/icons-material/AirlineSeatReclineExtra";
import EventIcon from "@mui/icons-material/Event";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

/**
 * BookFlight page displays a flight summary and a form to select number of seats.
 * On submit, navigates to the seat selection page.
 * Pre-fills seat count from passengers query param if available.
 */
export default function BookFlight() {
  const { flightId } = useParams<{ flightId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultSeats = parseInt(searchParams.get("passengers") || "1");

  const { data: flight, isLoading, isError } = useQuery({
    queryKey: ["flight", flightId],
    queryFn: () => getFlightById(flightId!),
    enabled: !!flightId,
  });

  /** Dynamic Yup schema that depends on available seats */
  const bookingSchema = useMemo(() => {
    return Yup.object().shape({
      numberOfSeats: Yup.number()
        .required("Number of seats is required")
        .min(1, "At least 1 seat required")
        .max(flight?.availableSeats ?? 1, `Maximum ${flight?.availableSeats ?? 1} seats available`),
    });
  }, [flight?.availableSeats]);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMsg message="Failed to load flight details." />;
  if (!flight) return <ErrorMsg message="Flight not found." />;

  /** Format an ISO date string to a readable format */
  const formatDateTime = (iso: string): string => {
    return new Date(iso).toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", px: { xs: 2, sm: 3 }, py: { xs: 4, sm: 6 } }}>
      {/* Back Button */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            mb: 3,
            color: "#9CA3AF",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            "&:hover": { background: "rgba(249,115,22,0.1)", color: "#F97316" },
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
      </motion.div>

      <BookingProgress activeStep={1} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        {/* Flight Summary Card */}
        <Paper
          sx={{
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "16px",
            p: { xs: 3, sm: 4 },
            mb: 3,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative gradient */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: "linear-gradient(90deg, #F97316, #F59E0B)",
            }}
          />

          <Typography sx={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#F97316", fontWeight: 700, mb: 2 }}>
            Flight Summary
          </Typography>

          {/* Airline info */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                background: "rgba(249,115,22,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FlightIcon sx={{ color: "#F97316", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ color: "#FFFFFF", fontWeight: 600, fontSize: "0.95rem" }}>
                {flight.airlineName}
              </Typography>
              <Typography sx={{ color: "#6B7280", fontSize: "0.8rem", fontFamily: "monospace" }}>
                {flight.flightNumber}
              </Typography>
            </Box>
          </Box>

          {/* Route */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.5 }}>
                <FlightTakeoffIcon sx={{ fontSize: 16, color: "#F97316" }} />
                <Typography sx={{ color: "#6B7280", fontSize: "0.75rem" }}>From</Typography>
              </Box>
              <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "1.1rem" }}>
                {flight.source}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", px: 2 }}>
              <Box
                sx={{
                  width: 80,
                  height: 0,
                  borderTop: "2px dashed rgba(249,115,22,0.3)",
                  position: "relative",
                }}
              >
                <FlightIcon
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%) rotate(90deg)",
                    color: "#F97316",
                    fontSize: 18,
                    background: "#111111",
                    px: 0.3,
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ flex: 1, textAlign: "right" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.5, justifyContent: "flex-end" }}>
                <FlightLandIcon sx={{ fontSize: 16, color: "#F97316" }} />
                <Typography sx={{ color: "#6B7280", fontSize: "0.75rem" }}>To</Typography>
              </Box>
              <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "1.1rem" }}>
                {flight.destination}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 2.5 }} />

          {/* Details row */}
          <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <EventIcon sx={{ fontSize: 16, color: "#6B7280" }} />
              <Typography sx={{ color: "#9CA3AF", fontSize: "0.85rem" }}>
                {formatDateTime(flight.departureTime)} — {formatDateTime(flight.arrivalTime)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AirlineSeatReclineExtraIcon sx={{ fontSize: 16, color: "#6B7280" }} />
              <Typography sx={{ color: "#9CA3AF", fontSize: "0.85rem" }}>
                {flight.availableSeats} seats available
              </Typography>
            </Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "1rem",
                background: "linear-gradient(135deg, #F97316, #F59E0B)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ₹{flight.price.toLocaleString("en-IN")} / seat
            </Typography>
          </Box>
        </Paper>
      </motion.div>

      {/* Booking Form */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <Paper
          sx={{
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "16px",
            p: { xs: 3, sm: 4 },
          }}
        >
          <Typography sx={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#F97316", fontWeight: 700, mb: 3 }}>
            Select Passengers
          </Typography>

          <Formik
            initialValues={{ numberOfSeats: defaultSeats }}
            validationSchema={bookingSchema}
            onSubmit={async (values, { setSubmitting }) => {
              navigate(`/select-seats/${flight.id}?seats=${values.numberOfSeats}`);
              setSubmitting(false);
            }}
          >
            {({ isSubmitting, values, touched, errors, setFieldValue }) => {
              const totalPrice = values.numberOfSeats * flight.price;
              return (
                <Form>
                  <Box sx={{ mb: 3 }}>
                    <NumberInput
                      label="Number of Seats"
                      value={values.numberOfSeats}
                      onChange={(val) => setFieldValue("numberOfSeats", val)}
                      min={1}
                      max={flight.availableSeats}
                      error={touched.numberOfSeats && errors.numberOfSeats ? String(errors.numberOfSeats) : undefined}
                    />
                  </Box>

                  {/* Total price display */}
                  <Box
                    sx={{
                      background: "rgba(249,115,22,0.06)",
                      border: "1px solid rgba(249,115,22,0.15)",
                      borderRadius: "12px",
                      p: 2.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 3,
                    }}
                  >
                    <Typography sx={{ color: "#9CA3AF", fontWeight: 500 }}>Estimated Total</Typography>
                    <Typography
                      sx={{
                        fontSize: "1.5rem",
                        fontWeight: 800,
                        background: "linear-gradient(135deg, #F97316, #F59E0B)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      ₹{(totalPrice > 0 ? totalPrice : 0).toLocaleString("en-IN")}
                    </Typography>
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isSubmitting}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      py: 1.8,
                      borderRadius: "12px",
                      fontWeight: 700,
                      fontSize: "1rem",
                      background: "linear-gradient(135deg, #F97316, #EA580C)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #EA580C, #DC2626)",
                      },
                    }}
                  >
                    {isSubmitting ? "Processing..." : "Continue to Seat Selection"}
                  </Button>
                </Form>
              );
            }}
          </Formik>
        </Paper>
      </motion.div>
    </Box>
  );
}
