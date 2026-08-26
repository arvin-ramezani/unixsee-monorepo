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
    <Section
      id={id}
      className="bg-muted"
      containerClassName="flex-col! items-stretch! pb-0!"
    >
      <Title
        as="h2"
        className="mx-auto mb-4 text-center md:mx-0 md:text-start lg:max-w-3xl"
        dangerouslySetInnerHTML={{ __html: t.raw("heading") }}
      />
      {/* {t("heading")}
      </Title> */}
      <p
        className="mx-auto max-w-sm text-center md:mx-0 md:text-start rtl:leading-7"
        dangerouslySetInnerHTML={{ __html: t.raw("subHeading") }}
      />
      {/* {t("subHeading")}
      </p> */}

      <PlansList className="mt-8 lg:mt-20 [&_article]:border!" />
    </Section>
  );
}
