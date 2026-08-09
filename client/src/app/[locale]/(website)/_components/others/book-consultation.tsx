import SubTitle from "@/components/common/subtitle";
import Title from "@/components/common/title";
import { useTranslations } from "next-intl";

export type BookConsultationType = {};

export default function BookConsultation(_props: BookConsultationType) {
  const t = useTranslations(`HomePage.ConsultationSection`);

  return (
    <>
      <Title as="h3" className="text-center">
        {t(`bookConsultation.title`)}
      </Title>
      <SubTitle className="mt-6 text-center">
        {t(`bookConsultation.description`)}
      </SubTitle>
    </>
  );
}
