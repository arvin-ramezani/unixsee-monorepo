import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { WebsitesView } from "@/components/websites/websites-view";
import { serverFetch } from "@/lib/api/server-fetch";
import { WEBSITE_STATUS, type WebsiteType } from "@/lib/data/websites-data";
import { listRuntimeWebsites } from "@/lib/data/websites-runtime";
import { readEnumParam } from "@/lib/url-search-params";
import type { AdminWebsiteAgentContext } from "@/actions/websites/website-agent-actions";

const FILTERS = ["ALL", ...Object.values(WEBSITE_STATUS)] as const;
const mapLive = (item: AdminWebsiteAgentContext): WebsiteType => {
  const discovery = item.discoveries?.[0];
  const traffic = discovery?.trafficSnapshot;
  return {
    id: item.id,
    domain: item.domain,
    title: item.displayName || item.domain,
    tenantName: item.tenant?.name ?? "بدون مستأجر",
    tenantId: item.tenant?.id ?? "",
    serverId: item.vpsNode?.server?.id ?? "",
    status:
      item.status === "ACTIVE"
        ? WEBSITE_STATUS.ONLINE
        : WEBSITE_STATUS.PENDING_SETUP,
    availabilityStatus: WEBSITE_STATUS.PENDING_SETUP,
    lastAvailabilityCheckAt: "—",
    lastAgentDataAt:
      traffic?.activeMeasuredAt ?? discovery?.stackCheckedAt ?? "—",
    overallHealth: "NORMAL",
    activeVisitors: traffic?.activeVisitorCount ?? 0,
    visitors24h: traffic?.uniqueVisitors24h ?? 0,
    technical: {
      wordpress: discovery?.wordpressVersion ?? "—",
      php: discovery?.phpVersion ?? "—",
      imagick: discovery?.imagickVersion ?? "—",
      wordpressUpdate: { label: "خارج از محدوده Agent", updatedAt: "—" },
      securityScan: { label: "—", updatedAt: "—" },
    },
    service: {
      plan: item.plan?.code ?? "—",
      planActivatedAt: item.planActivatedAt ?? null,
      serverLocation: "—",
      server: item.vpsNode?.server?.name ?? "—",
      controlPanel: "DirectAdmin",
      webServer: "OpenLiteSpeed",
      serviceStartDate: "—",
      renewalAt: "1970-01-01",
      billingPeriod: "—",
    },
    monitoring: {
      agentStatus:
        item.vpsNode?.status === "ONLINE" ? "CONNECTED" : "DISCONNECTED",
      lastSeenAt: item.vpsNode?.lastHeartbeatAt ?? "—",
      dataFreshness: item.vpsNode?.status === "ONLINE" ? "UP_TO_DATE" : "STALE",
    },
  };
};
export type WebsitesPageProps = {
  searchParams: Promise<{ status?: string | string[] }>;
};
export default async function WebsitesPage({
  searchParams,
}: WebsitesPageProps) {
  const params = await searchParams;
  const initialStatus = readEnumParam(params.status, FILTERS) ?? "ALL";
  const fixtures = listRuntimeWebsites();
  let live: WebsiteType[] = [];
  try {
    const response = await serverFetch<{
      items: AdminWebsiteAgentContext[];
      total: number;
    }>("/admin/websites", { method: "GET" });
    if (response.success && response.data)
      live = response.data.items.map(mapLive);
  } catch {
    /* fixtures remain available */
  }
  const fixtureIds = new Set(fixtures.map((item) => item.id));
  const websites = [
    ...live.filter((item) => !fixtureIds.has(item.id)),
    ...fixtures,
  ];
  return (
    <div className="flex flex-1 flex-col gap-6 pt-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">وب‌سایت‌ها</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          رکوردهای NestJS همراه با شاخه‌های نمونه تجاری
        </p>
        <Link
          href="/websites/new"
          className={buttonVariants({ className: "mt-3 w-fit" })}
        >
          <Plus className="ms-1 size-4" />
          افزودن وب‌سایت
        </Link>
      </div>
      <WebsitesView websites={websites} initialStatus={initialStatus} />
    </div>
  );
}
