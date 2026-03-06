// src/utils/generateTicketPDF.ts
// Utility to render a TicketCard off-screen and generate a downloadable PDF

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ReactDOM from "react-dom/client";
import React from "react";
import type { TicketData } from "../types";
import TicketCard from "../components/TicketCard";
import toast from "react-hot-toast";

export async function generateTicketPDF(
  ticketData: TicketData,
  filename: string,
  toastId?: string
) {
  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 700px;
    background: white;
    z-index: -9999;
  `;
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);
  await new Promise<void>((resolve) => {
    root.render(
      React.createElement(TicketCard, {
        ticket: ticketData,
        compact: false,
      })
    );
    setTimeout(resolve, 800);
  });

  try {
    const canvas = await html2canvas(container, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const margin = 8;
    const pdfWidth = 210 - margin * 2;
    const imgRatio = canvas.height / canvas.width;
    const imgHeight = pdfWidth * imgRatio;

    pdf.setProperties({
      title: `Flight Ticket — ${ticketData.bookingId}`,
      author: "SkyBook",
    });

    pdf.addImage(imgData, "PNG", margin, margin, pdfWidth, imgHeight);
    pdf.save(filename);

    if (toastId) {
      toast.success("Ticket downloaded!", { id: toastId });
    }
  } finally {
    root.unmount();
    document.body.removeChild(container);
  }
}
