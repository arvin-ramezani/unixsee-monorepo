import { getTranslations } from "next-intl/server";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { UnixseeMessagesLoadingSkeleton } from "@/components/unixsee-messages/unixsee-messages-loading-skeleton";

export default async function UnixseeMessagesLoading() {
  const t = await getTranslations("UnixseeMessages");

  return (
    <DashboardShell
      activeItem="UnixseeMessages"
      breadcrumbs={[{ label: t("title") }]}
    >
      <UnixseeMessagesLoadingSkeleton />
    </DashboardShell>
  );
}
