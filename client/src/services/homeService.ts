// src/services/homeService.ts
// Service for homepage configuration API calls

import axiosInstance from "../api/axiosInstance";
import type { HomeConfig } from "../types";

const homeService = {
  /** Fetch homepage config (public) */
  getConfig: async (): Promise<HomeConfig> => {
    const res = await axiosInstance.get<HomeConfig>("/home/config");
    return res.data;
  },

  /** Admin update homepage config */
  updateConfig: async (config: HomeConfig): Promise<HomeConfig> => {
    const res = await axiosInstance.put<HomeConfig>("/home/config", config);
    return res.data;
  },

  /** Get distinct airlines from DB */
  getAirlines: async (): Promise<string[]> => {
    const res = await axiosInstance.get<string[]>("/flights/airlines");
    return res.data;
  },
};

export default homeService;
