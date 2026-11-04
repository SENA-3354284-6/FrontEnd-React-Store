import { apiClient } from "./client";
import type { ApiResponse, Role } from "../types";

export const rolesApi = {
  list: () => apiClient.get<ApiResponse<Role[]>>("/roles"),
};
