"use server";

import { revalidatePath } from "next/cache";

import {
  resolveStaffApiErrorMessage,
  STAFF_API_ERROR_MESSAGES,
} from "@/lib/api/map-api-error";
import { serverActionFetch } from "@/lib/api/server-action-fetch";
import type { ServerType } from "@/lib/data/servers-data";
import {
  mapAdminServerToUi,
  mapEnrollmentRevealToUi,
  type AdminServerReadModelDto,
  type EnrollmentRevealDto,
} from "@/lib/servers/map-admin-server";
import type { ApiResponse } from "@/types/auth.types";

export type ServerMutationResult =
  | { ok: true; server: ServerType }
  | { ok: false; message: string };

export type EnrollmentRevealPayload = {
  tokenId: string;
  token: string;
  installCommand: string;
  issuedAt: string;
  expiresAt: string;
  mode: "issue" | "reissue";
};

export type IssueEnrollmentTokenResult =
  | { ok: true; reveal: EnrollmentRevealPayload; server: ServerType }
  | { ok: false; message: string };

export type RevokeMutationResult =
  | { ok: true; server: ServerType }
  | { ok: false; message: string };

type CreatedServerRow = {
  id: string;
  name: string;
  ipAddress: string;
  notes: string | null;
};

const ENROLLMENT_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function staffErrorMessage(response: ApiResponse<unknown>): string {
  return resolveStaffApiErrorMessage(response);
}

function revalidateServers(serverId?: string) {
  revalidatePath("/servers");
  if (serverId) {
    revalidatePath(`/servers/${serverId}`);
  }
}

async function fetchAdminServer(
  serverId: string,
): Promise<ServerMutationResult> {
  const response = await serverActionFetch<AdminServerReadModelDto>(
    `/admin/servers/${serverId}`,
    { method: "GET" },
  );

  if (!response.success || !response.data) {
    return { ok: false, message: staffErrorMessage(response) };
  }

  return { ok: true, server: mapAdminServerToUi(response.data) };
}

export async function createServerAction(input: {
  name: string;
  ipAddress: string;
  notes?: string;
}): Promise<ServerMutationResult> {
  const name = input.name.trim();
  const ipAddress = input.ipAddress.trim();
  const notes = input.notes?.trim();

  if (!name || !ipAddress) {
    return { ok: false, message: "شناسه سرور و آدرس IP الزامی هستند." };
  }

  try {
    const response = await serverActionFetch<CreatedServerRow>(
      "/admin/servers",
      {
        method: "POST",
        body: JSON.stringify({
          name,
          ipAddress,
          ...(notes ? { notes } : {}),
        }),
      },
    );

    if (!response.success || !response.data) {
      return { ok: false, message: staffErrorMessage(response) };
    }

    const detail = await fetchAdminServer(response.data.id);
    if (!detail.ok) {
      return detail;
    }

    revalidateServers(response.data.id);
    return detail;
  } catch {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
  }
}

export async function issueEnrollmentTokenAction(input: {
  serverId: string;
  mode: "issue" | "reissue";
}): Promise<IssueEnrollmentTokenResult> {
  try {
    const expiresAt = new Date(
      Date.now() + ENROLLMENT_TOKEN_TTL_MS,
    ).toISOString();

    const response = await serverActionFetch<EnrollmentRevealDto>(
      `/admin/servers/${input.serverId}/enrollment-tokens`,
      {
        method: "POST",
        body: JSON.stringify({ expiresAt }),
      },
    );

    if (!response.success || !response.data) {
      return { ok: false, message: staffErrorMessage(response) };
    }

    const detail = await fetchAdminServer(input.serverId);
    if (!detail.ok) {
      return detail;
    }

    revalidateServers(input.serverId);

    const reveal = mapEnrollmentRevealToUi(response.data);

    return {
      ok: true,
      reveal: {
        ...reveal,
        mode: input.mode,
      },
      server: detail.server,
    };
  } catch {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
  }
}

export async function revokeEnrollmentTokenAction(input: {
  serverId: string;
  tokenId: string;
}): Promise<RevokeMutationResult> {
  try {
    const response = await serverActionFetch<unknown>(
      `/admin/servers/${input.serverId}/enrollment-tokens/${input.tokenId}/revoke`,
      { method: "POST" },
    );

    if (!response.success) {
      return { ok: false, message: staffErrorMessage(response) };
    }

    const detail = await fetchAdminServer(input.serverId);
    if (!detail.ok) {
      return detail;
    }

    revalidateServers(input.serverId);
    return detail;
  } catch {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
  }
}

export async function revokeAgentCredentialsAction(input: {
  serverId: string;
  reason: string;
}): Promise<RevokeMutationResult> {
  const reason = input.reason.trim();
  if (!reason) {
    return { ok: false, message: "دلیل باطل‌سازی الزامی است." };
  }

  try {
    const response = await serverActionFetch<unknown>(
      `/admin/servers/${input.serverId}/agent/revoke`,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
      },
    );

    if (!response.success) {
      return { ok: false, message: staffErrorMessage(response) };
    }

    const detail = await fetchAdminServer(input.serverId);
    if (!detail.ok) {
      return detail;
    }

    revalidateServers(input.serverId);
    return detail;
  } catch {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
  }
}

export async function deleteServerAction(input: {
  serverId: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const response = await serverActionFetch<{
      id: string;
      revokedTokenCount: number;
      disabledNodeCount: number;
    }>(`/admin/servers/${input.serverId}`, { method: "DELETE" });

    if (!response.success) {
      return { ok: false, message: staffErrorMessage(response) };
    }

    revalidateServers();
    return { ok: true };
  } catch {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
  }
}
