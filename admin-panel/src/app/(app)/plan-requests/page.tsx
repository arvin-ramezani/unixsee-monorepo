import { PlanRequestsView } from "@/components/plan-requests/plan-requests-view";
import {
  mapApiError,
  STAFF_API_ERROR_MESSAGES,
} from "@/lib/api/map-api-error";
import { serverFetch } from "@/lib/api/server-fetch";
import { PLAN_REQUEST_STATUS } from "@/lib/data/plan-requests-data";
import type { PlanRequestType } from "@/lib/data/plan-requests-data";
import {
  mapAdminPlanRequestListToUi,
  type AdminPlanRequestListResponse,
} from "@/lib/plan-requests/map-admin-plan-request";
import { readEnumParam } from "@/lib/url-search-params";

const PAGE_SIZE = 50;

const PLAN_REQUEST_STATUS_FILTER_VALUES = [
  "ALL",
  "ACTIONABLE",
  ...Object.values(PLAN_REQUEST_STATUS),
] as const;

const UI_STATUS_TO_NEST: Partial<Record<string, string>> = {
  [PLAN_REQUEST_STATUS.PENDING]: "SUBMITTED",
  [PLAN_REQUEST_STATUS.READY_TO_ENABLE]: "LINKED",
  [PLAN_REQUEST_STATUS.ENABLED]: "ENABLED",
  [PLAN_REQUEST_STATUS.DECLINED]: "DECLINED",
};

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

  const query = new URLSearchParams({
    skip: "0",
    take: String(PAGE_SIZE),
  });
  const nestStatus = UI_STATUS_TO_NEST[initialStatus];
  if (nestStatus) {
    query.set("status", nestStatus);
  }

  let requests: PlanRequestType[] = [];
  let loadError: string | null = null;

  try {
    // ACTIONABLE / ALL / cancelled have no Nest status — load a page and filter in the UI.
    const response = await serverFetch<AdminPlanRequestListResponse>(
      `/admin/plan-requests?${query.toString()}`,
      { method: "GET" },
    );

    if (!response.success || !response.data) {
      const mapped = mapApiError(response);
      loadError = mapped
        ? STAFF_API_ERROR_MESSAGES[mapped.key]
        : STAFF_API_ERROR_MESSAGES.generic;
    } else {
      requests = mapAdminPlanRequestListToUi(response.data);
    }
  } catch {
    loadError = STAFF_API_ERROR_MESSAGES.unavailable;
  }

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
      </div>

      <PlanRequestsView
        initialStatus={initialStatus}
        initialRequests={requests}
        loadError={loadError}
      />
    </div>
  );
}
