import { PlanRequestsView } from "@/components/plan-requests/plan-requests-view";
import { PLAN_REQUEST_STATUS } from "@/lib/data/plan-requests-data";
import { readEnumParam } from "@/lib/url-search-params";

const PLAN_REQUEST_STATUS_FILTER_VALUES = [
  "ALL",
  "ACTIONABLE",
  ...Object.values(PLAN_REQUEST_STATUS),
] as const;

export type PlanRequestsPageProps = {
  searchParams: Promise<{ status?: string | string[] }>;
};

export default async function PlanRequestsPage({
  searchParams,
}: PlanRequestsPageProps) {
  const params = await searchParams;
  const initialStatus =
    readEnumParam(params.status, PLAN_REQUEST_STATUS_FILTER_VALUES) ??
    "ACTIONABLE";

  return (
    <div className="flex flex-1 flex-col gap-6 pt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            درخواست‌های پلن
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            مشاهده درخواست‌های UNIX CORE تا ENTERPRISE، اتصال به وب‌سایت و
            فعال‌سازی پلن برای کاربر موجود
          </p>
        </div>
        <p className="w-fit rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
          داده‌های نمایشی
        </p>
      </div>

      <PlanRequestsView initialStatus={initialStatus} />
    </div>
  );
}
