"use server";

import { revalidatePath } from "next/cache";
import {
  resolveStaffApiErrorMessage,
  STAFF_API_ERROR_MESSAGES,
} from "@/lib/api/map-api-error";
import { serverActionFetch } from "@/lib/api/server-action-fetch";

export type AdminWebsiteContactUser = {
  id: string;
  fullName?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
};

export type AdminWebsiteAgentContext = {
  id: string;
  domain: string;
  displayName?: string | null;
  tenantId?: string;
  userId?: string | null;
  managementCoverage?:
    "UNIXSEE_MANAGED" | "EXTERNAL_INFRASTRUCTURE" | "UNCLASSIFIED";
  wordpressAdminUrl?: string | null;
  wordpressAdminUsername?: string | null;
  wordpressAdminPassword?: string | null;
  directAdminUrl?: string | null;
  directAdminUsername?: string | null;
  directAdminPassword?: string | null;
  status?: string;
  planActivatedAt?: string | null;
  tenant?: { id: string; name: string } | null;
  user?: AdminWebsiteContactUser | null;
  plan?: { id: string; code: string; nameEn: string } | null;
  vpsNode?: {
    id: string;
    status: string;
    agentVersion?: string | null;
    lastHeartbeatAt?: string | null;
    server?: { id: string; name: string; controlPanelUrl?: string | null };
  } | null;
  discoveries?: Array<{
    id: string;
    domain: string;
    isPresent: boolean;
    wordpressVersion?: string | null;
    phpVersion?: string | null;
    imagickVersion?: string | null;
    stackCheckedAt?: string | null;
    stackLastSucceededAt?: string | null;
    fieldStatus?: Record<string, { state: string; reason?: string }> | null;
    trafficSnapshot?: {
      activeVisitorCount?: number | null;
      activeMeasuredAt?: string | null;
      uniqueVisitors24h?: number | null;
      visitors24hCoverageSeconds?: number | null;
      visitors24hMeasuredAt?: string | null;
      visitors24hStatus?: { state?: string; reason?: string } | null;
    } | null;
  }>;
};
export type AgentCommandDto = {
  id: string;
  status: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "EXPIRED";
  errorCode?: string | null;
};
type Result<T> = { ok: true; data: T } | { ok: false; message: string };
const error = (response: Parameters<typeof resolveStaffApiErrorMessage>[0]) =>
  resolveStaffApiErrorMessage(response);

export async function updateWebsiteAdminUrlAction(input: {
  websiteId: string;
  wordpressAdminUrl: string;
}): Promise<Result<AdminWebsiteAgentContext>> {
  const url = input.wordpressAdminUrl.trim();
  if (url && !url.startsWith("https://"))
    return {
      ok: false,
      message: "نشانی مدیریت وردپرس باید با https:// آغاز شود.",
    };
  try {
    const response = await serverActionFetch<AdminWebsiteAgentContext>(
      `/admin/websites/${input.websiteId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ wordpressAdminUrl: url || null }),
      },
    );
    if (!response.success || !response.data)
      return { ok: false, message: error(response) };
    revalidatePath(`/websites/${input.websiteId}`);
    return { ok: true, data: response.data };
  } catch {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
  }
}

export async function updateWebsiteManagementCoverageAction(input: {
  websiteId: string;
  managementCoverage:
    "UNIXSEE_MANAGED" | "EXTERNAL_INFRASTRUCTURE" | "UNCLASSIFIED";
}): Promise<Result<AdminWebsiteAgentContext>> {
  try {
    const response = await serverActionFetch<AdminWebsiteAgentContext>(
      "/admin/websites/" + input.websiteId,
      {
        method: "PATCH",
        body: JSON.stringify({ managementCoverage: input.managementCoverage }),
      },
    );
    if (!response.success || !response.data)
      return { ok: false, message: error(response) };
    revalidatePath("/websites/" + input.websiteId);
    return { ok: true, data: response.data };
  } catch {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
  }
}

export async function updateWebsiteCredentialsAction(input: {
  websiteId: string;
  wordpressAdminUrl?: string | null;
  wordpressAdminUsername?: string | null;
  wordpressAdminPassword?: string | null;
  directAdminUrl?: string | null;
  directAdminUsername?: string | null;
  directAdminPassword?: string | null;
}): Promise<Result<AdminWebsiteAgentContext>> {
  try {
    const body: Record<string, unknown> = {};
    if (input.wordpressAdminUrl !== undefined)
      body.wordpressAdminUrl = input.wordpressAdminUrl || null;
    if (input.wordpressAdminUsername !== undefined)
      body.wordpressAdminUsername = input.wordpressAdminUsername || null;
    if (input.wordpressAdminPassword !== undefined)
      body.wordpressAdminPassword = input.wordpressAdminPassword || null;
    if (input.directAdminUrl !== undefined)
      body.directAdminUrl = input.directAdminUrl || null;
    if (input.directAdminUsername !== undefined)
      body.directAdminUsername = input.directAdminUsername || null;
    if (input.directAdminPassword !== undefined)
      body.directAdminPassword = input.directAdminPassword || null;

    const response = await serverActionFetch<AdminWebsiteAgentContext>(
      "/admin/websites/" + input.websiteId,
      { method: "PATCH", body: JSON.stringify(body) },
    );
    if (!response.success || !response.data)
      return { ok: false, message: error(response) };
    revalidatePath("/websites/" + input.websiteId);
    return { ok: true, data: response.data };
  } catch {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
  }
}
export async function requestDiscoveryStackRefreshAction(
  discoveryId: string,
): Promise<Result<AgentCommandDto>> {
  try {
    const response = await serverActionFetch<AgentCommandDto>(
      `/admin/discoveries/${discoveryId}/stack-refresh`,
      { method: "POST" },
    );
    return response.success && response.data
      ? { ok: true, data: response.data }
      : { ok: false, message: error(response) };
  } catch {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
  }
}
export async function requestWebsiteStackRefreshAction(
  websiteId: string,
): Promise<Result<AgentCommandDto>> {
  try {
    const response = await serverActionFetch<AgentCommandDto>(
      `/admin/websites/${websiteId}/stack-refresh`,
      { method: "POST" },
    );
    return response.success && response.data
      ? { ok: true, data: response.data }
      : { ok: false, message: error(response) };
  } catch {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
  }
}
export async function getAgentCommandAction(
  commandId: string,
): Promise<Result<AgentCommandDto>> {
  try {
    const response = await serverActionFetch<AgentCommandDto>(
      `/admin/agent-commands/${commandId}`,
      { method: "GET" },
    );
    return response.success && response.data
      ? { ok: true, data: response.data }
      : { ok: false, message: error(response) };
  } catch {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
  }
}
