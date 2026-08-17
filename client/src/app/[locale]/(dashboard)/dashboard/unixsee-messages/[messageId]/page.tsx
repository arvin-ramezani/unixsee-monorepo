import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { UnixseeMessageDetailView } from "@/components/unixsee-messages/unixsee-message-detail-view";
import type { Locale } from "@/i18n/routing";
import { fetchUnixseeMessageDetail } from "@/lib/unixsee-messages/unixsee-messages-api";

interface PageProps {
  params: Promise<{ locale: Locale; messageId: string }>;
}

export async function generateMetadata({
  params,
}: Pick<PageProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Metadata.unixseeMessageDetails");
  return { title: t("title"), description: t("description") };
}

export default async function UnixseeMessageDetailPage({ params }: PageProps) {
  const { locale, messageId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("UnixseeMessages");
  const result = await fetchUnixseeMessageDetail(messageId);

  if (!result.ok) {
    if (result.error.key === "notFound") {
      notFound();
    }
    return (
      <DashboardShell
        activeItem="UnixseeMessages"
        breadcrumbs={[
          { label: t("title"), href: "/dashboard/unixsee-messages" },
          { label: t("details") },
        ]}
      >
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-6 text-sm">
          {t("loadError")}
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      activeItem="UnixseeMessages"
      breadcrumbs={[
        { label: t("title"), href: "/dashboard/unixsee-messages" },
        { label: result.data.title },
      ]}
    >
      <UnixseeMessageDetailView message={result.data} />
    </DashboardShell>
  );
}
