import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export const NAVIGATION_ITEMS = [
  { key: "home", href: "/" },
  { key: "managedServer", href: "/managed-hosting" },
  { key: "services", href: "/complementary-services" },
  { key: "customers", href: "/migration-optimization" },
  { key: "resources", href: "/customers" },
  // Must stay in sync with the live nav in `src/lib/translation-keys.ts`.
  // This module is currently dead code (only `disabled.header.tsx` imports it),
  // and it previously pointed at `/about`, which has never been a route. Kept
  // corrected rather than stale so re-enabling this header cannot resurrect a
  // 404 on the About page.
  { key: "aboutUs", href: "/about-us" },
  { key: "requestConsultation", href: "/contact" },
] as const;

export type NavigationType = object;

export default function Navigation({}: NavigationType) {
  const t = useTranslations("Layout.Navigation");

  return (
    <nav className="flex gap-2">
      {NAVIGATION_ITEMS.map((item) => (
        <Link key={item.key} href={item.href}>
          {/* @ts-expect-error we need partial navigation here */}
          {t(item.key)}
        </Link>
      ))}
    </nav>
  );
}
