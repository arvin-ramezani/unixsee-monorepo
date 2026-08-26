import { useLocale, useTranslations } from "next-intl";

import Section from "@/components/common/section";
import SubTitle from "@/components/common/subtitle";
import Title from "@/components/common/title";
import RevealOnScroll from "@/components/common/motion/reveal-on-scroll";
import { DirectionalImage } from "@/components/common/directional-image";

export type SupportSectionProps = { id?: string };

const PILLARS = ["prevention", "watch", "clearing"] as const;

/**
 * Section 5 — how we think about support.
 *
 * This is the page's strongest differentiator while the team, metric, and
 * legal-entity proofs are still unavailable, so it is the one section that must
 * not be shortened to balance the layout.
 *
 * The ordinals are typographic rather than iconographic on purpose: they carry
 * a sequence (before the incident, during it, and along the growth path) that
 * an icon set would flatten into three unrelated symbols. Each one sits alone
 * in its own element, so localized digits cannot be reordered by the
 * surrounding Persian text and need no bidi isolate.
 */
export default function SupportSection({ id }: SupportSectionProps) {
  const locale = useLocale();
  const t = useTranslations("AboutPage.SupportSection");
  // Matches the digit formatting used by the help-center topic list.
  const ordinals = new Intl.NumberFormat(
    locale === "fa" ? "fa-u-nu-arabext" : "en",
  );

  return (
    <Section id={id} className="bg-muted">
      <RevealOnScroll>
        <Title as="h2" className="max-w-3xl rtl:leading-[1.5]">
          {t("heading")}
        </Title>

        <SubTitle className="mt-5 max-w-3xl font-semibold rtl:leading-[2]">
          {t("lead")}
        </SubTitle>

        {/*
          Sits directly above the pillar list so each station lines up with the
          card it depicts: shield → prevention, trace → watch, rising steps →
          clearing the path. That mapping is why the asset ships mirrored rather
          than CSS-flipped — a `-scale-x-100` would also flip the green check and
          the light source, and in RTL the sequence has to start on the right.

          Decorative: the sequence is fully named in the ordered list below.
        */}
        <div className="relative mt-10 aspect-3/1 w-full">
          <DirectionalImage
            src={{
              ltr: "/images/about-us/support-continuum.png",
              rtl: "/images/about-us/support-continuum-rtl.png",
            }}
            alt=""
            fill
            sizes="(min-width: 1280px) 1120px, 100vw"
            className="object-contain"
          />
        </div>

        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {PILLARS.map((pillar, index) => (
            <li
              key={pillar}
              className="bg-card border-border flex flex-col gap-3 rounded-xl border p-6"
            >
              <span
                aria-hidden="true"
                className="text-foreground/35 text-3xl font-extrabold"
              >
                {ordinals.format(index + 1)}
              </span>

              <h3 className="text-lg font-bold rtl:leading-[1.7]">
                {t(`pillars.${pillar}.title`)}
              </h3>

              <p className="text-text-secondary rtl:leading-[2]">
                {t(`pillars.${pillar}.description`)}
              </p>
            </li>
          ))}
        </ol>

        <p className="mt-8 max-w-3xl text-lg font-semibold md:text-xl rtl:leading-[1.9]">
          {t("close")}
        </p>
      </RevealOnScroll>
    </Section>
  );
}
