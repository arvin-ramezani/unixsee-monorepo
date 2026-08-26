import {
  Activity,
  ArrowUpRight,
  BellRing,
  LayoutDashboard,
  LifeBuoy,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import Section from "@/components/common/section";
import SubTitle from "@/components/common/subtitle";
import Title from "@/components/common/title";
import RevealOnScroll from "@/components/common/motion/reveal-on-scroll";
import { Link } from "@/i18n/navigation";

export type ScopeSectionProps = { id?: string };

/**
 * Section 4 — what we do.
 *
 * This is a responsibility boundary, not a service catalogue: two or three
 * lines per item, and anything that wants more room links out to the page that
 * owns it. Items without an owning route simply carry no link rather than
 * pointing at a route that does not exist.
 */
const SCOPE_ITEMS = [
  {
    key: "monitoring",
    icon: Activity,
  },
  {
    key: "operations",
    icon: Wrench,
  },
  { key: "support", icon: LifeBuoy },
  { key: "incident", icon: BellRing },
  {
    key: "security",
    icon: ShieldCheck,
  },
  { key: "applications", icon: LayoutDashboard },
] as const;

export default function ScopeSection({ id }: ScopeSectionProps) {
  const t = useTranslations("AboutPage.ScopeSection");

  return (
    <Section id={id}>
      <RevealOnScroll>
        <Title as="h2" className="max-w-3xl rtl:leading-normal">
          {t("heading")}
        </Title>

        <SubTitle className="mt-5 max-w-3xl rtl:leading-loose">
          {t("lead")}
        </SubTitle>

        <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SCOPE_ITEMS.map(({ key, icon: Icon }) => (
            <li
              key={key}
              className="bg-card border-border flex flex-col gap-2 rounded-xl border p-5"
            >
              <h3 className="flex items-center gap-2 font-semibold">
                <Icon
                  aria-hidden="true"
                  className="text-foreground/70 size-4.5 shrink-0"
                />
                {t(`items.${key}.title`)}
              </h3>

              <p className="text-text-secondary text-sm rtl:leading-[1.9]">
                {t(`items.${key}.description`)}
              </p>
            </li>
          ))}
        </ul>
      </RevealOnScroll>
    </Section>
  );
}
