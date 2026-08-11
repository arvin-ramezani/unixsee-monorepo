import { TicketDetailsView } from "@/components/tickets/ticket-details-view";
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
  let loadFailed = false;

  try {
    const response = await serverFetch<AdminTicketDetailDto>(
      `/admin/tickets/${id}`,
      { method: "GET" },
    );

    if (response.success && response.data) {
      ticket = mapAdminTicketDetailToUi(response.data);
    }
  } catch {
    loadFailed = true;
  }

  if (loadFailed) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
        بارگذاری تیکت ممکن نیست.
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
        تیکت موردنظر پیدا نشد.
      </div>
    );
  }

  return <TicketDetailsView ticket={ticket} />;
}
