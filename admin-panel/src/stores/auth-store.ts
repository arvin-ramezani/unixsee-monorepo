import { createStore } from "zustand/vanilla";

import type { SafeAuthUser } from "@/types/auth.types";

export type AuthState = {
  accessToken: string | null;
  serverClockOffsetInSeconds: number | null;
  user: SafeAuthUser | null;
};

export type AuthActions = {
  setAccessToken: (
    accessToken: string | null,
    serverClockOffsetInSeconds: number | null,
  ) => void;
  setUser: (user: SafeAuthUser | null) => void;
  login: (payload: {
    user: SafeAuthUser | null;
    accessToken: string | null;
    serverClockOffsetInSeconds: number | null;
  }) => void;
  logout: () => void;
};

export type AuthStore = AuthState & AuthActions;

export const defaultAuthState: AuthState = {
  accessToken: null,
  serverClockOffsetInSeconds: null,
  user: null,
};

export function createAuthStore(initState: AuthState = defaultAuthState) {
  return createStore<AuthStore>()((set) => ({
    ...initState,
    login: ({ user, accessToken, serverClockOffsetInSeconds }) =>
      set((state) => ({
        ...state,
        user,
        accessToken,
        serverClockOffsetInSeconds,
      })),
    setAccessToken: (accessToken, serverClockOffsetInSeconds) => {
      set({ accessToken, serverClockOffsetInSeconds });
    },
    setUser: (user) => {
      set({ user });
    },
    logout: () => {
      set({
        accessToken: null,
        user: null,
        serverClockOffsetInSeconds: null,
      });
    },
  }));
}
