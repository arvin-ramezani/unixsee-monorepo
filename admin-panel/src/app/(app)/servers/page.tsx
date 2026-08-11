import { ServersView } from "@/components/servers/servers-view";
import { SERVER_AGENT_STATE } from "@/lib/data/servers-data";
import { readEnumParam } from "@/lib/url-search-params";

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

  return (
    <div className="flex flex-1 flex-col gap-6 pt-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">سرورها</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ثبت VPS، اتصال Agent و مدیریت وب‌سایت‌های کشف‌شده
        </p>
      </div>

      <ServersView initialAgentFilter={initialAgentFilter} />
    </div>
  );
}
