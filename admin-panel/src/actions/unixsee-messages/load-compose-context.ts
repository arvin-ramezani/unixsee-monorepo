"use server";

import { serverActionFetch } from "@/lib/api/server-action-fetch";
import type { AdminUnixseeComposeContextDto } from "@/lib/unixsee-messages/map-admin-unixsee-message";

export async function loadUnixseeComposeContextAction(
  tenantId: string,
): Promise<AdminUnixseeComposeContextDto | null> {
  try {
    const response = await serverActionFetch<AdminUnixseeComposeContextDto>(
      `/admin/unixsee-messages/tenants/${tenantId}/compose-context`,
      { method: "GET" },
    );
    if (!response.success || !response.data) {
      return null;
    }
    return response.data;
  } catch {
    return null;
  }
}
