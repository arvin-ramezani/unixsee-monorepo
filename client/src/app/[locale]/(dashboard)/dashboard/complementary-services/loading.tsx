import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function LoadingComplementaryServices() {
  return (
    <DashboardShell activeItem="ComplementaryServices">
      <div className="py-7">
        <div className="h-9 w-72 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
        <div className="mt-3 h-5 w-full max-w-xl animate-pulse rounded bg-muted motion-reduce:animate-none" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-72 animate-pulse rounded-xl border border-border bg-muted/60 motion-reduce:animate-none"
          />
        ))}
      </div>
    </DashboardShell>
  );
}
