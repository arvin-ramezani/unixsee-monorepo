import { mapApiError, type MappedApiError } from "@/lib/api/map-api-error";
import { serverFetch } from "@/lib/api/server-fetch";
import type {
  UnixseeMessageItem,
  UnixseeMessageListResponse,
} from "@/lib/unixsee-messages/types";

export type UnixseeMessagesFetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: MappedApiError };

function toResult<T>(
  response: Awaited<ReturnType<typeof serverFetch<T>>>,
): UnixseeMessagesFetchResult<T> {
  if (!response.success || response.data == null) {
    return {
      ok: false,
      error: mapApiError(response) ?? {
        key: "generic",
        code: null,
        statusCode: response.statusCode,
      },
    };
  }
  return { ok: true, data: response.data };
}

export async function fetchUnixseeMessageList(params?: {
  take?: number;
  skip?: number;
}): Promise<UnixseeMessagesFetchResult<UnixseeMessageListResponse>> {
  const search = new URLSearchParams();
  search.set("take", String(params?.take ?? 50));
  search.set("skip", String(params?.skip ?? 0));

  try {
    const response = await serverFetch<UnixseeMessageListResponse>(
      `/unixsee-messages?${search.toString()}`,
      { method: "GET" },
    );
    return toResult(response);
  } catch {
    return {
      ok: false,
      error: { key: "unavailable", code: null, statusCode: null },
    };
  }
}

export async function fetchUnixseeMessageDetail(
  messageId: string,
): Promise<UnixseeMessagesFetchResult<UnixseeMessageItem>> {
  try {
    const response = await serverFetch<UnixseeMessageItem>(
      `/unixsee-messages/${messageId}`,
      { method: "GET" },
    );
    return toResult(response);
  } catch {
    return {
      ok: false,
      error: { key: "unavailable", code: null, statusCode: null },
    };
  }
}
