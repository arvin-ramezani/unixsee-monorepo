import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardLoadingSkeleton } from "@/components/dashboard/dashboard-loading-skeleton";

export default function DashboardLoading() {
  return (
    <DashboardShell activeItem="Dashboard">
      <DashboardLoadingSkeleton />
    </DashboardShell>
  );
}
