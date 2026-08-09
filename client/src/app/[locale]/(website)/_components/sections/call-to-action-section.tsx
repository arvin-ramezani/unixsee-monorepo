import { useTranslations } from "next-intl";

import Section from "@/components/common/section";
import { Button } from "@/components/ui/button";
import Title from "@/components/common/title";
import SubTitle from "@/components/common/subtitle";

export type CallToActionSectionType = {};

export default function CallToActionSection(_props: CallToActionSectionType) {
  const t = useTranslations("HomePage.CallToActionSection");

  return (
    <Section className="">
      <Title as="h2">{t("title")}</Title>
      <SubTitle className="mt-4 lg:mt-6">{t("description")}</SubTitle>

      <div className="container mt-10 flex flex-col gap-4 lg:flex-row lg:justify-center">
        <Button className="bg-secondary h-12 text-white lg:min-w-48">
          {t("primaryCTA")}
        </Button>
      </div>
    </Section>
  );
}
