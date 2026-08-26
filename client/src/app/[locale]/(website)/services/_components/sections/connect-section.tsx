import { useTranslations } from "next-intl";
import Section from "./section";
import Title from "../common/title";
import Image from "next/image";
import LinkButton from "@/components/common/link-button";
import Text from "../common/text";
import { RadialRevealLink } from "@/components/common/radial-reveal/radial-reveal-link";

export type ConnectSectionProps = {
  id?: string;
};

export default function ConnectSection({ id }: ConnectSectionProps) {
  const t = useTranslations("ManagedServerPage.ConnectSection");

  return (
    <Section
      id={id}
      className="bg-muted"
      containerClassName="flex-col lg:flex-row-reverse gap-10 lg:gap-20"
    >
      <div className="flex flex-col gap-4 text-center md:text-start">
        <Title
          as="h2"
          className="lg:leading-14"
          dangerouslySetInnerHTML={{ __html: t.raw("heading") }}
        />
        {/* </Title> */}
        <Text className="text-foreground text-lg">{t("description")}</Text>
        <RadialRevealLink
          variant={"link"}
          href={t("cta.href")}
          className="text-text-link w-full hover:no-underline md:w-fit lg:min-w-auto lg:self-start lg:px-2"
        >
          {t("cta.label")}
        </RadialRevealLink>
      </div>

      <div className="relative aspect-69/50 w-full rounded-xl lg:min-w-[40%]">
        <Image src={t("image.src")} alt={t("image.alt")} fill />
      </div>
    </Section>
  );
}
