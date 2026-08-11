import { createServerClockOffsetInSeconds } from "@/lib/auth/auth-utils";
import { executeRefreshOperation } from "@/lib/auth/refresh-manager";
import { shouldRefreshToken } from "@/lib/auth/jwt";
import { getAuthStoreApi } from "@/stores/auth-store-accessor";

type RefreshAccessTokenResponse = {
  accessToken: string | null;
  serverTimeInSeconds: number | null;
};

export async function refreshAccessToken(): Promise<string | null> {
  const authStore = getAuthStoreApi();

  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      authStore.getState().logout();
      return null;
    }

    const data = (await response.json()) as RefreshAccessTokenResponse;

    if (!data.accessToken || data.serverTimeInSeconds == null) {
      authStore.getState().logout();
      return null;
    }

    authStore
      .getState()
      .setAccessToken(
        data.accessToken,
        createServerClockOffsetInSeconds(data.serverTimeInSeconds),
      );

    return data.accessToken;
  } catch {
    authStore.getState().logout();
    return null;
  }
}

export async function getValidAccessToken() {
  const authStore = getAuthStoreApi();
  const { accessToken, serverClockOffsetInSeconds } = authStore.getState();

  if (!accessToken || serverClockOffsetInSeconds === null) {
    return executeRefreshOperation(refreshAccessToken);
  }

  if (!shouldRefreshToken(accessToken, serverClockOffsetInSeconds)) {
    return accessToken;
  }

  return executeRefreshOperation(refreshAccessToken);
}
