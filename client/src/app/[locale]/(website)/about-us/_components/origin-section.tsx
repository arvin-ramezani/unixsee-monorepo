import {
  CreditCard,
  Database,
  Gauge,
  ShieldAlert,
  ZapOff,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import Section from "@/components/common/section";
import SubTitle from "@/components/common/subtitle";
import Title from "@/components/common/title";
import RevealOnScroll from "@/components/common/motion/reveal-on-scroll";

export type OriginSectionProps = { id?: string };

/**
 * Section 2 — why Unixsee was built.
 *
 * The approved brand narrative names five concrete ecommerce failure modes in
 * one long sentence. Splitting them into scannable stake items is the whole
 * point of this section: the single-block form in the site footer is the defect
 * being fixed, so do not recombine them into a paragraph.
 */
const STAKES = [
  { key: "slowness", icon: Gauge },
  { key: "payment", icon: CreditCard },
  { key: "database", icon: Database },
  { key: "security", icon: ShieldAlert },
  { key: "downtime", icon: ZapOff },
] as const;

export default function OriginSection({ id }: OriginSectionProps) {
  const t = useTranslations("AboutPage.OriginSection");

  return (
    <Section id={id}>
      <RevealOnScroll>
        <Title as="h2" className="max-w-3xl rtl:leading-normal">
          {t("heading")}
        </Title>

        <SubTitle className="mt-5 max-w-3xl rtl:leading-loose">
          {t("lead")}
        </SubTitle>

        <p className="mt-8 max-w-3xl font-semibold rtl:leading-loose">
          {t("stakesIntro")}
        </p>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STAKES.map(({ key, icon: Icon }) => (
            <li
              key={key}
              className="bg-card border-border flex flex-col gap-2 rounded-xl border p-5"
            >
              <span className="flex items-center gap-2 font-semibold">
                <Icon
                  aria-hidden="true"
                  className="text-foreground/70 size-4 shrink-0"
                />
                {t(`stakes.${key}.title`)}
              </span>
              <p className="text-text-secondary text-sm rtl:leading-[1.9]">
                {t(`stakes.${key}.description`)}
              </p>
            </li>
          ))}
        </ul>

        <p className="border-secondary mt-8 max-w-3xl border-s-2 ps-4 font-medium rtl:leading-loose">
          {t("close")}
        </p>
      </RevealOnScroll>
    </Section>
  );
}
