import { getServerCoreApiBaseUrl } from "@/lib/auth/auth-utils";
import type { ApiResponse } from "@/types/auth.types";

export async function publicFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const response = await fetch(`${getServerCoreApiBaseUrl()}${endpoint}`, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  const data = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!data) {
    return {
      statusCode: response.status,
      success: false,
      message: "Request failed",
      data: null,
      error: {
        code: "REQUEST_FAILED",
        message: "Request failed",
      },
    };
  }

  return data;
}
