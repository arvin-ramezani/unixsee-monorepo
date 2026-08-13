import { ServerDetailsView } from "@/components/servers/server-details-view";
import {
  mapApiError,
  STAFF_API_ERROR_MESSAGES,
} from "@/lib/api/map-api-error";
import { serverFetch } from "@/lib/api/server-fetch";
import {
  mapAdminServerToUi,
  type AdminServerReadModelDto,
} from "@/lib/servers/map-admin-server";
import type { ServerType } from "@/lib/data/servers-data";

export type ServerDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ServerDetailsPage({
  params,
}: ServerDetailsPageProps) {
  const { id } = await params;

  let server: ServerType | null = null;
  let loadError: string | null = null;

  try {
    const response = await serverFetch<AdminServerReadModelDto>(
      `/admin/servers/${id}`,
      { method: "GET" },
    );

    if (response.success && response.data) {
      server = mapAdminServerToUi(response.data);
    } else {
      const mapped = mapApiError(response);
      loadError = mapped
        ? STAFF_API_ERROR_MESSAGES[mapped.key]
        : STAFF_API_ERROR_MESSAGES.generic;
    }
  } catch {
    loadError = STAFF_API_ERROR_MESSAGES.unavailable;
  }

  if (loadError) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
        {loadError}
      </div>
    );
  }

  if (!server) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
        {STAFF_API_ERROR_MESSAGES.notFound}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 pt-4">
      <ServerDetailsView initialServer={server} />
    </div>
  );
}
