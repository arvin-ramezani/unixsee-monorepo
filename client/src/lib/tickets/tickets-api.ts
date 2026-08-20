import { mapApiError, type MappedApiError } from "@/lib/api/map-api-error";
import { serverFetch } from "@/lib/api/server-fetch";
import type {
  NestWebsiteListItem,
  TicketDetail,
  TicketListResponse,
  TicketServiceCatalogItem,
  TicketServicesResponse,
  TicketWebsiteRef,
} from "@/lib/tickets/types";

export type TicketsFetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: MappedApiError };

function toResult<T>(
  response: Awaited<ReturnType<typeof serverFetch<T>>>,
): TicketsFetchResult<T> {
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

export function mapNestWebsite(website: NestWebsiteListItem): TicketWebsiteRef {
  return {
    id: website.id,
    name: website.displayName?.trim() || website.domain,
    domain: website.domain,
  };
}

export async function fetchTicketList(params?: {
  take?: number;
  skip?: number;
}): Promise<TicketsFetchResult<TicketListResponse>> {
  const search = new URLSearchParams();
  search.set("take", String(params?.take ?? 50));
  search.set("skip", String(params?.skip ?? 0));

  try {
    const response = await serverFetch<TicketListResponse>(
      `/tickets?${search.toString()}`,
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

export async function fetchTicketDetail(
  ticketId: string,
): Promise<TicketsFetchResult<TicketDetail>> {
  try {
    const response = await serverFetch<TicketDetail>(`/tickets/${ticketId}`, {
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

export async function fetchTicketServices(): Promise<
  TicketsFetchResult<TicketServiceCatalogItem[]>
> {
  try {
    const response = await serverFetch<TicketServicesResponse>(
      "/tickets/services",
      { method: "GET" },
    );
    const result = toResult(response);
    if (!result.ok) return result;
    return { ok: true, data: result.data.items };
  } catch {
    return {
      ok: false,
      error: { key: "unavailable", code: null, statusCode: null },
    };
  }
}

export async function fetchTicketWebsites(): Promise<
  TicketsFetchResult<TicketWebsiteRef[]>
> {
  try {
    const response = await serverFetch<NestWebsiteListItem[]>("/websites", {
      method: "GET",
    });
    const result = toResult(response);
    if (!result.ok) return result;
    return { ok: true, data: result.data.map(mapNestWebsite) };
  } catch {
    return {
      ok: false,
      error: { key: "unavailable", code: null, statusCode: null },
    };
  }
}
