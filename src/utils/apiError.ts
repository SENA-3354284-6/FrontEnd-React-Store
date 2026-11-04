import { isAxiosError } from "axios";

import type { ApiResponse } from "../types";

export function getApiErrorMessage(error: unknown, fallback = "Ocurrió un error inesperado"): string {
  if (isAxiosError<ApiResponse>(error)) {
    const data = error.response?.data;
    if (data?.msg) {
      return String(data.msg);
    }
    if (data?.errors) {
      const errors = Array.isArray(data.errors) ? data.errors : Object.values(data.errors ?? {});
      if (errors.length) {
        return String(errors[0]);
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
