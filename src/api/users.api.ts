import { apiClient } from "./client";
import type { ApiResponse, User } from "../types";

export const usersApi = {
  getAll: () => apiClient.get<ApiResponse<User[]>>("/users"),

  getById: (id: string) => apiClient.get<ApiResponse<User>>(`/users/${id}`),

  create: (formData: FormData) =>
    apiClient.post<ApiResponse<User>>("/users", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: string, formData: FormData) =>
    apiClient.patch<ApiResponse<User>>(`/users/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  remove: (id: string) => apiClient.delete<ApiResponse<User>>(`/users/${id}`),
};
