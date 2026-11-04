import { apiClient } from "./client";
import type { ApiResponse, User } from "../types";

export interface LoginResponse {
  msg?: string;
  token: string;
  data: User;
}

export interface RegisterPayload {
  name: string;
  nickname: string;
  email: string;
  password: string;
  avatarUrl?: string;
}

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post<LoginResponse>("/auth/login", credentials),

  register: (payload: RegisterPayload) =>
    apiClient.post<ApiResponse<User>>("/auth/register", payload),

  renewToken: () => apiClient.get<LoginResponse>("/auth/renew-token"),
};
