import { useTranslations } from "next-intl";
import Title from "../common/title";
import Section from "./section";
import MigrationFaq from "../faq/migration-faq";

export type FaqSectionProps = {
  id?: string;
};

export default function FaqSection({ id }: FaqSectionProps) {
  const t = useTranslations("MigrationPage.FAQSection");

  return (
    <Section id={id} containerClassName="flex-col!">
      <Title as="h2" className="text-center lg:max-w-4xl lg:leading-14">
        {t("heading")}
      </Title>

      <MigrationFaq className="mt-16 lg:max-w-4xl" />
    </Section>
  );
}
