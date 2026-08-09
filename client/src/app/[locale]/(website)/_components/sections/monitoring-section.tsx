import { useTranslations } from "next-intl";

import Title from "@/components/common/title";
import Section from "@/components/common/section";
import SubTitle from "@/components/common/subtitle";
import { ProblemSectionCard } from "../others/problem-section-card";
import { CardImage } from "@/components/common/card-image";

const itemKeys = [
  "liveStatus",
  "healthMetrics",
  "issueDetection",
  "operationalAlerts",
] as const;

export type MonitoringSectionType = {};

export default function MonitoringSection(_props: MonitoringSectionType) {
  const t = useTranslations("HomePage.MonitoringSection");

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
