// src/pages/BookingDetail.tsx
// Displays full booking details with ticket card, download, and cancel option — dark theme

import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { getBookingById, cancelBooking } from "../services/bookingService";
import paymentService from "../services/paymentService";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import TicketCard from "../components/TicketCard";
import { useTicketDownload } from "../hooks/useTicketDownload";
import { getAirportCode } from "../utils/airportHelper";
import type { TicketData } from "../types";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import MuiLink from "@mui/material/Link";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import FlightIcon from "@mui/icons-material/Flight";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import DownloadIcon from "@mui/icons-material/Download";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AirlineSeatReclineExtraIcon from "@mui/icons-material/AirlineSeatReclineExtra";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import PaymentIcon from "@mui/icons-material/Payment";
import GavelIcon from "@mui/icons-material/Gavel";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

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

const STATUS_STYLES: Record<string, { bg: string; border: string; color: string; label: string }> = {
  CONFIRMED: { bg: "var(--nw-success-08)", border: "var(--nw-success-20)", color: "var(--nw-success-bright)", label: "Confirmed" },
  CANCELLED: { bg: "var(--nw-error-08)", border: "var(--nw-error-20)", color: "var(--nw-error)", label: "Cancelled" },
};

export default function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const { ticketRef, downloadTicket, isDownloading } = useTicketDownload();

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => getBookingById(id!),
    enabled: !!id,
  });

  const { data: payments } = useQuery({
    queryKey: ["myPayments"],
    queryFn: () => paymentService.getMyPayments(),
    enabled: !!booking,
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelBooking(booking!.id),
    onSuccess: (updated) => {
      queryClient.setQueryData(["booking", id], updated);
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
      toast.success("Booking cancelled successfully.");
      setShowModal(false);
    },
    onError: () => {
      toast.error("Failed to cancel booking.");
    },
  });

  const ticketData: TicketData | null = useMemo(() => {
    if (!booking) return null;
    const payment = payments?.find((p) => p.bookingId === booking.id);

    const depTime = booking.departureTimeStr || booking.bookingDate;
    const arrTime = booking.arrivalTime || "";

    return {
      bookingId: booking.id,
      bookingDate: formatDateStr(booking.bookingDate),
      status: booking.status,
      passengerName: booking.userName || "Passenger",
      passengerEmail: booking.userEmail || "",
      flightNumber: booking.flightNumber,
      airlineName: booking.airlineName,
      source: booking.source,
      sourceCode: getAirportCode(booking.source),
      destination: booking.destination,
      destinationCode: getAirportCode(booking.destination),
      departureDate: depTime ? formatDateStr(depTime) : formatDateStr(booking.bookingDate),
      departureTime: depTime ? formatTimeStr(depTime) : "--:--",
      arrivalTime: arrTime ? formatTimeStr(arrTime) : "Check Airline",
      duration: booking.duration || "",
      numberOfSeats: booking.numberOfSeats,
      selectedSeats: booking.selectedSeats || [],
      foodOrders: booking.foodOrders || payment?.foodOrders || [],
      foodTotal: booking.foodTotal || payment?.foodTotal || 0,
      mealSkipped: booking.mealSkipped || payment?.mealSkipped || false,
      cabinClass: "Economy",
      cabinBaggage: "7 kg per person",
      checkInBaggage: "15 kg per person",
      razorpayPaymentId: payment?.razorpayPaymentId || booking.paymentId || "",
      baseFare: booking.baseFlightFare || payment?.baseFare || Math.round(booking.totalPrice * 0.82),
      taxes: booking.taxes || payment?.taxes || Math.round(booking.totalPrice * 0.15),
      convenienceFee: booking.convenienceFee || payment?.convenienceFee || 199,
      totalAmount: booking.totalPrice,
      currency: "INR",
    };
  }, [booking, payments]);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message="Failed to load booking details." />;
  if (!booking) return <ErrorMessage message="Booking not found." />;

  const statusStyle = STATUS_STYLES[booking.status] ?? { bg: "rgba(156,163,175,0.08)", border: "rgba(156,163,175,0.2)", color: "var(--nw-text-secondary)", label: booking.status };
  const payment = payments?.find((p) => p.bookingId === booking.id);

  const sectionHeadingSx = {
    fontSize: "0.65rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    color: "var(--nw-primary)",
    fontWeight: 700,
    mb: 2,
    display: "flex",
    alignItems: "center",
    gap: 1,
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 3 }, py: { xs: 3, md: 5 } }}>
      {/* Breadcrumbs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon sx={{ fontSize: 16, color: "var(--nw-text-disabled)" }} />}
          sx={{ mb: 3 }}
        >
          <MuiLink
            component={Link}
            to="/"
            sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "var(--nw-text-muted)", fontSize: "0.85rem", textDecoration: "none", "&:hover": { color: "var(--nw-primary)" } }}
          >
            <HomeOutlinedIcon sx={{ fontSize: 16 }} />
            Home
          </MuiLink>
          <MuiLink
            component={Link}
            to="/my-bookings"
            sx={{ color: "var(--nw-text-muted)", fontSize: "0.85rem", textDecoration: "none", "&:hover": { color: "var(--nw-primary)" } }}
          >
            My Bookings
          </MuiLink>
          <Typography sx={{ color: "var(--nw-text-primary)", fontSize: "0.85rem", fontWeight: 500 }}>
            #{booking.id.slice(-8).toUpperCase()}
          </Typography>
        </Breadcrumbs>
      </motion.div>

      {/* Status Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Paper
          sx={{
            background: statusStyle.bg,
            border: `1px solid ${statusStyle.border}`,
            borderRadius: "16px",
            p: 2.5,
            mb: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {booking.status === "CONFIRMED" ? (
              <CheckCircleIcon sx={{ color: statusStyle.color, fontSize: 24 }} />
            ) : (
              <CancelOutlinedIcon sx={{ color: statusStyle.color, fontSize: 24 }} />
            )}
            <Box>
              <Typography sx={{ color: statusStyle.color, fontWeight: 700, fontSize: "1rem" }}>
                Booking {statusStyle.label}
              </Typography>
              <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.8rem" }}>
                Booked on {formatDateStr(booking.bookingDate)}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={`#${booking.id.slice(-8).toUpperCase()}`}
            sx={{
              fontFamily: "monospace",
              fontWeight: 700,
              fontSize: "0.75rem",
              background: "var(--nw-primary-10)",
              border: "1px solid var(--nw-primary-20)",
              color: "var(--nw-primary)",
            }}
          />
        </Paper>
      </motion.div>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 340px" }, gap: 3 }}>
        {/* LEFT — Details */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Flight Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <Paper sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", p: 3 }}>
              <Typography sx={sectionHeadingSx}>
                <FlightIcon sx={{ fontSize: 16 }} />
                Flight Summary
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: "10px", background: "var(--nw-primary-08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FlightIcon sx={{ color: "var(--nw-primary)", fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography sx={{ color: "var(--nw-text-primary)", fontWeight: 600, fontSize: "0.95rem" }}>{booking.airlineName}</Typography>
                  <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.8rem", fontFamily: "monospace" }}>{booking.flightNumber}</Typography>
                </Box>
              </Box>

              {/* Route */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.3 }}>
                    <FlightTakeoffIcon sx={{ fontSize: 14, color: "var(--nw-primary)" }} />
                    <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.65rem", textTransform: "uppercase" }}>From</Typography>
                  </Box>
                  <Typography sx={{ color: "var(--nw-text-primary)", fontWeight: 700, fontSize: "1.1rem" }}>{booking.source}</Typography>
                  {ticketData && (
                    <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.8rem" }}>{ticketData.departureTime}</Typography>
                  )}
                </Box>
                <Box sx={{ px: 2 }}>
                  <Box sx={{ width: 60, height: 0, borderTop: "2px dashed var(--nw-primary-30)", position: "relative" }}>
                    <FlightIcon sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(90deg)", color: "var(--nw-primary)", fontSize: 16, background: "var(--nw-card)", px: 0.3 }} />
                  </Box>
                </Box>
                <Box sx={{ flex: 1, textAlign: "right" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.3, justifyContent: "flex-end" }}>
                    <FlightLandIcon sx={{ fontSize: 14, color: "var(--nw-primary)" }} />
                    <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.65rem", textTransform: "uppercase" }}>To</Typography>
                  </Box>
                  <Typography sx={{ color: "var(--nw-text-primary)", fontWeight: 700, fontSize: "1.1rem" }}>{booking.destination}</Typography>
                  {ticketData && (
                    <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.8rem" }}>{ticketData.arrivalTime}</Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          </motion.div>

          {/* Seat Assignment */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
            <Paper sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", p: 3 }}>
              <Typography sx={sectionHeadingSx}>
                <AirlineSeatReclineExtraIcon sx={{ fontSize: 16 }} />
                Passengers & Seats
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.85rem" }}>
                  {booking.numberOfSeats} passenger{booking.numberOfSeats > 1 ? "s" : ""} • Economy Class
                </Typography>
              </Box>
              {booking.selectedSeats && booking.selectedSeats.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {booking.selectedSeats.map((seat, i) => (
                    <Chip
                      key={seat}
                      label={`Passenger ${i + 1} — Seat ${seat}`}
                      sx={{
                        background: "var(--nw-primary-08)",
                        border: "1px solid var(--nw-primary-20)",
                        color: "var(--nw-primary)",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                      }}
                    />
                  ))}
                </Box>
              )}
            </Paper>
          </motion.div>

          {/* Meals Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
            <Paper sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", p: 3 }}>
              <Typography sx={sectionHeadingSx}>
                <RestaurantMenuIcon sx={{ fontSize: 16 }} />
                Meals Summary
              </Typography>
              {ticketData?.mealSkipped || !ticketData?.foodOrders?.length ? (
                <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.85rem" }}>No meals selected.</Typography>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {ticketData.foodOrders.filter(o => o.items.length > 0).map((order) => (
                    <Box key={order.seatNumber} sx={{ background: "var(--nw-primary-04)", border: "1px solid var(--nw-primary-10)", borderRadius: "10px", p: 2 }}>
                      <Typography sx={{ color: "var(--nw-text-primary)", fontWeight: 600, fontSize: "0.85rem", mb: 0.8 }}>
                        Seat {order.seatNumber}
                      </Typography>
                      {order.items.map((item) => (
                        <Box key={item.foodItemId} sx={{ display: "flex", justifyContent: "space-between", mb: 0.3 }}>
                          <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.8rem" }}>{item.foodItemName} × {item.quantity}</Typography>
                          <Typography sx={{ color: "var(--nw-text-primary)", fontSize: "0.8rem" }}>₹{(item.price * item.quantity).toLocaleString("en-IN")}</Typography>
                        </Box>
                      ))}
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </motion.div>

          {/* Payment Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
            <Paper sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", p: 3 }}>
              <Typography sx={sectionHeadingSx}>
                <PaymentIcon sx={{ fontSize: 16 }} />
                Payment Details
              </Typography>
              {ticketData && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.85rem" }}>Base Fare</Typography>
                    <Typography sx={{ color: "var(--nw-text-primary)", fontSize: "0.85rem" }}>₹{ticketData.baseFare.toLocaleString("en-IN")}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.85rem" }}>Taxes & Fees</Typography>
                    <Typography sx={{ color: "var(--nw-text-primary)", fontSize: "0.85rem" }}>₹{ticketData.taxes.toLocaleString("en-IN")}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.85rem" }}>Convenience Fee</Typography>
                    <Typography sx={{ color: "var(--nw-text-primary)", fontSize: "0.85rem" }}>₹{ticketData.convenienceFee.toLocaleString("en-IN")}</Typography>
                  </Box>
                  {(ticketData.foodTotal || 0) > 0 && (
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.85rem" }}>Meals</Typography>
                      <Typography sx={{ color: "var(--nw-text-primary)", fontSize: "0.85rem" }}>₹{ticketData.foodTotal?.toLocaleString("en-IN")}</Typography>
                    </Box>
                  )}
                  <Divider sx={{ borderColor: "var(--nw-border)" }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ color: "var(--nw-text-primary)", fontWeight: 700, fontSize: "1rem" }}>Total</Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", background: "linear-gradient(135deg, var(--nw-primary), var(--nw-secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                      ₹{ticketData.totalAmount.toLocaleString("en-IN")}
                    </Typography>
                  </Box>
                  {payment?.razorpayPaymentId && (
                    <Typography sx={{ color: "var(--nw-text-disabled)", fontSize: "0.75rem", fontFamily: "monospace", mt: 1 }}>
                      Payment ID: {payment.razorpayPaymentId}
                    </Typography>
                  )}
                </Box>
              )}
            </Paper>
          </motion.div>

          {/* Cancellation Policy */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
            <Paper sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", p: 3 }}>
              <Typography sx={sectionHeadingSx}>
                <GavelIcon sx={{ fontSize: 16 }} />
                Cancellation Policy
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {[
                  { time: "24+ hrs before departure", refund: "Full refund", color: "var(--nw-success-bright)" },
                  { time: "12-24 hrs before departure", refund: "50% refund", color: "var(--nw-secondary)" },
                  { time: "Less than 12 hrs", refund: "No refund", color: "var(--nw-error)" },
                ].map((row) => (
                  <Box key={row.time} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.85rem" }}>{row.time}</Typography>
                    <Typography sx={{ color: row.color, fontSize: "0.85rem", fontWeight: 600 }}>{row.refund}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </motion.div>

          {/* Ticket Preview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}>
            <Paper
              sx={{
                border: "2px dashed var(--nw-primary-30)",
                borderRadius: "16px",
                p: 2,
                background: "transparent",
              }}
            >
              {ticketData && <TicketCard ref={ticketRef} ticket={ticketData} />}
            </Paper>
          </motion.div>
        </Box>

        {/* RIGHT — Actions Sidebar */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
            <Paper sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", p: 3, position: "sticky", top: 86 }}>
              <Typography sx={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--nw-primary)", fontWeight: 700, mb: 2.5 }}>
                Actions
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {/* Download Ticket */}
                {booking.status !== "CANCELLED" && (
                  <Button
                    onClick={() => downloadTicket(booking.id.slice(-8), booking.userName || "Ticket")}
                    disabled={isDownloading}
                    fullWidth
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    sx={{
                      py: 1.5,
                      borderRadius: "12px",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      background: "linear-gradient(135deg, var(--nw-primary), var(--nw-primary-dark))",
                      "&:hover": { background: "linear-gradient(135deg, var(--nw-primary-dark), var(--nw-error))" },
                      "&.Mui-disabled": { background: "var(--nw-border)", color: "var(--nw-text-disabled)" },
                    }}
                  >
                    {isDownloading ? "Generating..." : "Download Ticket"}
                  </Button>
                )}

                {/* Cancel Booking */}
                {booking.status === "CONFIRMED" && (
                  <Button
                    onClick={() => setShowModal(true)}
                    fullWidth
                    startIcon={<CancelOutlinedIcon />}
                    sx={{
                      py: 1.5,
                      borderRadius: "12px",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      color: "var(--nw-error)",
                      border: "1px solid var(--nw-error-20)",
                      background: "var(--nw-error-06)",
                      textTransform: "none",
                      "&:hover": { background: "var(--nw-error-12)", border: "1px solid var(--nw-error-30)" },
                    }}
                  >
                    Cancel Booking
                  </Button>
                )}

                {/* Contact Support */}
                <Button
                  fullWidth
                  startIcon={<SupportAgentIcon />}
                  disabled
                  sx={{
                    py: 1.5,
                    borderRadius: "12px",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "var(--nw-text-muted)",
                    border: "1px solid var(--nw-border-strong)",
                    textTransform: "none",
                    "&.Mui-disabled": { color: "var(--nw-text-disabled)" },
                  }}
                >
                  Contact Support
                </Button>

                {/* Share / Copy Link */}
                <Button
                  fullWidth
                  startIcon={<ContentCopyIcon />}
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Booking link copied!");
                  }}
                  sx={{
                    py: 1.5,
                    borderRadius: "12px",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "var(--nw-text-secondary)",
                    border: "1px solid var(--nw-border-strong)",
                    textTransform: "none",
                    "&:hover": { background: "var(--nw-border-soft)", border: "1px solid var(--nw-border-strong)" },
                  }}
                >
                  Copy Booking Link
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </Box>
      </Box>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        PaperProps={{
          sx: {
            background: "var(--nw-card)",
            border: "1px solid var(--nw-border-strong)",
            borderRadius: "16px",
            maxWidth: 400,
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
          <WarningAmberIcon sx={{ color: "var(--nw-error)" }} />
          <Typography sx={{ color: "var(--nw-text-primary)", fontWeight: 700, fontSize: "1.1rem" }}>
            Cancel Booking?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.9rem" }}>
            Are you sure you want to cancel this booking? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button
            onClick={() => setShowModal(false)}
            sx={{
              borderRadius: "10px",
              color: "var(--nw-text-secondary)",
              border: "1px solid var(--nw-border-strong)",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { background: "var(--nw-border-soft)" },
            }}
          >
            Keep Booking
          </Button>
          <Button
            onClick={() => cancelMutation.mutate()}
            disabled={cancelMutation.isPending}
            sx={{
              borderRadius: "10px",
              background: "var(--nw-error-10)",
              border: "1px solid var(--nw-error-30)",
              color: "var(--nw-error)",
              textTransform: "none",
              fontWeight: 700,
              "&:hover": { background: "var(--nw-error-20)" },
            }}
          >
            {cancelMutation.isPending ? "Cancelling..." : "Yes, Cancel"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}




