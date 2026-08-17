import { notFound } from "next/navigation";

import { UnixseeMessageDetailsView } from "@/components/unixsee-messages/unixsee-message-details-view";
import { mapApiError, STAFF_API_ERROR_MESSAGES } from "@/lib/api/map-api-error";
import { serverFetch } from "@/lib/api/server-fetch";
import {
  mapAdminUnixseeMessageToUi,
  type AdminUnixseeMessageDto,
} from "@/lib/unixsee-messages/map-admin-unixsee-message";
import { buildTenantOptionsFromUsers } from "@/lib/unixsee-messages/tenant-options";
import type { AdminUserListResponse } from "@/lib/users/map-admin-user";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function loadTenantOptions() {
  try {
    const response = await serverFetch<AdminUserListResponse>(
      "/admin/users?skip=0&take=100",
      { method: "GET" },
    );
    if (!response.success || !response.data) return [];
    return buildTenantOptionsFromUsers(response.data.items);
  } catch {
    return [];
  }
}

export default async function UnixseeMessageDetailPage({ params }: PageProps) {
  const { id } = await params;

  let loadError: string | null = null;
  let message = null;

  try {
    const response = await serverFetch<AdminUnixseeMessageDto>(
      `/admin/unixsee-messages/${id}`,
      { method: "GET" },
    );
    if (!response.success || !response.data) {
      const mapped = mapApiError(response);
      if (mapped?.key === "notFound") {
        notFound();
      }
      loadError = mapped
        ? STAFF_API_ERROR_MESSAGES[mapped.key]
        : STAFF_API_ERROR_MESSAGES.generic;
    } else {
      message = mapAdminUnixseeMessageToUi(response.data);
    }
  } catch {
    loadError = STAFF_API_ERROR_MESSAGES.unavailable;
  }

  if (!message && !loadError) {
    notFound();
  }

  const tenants = await loadTenantOptions();

  return (
    <div className="flex flex-1 flex-col gap-6 pt-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">جزئیات پیام</h1>
      </div>

      {!!loadError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {loadError}
        </div>
      )}

      {!!message && (
        <UnixseeMessageDetailsView message={message} tenants={tenants} />
      )}
    </div>
  );
}
