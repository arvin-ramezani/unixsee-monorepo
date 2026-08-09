import { WebsiteCard } from "@/components/websites/website-card";
import type { WebsiteRecord } from "@/lib/websites-data";

/**
 * Responsive grid of website cards. Shares the same filtered/sorted records the
 * table receives — only the presentation differs, never the data pipeline.
 */
export function WebsiteGrid({ websites }: { websites: WebsiteRecord[] }) {
  return (
    <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
      {websites.map((website) => (
        <WebsiteCard key={website.domain} website={website} />
      ))}
    </div>
  );
}
