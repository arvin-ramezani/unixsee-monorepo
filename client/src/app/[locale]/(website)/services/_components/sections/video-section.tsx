import { useTranslations } from "next-intl";

import Section from "./section";
import VideoCard from "../video-card/video-card";
import VideoList from "../video-card/video-list";
import Title from "../common/title";
import Text from "../common/text";

export type VideoSectionProps = {
  id?: string;
};

export default function VideoSection({ id }: VideoSectionProps) {
  const t = useTranslations("ManagedServerPage.MonitoringSection");

  return (
    <Section id={id} containerClassName="lg:flex-col  items-center">
      <Title as="h2" className="mb-4 text-center">
        {t("heading")}
      </Title>
      <Text className="text-center">{t("description")}</Text>

      <VideoCard className="mt-4 flex flex-col" />

      <VideoList className="mt-10 p-6" />
    </Section>
  );
}
