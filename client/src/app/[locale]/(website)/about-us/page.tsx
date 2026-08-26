import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { RevealOnScrollNoScript } from "@/components/common/motion/reveal-on-scroll";
import type { Locale } from "@/i18n/routing";
import ContactSection from "./_components/contact-section";
import NameSection from "./_components/name-section";
import NextStepSection from "./_components/next-step-section";
import OrganizationJsonLd from "./_components/organization-json-ld";
import OriginSection from "./_components/origin-section";
import PositioningSection from "./_components/positioning-section";
import ScopeSection from "./_components/scope-section";
import SupportSection from "./_components/support-section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Metadata.about");
  return { title: t("title"), description: t("description") };
}

export type AboutUsPageProps = { params: Promise<{ locale: Locale }> };

export default async function AboutUsPage({ params }: AboutUsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="pb-8">
      <OrganizationJsonLd />
      <RevealOnScrollNoScript />

      <PositioningSection />
      <OriginSection />
      <NameSection />
      <ScopeSection />
      <SupportSection />
      <ContactSection />
      <NextStepSection />
    </main>
  );
}
