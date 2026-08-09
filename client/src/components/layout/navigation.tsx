import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export const NAVIGATION_ITEMS = [
  { key: "home", href: "/" },
  { key: "managedServer", href: "/managed-hosting" },
  { key: "services", href: "/complementary-services" },
  { key: "customers", href: "/migration-optimization" },
  { key: "resources", href: "/customers" },
  { key: "aboutUs", href: "/about" },
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
