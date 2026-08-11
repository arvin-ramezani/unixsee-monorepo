import { getServerCoreApiBaseUrl } from "@/lib/auth/auth-utils";
import { getServerActionAccessToken } from "@/lib/auth/server-action-auth";
import type { ApiResponse } from "@/types/auth.types";

export async function serverActionFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const accessToken = await getServerActionAccessToken();

  if (!accessToken) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(`${getServerCoreApiBaseUrl()}${endpoint}`, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!data) {
    throw new Error("Request failed");
  }

  return data;
}
