import { ComplementaryServicesView } from "@/components/complementary-services/complementary-services-view";
import {
  COMPLEMENTARY_SERVICE_ASSIGNMENTS,
  COMPLEMENTARY_SERVICE_REQUESTS,
} from "@/lib/data/complementary-services-data";
import { readEnumParam } from "@/lib/url-search-params";

const COMPLEMENTARY_STATUS_FILTER_VALUES = [
  "ALL",
  "ACTIONABLE",
  "WAITING",
  "READY",
] as const;

export type ComplementaryServicesPageProps = {
  searchParams: Promise<{ status?: string | string[] }>;
};

export default async function ComplementaryServicesPage({
  searchParams,
}: ComplementaryServicesPageProps) {
  const params = await searchParams;
  const initialStatus =
    readEnumParam(params.status, COMPLEMENTARY_STATUS_FILTER_VALUES) ?? "ALL";

  return (
    <div className="flex flex-1 flex-col gap-6 pt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            خدمات تکمیلی
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            بررسی درخواست‌های مشتریان و مدیریت سرویس‌های هر وب‌سایت
          </p>
        </div>
        <p className="w-fit rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
          داده‌های نمایشی
        </p>
      </div>

      <ComplementaryServicesView
        initialRequests={COMPLEMENTARY_SERVICE_REQUESTS}
        initialAssignments={COMPLEMENTARY_SERVICE_ASSIGNMENTS}
        initialStatus={initialStatus}
      />
    </div>
  );
}
