import { useTranslations } from "next-intl";
import Image from "next/image";

import Section from "@/components/common/section";
import SubTitle from "@/components/common/subtitle";
import Title from "@/components/common/title";
import { Badge } from "@/components/ui/badge";

export type PositioningSectionProps = { id?: string };

/**
 * Section 1 — positioning hero.
 *
 * Carries the page's single `h1` plus one verifiable credibility anchor (the
 * operations base) so the first mobile screen is not spent on claims alone.
 * No price, plan, or sales headline here by design: this page's job is due
 * diligence, not conversion.
 */
export default function PositioningSection({ id }: PositioningSectionProps) {
  const t = useTranslations("AboutPage.PositioningSection");
  const tCommon = useTranslations("common");

  return (
    <Section
      id={id}
      // Not wrapped in a scroll reveal: this block is above the fold, and
      // hiding it until hydration would delay the one thing the page must show
      // immediately.
      //
      // Column-first: on mobile the whole text block — positioning line plus the
      // credibility anchor — must precede the illustration (PRD §10.2), which
      // DOM order already gives us. Only from `lg` is there room to sit them
      // side by side.
      containerClassName="flex flex-col gap-10 py-12 md:py-16 lg:flex-row lg:items-center lg:gap-12 lg:py-20 xl:py-24"
    >
      <div className="flex max-w-3xl flex-col items-start gap-5">
        <Badge
          variant="secondary"
          className="text-secondary-foreground/75 gap-1.5 text-base font-semibold"
        >
          {tCommon("slogan")}
        </Badge>

        <Title className="rtl:leading-[1.45]">{t("heading")}</Title>

        <p className="text-lg font-semibold md:text-xl lg:text-2xl rtl:leading-[1.9]">
          {t("lead")}
        </p>

        <SubTitle className="-mt-6 rtl:leading-loose">{t("support")}</SubTitle>
      </div>

      {/*
        Decorative only — `alt=""` keeps it out of the accessibility tree, since
        every claim it depicts is already stated in the text beside it.
        `object-contain` rather than `cover`: these are transparent illustrations
        with deliberate breathing room, and cropping clips the glow.
      */}
      <div className="relative aspect-video w-full shrink-0 lg:w-[46%]">
        <Image
          src="/images/about-us/hero.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1280px) 520px, (min-width: 1024px) 46vw, 100vw"
          className="object-contain"
        />
      </div>
    </Section>
  );
}
