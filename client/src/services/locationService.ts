// src/services/locationService.ts
// Service for all location-related API calls

import axiosInstance from "../api/axiosInstance";
import type { Location } from "../types";

const locationService = {
  /** Public — get all active locations (for CityCombobox) */
  getAll: async (): Promise<Location[]> => {
    const res = await axiosInstance.get<Location[]>("/locations");
    return res.data;
  },

  /** Public — search while typing */
  search: async (q: string): Promise<Location[]> => {
    const res = await axiosInstance.get<Location[]>("/locations/search", {
      params: { q },
    });
    return res.data;
  },

  /** Public — explore page cities */
  getExploreCities: async (): Promise<Location[]> => {
    const res = await axiosInstance.get<Location[]>("/locations/explore");
    return res.data;
  },

  /** Public — home page cities */
  getHomeCities: async (): Promise<Location[]> => {
    const res = await axiosInstance.get<Location[]>("/locations/home");
    return res.data;
  },

  /** Admin — get ALL including inactive */
  getAllAdmin: async (): Promise<Location[]> => {
    const res = await axiosInstance.get<Location[]>("/locations/all");
    return res.data;
  },

  /** Admin — create location */
  create: async (location: Partial<Location>): Promise<Location> => {
    const res = await axiosInstance.post<Location>("/locations", location);
    return res.data;
  },

  /** Admin — update location */
  update: async (id: string, location: Partial<Location>): Promise<Location> => {
    const res = await axiosInstance.put<Location>(`/locations/${id}`, location);
    return res.data;
  },

  /** Admin — delete location */
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/locations/${id}`);
  },

  /** Admin — toggle active */
  toggle: async (id: string): Promise<Location> => {
    const res = await axiosInstance.patch<Location>(`/locations/${id}/toggle`);
    return res.data;
  },

  /** Admin — refresh flight counts */
  refreshCounts: async (): Promise<string> => {
    const res = await axiosInstance.post<string>("/locations/refresh-counts");
    return res.data;
  },
};

export default locationService;
