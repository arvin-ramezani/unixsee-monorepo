import { useTranslations } from "next-intl";
import Image from "next/image";

import Section from "@/components/common/section";
import SubTitle from "@/components/common/subtitle";
import Title from "@/components/common/title";
import RevealOnScroll from "@/components/common/motion/reveal-on-scroll";

export type NameSectionProps = { id?: string };

const PARTS = ["unix", "see"] as const;

/**
 * Section 3 — what the name means.
 *
 * Kept deliberately short. Its value is as the cheapest available proof that
 * observability is structural to the offering rather than a feature bullet, so
 * it stays two definitions plus the closing line and does not grow.
 */
export default function NameSection({ id }: NameSectionProps) {
  const t = useTranslations("AboutPage.NameSection");

  return (
    <Section id={id} className="bg-muted">
      <RevealOnScroll>
        <Title as="h2" className="max-w-3xl rtl:leading-normal">
          {t("heading")}
        </Title>

        <SubTitle
          className="mt-5 max-w-3xl rtl:leading-loose"
          dangerouslySetInnerHTML={{ __html: t.raw("lead") }}
        />
        {/* {t("lead")} */}
        {/* </SubTitle> */}

        {/*
          The definitions and the illustration share a row from `lg` only. The
          `dl` keeps its two-up layout at `md` and drops back to one column at
          `lg`, where the image takes the horizontal space instead — stacking the
          terms there reads as a list rather than a cramped two-by-two.
        */}
        <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-14">
          <dl className="grid max-w-4xl flex-1 gap-6 md:grid-cols-2 lg:grid-cols-1">
            {PARTS.map((part) => (
              <div
                key={part}
                className="border-secondary/60 flex flex-col gap-2 border-s-2 ps-5"
              >
                <dt className="text-2xl font-extrabold lg:text-3xl">
                  {t(`parts.${part}.term`)}
                </dt>
                <dd className="text-text-secondary rtl:leading-loose">
                  {t(`parts.${part}.description`)}
                </dd>
              </div>
            ))}
          </dl>

          {/*
            Decorative: a console whose contents are drawn as bars, never
            characters, so nothing here needs translating or reading aloud.
            Width-capped so a square does not swallow a mobile viewport.
          */}
          <div className="relative aspect-square w-full max-w-90 self-center lg:w-[42%] lg:max-w-105 lg:shrink-0">
            <Image
              src="/images/about-us/name-story.png"
              alt=""
              fill
              sizes="(min-width: 1024px) 420px, 360px"
              className="object-contain"
            />
          </div>
        </div>

        <p className="mt-8 max-w-3xl text-lg font-semibold md:text-xl rtl:leading-[1.9]">
          {t("close")}
        </p>
      </RevealOnScroll>
    </Section>
  );
}
