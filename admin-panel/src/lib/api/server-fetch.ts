import { getServerCoreApiBaseUrl } from "@/lib/auth/auth-utils";
import { getServerAccessToken } from "@/lib/auth/server-auth";
import type { ApiResponse } from "@/types/auth.types";

export async function serverFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const accessToken = await getServerAccessToken();

  const response = await fetch(`${getServerCoreApiBaseUrl()}${endpoint}`, {
    ...options,
    cache: "no-store",
    headers: {
      ...(options?.headers ?? {}),
      ...(accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {}),
    },
  });

  const data = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!data) {
    throw new Error("Request failed");
  }

  return data;
}
