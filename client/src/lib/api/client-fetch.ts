import { getPublicCoreApiBaseUrl } from "@/lib/auth/auth-utils";
import {
  getValidAccessToken,
  refreshAccessToken,
} from "@/lib/auth/client-auth";
import type { ApiResponse } from "@/types/auth.types";

function createAuthenticatedRequestInit(
  options: RequestInit | undefined,
  accessToken: string | null,
): RequestInit {
  const headers = new Headers(options?.headers);

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return {
    ...options,
    credentials: "include",
    headers,
  };
}

export async function clientFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const accessToken = await getValidAccessToken();
  const url = `${getPublicCoreApiBaseUrl()}${endpoint}`;

  let response = await fetch(
    url,
    createAuthenticatedRequestInit(options, accessToken),
  );

  if (response.status === 401) {
    const refreshedAccessToken = await refreshAccessToken();
    if (refreshedAccessToken) {
      response = await fetch(
        url,
        createAuthenticatedRequestInit(options, refreshedAccessToken),
      );
    }
  }

  const data = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!data) {
    throw new Error("Request failed");
  }

  return data;
}
