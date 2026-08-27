"use server";

import { revalidatePath } from "next/cache";

import {
  resolveStaffApiErrorMessage,
  STAFF_API_ERROR_MESSAGES,
} from "@/lib/api/map-api-error";
import { serverActionFetch } from "@/lib/api/server-action-fetch";
import {
  mapAdminRequestToUi,
  type AdminComplementaryRequestApiItem,
} from "@/lib/complementary-services/map-admin-complementary";
import type {
  ComplementaryServiceRequestType,
  ComplementaryServiceAssignmentType,
} from "@/lib/data/complementary-services-data";

export type ComplementaryRequestMutationResult =
  | { ok: true; request: ComplementaryServiceRequestType }
  | { ok: false; message: string };

export async function acceptComplementaryRequestAction(input: {
  requestId: string;
}): Promise<ComplementaryRequestMutationResult> {
  try {
    const response = await serverActionFetch<AdminComplementaryRequestApiItem>(
      "/admin/complementary-service-requests/" + input.requestId + "/accept",
      {
        method: "POST",
        headers: {
          "Idempotency-Key": "complementary-request-accept-" + input.requestId,
        },
      },
    );

    if (!response.success || !response.data) {
      return { ok: false, message: resolveStaffApiErrorMessage(response) };
    }

    revalidatePath("/complementary-services");
    revalidatePath("/complementary-services/" + input.requestId);
    return { ok: true, request: mapAdminRequestToUi(response.data) };
  } catch {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
  }
}

export async function rejectComplementaryRequestAction(input: {
  requestId: string;
  reason: string;
}): Promise<ComplementaryRequestMutationResult> {
  if (!input.reason.trim()) {
    return { ok: false, message: "دلیل رد الزامی است." };
  }

  try {
    const response = await serverActionFetch<AdminComplementaryRequestApiItem>(
      "/admin/complementary-service-requests/" + input.requestId,
      {
        method: "PATCH",
        body: JSON.stringify({
          status: "CANCELLED",
          details: input.reason.trim(),
        }),
      },
    );
    if (!response.success || !response.data) {
      return { ok: false, message: resolveStaffApiErrorMessage(response) };
    }

    revalidatePath("/complementary-services");
    revalidatePath("/complementary-services/" + input.requestId);
    return { ok: true, request: mapAdminRequestToUi(response.data) };
  } catch {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
  }
}

export type ActivateComplementaryRequestResult =
  | { ok: true; assignment: ComplementaryServiceAssignmentType }
  | { ok: false; message: string };

export async function activateComplementaryRequestAction(input: {
  requestId: string;
  assigneeNote?: string;
  startedAt?: string;
  amount: number;
  interval: "MONTHLY" | "QUARTERLY" | "YEARLY" | "NONE";
  currency?: string;
  commercialModel?: string;
}): Promise<ActivateComplementaryRequestResult> {
  try {
    const response = await serverActionFetch<{
      id: string;
      requestId: string;
      assigneeNote: string | null;
      startedAt: string | null;
      completedAt: string | null;
      authorizationState: string | null;
      createdAt: string;
    }>("/admin/service-assignments", {
      method: "POST",
      body: JSON.stringify({
        requestId: input.requestId,
        ...(input.assigneeNote ? { assigneeNote: input.assigneeNote } : {}),
        ...(input.startedAt ? { startedAt: input.startedAt } : {}),
        amount: input.amount,
        interval: input.interval,
        currency: input.currency ?? "IRR",
        ...(input.commercialModel
          ? { commercialModel: input.commercialModel }
          : {}),
      }),
    });

    if (!response.success || !response.data) {
      return { ok: false, message: resolveStaffApiErrorMessage(response) };
    }

    revalidatePath("/complementary-services");
    revalidatePath("/complementary-services/" + input.requestId);
    return {
      ok: true,
      assignment: {
        id: response.data.id,
        requestId: response.data.requestId,
        source: "REQUEST",
        createReason: null,
        customerName: "",
        websiteId: "",
        websiteDomain: "",
        family: "SEO",
        title: "",
        engagement: null,
        serviceScope: null,
        scopeSummary: null,
        exclusions: null,
        ownerName: response.data.assigneeNote ?? "تخصیص داده نشده",
        commercialModel: "CUSTOM_QUOTE",
        status: "ACTIVE",
        startDate: response.data.startedAt ?? response.data.createdAt,
        renewalDate: null,
        progressLabel:
          response.data.authorizationState === "NOT_AUTHORIZED_AT_ACTIVATION"
            ? "فعال — مالکیت مستأجر هنگام فعالسازی تأیید نشده"
            : "فعال",
        agreedAmount: "",
      },
    };
  } catch {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
  }
}
