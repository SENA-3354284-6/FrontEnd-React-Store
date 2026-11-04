import { apiClient } from "./client";
import type { ApiResponse, Category } from "../types";

export const categoriesApi = {
  list: () => apiClient.get<ApiResponse<Category[]>>("/categories"),

  getById: (id: string) => apiClient.get<ApiResponse<Category>>(`/categories/${id}`),

  create: (formData: FormData) =>
    apiClient.post<ApiResponse<Category>>("/categories", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: string, formData: FormData) =>
    apiClient.patch<ApiResponse<Category>>(`/categories/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  remove: (id: string) => apiClient.delete<ApiResponse<Category>>(`/categories/${id}`),
};
