import { createServerClockOffsetInSeconds } from "@/lib/auth/auth-utils";
import { executeRefreshOperation } from "@/lib/auth/refresh-manager";
import { shouldRefreshToken } from "@/lib/auth/jwt";
import {
  getAuthStoreApi,
  type AuthStoreApi,
} from "@/stores/auth-store-accessor";

type RefreshAccessTokenResponse = {
  accessToken: string | null;
  serverTimeInSeconds: number | null;
};

export async function refreshAccessToken(
  storeApi: AuthStoreApi = getAuthStoreApi(),
): Promise<string | null> {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      storeApi.getState().logout();
      return null;
    }

    const data = (await response.json()) as RefreshAccessTokenResponse;

    if (!data.accessToken || data.serverTimeInSeconds == null) {
      storeApi.getState().logout();
      return null;
    }

    storeApi
      .getState()
      .setAccessToken(
        data.accessToken,
        createServerClockOffsetInSeconds(data.serverTimeInSeconds),
      );

    return data.accessToken;
  } catch {
    storeApi.getState().logout();
    return null;
  }
}

export async function getValidAccessToken() {
  const authStore = getAuthStoreApi();
  const { accessToken, serverClockOffsetInSeconds } = authStore.getState();

  if (!accessToken || serverClockOffsetInSeconds === null) {
    return executeRefreshOperation(() => refreshAccessToken(authStore));
  }

  if (!shouldRefreshToken(accessToken, serverClockOffsetInSeconds)) {
    return accessToken;
  }

  return executeRefreshOperation(() => refreshAccessToken(authStore));
}
