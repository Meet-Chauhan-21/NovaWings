// src/components/TicketCard.tsx
// Professional airline-grade e-ticket / boarding pass component

import { forwardRef } from "react";
import type { TicketData } from "../types";
import QRCodeDisplay from "./QRCodeDisplay";

interface TicketCardProps {
  ticket: TicketData;
  compact?: boolean;
}

const TicketCard = forwardRef<HTMLDivElement, TicketCardProps>(
  ({ ticket, compact = false }, ref) => {
    if (compact) {
      return <CompactTicket ticket={ticket} />;
    }

    return (
      <div
        ref={ref}
        className="max-w-2xl mx-auto bg-white rounded-3xl overflow-hidden"
        style={{
          border: "1px solid #e2e8f0",
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* ═══ SECTION 1 — HEADER BAR ═══ */}
        <div
          style={{
            background: "linear-gradient(135deg, #0284c7, #0ea5e9)",
            padding: "20px 28px",
            color: "white",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">✈</span>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  letterSpacing: 2,
                  textTransform: "uppercase" as const,
                }}
              >
                NovaWings
              </span>
            </div>
            <span
              style={{
                fontSize: 11,
                letterSpacing: 3,
                opacity: 0.85,
                textTransform: "uppercase" as const,
              }}
            >
              E-Ticket / Boarding Pass
            </span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "monospace",
              }}
            >
              Booking Reference: {ticket.bookingId.slice(-12).toUpperCase()}
            </span>
            <div className="flex items-center gap-3">
              <span style={{ fontSize: 12, opacity: 0.8 }}>
                Issued: {ticket.bookingDate}
              </span>
              <span
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.4)",
                  borderRadius: 20,
                  padding: "3px 12px",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                ✅ {ticket.status}
              </span>
            </div>
          </div>
        </div>

        {/* ═══ SECTION 2 — FLIGHT INFO ═══ */}
        <div style={{ padding: "28px 28px 20px" }}>
          {/* Airline + Flight number + Class */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>
                {ticket.airlineName}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span
                style={{
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: "4px 12px",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "monospace",
                  color: "#334155",
                }}
              >
                {ticket.flightNumber}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "#64748b",
                  fontWeight: 500,
                }}
              >
                {ticket.cabinClass}
              </span>
            </div>
          </div>

          {/* Times + Route */}
          <div className="flex items-center justify-between">
            {/* Departure */}
            <div className="text-left">
              <p
                style={{
                  fontSize: 42,
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1,
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}
              >
                {ticket.departureTime}
              </p>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#1e293b",
                  textTransform: "uppercase" as const,
                  letterSpacing: 1,
                  marginTop: 4,
                }}
              >
                {ticket.source}
              </p>
              <p
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: "#0ea5e9",
                  fontFamily: "monospace",
                }}
              >
                {ticket.sourceCode}
              </p>
            </div>

            {/* Duration line */}
            <div className="flex-1 flex flex-col items-center px-4">
              <span style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
                {ticket.duration || "Direct"}
              </span>
              <div className="w-full flex items-center">
                <div
                  className="flex-1"
                  style={{ borderTop: "2px dashed #cbd5e1" }}
                />
                <span
                  className="mx-2"
                  style={{ color: "#0ea5e9", fontSize: 18 }}
                >
                  ✈
                </span>
                <div
                  className="flex-1"
                  style={{ borderTop: "2px dashed #cbd5e1" }}
                />
              </div>
              <span
                style={{
                  marginTop: 6,
                  background: "#dcfce7",
                  color: "#15803d",
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: 12,
                  padding: "2px 10px",
                }}
              >
                NON-STOP
              </span>
            </div>

            {/* Arrival */}
            <div className="text-right">
              <p
                style={{
                  fontSize: 42,
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1,
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}
              >
                {ticket.arrivalTime}
              </p>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#1e293b",
                  textTransform: "uppercase" as const,
                  letterSpacing: 1,
                  marginTop: 4,
                }}
              >
                {ticket.destination}
              </p>
              <p
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: "#0ea5e9",
                  fontFamily: "monospace",
                }}
              >
                {ticket.destinationCode}
              </p>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center justify-between mt-4">
            <span style={{ fontSize: 13, color: "#475569" }}>
              {ticket.departureDate}
            </span>
          </div>
        </div>

        {/* ═══ TEAR LINE 1 ═══ */}
        <TearLine />

        {/* ═══ SECTION 3 — PASSENGER & SEAT INFO ═══ */}
        <div
          style={{
            background: "#f8fafc",
            padding: "20px 28px",
          }}
        >
          <div
            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
          >
            <InfoCell label="Passenger Name" value={ticket.passengerName} />
            <InfoCell
              label="Seat(s)"
              value={
                ticket.selectedSeats.length > 0
                  ? undefined
                  : "Not Selected"
              }
            >
              {ticket.selectedSeats.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {ticket.selectedSeats.map((seat) => (
                    <span
                      key={seat}
                      style={{
                        background: "#0ea5e9",
                        color: "white",
                        borderRadius: 6,
                        padding: "2px 8px",
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: "monospace",
                      }}
                    >
                      {seat}
                    </span>
                  ))}
                </div>
              )}
            </InfoCell>
            <InfoCell
              label="Passengers"
              value={String(ticket.numberOfSeats)}
            />
            <InfoCell label="Cabin Class" value={ticket.cabinClass} />
            <InfoCell label="Cabin Baggage" value={ticket.cabinBaggage} />
            <InfoCell label="Check-in Baggage" value={ticket.checkInBaggage} />
          </div>
        </div>

        {/* ═══ SECTION 3B — MEAL SUMMARY ═══ */}
        <div
          style={{
            background: "#fffbeb",
            borderTop: "1px solid #fde68a",
            borderBottom: "1px solid #fde68a",
            padding: "12px 28px",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#b45309",
              letterSpacing: 1,
              textTransform: "uppercase" as const,
              marginBottom: 6,
            }}
          >
            In-Flight Meals Selected
          </p>

          {ticket.mealSkipped || !ticket.foodOrders || ticket.foodOrders.length === 0 ? (
            <p style={{ fontSize: 12, color: "#6b7280" }}>No meals selected for this flight</p>
          ) : (
            <div style={{ display: "grid", gap: 6 }}>
              {ticket.foodOrders
                .filter((order) => order.items.length > 0)
                .map((order) => (
                  <div key={order.seatNumber} className="flex items-center justify-between" style={{ fontSize: 12 }}>
                    <span style={{ color: "#334155" }}>
                      <strong>Seat {order.seatNumber}</strong> {order.passengerLabel} - {order.items.map((item) => item.foodItemName).join(", ")}
                    </span>
                    <span style={{ color: "#92400e", fontWeight: 700 }}>
                      ₹{order.subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* ═══ TEAR LINE 2 ═══ */}
        <TearLine />

        {/* ═══ SECTION 4 & 5 — PAYMENT + QR CODE ═══ */}
        <div className="flex flex-col sm:flex-row">
          {/* Payment */}
          <div
            className="flex-1"
            style={{
              padding: "20px 28px",
              borderRight: "1px dashed #e2e8f0",
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "#94a3b8",
                letterSpacing: 1.5,
                textTransform: "uppercase" as const,
                marginBottom: 6,
              }}
            >
              Amount Paid
            </p>
            <p
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: "#16a34a",
                fontFamily: "system-ui, -apple-system, sans-serif",
                lineHeight: 1.1,
              }}
            >
              ₹{ticket.totalAmount.toLocaleString("en-IN")}
            </p>

            <div style={{ marginTop: 12 }}>
              <PriceRow label="Base Fare" amount={ticket.baseFare} />
              <PriceRow label="Taxes & Fees" amount={ticket.taxes} />
              <PriceRow label="Convenience Fee" amount={ticket.convenienceFee} />
              {!!ticket.foodTotal && <PriceRow label="Meals" amount={ticket.foodTotal} />}
              <div
                className="flex justify-between"
                style={{
                  fontWeight: 700,
                  color: "#1e293b",
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: 6,
                  marginTop: 4,
                  fontSize: 13,
                }}
              >
                <span>Total</span>
                <span>₹{ticket.totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {ticket.razorpayPaymentId && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "#94a3b8",
                  background: "#f8fafc",
                  borderRadius: 6,
                  padding: "4px 8px",
                  wordBreak: "break-all",
                }}
              >
                Payment ID: {ticket.razorpayPaymentId}
              </div>
            )}
          </div>

          {/* QR Code */}
          <div
            className="flex flex-col items-center justify-center"
            style={{ padding: "20px 28px", minWidth: 200 }}
          >
            <QRCodeDisplay
              bookingId={ticket.bookingId}
              paymentId={ticket.razorpayPaymentId}
              passengerName={ticket.passengerName}
              flightNumber={ticket.flightNumber}
              route={`${ticket.sourceCode} → ${ticket.destinationCode}`}
              date={ticket.departureDate}
              size={120}
            />
            <p
              style={{
                fontSize: 10,
                color: "#94a3b8",
                marginTop: 8,
                textAlign: "center",
              }}
            >
              Scan to verify ticket
            </p>
            {/* Barcode-style booking ID */}
            <div
              style={{
                fontFamily: "'Libre Barcode 39', monospace",
                fontSize: 32,
                letterSpacing: 4,
                color: "#1e293b",
                marginTop: 12,
              }}
            >
              *{ticket.bookingId.slice(-10).toUpperCase()}*
            </div>
            <p
              style={{
                fontSize: 10,
                fontFamily: "monospace",
                color: "#64748b",
                marginTop: 2,
              }}
            >
              {ticket.bookingId}
            </p>
          </div>
        </div>

        {/* ═══ SECTION 6 — IMPORTANT INFO ═══ */}
        <div style={{ padding: "0 28px", marginBottom: 16 }}>
          <div
            style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: 12,
              padding: "14px 16px",
            }}
          >
            {[
              "Web Check-in opens 48 hours before departure",
              "Arrive at airport 2 hours before departure",
              "Carry a valid government photo ID",
              "This is your e-ticket — no printout needed",
            ].map((info) => (
              <p
                key={info}
                style={{ fontSize: 12, color: "#92400e", margin: "3px 0" }}
              >
                ℹ️ {info}
              </p>
            ))}
          </div>
        </div>

        {/* ═══ SECTION 7 — FOOTER ═══ */}
        <div
          className="flex items-center justify-between flex-wrap gap-2"
          style={{
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            padding: "14px 28px",
            fontSize: 11,
            color: "#94a3b8",
          }}
        >
          <span>✈ SkyBook Travel • support@skybook.in</span>
          <span>Powered by Razorpay ✅ • PNR: {ticket.bookingId.slice(-8).toUpperCase()}</span>
        </div>
      </div>
    );
  }
);

