import { apiClient } from "./client";
import type { ApiResponse, Order } from "../types";

export const ordersApi = {
  create: (payload: {
    shippingAddress: { address: string; city: string; phone: string; notes?: string };
    paymentMethod: string;
    items?: { product: string; quantity: number }[];
  }) => apiClient.post<ApiResponse<Order>>("/orders", payload),

  getAll: () => apiClient.get<ApiResponse<Order[]>>("/orders"),

  getById: (id: string) => apiClient.get<ApiResponse<Order>>(`/orders/${id}`),
};
