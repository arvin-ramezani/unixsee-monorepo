import { WebsiteDetailsView } from "@/components/websites/website-details-view";
import { WEBSITES } from "@/lib/data/websites-data";

export type WebsiteDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function WebsiteDetailsPage({
  params,
}: WebsiteDetailsPageProps) {
  const { id } = await params;
  const website = WEBSITES.find((item) => item.id === id);

  if (!website) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
        وب‌سایت موردنظر پیدا نشد.
      </div>
    );
  }

  return <WebsiteDetailsView website={website} />;
}
