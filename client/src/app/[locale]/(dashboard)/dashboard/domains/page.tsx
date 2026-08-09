import { notFound } from "next/navigation";

import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";

interface DomainsPageProps {
  params: Promise<{ locale: Locale }>;
}

// The Domains area is not available yet ("Coming soon"). The route is disabled
// until the feature ships; the sidebar entry is rendered non-interactive.
export default async function DomainsPage({ params }: DomainsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  notFound();
}
