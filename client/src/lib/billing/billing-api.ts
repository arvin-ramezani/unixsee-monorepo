import { mapApiError, type MappedApiError } from "@/lib/api/map-api-error";
import { serverFetch } from "@/lib/api/server-fetch";
import type {
  BillingItemKind,
  CustomerBillingHubResponse,
} from "@/lib/billing/types";

export type BillingFetchResult<T> =
  { ok: true; data: T } | { ok: false; error: MappedApiError };

function toResult<T>(
  response: Awaited<ReturnType<typeof serverFetch<T>>>,
): BillingFetchResult<T> {
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

export async function fetchCustomerBillingHub(params?: {
  kind?: BillingItemKind;
  websiteId?: string;
}): Promise<BillingFetchResult<CustomerBillingHubResponse>> {
  const search = new URLSearchParams();
  if (params?.kind) {
    search.set("kind", params.kind);
  }
  if (params?.websiteId) {
    search.set("websiteId", params.websiteId);
  }

  const query = search.toString();
  const path = query ? `/billing?${query}` : "/billing";

  try {
    const response = await serverFetch<CustomerBillingHubResponse>(path, {
      method: "GET",
    });
    return toResult(response);
  } catch {
    return {
      ok: false,
      error: { key: "unavailable", code: null, statusCode: null },
    };
  }
}
