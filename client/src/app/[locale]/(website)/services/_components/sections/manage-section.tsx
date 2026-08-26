import { useTranslations } from "next-intl";

import Title from "../common/title";
import Section from "./section";
import ManageList from "../manage/manage-list";
import { RadialRevealLink } from "@/components/common/radial-reveal/radial-reveal-link";

export type ManageSectionProps = {
  id?: string;
};

export default function ManageSection({ id }: ManageSectionProps) {
  const t = useTranslations("ManagedServerPage.ManageSection");

  return (
    <Section id={id} containerClassName="flex-col! items-stretch!">
      <Title
        as="h2"
        className="mb-4 text-center md:text-start lg:max-w-3xl"
        dangerouslySetInnerHTML={{ __html: t.raw("heading") }}
      />
      {/* {t("heading")}
      </Title> */}

      <ManageList className="mt-8 lg:mt-12" />

      <RadialRevealLink
        href={t("cta.href")}
        className="mt-4 h-12 w-full min-w-48 self-center px-6 md:mt-12 md:w-fit md:self-start md:px-4"
      >
        {t("cta.label")}
      </RadialRevealLink>
    </Section>
  );
}
