"use server";

import { serverActionFetch } from "@/lib/api/server-action-fetch";
import { mapApiError, type MappedApiError } from "@/lib/api/map-api-error";

export type UploadDocumentResult =
  | {
      ok: true;
      data: {
        fileName: string;
        storageKey: string;
        downloadUrl: string;
      };
    }
  | { ok: false; error: MappedApiError };

export async function uploadAuthorizationDocumentAction(
  formData: FormData,
): Promise<UploadDocumentResult> {
  try {
    const result = await serverActionFetch<{
      fileName: string;
      storageKey: string;
      downloadUrl: string;
    }>("/authorization-cases/me/document", {
      method: "POST",
      body: formData,
    });

    if (!result.success || !result.data) {
      return {
        ok: false,
        error: mapApiError(result) ?? {
          key: "generic",
          code: null,
          statusCode: result.statusCode,
        },
      };
    }

    return { ok: true, data: result.data };
  } catch {
    return {
      ok: false,
      error: { key: "unavailable", code: null, statusCode: null },
    };
  }
}
