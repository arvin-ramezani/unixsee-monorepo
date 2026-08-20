import { ServersView } from "@/components/servers/servers-view";
import {
  mapApiError,
  STAFF_API_ERROR_MESSAGES,
} from "@/lib/api/map-api-error";
import { serverFetch } from "@/lib/api/server-fetch";
import { SERVER_AGENT_STATE, type ServerType } from "@/lib/data/servers-data";
import {
  mapAdminServerListToUi,
  type AdminServerListResponse,
} from "@/lib/servers/map-admin-server";
import { readEnumParam } from "@/lib/url-search-params";

const PAGE_SIZE = 50;

const SERVER_AGENT_FILTER_VALUES = [
  "ALL",
  "ACTIONABLE",
  ...Object.values(SERVER_AGENT_STATE),
] as const;

export type ServersPageProps = {
  searchParams: Promise<{ agent?: string | string[] }>;
};

export default async function ServersPage({ searchParams }: ServersPageProps) {
  const params = await searchParams;
  const initialAgentFilter =
    readEnumParam(params.agent, SERVER_AGENT_FILTER_VALUES) ?? "ACTIONABLE";

  let servers: ServerType[] = [];
  let loadError: string | null = null;

  try {
    const query = new URLSearchParams({
      skip: "0",
      take: String(PAGE_SIZE),
    });
    const response = await serverFetch<AdminServerListResponse>(
      `/admin/servers?${query.toString()}`,
      { method: "GET" },
    );

    if (!response.success || !response.data) {
      const mapped = mapApiError(response);
      loadError = mapped
        ? STAFF_API_ERROR_MESSAGES[mapped.key]
        : STAFF_API_ERROR_MESSAGES.generic;
    } else {
      servers = mapAdminServerListToUi(response.data);
    }
  } catch {
    loadError = STAFF_API_ERROR_MESSAGES.unavailable;
  }

  return (
    <div className="flex flex-1 flex-col gap-6 pt-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">سرورها</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ثبت VPS، اتصال Agent و مدیریت وب‌سایت‌های کشف‌شده
        </p>
      </div>

      <ServersView
        initialServers={servers}
        initialAgentFilter={initialAgentFilter}
        loadError={loadError}
      />
    </div>
  );
}
