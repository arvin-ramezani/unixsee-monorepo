import { PlanRequestDetailsView } from "@/components/plan-requests/plan-request-details-view";
import {
  mapApiError,
  STAFF_API_ERROR_MESSAGES,
} from "@/lib/api/map-api-error";
import { serverFetch } from "@/lib/api/server-fetch";
import type { PlanRequestType } from "@/lib/data/plan-requests-data";
import {
  mapAdminPlanRequestToUi,
  type AdminPlanRequestDto,
} from "@/lib/plan-requests/map-admin-plan-request";

export type PlanRequestDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlanRequestDetailsPage({
  params,
}: PlanRequestDetailsPageProps) {
  const { id } = await params;

  let request: PlanRequestType | null = null;
  let loadError: string | null = null;

  try {
    const response = await serverFetch<AdminPlanRequestDto>(
      `/admin/plan-requests/${id}`,
      { method: "GET" },
    );

    if (response.success && response.data) {
      request = mapAdminPlanRequestToUi(response.data);
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

  if (!request) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
        {STAFF_API_ERROR_MESSAGES.notFound}
      </div>
    );
  }

  return <PlanRequestDetailsView request={request} />;
}
