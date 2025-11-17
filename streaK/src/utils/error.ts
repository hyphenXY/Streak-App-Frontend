import { ApiError } from "../types/api";

export function normalizeApiError(err: any): ApiError {
  if (!err) return { message: "Unknown error" };
  if (err.response?.data) {
    const data = err.response.data;
    return {
      message: data.message || data.error || "API Error",
      code: data.code,
      status: err.response.status,
      details: data
    };
  }
  if (err.message) return { message: err.message };
  return { message: String(err) };
}
