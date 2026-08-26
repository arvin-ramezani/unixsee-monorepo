import { useTranslations } from "next-intl";
import Section from "./section";
import ProtectionList from "../protection/protection-list";
import Title from "../common/title";

export type ProtectionSectionProps = {
  id?: string;
};

export default function ProtectionSection({ id }: ProtectionSectionProps) {
  const t = useTranslations("ManagedServerPage.ProtectionSection");

  return (
    <Section
      id={id}
      className="bg-primary dark:bg-blue-light text-primary-foreground text-center md:text-start"
      containerClassName="flex-col! items-stretch!"
    >
      <Title
        as="h2"
        className="text-primary-foreground mx-auto mb-4 max-w-xs md:mx-0 xl:max-w-sm"
      >
        {t("heading")}
      </Title>
      {/* <p className="font-light">{t("description")}</p> */}

      <ProtectionList className="mt-4 text-start lg:mt-8 2xl:mt-12" />
    </Section>
  );
}
