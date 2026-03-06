// src/components/QRCodeDisplay.tsx
// Generates and displays a QR code with booking details

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface QRCodeDisplayProps {
  bookingId: string;
  paymentId: string;
  passengerName: string;
  flightNumber: string;
  route: string;
  date: string;
  size?: number;
}

export default function QRCodeDisplay({
  bookingId,
  paymentId,
  passengerName,
  flightNumber,
  route,
  date,
  size = 120,
}: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const qrData = JSON.stringify({
      bookingId,
      paymentId,
      passenger: passengerName,
      flight: flightNumber,
      route,
      date,
      issuer: "SkyBook Flight System",
    });

    QRCode.toCanvas(
      canvasRef.current,
      qrData,
      {
        width: size,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
        errorCorrectionLevel: "M",
      },
      (error) => {
        if (error) console.error("QR Code error:", error);
      }
    );
  }, [bookingId, paymentId, passengerName, flightNumber, route, date, size]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-xl border-2 border-gray-100"
      style={{ width: size, height: size }}
    />
  );
}
