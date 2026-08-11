import { cache } from "react";

import { serverFetch } from "@/lib/api/server-fetch";
import type { SafeAuthUser } from "@/types/auth.types";

type MeResponse = SafeAuthUser & {
  sub?: string;
  iat?: number;
  exp?: number;
};

export const getCurrentUser = cache(async (): Promise<SafeAuthUser | null> => {
  try {
    const response = await serverFetch<MeResponse>("/users/me", {
      method: "GET",
    });

    if (!response.success || !response.data?.id) {
      return null;
    }

    return {
      id: response.data.id,
      phoneNumber: response.data.phoneNumber ?? null,
      email: response.data.email ?? null,
      username: response.data.username ?? null,
      fullName: response.data.fullName ?? null,
      role: response.data.role,
    };
  } catch {
    return null;
  }
});
