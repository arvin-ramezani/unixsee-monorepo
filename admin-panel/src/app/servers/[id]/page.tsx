import { ServerDetailsPageClient } from "@/components/servers/server-details-page-client";

export type ServerDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ServerDetailsPage({
  params,
}: ServerDetailsPageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-1 flex-col gap-6 pt-4">
      <ServerDetailsPageClient id={id} />
    </div>
  );
}
