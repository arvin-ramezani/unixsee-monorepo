import { useTranslations } from "next-intl";

import Title from "@/components/common/title";
import Section from "@/components/common/section";
import SubTitle from "@/components/common/subtitle";
import { ProblemSectionCard } from "../others/problem-section-card";
import { CardImage } from "@/components/common/card-image";

const forItemKeys = [
  "growingStores",
  "trafficSensitiveStores",
  "stabilityFocusedBrands",
  "noInternalInfraTeam",
  "coordinatedSupport",
] as const;

const notForItemKeys = [
  "nonWordPress",
  "cheapestPlan",
  "sharedHostingSeekers",
  "lowNeedProjects",
] as const;

export type AudienceFitSectionType = {};

export default function AudienceFitSection(_props: AudienceFitSectionType) {
  const t = useTranslations("HomePage.AudienceFitSection");

  return (
    <Section>
      <Title as="h2">{t("title")}</Title>
      <SubTitle className="mt-4 lg:mt-6">{t("description")}</SubTitle>

      <ul className="mt-8 flex flex-col gap-4 lg:flex-row">
        {forItemKeys.map((key) => (
          <li key={key} className="flex-1">
            <CardImage title={t(`forItems.${key}`)} />
          </li>
        ))}
      </ul>

      <ul className="mt-8 flex flex-col gap-4 lg:flex-row">
        {notForItemKeys.map((key) => (
          <li key={key} className="flex-1">
            <CardImage title={t(`notForItems.${key}`)} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
