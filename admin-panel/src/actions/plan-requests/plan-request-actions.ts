"use server";

import { revalidatePath } from "next/cache";

import {
  resolveStaffApiErrorMessage,
  STAFF_API_ERROR_MESSAGES,
} from "@/lib/api/map-api-error";
import { serverActionFetch } from "@/lib/api/server-action-fetch";
import type { PlanRequestType } from "@/lib/data/plan-requests-data";
import {
  mapAdminPlanRequestToUi,
  type AdminPlanRequestDto,
} from "@/lib/plan-requests/map-admin-plan-request";
import type { ApiResponse } from "@/types/auth.types";

export type PlanRequestMutationResult =
  { ok: true; request: PlanRequestType } | { ok: false; message: string };

export type PlanRequestWebsiteOption = {
  id: string;
  domain: string;
  displayName: string | null;
  tenantId: string;
  tenantName: string;
  hasLinkedPlan: boolean;
  hasActivePlan: boolean;
  planCode: string | null;
  planLabel: string | null;
};

export type ListPlanRequestWebsitesResult =
  | { ok: true; websites: PlanRequestWebsiteOption[] }
  | { ok: false; message: string };

type AdminWebsiteListItem = {
  id: string;
  domain: string;
  displayName: string | null;
  tenantId: string;
  planId: string | null;
  planActivatedAt: string | null;
  tenant?: { id: string; name: string } | null;
  plan?: { id: string; code: string; nameEn: string } | null;
};

type AdminWebsiteListResponse = {
  items: AdminWebsiteListItem[];
  total: number;
};

function staffErrorMessage(response: ApiResponse<unknown>): string {
  return resolveStaffApiErrorMessage(response);
}

async function mutatePlanRequest(
  requestId: string,
  endpoint: string,
  init?: RequestInit,
): Promise<PlanRequestMutationResult> {
  try {
    const response = await serverActionFetch<AdminPlanRequestDto>(
      endpoint,
      init,
    );

    if (!response.success || !response.data) {
      return { ok: false, message: staffErrorMessage(response) };
    }

    revalidatePath("/plan-requests");
    revalidatePath(`/plan-requests/${requestId}`);
    return { ok: true, request: mapAdminPlanRequestToUi(response.data) };
  } catch {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
  }
}

function mapWebsiteOption(
  item: AdminWebsiteListItem,
): PlanRequestWebsiteOption {
  return {
    id: item.id,
    domain: item.domain,
    displayName: item.displayName,
    tenantId: item.tenantId,
    tenantName: item.tenant?.name?.trim() || "—",
    hasLinkedPlan: Boolean(item.planId),
    hasActivePlan: Boolean(item.planId && item.planActivatedAt),
    planCode: item.plan?.code ?? null,
    planLabel: item.plan?.nameEn ?? item.plan?.code ?? null,
  };
}

function normalizeWebsiteDomainInput(domain: string): string | null {
  const trimmed = domain.trim().toLowerCase();
  if (!trimmed) return null;

  try {
    const url = new URL(
      /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`,
    );
    return url.hostname.replace(/^www\./, "") || null;
  } catch {
    return null;
  }
}

export async function listWebsitesForPlanRequestAction(input: {
  linkedUserId?: string | null;
  linkedTenantId?: string | null;
  search?: string;
}): Promise<ListPlanRequestWebsitesResult> {
  if (!input.linkedUserId && !input.linkedTenantId) {
    return { ok: true, websites: [] };
  }

  try {
    const query = new URLSearchParams({
      skip: "0",
      take: "100",
    });

    // Prefer user scope so staff see websites across the linked user's tenants.
    if (input.linkedUserId) {
      query.set("userId", input.linkedUserId);
    } else if (input.linkedTenantId) {
      query.set("tenantId", input.linkedTenantId);
    }

    if (input.search?.trim()) {
      query.set("search", input.search.trim());
    }

    const response = await serverActionFetch<AdminWebsiteListResponse>(
      `/admin/websites?${query.toString()}`,
      { method: "GET" },
    );

    if (!response.success || !response.data) {
      return { ok: false, message: staffErrorMessage(response) };
    }

    return {
      ok: true,
      websites: response.data.items.map(mapWebsiteOption),
    };
  } catch {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
  }
}

export async function linkPlanRequestWebsiteAction(input: {
  requestId: string;
  tenantId: string;
  websiteId: string;
  linkedUserId?: string | null;
}): Promise<PlanRequestMutationResult> {
  return mutatePlanRequest(
    input.requestId,
    `/admin/plan-requests/${input.requestId}/link`,
    {
      method: "POST",
      body: JSON.stringify({
        tenantId: input.tenantId,
        websiteId: input.websiteId,
        ...(input.linkedUserId ? { linkedUserId: input.linkedUserId } : {}),
      }),
    },
  );
}

export async function enablePlanRequestAction(input: {
  requestId: string;
  websiteId: string;
  tenantId?: string | null;
}): Promise<PlanRequestMutationResult> {
  return mutatePlanRequest(
    input.requestId,
    `/admin/plan-requests/${input.requestId}/enable`,
    {
      method: "POST",
      headers: {
        "Idempotency-Key": `plan-request-enable-${input.requestId}-${input.websiteId}`,
      },
      body: JSON.stringify({
        websiteId: input.websiteId,
        ...(input.tenantId ? { tenantId: input.tenantId } : {}),
      }),
    },
  );
}

export async function declinePlanRequestAction(input: {
  requestId: string;
  reason: string;
  kind?: "declined" | "cancelled";
}): Promise<PlanRequestMutationResult> {
  const trimmedReason = input.reason.trim();
  if (!trimmedReason) {
    return { ok: false, message: "دلیل الزامی است." };
  }

  // Nest only has DECLINED; UI "cancel" is the same terminal action with a labeled reason.
  const reason =
    input.kind === "cancelled"
      ? `لغو درخواست: ${trimmedReason}`
      : trimmedReason;

  return mutatePlanRequest(
    input.requestId,
    `/admin/plan-requests/${input.requestId}/decline`,
    {
      method: "POST",
      body: JSON.stringify({ reason }),
    },
  );
}

export async function createWebsiteForPlanRequestAction(input: {
  domain: string;
  tenantId: string;
}): Promise<{
  ok: boolean;
  website?: { id: string; domain: string };
  message?: string;
}> {
  const domain = normalizeWebsiteDomainInput(input.domain);
  if (!domain) {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.validation };
  }

  try {
    const response = await serverActionFetch<{ id: string; domain: string }>(
      "/admin/websites",
      {
        method: "POST",
        body: JSON.stringify({
          domain,
          tenantId: input.tenantId,
        }),
      },
    );

    if (response.success && response.data) {
      return { ok: true, website: response.data };
    }
    return { ok: false, message: staffErrorMessage(response) };
  } catch {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
  }
}

export async function unlinkPlanRequestWebsiteAction(input: {
  requestId: string;
}): Promise<PlanRequestMutationResult> {
  return mutatePlanRequest(
    input.requestId,
    `/admin/plan-requests/${input.requestId}/unlink`,
    { method: "POST" },
  );
}
