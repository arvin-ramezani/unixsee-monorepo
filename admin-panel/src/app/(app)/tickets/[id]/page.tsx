import { TicketDetailsView } from "@/components/tickets/ticket-details-view";
import {
  mapApiError,
  STAFF_API_ERROR_MESSAGES,
} from "@/lib/api/map-api-error";
import { serverFetch } from "@/lib/api/server-fetch";
import {
  mapAdminTicketDetailToUi,
  type AdminTicketDetailDto,
} from "@/lib/tickets/map-admin-ticket";
import type { TicketType } from "@/lib/data/tickets-data";

export type TicketDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TicketDetailsPage({
  params,
}: TicketDetailsPageProps) {
  const { id } = await params;

  let ticket: TicketType | null = null;
  let loadError: string | null = null;

  try {
    const response = await serverFetch<AdminTicketDetailDto>(
      `/admin/tickets/${id}`,
      { method: "GET" },
    );

    if (response.success && response.data) {
      ticket = mapAdminTicketDetailToUi(response.data);
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

  if (!ticket) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
        {STAFF_API_ERROR_MESSAGES.notFound}
      </div>
    );
  }

  return <TicketDetailsView ticket={ticket} />;
}
