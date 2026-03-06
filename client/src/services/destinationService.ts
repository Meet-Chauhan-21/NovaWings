// src/services/destinationService.ts
import axiosInstance from "../api/axiosInstance";
import type { DestinationCard } from "../types";

const destinationService = {
  getAll: async (): Promise<DestinationCard[]> => {
    const res = await axiosInstance.get("/destinations");
    return res.data;
  },

  getFeatured: async (): Promise<DestinationCard[]> => {
    const res = await axiosInstance.get("/destinations/featured");
    return res.data;
  },

  getAllAdmin: async (): Promise<DestinationCard[]> => {
    const res = await axiosInstance.get("/destinations/all");
    return res.data;
  },

  create: async (card: Partial<DestinationCard>): Promise<DestinationCard> => {
    const res = await axiosInstance.post("/destinations", card);
    return res.data;
  },

  update: async (
    id: string,
    card: Partial<DestinationCard>
  ): Promise<DestinationCard> => {
    const res = await axiosInstance.put(`/destinations/${id}`, card);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/destinations/${id}`);
  },

  toggle: async (id: string): Promise<DestinationCard> => {
    const res = await axiosInstance.patch(`/destinations/${id}/toggle`);
    return res.data;
  },

  toggleFeatured: async (id: string): Promise<DestinationCard> => {
    const res = await axiosInstance.patch(`/destinations/${id}/feature`);
    return res.data;
  },

  updateOrder: async (id: string, order: number): Promise<DestinationCard> => {
    const res = await axiosInstance.patch(`/destinations/${id}/order`, {
      order,
    });
    return res.data;
  },
};

export default destinationService;
