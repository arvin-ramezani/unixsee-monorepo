import { LiveWebsiteDetailsView } from "@/components/websites/live-website-details-view";
import { WebsiteDetailsView } from "@/components/websites/website-details-view";
import { serverFetch } from "@/lib/api/server-fetch";
import { getRuntimeWebsite } from "@/lib/data/websites-runtime";
import type { AdminWebsiteAgentContext } from "@/actions/websites/website-agent-actions";

export type WebsiteDetailsPageProps = { params: Promise<{ id: string }> };
export default async function WebsiteDetailsPage({
  params,
}: WebsiteDetailsPageProps) {
  const { id } = await params;
  const fixture = getRuntimeWebsite(id);
  if (fixture) return <WebsiteDetailsView website={fixture} />;
  let website: AdminWebsiteAgentContext | null = null;
  try {
    const response = await serverFetch<AdminWebsiteAgentContext>(
      `/admin/websites/${id}`,
      { method: "GET" },
    );
    if (response.success && response.data) website = response.data;
  } catch {
    /* shared unavailable state below */
  }

  if (website) return <LiveWebsiteDetailsView website={website} />;

  return (
    <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
      وب‌سایت موردنظر پیدا نشد یا سرویس NestJS در دسترس نیست.
    </div>
  );
}
