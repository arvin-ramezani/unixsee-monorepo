import { useTranslations } from "next-intl";
import Image from "next/image";

import LinkButton from "@/components/common/link-button";
import Section from "./section";
import Title from "../common/title";
import Text from "../common/text";
import { RadialRevealLink } from "@/components/common/radial-reveal/radial-reveal-link";

export type HeroSectionProps = {
  id?: string;
};

export default function HeroSection({ id }: HeroSectionProps) {
  const t = useTranslations("ManagedServerPage.HeroSection");
  return (
    <Section
      id={id}
      className="lg:py-24"
      containerClassName="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-20 lg:pt-9!"
    >
      <div className="flex flex-col gap-4 text-center md:text-start lg:flex-1">
        <Text className="-mb-6 text-lg">{t("subTitle")}</Text>
        <Title>{t("heading")}</Title>
        <Text className="mt-0">{t("description")}</Text>

        <RadialRevealLink
          href="/"
          className="h-12 w-full text-white md:w-auto md:self-start md:px-6"
        >
          {t("primaryCTA")}
        </RadialRevealLink>
      </div>

      <div className="lg:min-w-[45%] xl:min-w-1/2">
        <div className="relative aspect-358/234 w-full">
          <Image
            src="/images/migration-service/hero-section.avif"
            alt="Hero section image"
            fill
            priority
          />
        </div>
      </div>
    </Section>
  );
}
