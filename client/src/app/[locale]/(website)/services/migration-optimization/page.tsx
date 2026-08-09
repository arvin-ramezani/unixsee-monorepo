import { useTranslations } from "next-intl";

import { MIGRATION_PAGE_NAV_ITEMS_KEYS } from "@/lib/constants";
import ConnectSection from "../_components/sections/connect-section";
import FaqSection from "../_components/sections/faq-section";
import HeroSection from "../_components/sections/hero-section";
import ManageSection from "../_components/sections/manage-section";
import PerformanceSection from "../_components/sections/performance-section";
import PlansSection from "../_components/sections/plans-section";
import ProtectionSection from "../_components/sections/protection-section";
import VideoSection from "../_components/sections/video-section";

export type PageProps = object;

export default function Page({}: PageProps) {
  const t = useTranslations(`Layout.MigrationSecondaryNavigation`);
  const sectionIds = MIGRATION_PAGE_NAV_ITEMS_KEYS.map((key) =>
    t(`${key}.href`),
  );

  return (
    <main className="pb-20">
      <HeroSection />
      <PlansSection id={sectionIds[0]} />
      <VideoSection id={sectionIds[1]} />
      <ManageSection id={sectionIds[2]} />
      <ConnectSection id={sectionIds[3]} />
      <PerformanceSection id={sectionIds[4]} />
      <ProtectionSection id={sectionIds[5]} />
      <FaqSection id={sectionIds[7]} />
    </main>
  );
}
