import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { RevealOnScrollNoScript } from "@/components/common/motion/reveal-on-scroll";
import Section from "@/components/common/section";
import SubTitle from "@/components/common/subtitle";
import Title from "@/components/common/title";
import type { Locale } from "@/i18n/routing";
import { CONTACT_US_PAGE_NAV_ITEMS_KEYS } from "@/lib/constants";
import ContactFormSection from "./_components/contact-form-section";
import ContactInfoSection from "./_components/contact-info-section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Metadata.contactUs");
  return { title: t("title"), description: t("description") };
}

export type ContactUsPageProps = { params: Promise<{ locale: Locale }> };

export default async function ContactUsPage({ params }: ContactUsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("ContactUsPage");
  const tNav = await getTranslations("Layout.ContactUsSecondaryNavigation");

  const [messageId, infoId] = CONTACT_US_PAGE_NAV_ITEMS_KEYS.map((key) =>
    tNav(`${key}.href`),
  );

  return (
    <main>
      <RevealOnScrollNoScript />
      <Section containerClassName="py-12 md:py-16 lg:py-20">
        <Title as="h1" className="max-w-3xl rtl:leading-normal">
          {t("heading")}
        </Title>
        <SubTitle className="mt-5 max-w-3xl rtl:leading-loose">
          {t("lead")}
        </SubTitle>

        <div className="mt-10 grid items-start gap-6 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,22rem)] lg:items-stretch lg:gap-8">
          <ContactFormSection id={messageId} />
          <ContactInfoSection id={infoId} />
        </div>
      </Section>
    </main>
  );
}
