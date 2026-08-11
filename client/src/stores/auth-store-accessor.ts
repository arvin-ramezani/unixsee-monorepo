import { createAuthStore } from "@/stores/auth-store";

export type AuthStoreApi = ReturnType<typeof createAuthStore>;

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
