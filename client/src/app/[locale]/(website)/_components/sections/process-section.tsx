import { useTranslations } from "next-intl";

import Title from "@/components/common/title";
import Section from "@/components/common/section";
import ProcessSectionCarousel from "../others/process-section-carousel";

export type ProcessSectionType = object;

export default function ProcessSection({}: ProcessSectionType) {
  const t = useTranslations("HomePage.ProcessSection");

  return (
    <Section>
      <Title>{t("title")}</Title>
      {/* <SubTitle>{t("description")}</SubTitle> */}

      <ProcessSectionCarousel />
    </Section>
  );
}
