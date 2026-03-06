// src/components/DownloadTicketButton.tsx
// Button component for downloading e-ticket PDF from any page

import { useState } from "react";
import toast from "react-hot-toast";
import paymentService from "../services/paymentService";
import { generateTicketPDF } from "../utils/generateTicketPDF";
import { getAirportCode } from "../utils/airportHelper";
import type { BookingResponse, TicketData } from "../types";

interface DownloadTicketButtonProps {
  booking: BookingResponse;
  variant?: "full" | "compact" | "icon";
}

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

export default function DownloadTicketButton({
  booking,
  variant = "full",
}: DownloadTicketButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleDownload() {
    setIsGenerating(true);
    const toastId = toast.loading("Preparing ticket...");

    try {
      // Fetch payment data for price breakdown
      const payments = await paymentService.getMyPayments();
      const payment = payments.find((p) => p.bookingId === booking.id);

      const depTime = booking.departureTimeStr || booking.bookingDate;
      const arrTime = booking.arrivalTime || "";

      const ticketData: TicketData = {
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
        cabinClass: "Economy",
        cabinBaggage: "7 kg per person",
        checkInBaggage: "15 kg per person",
        razorpayPaymentId: payment?.razorpayPaymentId || booking.paymentId || "",
        baseFare: payment?.baseFare || Math.round(booking.totalPrice * 0.82),
        taxes: payment?.taxes || Math.round(booking.totalPrice * 0.15),
        convenienceFee: payment?.convenienceFee || 199,
        totalAmount: booking.totalPrice,
        currency: "INR",
      };

      const safeName = (booking.userName || "Ticket").replace(/\s+/g, "_");
      await generateTicketPDF(
        ticketData,
        `SkyBook_Ticket_${booking.id.slice(-8)}_${safeName}.pdf`,
        toastId
      );
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Download failed. Please try again.", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  }

  const isDisabled = isGenerating || booking.status === "CANCELLED";

  if (variant === "icon") {
    return (
      <button
        onClick={handleDownload}
        disabled={isDisabled}
        title={booking.status === "CANCELLED" ? "Cancelled bookings cannot be downloaded" : "Download Ticket"}
        className="p-2 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <span>📥</span>
        )}
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <button
        onClick={handleDownload}
        disabled={isDisabled}
        title={booking.status === "CANCELLED" ? "Cancelled bookings cannot be downloaded" : "Download Ticket"}
        className="flex items-center gap-2 px-3 py-2 border border-sky-200 text-sky-600 hover:bg-sky-50 rounded-xl text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating...
          </>
        ) : (
          <>📥 Download Ticket</>
        )}
      </button>
    );
  }

  // Full variant
  return (
    <button
      onClick={handleDownload}
      disabled={isDisabled}
      title={booking.status === "CANCELLED" ? "Cancelled bookings cannot be downloaded" : "Download Ticket PDF"}
      className="flex items-center gap-3 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {isGenerating ? (
        <>
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Generating PDF...
        </>
      ) : (
        <>📥 Download Ticket PDF</>
      )}
    </button>
  );
}
