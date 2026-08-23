import { useTranslations } from "next-intl";
import Section from "./section";
import PlansList from "@/components/plans/plans-list";
import Title from "../common/title";

export type PlansSectionProps = {
  id?: string;
};

export default function PlansSection({ id }: PlansSectionProps) {
  const t = useTranslations("ManagedServerPage.PlansSection");
  return (
    <Section id={id} className="bg-muted" containerClassName="flex-col! pb-0!">
      <Title as="h2" className="mx-auto mb-4 max-w-lg text-center lg:max-w-3xl">
        {t("heading")}
      </Title>
      <p className="text-center">{t("subHeading")}</p>

      <PlansList className="mt-8 lg:mt-20 [&_article]:border!" />
    </Section>
  );
}
