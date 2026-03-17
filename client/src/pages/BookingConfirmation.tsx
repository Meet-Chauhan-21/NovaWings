// src/pages/BookingConfirmation.tsx
// Booking confirmation page shown after successful payment — dark theme with animations

import { useMemo } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getBookingById } from "../services/bookingService";
import paymentService from "../services/paymentService";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import TicketCard from "../components/TicketCard";
import { useTicketDownload } from "../hooks/useTicketDownload";
import { getAirportCode } from "../utils/airportHelper";
import type { TicketData } from "../types";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DownloadIcon from "@mui/icons-material/Download";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import ListAltIcon from "@mui/icons-material/ListAlt";

function formatDateStr(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTimeStr(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function BookingConfirmation() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const paymentResult = location.state?.paymentResult;
  const { ticketRef, downloadTicket, isDownloading } = useTicketDownload();

  // Fetch booking as fallback (if user refreshes page)
  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => getBookingById(bookingId!),
    enabled: !!bookingId,
  });

  // Fetch payment details for price breakdown
  const { data: payments } = useQuery({
    queryKey: ["myPayments"],
    queryFn: paymentService.getMyPayments,
    enabled: !!bookingId,
  });

  const ticketData: TicketData | null = useMemo(() => {
    const b = booking;
    const pr = paymentResult;

    const source = pr?.source || b?.source || "";
    const destination = pr?.destination || b?.destination || "";
    const flightNumber = pr?.flightNumber || b?.flightNumber || "";
    const numberOfSeats = pr?.numberOfSeats || b?.numberOfSeats || 0;
    const selectedSeats = pr?.selectedSeats || b?.selectedSeats || [];
    const totalAmount = pr?.totalAmount || b?.totalPrice || 0;
    const paymentId = pr?.paymentId || b?.paymentId || "";
    const departureTime = pr?.departureTime || b?.departureTimeStr || "";
    const arrivalTime = b?.arrivalTime || "";
    const duration = b?.duration || "";
    const passengerName = b?.userName || "Passenger";
    const passengerEmail = b?.userEmail || "";
    const airlineName = b?.airlineName || "";
    const bookingDate = b?.bookingDate || new Date().toISOString();
    const status = pr?.status || b?.status || "CONFIRMED";

    if (!source && !pr) return null;

    // Find payment record for price breakdown
    const payment = payments?.find((p) => p.bookingId === bookingId);

    return {
      bookingId: bookingId || "",
      bookingDate: formatDateStr(bookingDate),
      status: String(status),
      passengerName,
      passengerEmail,
      flightNumber,
      airlineName,
      source,
      sourceCode: getAirportCode(source),
      destination,
      destinationCode: getAirportCode(destination),
      departureDate: departureTime ? formatDateStr(departureTime) : formatDateStr(bookingDate),
      departureTime: departureTime ? formatTimeStr(departureTime) : "--:--",
      arrivalTime: arrivalTime ? formatTimeStr(arrivalTime) : "Check Airline",
      duration,
      numberOfSeats,
      selectedSeats: selectedSeats || [],
      foodOrders: b?.foodOrders || payment?.foodOrders || [],
      foodTotal: b?.foodTotal || payment?.foodTotal || 0,
      mealSkipped: b?.mealSkipped || payment?.mealSkipped || false,
      cabinClass: "Economy",
      cabinBaggage: "7 kg per person",
      checkInBaggage: "15 kg per person",
      razorpayPaymentId: payment?.razorpayPaymentId || paymentId || "",
      baseFare: b?.baseFlightFare || payment?.baseFare || Math.round(totalAmount * 0.82),
      taxes: b?.taxes || payment?.taxes || Math.round(totalAmount * 0.15),
      convenienceFee: b?.convenienceFee || payment?.convenienceFee || 199,
      totalAmount,
      currency: "INR",
    };
  }, [booking, paymentResult, payments, bookingId]);

  if (!paymentResult && isLoading) return <LoadingSpinner />;
  if (!paymentResult && isError) return <ErrorMessage message="Failed to load booking details." />;
  if (!paymentResult && !booking) return <ErrorMessage message="Booking not found." />;

  // Confetti colors
  const confettiColors = ["var(--nw-primary)", "var(--nw-secondary)", "var(--nw-error)", "var(--nw-info)", "var(--nw-success-bright)", "var(--nw-accent-violet)", "var(--nw-accent-pink)", "var(--nw-accent-cyan)"];

  return (
    <Box sx={{ minHeight: "100vh", py: { xs: 6, md: 10 }, px: { xs: 2, md: 3 } }}>
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(80px) rotate(360deg); opacity: 0; }
        }
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>

      <Box sx={{ maxWidth: 700, mx: "auto" }}>
        {/* Success Header with Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Box sx={{ position: "relative", display: "inline-block", mb: 3 }}>
              {/* Confetti dots */}
              {confettiColors.map((color, i) => (
                <Box
                  key={i}
                  sx={{
                    position: "absolute",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: color,
                    top: `${10 + Math.sin(i * 0.8) * 35}px`,
                    left: `${50 + Math.cos(i * 0.8) * 55}%`,
                    animation: `confettiFall 1.4s ease-out ${i * 0.1}s forwards`,
                  }}
                />
              ))}

              {/* Check circle */}
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <Box
                  sx={{
                    width: 88,
                    height: 88,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--nw-success-15), var(--nw-success-08))",
                    border: "2px solid var(--nw-success-30)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 48, color: "var(--nw-success-bright)" }} />
                </Box>
              </motion.div>
            </Box>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "1.5rem", md: "2rem" },
                  fontWeight: 800,
                  color: "var(--nw-text-primary)",
                  mb: 1,
                }}
              >
                Payment Successful!
              </Typography>
              <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.95rem" }}>
                Your booking has been confirmed
              </Typography>
            </motion.div>
          </Box>
        </motion.div>

        {/* Ticket Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          {ticketData && <TicketCard ref={ticketRef} ticket={ticketData} />}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.9 }}
          className="no-print"
        >
          <Box
            sx={{
              mt: 5,
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
            }}
          >
            <Button
              onClick={() =>
                ticketData &&
                downloadTicket(ticketData.bookingId, ticketData.passengerName)
              }
              disabled={isDownloading || !ticketData}
              variant="contained"
              startIcon={isDownloading ? undefined : <DownloadIcon />}
              sx={{
                flex: 1,
                py: 2,
                borderRadius: "14px",
                fontWeight: 700,
                fontSize: "0.95rem",
                background: "linear-gradient(135deg, var(--nw-primary), var(--nw-primary-dark))",
                boxShadow: "0 8px 30px var(--nw-primary-30)",
                "&:hover": {
                  background: "linear-gradient(135deg, var(--nw-primary-dark), var(--nw-error))",
                },
                "&.Mui-disabled": {
                  background: "var(--nw-border)",
                  color: "var(--nw-text-disabled)",
                },
              }}
            >
              {isDownloading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTop: "2px solid var(--nw-text-primary)",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                      "@keyframes spin": { "100%": { transform: "rotate(360deg)" } },
                    }}
                  />
                  Generating PDF...
                </Box>
              ) : (
                "Download Ticket PDF"
              )}
            </Button>

            <Button
              component={Link}
              to="/explore"
              variant="outlined"
              startIcon={<FlightTakeoffIcon />}
              sx={{
                flex: 1,
                py: 2,
                borderRadius: "14px",
                fontWeight: 600,
                fontSize: "0.95rem",
                borderColor: "var(--nw-border-strong)",
                color: "var(--nw-text-secondary)",
                "&:hover": {
                  borderColor: "var(--nw-primary)",
                  color: "var(--nw-primary)",
                  background: "var(--nw-primary-04)",
                },
              }}
            >
              Book Another Flight
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Button
              component={Link}
              to="/my-bookings"
              startIcon={<ListAltIcon sx={{ fontSize: 18 }} />}
              sx={{
                color: "var(--nw-primary)",
                fontSize: "0.85rem",
                fontWeight: 500,
                textTransform: "none",
                "&:hover": {
                  background: "var(--nw-primary-06)",
                },
              }}
            >
              View All My Bookings
            </Button>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}




