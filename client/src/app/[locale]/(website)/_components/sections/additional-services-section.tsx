import { useTranslations } from "next-intl";

import Title from "@/components/common/title";
import Section from "@/components/common/section";
import SubTitle from "@/components/common/subtitle";
// import { ProblemSectionCard } from "../others/problem-section-card";
import { CardImage } from "@/components/common/card-image";

const itemKeys = [
  "seo",
  "graphicDesign",
  "productDataEntry",
  "socialMedia",
  "operationalSupport",
] as const;

export type AdditionalServicesSectionType = {};

export default function AdditionalServicesSection(
  _props: AdditionalServicesSectionType,
) {
  const t = useTranslations("HomePage.AdditionalServicesSection");

  return (
    <Section>
      <Title as="h2">{t("title")}</Title>
      <SubTitle className="mt-4 lg:mt-6">{t("description")}</SubTitle>

      <ul className="mt-8 flex flex-col gap-4 lg:flex-row">
        {itemKeys.map((key) => (
          <li key={key} className="flex-1">
            <CardImage title={t(`items.${key}`)} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
