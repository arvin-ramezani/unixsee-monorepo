import { useTranslations } from "next-intl";

import Title from "@/components/common/title";
import Section from "@/components/common/section";
import SubTitle from "@/components/common/subtitle";
import { ProblemSectionCard } from "../others/problem-section-card";
import { MouseParticlesBackground } from "@/components/common/wavy-background";
import { ContourLinesBackground } from "@/components/common/motion-wavy-background";
import { CardImage } from "@/components/common/card-image";

const itemKeys = [
  "semiDedicated",
  "dedicated",
  "woocommerceSupport",
  "complementaryServices",
] as const;

export type CoreServicesSectionType = {};

export default function CoreServicesSection(_props: CoreServicesSectionType) {
  const t = useTranslations("HomePage.CoreServicesSection");

  return (
    <Section className="relative">
      <Title as="h2">{t("title")}</Title>
      <SubTitle className="mt-4 lg:mt-6">{t("description")}</SubTitle>

      <ul className="mt-8 flex flex-col gap-4 lg:flex-row lg:flex-wrap">
        {itemKeys.map((key) => (
          <li key={key} className="flex-1">
            <CardImage
              title={t(`items.${key}.title`)}
              description={t(`items.${key}.description`)}
            />
          </li>
        ))}
      </ul>

      <MouseParticlesBackground
      // className="absolute inset-0"
      // lineCount={120}
      // segments={46}
      // stroke="255,255,255"
      // strokeWidth={0.65}
      // opacity={0.08}
      // baseAmplitude={16}
      // mouseAmplitude={26}
      // mouseRadius={170}
      />
    </Section>
  );
}
