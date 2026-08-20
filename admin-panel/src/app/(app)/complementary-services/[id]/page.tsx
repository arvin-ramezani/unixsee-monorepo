import { RequestDetailsPageClient } from "@/components/complementary-services/request-details-page-client";

export type ComplementaryServiceDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ComplementaryServiceDetailsPage({
  params,
}: ComplementaryServiceDetailsPageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-1 flex-col gap-6 pt-4">
      <RequestDetailsPageClient id={id} />
    </div>
  );
}
