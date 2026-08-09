import { useTranslations } from "next-intl";
import Title from "../common/title";
import Section from "./section";
import LinkButton from "@/components/common/link-button";

export type CtaSectionProps = {
  id?: string;
};

export default function CtaSection({ id }: CtaSectionProps) {
  const t = useTranslations(`MigrationPage.CtaSection`);

  return (
    <Section
      id={id}
      className="px-4 py-14 lg:py-12"
      containerClassName="bg-primary rounded-2xl text-primary-foreground flex-col! gap-8"
    >
      <Title>{t(`heading`)}</Title>
      <p>{t(`subHeading`)}</p>

      <LinkButton
        className="bg-text-link hover:border-text-link border-text-link border text-base font-bold"
        href={t(`cta.href`)}
      >
        {t(`cta.label`)}
      </LinkButton>
    </Section>
  );
}