TicketCard.displayName = "TicketCard";
export default TicketCard;

/* ─── Tear Line separator ─── */
function TearLine() {
  return (
    <div className="relative flex items-center" style={{ overflow: "hidden" }}>
      <div
        className="absolute -left-3 w-6 h-6 rounded-full z-10"
        style={{
          background: "#f1f5f9",
          border: "1px solid #e2e8f0",
        }}
      />
      <div className="flex-1 mx-3" style={{ borderTop: "2px dashed #e2e8f0" }} />
      <span style={{ color: "#cbd5e1", fontSize: 14 }}>✂</span>
      <div className="flex-1 mx-3" style={{ borderTop: "2px dashed #e2e8f0" }} />
      <div
        className="absolute -right-3 w-6 h-6 rounded-full z-10"
        style={{
          background: "#f1f5f9",
          border: "1px solid #e2e8f0",
        }}
      />
    </div>
  );
}

/* ─── Info cell for passenger / seat grid ─── */
function InfoCell({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <p
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: "#94a3b8",
          letterSpacing: 1.5,
          textTransform: "uppercase" as const,
          marginBottom: 4,
        }}
      >
        {label}
      </p>
      {children || (
        <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
          {value}
        </p>
      )}
    </div>
  );
}

/* ─── Price row ─── */
function PriceRow({ label, amount }: { label: string; amount: number }) {
  return (
    <div
      className="flex justify-between"
      style={{ fontSize: 12, color: "#64748b", padding: "3px 0" }}
    >
      <span>{label}</span>
      <span>₹{amount.toLocaleString("en-IN")}</span>
    </div>
  );
}

