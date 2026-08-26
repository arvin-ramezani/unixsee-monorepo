import { useTranslations } from "next-intl";
import Title from "../common/title";
import Section from "./section";
import { Badge } from "@/components/ui/badge";
import PerformanceAccordion from "../performance/performance-accordion";

export type PerformanceSectionProps = {
  id?: string;
};

export default function PerformanceSection({ id }: PerformanceSectionProps) {
  const t = useTranslations("ManagedServerPage.PerformanceSection");
  return (
    <Section
      id={id}
      className="bg-muted"
      containerClassName="gap-10 lg:items-stretch lg:gap-20"
    >
      <div className="flex flex-col items-center gap-6 text-center md:items-start md:text-start">
        <Badge
          variant={"outline"}
          className="border-primary bg-primary/20 px-3 py-1.5"
        >
          {t(`badge`)}
        </Badge>
        <Title as="h2">{t(`heading`)}</Title>
      </div>

      <PerformanceAccordion className="lg:max-w-[42%] lg:min-w-[42%]" />
    </Section>
  );
}
