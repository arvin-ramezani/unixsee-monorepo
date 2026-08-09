"use client";

import { ServerDetailsView } from "@/components/servers/server-details-view";
import { getRuntimeServer } from "@/lib/data/servers-runtime";

export type ServerDetailsPageClientProps = {
  id: string;
};

export function ServerDetailsPageClient({ id }: ServerDetailsPageClientProps) {
  const server = getRuntimeServer(id);

  if (!server) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
        سرور موردنظر پیدا نشد.
      </div>
    );
  }

  return <ServerDetailsView initialServer={server} />;
}
