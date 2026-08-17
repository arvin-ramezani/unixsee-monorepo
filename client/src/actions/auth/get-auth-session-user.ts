"use server";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import type { SafeAuthUser } from "@/types/auth.types";

export async function getAuthSessionUser(): Promise<SafeAuthUser | null> {
  return getCurrentUser();
}
