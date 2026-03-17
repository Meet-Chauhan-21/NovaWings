// src/components/BookingCard.tsx
// Displays a single booking as a dark themed MUI card with route display & actions

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DownloadTicketButton from "./DownloadTicketButton";
import type { BookingResponse } from "../types";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import FlightIcon from "@mui/icons-material/Flight";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import EventIcon from "@mui/icons-material/Event";
import AirlineSeatReclineExtraIcon from "@mui/icons-material/AirlineSeatReclineExtra";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

interface BookingCardProps {
  booking: BookingResponse;
  onCancel?: (bookingId: string) => void;
  isCancelling?: boolean;
}

const STATUS_STYLES: Record<string, { bg: string; border: string; color: string }> = {
  CONFIRMED: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", color: "#22C55E" },
  CANCELLED: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", color: "#EF4444" },
};

const BookingCard: React.FC<BookingCardProps> = React.memo(({ booking, onCancel, isCancelling }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);

  const s = STATUS_STYLES[booking.status] ?? { bg: "rgba(156,163,175,0.1)", border: "rgba(156,163,175,0.3)", color: "#9CA3AF" };

  const formatDate = (iso: string): string => {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <Paper
        sx={{
          background: "var(--nw-card)",
          border: "1px solid var(--nw-border)",
          borderRadius: "16px",
          overflow: "hidden",
          transition: "all 0.2s ease",
          height: "100%",
          "&:hover": {
            border: "1px solid rgba(249,115,22,0.2)",
            boxShadow: "0 8px 30px rgba(15,23,42,0.12)",
          },
        }}
      >
        {/* Top gradient line */}
        <Box sx={{ height: 3, background: "linear-gradient(90deg, #F97316, #F59E0B)" }} />

        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          {/* Header row: Booking ID + Status */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
            <Chip
              label={`#${booking.id.slice(-8).toUpperCase()}`}
              size="small"
              sx={{
                fontFamily: "monospace",
                fontWeight: 700,
                fontSize: "0.7rem",
                background: "rgba(249,115,22,0.1)",
                border: "1px solid rgba(249,115,22,0.2)",
                color: "#F97316",
                letterSpacing: "0.05em",
              }}
            />
            <Chip
              label={booking.status}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: "0.65rem",
                background: s.bg,
                border: `1px solid ${s.border}`,
                color: s.color,
                letterSpacing: "0.05em",
              }}
            />
          </Box>

          {/* Airline info */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                background: "rgba(249,115,22,0.08)",
                border: "1px solid rgba(249,115,22,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FlightIcon sx={{ color: "#F97316", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ color: "var(--nw-text-primary)", fontWeight: 600, fontSize: "0.9rem" }}>
                {booking.airlineName}
              </Typography>
              <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.75rem", fontFamily: "monospace" }}>
                {booking.flightNumber}
              </Typography>
            </Box>
          </Box>

          {/* Route display */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.3 }}>
                <FlightTakeoffIcon sx={{ fontSize: 14, color: "#F97316" }} />
                <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  From
                </Typography>
              </Box>
              <Typography sx={{ color: "var(--nw-text-primary)", fontWeight: 700, fontSize: "1.05rem" }}>
                {booking.source}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", px: 1 }}>
              <Box sx={{ width: 50, height: 0, borderTop: "2px dashed rgba(249,115,22,0.25)", position: "relative" }}>
                <FlightIcon
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%) rotate(90deg)",
                    color: "#F97316",
                    fontSize: 16,
                    background: "var(--nw-card)",
                    px: 0.2,
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ flex: 1, textAlign: "right" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.3, justifyContent: "flex-end" }}>
                <FlightLandIcon sx={{ fontSize: 14, color: "#F97316" }} />
                <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  To
                </Typography>
              </Box>
              <Typography sx={{ color: "var(--nw-text-primary)", fontWeight: 700, fontSize: "1.05rem" }}>
                {booking.destination}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: "var(--nw-border)", mb: 2 }} />

          {/* Bottom row: Details + Price */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <AirlineSeatReclineExtraIcon sx={{ fontSize: 14, color: "var(--nw-text-muted)" }} />
                <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.8rem" }}>
                  {booking.numberOfSeats} seat{booking.numberOfSeats > 1 ? "s" : ""}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <EventIcon sx={{ fontSize: 14, color: "var(--nw-text-muted)" }} />
                <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.8rem" }}>
                  {formatDate(booking.bookingDate)}
                </Typography>
              </Box>
            </Box>

            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "1.15rem",
                background: "linear-gradient(135deg, #F97316, #F59E0B)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ₹{booking.totalPrice.toLocaleString("en-IN")}
            </Typography>
          </Box>

          {/* Action buttons */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button
              size="small"
              startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={() => navigate(`/bookings/${booking.id}`)}
              sx={{
                borderRadius: "8px",
                fontSize: "0.75rem",
                color: "#F97316",
                border: "1px solid rgba(249,115,22,0.2)",
                background: "rgba(249,115,22,0.06)",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  background: "rgba(249,115,22,0.12)",
                  border: "1px solid rgba(249,115,22,0.3)",
                },
              }}
            >
              View Details
            </Button>

            <Box onClick={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); }}>
              <DownloadTicketButton booking={booking} variant="compact" />
            </Box>

            {booking.status === "CONFIRMED" && onCancel && (
              <Button
                size="small"
                startIcon={<CancelOutlinedIcon sx={{ fontSize: 16 }} />}
                onClick={() => setCancelDialog(true)}
                sx={{
                  borderRadius: "8px",
                  fontSize: "0.75rem",
                  color: "#EF4444",
                  border: "1px solid rgba(239,68,68,0.2)",
                  background: "rgba(239,68,68,0.06)",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    background: "rgba(239,68,68,0.12)",
                    border: "1px solid rgba(239,68,68,0.3)",
                  },
                }}
              >
                Cancel
              </Button>
            )}

            {/* Expand toggle */}
            <Button
              size="small"
              onClick={() => setExpanded(!expanded)}
              endIcon={expanded ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: "8px",
                fontSize: "0.75rem",
                color: "var(--nw-text-muted)",
                textTransform: "none",
                ml: "auto",
                "&:hover": { background: "var(--nw-glass)" },
              }}
            >
              {expanded ? "Less" : "More"}
            </Button>
          </Box>

          {/* Expandable details */}
          <Collapse in={expanded}>
            <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid var(--nw-border)" }}>
              {booking.selectedSeats && booking.selectedSeats.length > 0 && (
                <Box sx={{ mb: 1.5 }}>
                  <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.8 }}>
                    Seats
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {booking.selectedSeats.map((seat) => (
                      <Chip
                        key={seat}
                        label={seat}
                        size="small"
                        sx={{
                          background: "rgba(249,115,22,0.08)",
                          border: "1px solid rgba(249,115,22,0.2)",
                          color: "#F97316",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          height: 24,
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
              {booking.paymentId && (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography sx={{ color: "var(--nw-text-disabled)", fontSize: "0.7rem", fontFamily: "monospace" }}>
                    Payment: {booking.paymentId}
                  </Typography>
                  <Chip
                    label="Paid"
                    size="small"
                    sx={{
                      background: "rgba(34,197,94,0.1)",
                      border: "1px solid rgba(34,197,94,0.2)",
                      color: "#22C55E",
                      fontWeight: 700,
                      fontSize: "0.6rem",
                      height: 20,
                    }}
                  />
                </Box>
              )}
            </Box>
          </Collapse>
        </Box>
      </Paper>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialog}
        onClose={() => setCancelDialog(false)}
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
          <WarningAmberIcon sx={{ color: "#EF4444" }} />
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
            onClick={() => setCancelDialog(false)}
            sx={{
              borderRadius: "10px",
              color: "var(--nw-text-secondary)",
              border: "1px solid var(--nw-border-strong)",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { background: "var(--nw-glass)" },
            }}
          >
            Keep Booking
          </Button>
          <Button
            onClick={() => {
              onCancel?.(booking.id);
              setCancelDialog(false);
            }}
            disabled={isCancelling}
            sx={{
              borderRadius: "10px",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#EF4444",
              textTransform: "none",
              fontWeight: 700,
              "&:hover": { background: "rgba(239,68,68,0.2)" },
            }}
          >
            {isCancelling ? "Cancelling..." : "Yes, Cancel"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

BookingCard.displayName = "BookingCard";

export default BookingCard;
