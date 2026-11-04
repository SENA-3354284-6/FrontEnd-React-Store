import { apiClient } from "./client";
import type { ApiResponse, Cart } from "../types";

export const cartApi = {
  get: () => apiClient.get<ApiResponse<Cart>>("/cart"),

  update: (items: { product: string; quantity: number }[]) =>
    apiClient.put<ApiResponse<Cart>>("/cart", { items }),

  sync: (items: { product: string; quantity: number }[]) =>
    apiClient.post<ApiResponse<Cart>>("/cart/sync", { items }),

  removeItem: (productId: string) =>
    apiClient.delete<ApiResponse<Cart>>(`/cart/item/${productId}`),

  clear: () => apiClient.delete<ApiResponse<Cart>>("/cart"),
};
