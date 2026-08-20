import { WebsitesView } from "@/components/websites/websites-view";
import { WEBSITE_STATUS } from "@/lib/data/websites-data";
import { listRuntimeWebsites } from "@/lib/data/websites-runtime";
import { readEnumParam } from "@/lib/url-search-params";

const WEBSITE_STATUS_FILTER_VALUES = [
  "ALL",
  ...Object.values(WEBSITE_STATUS),
] as const;

export type WebsitesPageProps = {
  searchParams: Promise<{ status?: string | string[] }>;
};

export default async function WebsitesPage({ searchParams }: WebsitesPageProps) {
  const params = await searchParams;
  const initialStatus =
    readEnumParam(params.status, WEBSITE_STATUS_FILTER_VALUES) ?? "ALL";

  return (
    <div className="flex flex-1 flex-col gap-6 pt-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">وب‌سایت‌ها</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          مدیریت و پایش وب‌سایت‌های مشتریان
        </p>
      </div>

      <WebsitesView
        websites={listRuntimeWebsites()}
        initialStatus={initialStatus}
      />
    </div>
  );
}
