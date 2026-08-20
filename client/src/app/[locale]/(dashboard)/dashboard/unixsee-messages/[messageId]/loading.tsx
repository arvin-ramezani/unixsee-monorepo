import { getTranslations } from "next-intl/server";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { UnixseeMessageDetailLoadingSkeleton } from "@/components/unixsee-messages/unixsee-message-detail-loading-skeleton";

export default async function UnixseeMessageDetailLoading() {
  const t = await getTranslations("UnixseeMessages");

  return (
    <DashboardShell
      activeItem="UnixseeMessages"
      breadcrumbs={[
        { label: t("title"), href: "/dashboard/unixsee-messages" },
        { label: t("details") },
      ]}
    >
      <UnixseeMessageDetailLoadingSkeleton />
    </DashboardShell>
  );
}
