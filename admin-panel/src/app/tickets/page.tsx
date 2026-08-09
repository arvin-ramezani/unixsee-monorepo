import { TicketsView } from "@/components/tickets/tickets-view";
import { TICKET_STATUS, TICKETS } from "@/lib/data/tickets-data";
import { readEnumParam } from "@/lib/url-search-params";

const TICKET_STATUS_FILTER_VALUES = ["ALL", ...Object.values(TICKET_STATUS)] as const;

export type TicketsPageProps = {
  searchParams: Promise<{ status?: string | string[] }>;
};

export default async function TicketsPage({ searchParams }: TicketsPageProps) {
  const params = await searchParams;
  const initialStatus =
    readEnumParam(params.status, TICKET_STATUS_FILTER_VALUES) ?? "ALL";

  return (
    <div className="flex flex-1 flex-col gap-6 pt-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">تیکت‌ها</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          مدیریت و پیگیری درخواست‌های پشتیبانی مشتریان
        </p>
      </div>

      <TicketsView tickets={TICKETS} initialStatus={initialStatus} />
    </div>
  );
}
