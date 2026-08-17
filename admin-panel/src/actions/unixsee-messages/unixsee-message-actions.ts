"use server";

import { revalidatePath } from "next/cache";

import {
  resolveStaffApiErrorMessage,
  STAFF_API_ERROR_MESSAGES,
} from "@/lib/api/map-api-error";
import { serverActionFetch } from "@/lib/api/server-action-fetch";
import type {
  UnixseeContentLocaleType,
  UnixseeMessageAttachmentType,
  UnixseeMessageLinkType,
} from "@/lib/data/unixsee-messages-data";

export type UnixseeMessageMutationResult =
  | { ok: true; id?: string }
  | { ok: false; message: string };

export type UnixseeMessageWriteInput = {
  tenantId: string;
  title: string;
  body: string;
  contentLocale: UnixseeContentLocaleType;
  websiteId?: string | null;
  links?: UnixseeMessageLinkType[];
  attachments?: UnixseeMessageAttachmentType[];
};

function revalidateUnixseeMessages(id?: string) {
  revalidatePath("/unixsee-messages");
  if (id) {
    revalidatePath(`/unixsee-messages/${id}`);
  }
}

export async function createUnixseeMessageAction(
  input: UnixseeMessageWriteInput,
): Promise<UnixseeMessageMutationResult> {
  try {
    const response = await serverActionFetch<{ id: string }>(
      "/admin/unixsee-messages",
      {
        method: "POST",
        body: JSON.stringify({
          tenantId: input.tenantId,
          title: input.title,
          body: input.body,
          contentLocale: input.contentLocale,
          ...(input.websiteId ? { websiteId: input.websiteId } : {}),
          ...(input.links?.length ? { links: input.links } : {}),
          ...(input.attachments?.length
            ? {
                attachments: input.attachments.map((attachment) => ({
                  fileName: attachment.fileName,
                  contentType: attachment.contentType,
                  sizeBytes: attachment.sizeBytes,
                  storageKey: attachment.storageKey,
                })),
              }
            : {}),
        }),
      },
    );

    if (!response.success || !response.data?.id) {
      return { ok: false, message: resolveStaffApiErrorMessage(response) };
    }

    revalidateUnixseeMessages(response.data.id);
    return { ok: true, id: response.data.id };
  } catch {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
  }
}

export async function updateUnixseeMessageAction(
  id: string,
  input: Omit<UnixseeMessageWriteInput, "tenantId">,
): Promise<UnixseeMessageMutationResult> {
  try {
    const response = await serverActionFetch(`/admin/unixsee-messages/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: input.title,
        body: input.body,
        contentLocale: input.contentLocale,
        websiteId: input.websiteId ?? null,
        links: input.links ?? [],
        attachments: (input.attachments ?? []).map((attachment) => ({
          fileName: attachment.fileName,
          contentType: attachment.contentType,
          sizeBytes: attachment.sizeBytes,
          storageKey: attachment.storageKey,
        })),
      }),
    });

    if (!response.success) {
      return { ok: false, message: resolveStaffApiErrorMessage(response) };
    }

    revalidateUnixseeMessages(id);
    return { ok: true, id };
  } catch {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
  }
}

export async function publishUnixseeMessageAction(
  id: string,
): Promise<UnixseeMessageMutationResult> {
  try {
    const response = await serverActionFetch(
      `/admin/unixsee-messages/${id}/publish`,
      { method: "POST" },
    );
    if (!response.success) {
      return { ok: false, message: resolveStaffApiErrorMessage(response) };
    }
    revalidateUnixseeMessages(id);
    return { ok: true, id };
  } catch {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
  }
}

export async function withdrawUnixseeMessageAction(
  id: string,
): Promise<UnixseeMessageMutationResult> {
  try {
    const response = await serverActionFetch(
      `/admin/unixsee-messages/${id}/withdraw`,
      { method: "POST" },
    );
    if (!response.success) {
      return { ok: false, message: resolveStaffApiErrorMessage(response) };
    }
    revalidateUnixseeMessages(id);
    return { ok: true, id };
  } catch {
    return { ok: false, message: STAFF_API_ERROR_MESSAGES.unavailable };
  }
}
