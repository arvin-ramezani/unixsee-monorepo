import { RequestDetailsView } from "@/components/complementary-services/request-details-view";
import { serverFetch } from "@/lib/api/server-fetch";
import {
  mapAdminRequestToUi,
  type AdminComplementaryRequestApiItem,
} from "@/lib/complementary-services/map-admin-complementary";

export type ComplementaryServiceDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ComplementaryServiceDetailsPage({
  params,
}: ComplementaryServiceDetailsPageProps) {
  const { id } = await params;

  let request: ReturnType<typeof mapAdminRequestToUi> | null = null;
  try {
    const response = await serverFetch<AdminComplementaryRequestApiItem>(
      "/admin/complementary-service-requests/" + id,
      { method: "GET" },
    );
    if (response.success && response.data) {
      request = mapAdminRequestToUi(response.data);
    }
  } catch {
    // Render the explicit unavailable state below.
  }

  if (request) {
    return (
      <div className="flex flex-1 flex-col gap-6 pt-4">
        <RequestDetailsView initialRequest={request} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 pt-4">
      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
        دریافت جزئیات درخواست ممکن نشد.
      </div>
    </div>
  );
}
