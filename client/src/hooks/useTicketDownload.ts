// src/hooks/useTicketDownload.ts
// Hook for downloading ticket as PDF using html2canvas + jsPDF

import { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";

export function useTicketDownload() {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  async function downloadTicket(bookingId: string, passengerName: string) {
    if (!ticketRef.current) return;
    setIsDownloading(true);

    const toastId = toast.loading("Generating your ticket PDF...");

    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 15000,
        windowWidth: ticketRef.current.scrollWidth,
        windowHeight: ticketRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 10;
      const usableWidth = pdfWidth - margin * 2;

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgWidth / imgHeight;
      let calcHeight = usableWidth / ratio;

      pdf.setProperties({
        title: `E-Ticket ${bookingId} — SkyBook`,
        subject: `Flight Ticket for ${passengerName}`,
        author: "SkyBook Flight System",
        creator: "SkyBook",
      });

      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

      if (calcHeight > pdfHeight - margin * 2) {
        const scaledHeight = pdfHeight - margin * 2;
        const scaledWidth = scaledHeight * ratio;
        const xOffset = (pdfWidth - scaledWidth) / 2;
        pdf.addImage(imgData, "PNG", xOffset, margin, scaledWidth, scaledHeight, undefined, "FAST");
      } else {
        pdf.addImage(imgData, "PNG", margin, margin, usableWidth, calcHeight, undefined, "FAST");
      }

      const safeName = passengerName.replace(/\s+/g, "_");
      const filename = `SkyBook_Ticket_${bookingId.slice(-8)}_${safeName}.pdf`;

      pdf.save(filename);
      toast.success("Ticket downloaded!", { id: toastId });
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Download failed. Please try again.", { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  }

  return { ticketRef, downloadTicket, isDownloading };
}
