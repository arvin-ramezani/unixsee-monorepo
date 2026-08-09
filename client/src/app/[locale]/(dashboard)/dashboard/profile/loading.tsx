import { useTranslations } from "next-intl";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}
export default function ProfileLoading() {
  const t = useTranslations("Profile");
  return (
    <DashboardShell activeItem="Profile" searchPlaceholder={t("searchHeader")}>
      <div
        className="w-full py-8"
        aria-busy="true"
        aria-label={t("loading")}
      >
        <Skeleton className="h-9 w-40" />
        <Skeleton className="mt-3 h-4 w-80 max-w-full" />
        <Skeleton className="mt-8 h-[430px] w-full" />
        <Skeleton className="mt-8 h-8 w-40" />
        {Array.from({ length: 2 }, (_, index) => (
          <Skeleton key={index} className="mt-4 h-32 w-full" />
        ))}
      </div>
    </DashboardShell>
  );
}
