import { setRequestLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import type { Locale } from "@/i18n/routing";

export default async function DashboardLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);

  const user = await getCurrentUser();

  if (!user) {
    redirect({
      href: "/auth?returnTo=/dashboard",
      locale,
    });
  }

  return children;
}