/* ─── Compact Ticket (for list views) ─── */
function CompactTicket({ ticket }: { ticket: TicketData }) {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: "linear-gradient(135deg, #0284c7, #0ea5e9)", color: "white" }}
      >
        <div className="flex items-center gap-2">
          <span>✈</span>
          <span style={{ fontWeight: 700, fontSize: 13 }}>{ticket.flightNumber}</span>
          <span style={{ fontSize: 11, opacity: 0.8 }}>{ticket.airlineName}</span>
        </div>
        <span
          style={{
            background: "rgba(255,255,255,0.2)",
            borderRadius: 12,
            padding: "2px 8px",
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          {ticket.status}
        </span>
      </div>
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="text-center">
          <p style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{ticket.sourceCode}</p>
          <p style={{ fontSize: 11, color: "#64748b" }}>{ticket.departureTime}</p>
        </div>
        <div className="flex-1 mx-3 flex items-center">
          <div className="flex-1" style={{ borderTop: "1px dashed #cbd5e1" }} />
          <span className="mx-1" style={{ color: "#94a3b8", fontSize: 12 }}>✈</span>
          <div className="flex-1" style={{ borderTop: "1px dashed #cbd5e1" }} />
        </div>
        <div className="text-center">
          <p style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{ticket.destinationCode}</p>
          <p style={{ fontSize: 11, color: "#64748b" }}>{ticket.arrivalTime}</p>
        </div>
        <div className="ml-4 text-right">
          <p style={{ fontSize: 18, fontWeight: 800, color: "#16a34a" }}>
            ₹{ticket.totalAmount.toLocaleString("en-IN")}
          </p>
          <p style={{ fontSize: 10, color: "#94a3b8" }}>{ticket.departureDate}</p>
        </div>
      </div>
    </div>
  );
}
