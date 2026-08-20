import { OverviewView } from "@/components/overview/overview-view";
import { buildOverviewSnapshot } from "@/lib/data/overview-data";

export type OverviewPageProps = object;

export default function OverviewPage({}: OverviewPageProps) {
  const snapshot = buildOverviewSnapshot();

  return (
    <div className="flex flex-1 flex-col gap-6 pt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">نمای‌کلی</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            صف اولویت‌دار تیکت‌ها، درخواست‌های پلن و خدمات تکمیلی
          </p>
        </div>
        <p className="w-fit rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
          داده‌های نمایشی
        </p>
      </div>

      <OverviewView initialSnapshot={snapshot} />
    </div>
  );
}
