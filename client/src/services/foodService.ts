import axiosInstance from "../api/axiosInstance";
import type { FoodCategory, FoodItem, FoodMenuResponse } from "../types";

const foodService = {
  getMenu: async (
    airline: string,
    cabinClass: string = "Economy"
  ): Promise<FoodMenuResponse> => {
    const response = await axiosInstance.get("/food/menu", {
      params: { airline, cabinClass },
    });
    return response.data;
  },

  getAllCategories: async (): Promise<FoodCategory[]> => {
    const response = await axiosInstance.get("/food/categories/all");
    return response.data;
  },

  createCategory: async (category: Partial<FoodCategory>): Promise<FoodCategory> => {
    const response = await axiosInstance.post("/food/categories", category);
    return response.data;
  },

  updateCategory: async (id: string, category: Partial<FoodCategory>): Promise<FoodCategory> => {
    const response = await axiosInstance.put(`/food/categories/${id}`, category);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/food/categories/${id}`);
  },

  getAllItems: async (): Promise<FoodItem[]> => {
    const response = await axiosInstance.get("/food/items/all");
    return response.data;
  },

  createItem: async (item: Partial<FoodItem>): Promise<FoodItem> => {
    const response = await axiosInstance.post("/food/items", item);
    return response.data;
  },

  updateItem: async (id: string, item: Partial<FoodItem>): Promise<FoodItem> => {
    const response = await axiosInstance.put(`/food/items/${id}`, item);
    return response.data;
  },

  deleteItem: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/food/items/${id}`);
  },

  toggleItem: async (id: string): Promise<FoodItem> => {
    const response = await axiosInstance.patch(`/food/items/${id}/toggle`);
    return response.data;
  },
};

export default foodService;
