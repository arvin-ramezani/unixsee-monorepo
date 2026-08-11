import { TicketsView } from "@/components/tickets/tickets-view";
import { serverFetch } from "@/lib/api/server-fetch";
import type { TicketType } from "@/lib/data/tickets-data";
import { TICKET_STATUS } from "@/lib/data/tickets-data";
import {
  mapAdminTicketListToUi,
  type AdminTicketListResponse,
} from "@/lib/tickets/map-admin-ticket";
import { readEnumParam } from "@/lib/url-search-params";

const TICKET_STATUS_FILTER_VALUES = [
  "ALL",
  ...Object.values(TICKET_STATUS),
] as const;

export type TicketsPageProps = {
  searchParams: Promise<{ status?: string | string[] }>;
};

export default async function TicketsPage({ searchParams }: TicketsPageProps) {
  const params = await searchParams;
  const initialStatus =
    readEnumParam(params.status, TICKET_STATUS_FILTER_VALUES) ?? "ALL";

  let tickets: TicketType[] = [];
  let loadError: string | null = null;

  try {
    const response = await serverFetch<AdminTicketListResponse>(
      "/admin/tickets?skip=0&take=50",
      { method: "GET" },
    );

    if (!response.success || !response.data) {
      loadError = "بارگذاری تیکت‌ها ممکن نیست.";
    } else {
      tickets = mapAdminTicketListToUi(response.data);
    }
  } catch {
    loadError = "سرویس تیکت در دسترس نیست.";
  }

  return (
    <div className="flex flex-1 flex-col gap-6 pt-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">تیکت‌ها</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          مدیریت و پیگیری درخواست‌های پشتیبانی مشتریان
        </p>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {loadError}
        </div>
      ) : (
        <TicketsView tickets={tickets} initialStatus={initialStatus} />
      )}
    </div>
  );
}
