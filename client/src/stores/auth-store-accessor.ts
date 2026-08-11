import type { AuthStoreApi } from "@/components/providers/auth-store-provider";

let authStoreApi: AuthStoreApi | undefined;

export function setAuthStoreApi(api: AuthStoreApi | undefined) {
  authStoreApi = api;
}

export function getAuthStoreApi(): AuthStoreApi {
  if (!authStoreApi) {
    throw new Error("Auth store is not initialized");
  }
  return authStoreApi;
}
