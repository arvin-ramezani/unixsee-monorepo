import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { UnixseeMessagesAside } from "@/components/unixsee-messages/unixsee-messages-aside";
import { UnixseeMessagesManager } from "@/components/unixsee-messages/unixsee-messages-manager";
import type { Locale } from "@/i18n/routing";
import { fetchUnixseeMessageList } from "@/lib/unixsee-messages/unixsee-messages-api";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({
  params,
}: Pick<PageProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Metadata.unixseeMessages");
  return { title: t("title"), description: t("description") };
}

export default async function UnixseeMessagesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("UnixseeMessages");
  const result = await fetchUnixseeMessageList({ take: 50 });

  return (
    <DashboardShell
      activeItem="UnixseeMessages"
      breadcrumbs={[{ label: t("title") }]}
    >
      <div className="space-y-4 pt-2">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t("subtitle")}</p>
        </div>
        <div className="grid w-full max-w-5xl gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="xl:hidden">
            <UnixseeMessagesAside />
          </div>
          <div className="min-w-0 max-w-2xl">
            <UnixseeMessagesManager
              messages={result.ok ? result.data.items : []}
              initialState={
                !result.ok
                  ? "error"
                  : result.data.items.length === 0
                    ? "empty"
                    : "ready"
              }
            />
          </div>
          <UnixseeMessagesAside className="hidden self-start xl:sticky xl:top-24 xl:block" />
        </div>
      </div>
    </DashboardShell>
  );
}
