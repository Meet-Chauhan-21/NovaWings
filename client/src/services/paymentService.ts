// src/services/paymentService.ts
// Service for all payment-related API calls

import axiosInstance from "../api/axiosInstance";
import type { CreateOrderResponse, PaymentRecord } from "../types";

const paymentService = {
  createOrder: async (data: {
    flightId: string;
    numberOfSeats: number;
    selectedSeats: string[];
    totalAmount: number;
  }): Promise<CreateOrderResponse> => {
    const res = await axiosInstance.post("/payments/create-order", data);
    return res.data;
  },

  verifyPayment: async (data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => {
    const res = await axiosInstance.post("/payments/verify", data);
    return res.data;
  },

  getMyPayments: async (): Promise<PaymentRecord[]> => {
    const res = await axiosInstance.get("/payments/my");
    return res.data;
  },

  getAllPayments: async (): Promise<PaymentRecord[]> => {
    const res = await axiosInstance.get("/payments/all");
    return res.data;
  },

  getTotalRevenue: async (): Promise<number> => {
    const res = await axiosInstance.get("/payments/revenue");
    return res.data.totalRevenue;
  },
};

export default paymentService;
