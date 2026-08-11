import { TicketsView } from "@/components/tickets/tickets-view";
import {
  mapApiError,
  STAFF_API_ERROR_MESSAGES,
} from "@/lib/api/map-api-error";
import { serverFetch } from "@/lib/api/server-fetch";
import type { TicketType } from "@/lib/data/tickets-data";
import { TICKET_STATUS } from "@/lib/data/tickets-data";
import {
  mapAdminTicketListToUi,
  type AdminTicketListResponse,
} from "@/lib/tickets/map-admin-ticket";
import { readEnumParam } from "@/lib/url-search-params";

const PAGE_SIZE = 50;

const TICKET_STATUS_FILTER_VALUES = [
  "ALL",
  ...Object.values(TICKET_STATUS),
] as const;

export type TicketsPageProps = {
  searchParams: Promise<{
    status?: string | string[];
    page?: string | string[];
  }>;
};

function readPageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? "1", 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
}

export default async function TicketsPage({ searchParams }: TicketsPageProps) {
  const params = await searchParams;
  const status =
    readEnumParam(params.status, TICKET_STATUS_FILTER_VALUES) ?? "ALL";
  const page = readPageParam(params.page);
  const skip = (page - 1) * PAGE_SIZE;

  const query = new URLSearchParams({
    skip: String(skip),
    take: String(PAGE_SIZE),
  });
  if (status !== "ALL") {
    query.set("status", status);
  }

  let tickets: TicketType[] = [];
  let total = 0;
  let loadError: string | null = null;

  try {
    const response = await serverFetch<AdminTicketListResponse>(
      `/admin/tickets?${query.toString()}`,
      { method: "GET" },
    );

    if (!response.success || !response.data) {
      const mapped = mapApiError(response);
      loadError = mapped
        ? STAFF_API_ERROR_MESSAGES[mapped.key]
        : STAFF_API_ERROR_MESSAGES.generic;
    } else {
      tickets = mapAdminTicketListToUi(response.data);
      total = response.data.total;
    }
  } catch {
    loadError = STAFF_API_ERROR_MESSAGES.unavailable;
  }

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);

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
        <TicketsView
          tickets={tickets}
          initialStatus={status}
          total={total}
          page={safePage}
          pageSize={PAGE_SIZE}
        />
      )}
    </div>
  );
}
