import { apiClient } from "./client";
import type { ApiResponse, Product } from "../types";

export const productsApi = {
  list: () => apiClient.get<ApiResponse<Product[]>>("/products"),

  getById: (id: string) => apiClient.get<ApiResponse<Product>>(`/products/${id}`),

  create: (formData: FormData) =>
    apiClient.post<ApiResponse<Product>>("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: string, formData: FormData) =>
    apiClient.patch<ApiResponse<Product>>(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updateJson: (id: string, data: unknown) => apiClient.patch<ApiResponse<Product>>(`/products/${id}`, data),

  remove: (id: string) => apiClient.delete<ApiResponse<Product>>(`/products/${id}`),
};
