"use client";

import { RequestDetailsView } from "@/components/complementary-services/request-details-view";
import { getRuntimeComplementaryRequest } from "@/lib/data/complementary-services-runtime";

export type RequestDetailsPageClientProps = {
  id: string;
};

export function RequestDetailsPageClient({
  id,
}: RequestDetailsPageClientProps) {
  const request = getRuntimeComplementaryRequest(id);

  if (!request) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
        درخواست موردنظر پیدا نشد.
      </div>
    );
  }

  return <RequestDetailsView key={request.id} initialRequest={request} />;
}
