import { draftMode } from "next/headers";

import HeroSection from "./_components/sections/hero-section";
import ProblemSection from "./_components/sections/problem-section";
import SolutionOverviewSection from "./_components/sections/solution-overview-section";
import FaqSection from "./_components/sections/faq-section";
import NumberOfSuccessSection from "./_components/sections/number-of-success/number-of-success-section";
import ProcessSection from "./_components/sections/ProcessSection";
import InfrastructureSection from "./_components/sections/infrastructure-section";
import ConsultationSection from "./_components/sections/consultation-section";
import AboutUsSection from "./_components/sections/about-us-section";
import PortfolioLogos from "./_components/sections/portfolio-logos";
import TestimonialsSection from "./_components/sections/testimonial/testimonials-section";
import { createUnixseeRouteAdapter } from "@/lib/api-clients/wordpress/route-adapter";
// import { homeRegistry } from "@/lib/api-clients/wordpress/home-registry";
import { wordpressClient } from "@/lib/api-clients/wordpress/client";
import BlogSection from "./_components/sections/blog-section";
import VideoBackground from "./_components/sections/hero-section/video-background";
import { getTranslations } from "next-intl/server";
import { HOME_PAGE_SECTION_IDS } from "@/lib/constants";
// import { getFirstConnection } from "@/lib/api/wp.api";
// import CoreServicesSection from "./_components/sections/core-services-section";
// import WhyChooseUsSection from "./_components/sections/why-choose-us-section";
// import AudienceFitSection from "./_components/sections/audience-fit-section";
// import MonitoringSection from "./_components/sections/monitoring-section";
// import AdditionalServicesSection from "./_components/sections/additional-services-section";
// import SocialProofSection from "./_components/sections/social-proof-section";
// import CallToActionSection from "./_components/sections/call-to-action-section";

// const adapter = createUnixseeRouteAdapter({
//   registry: homeRegistry,
//   onUnknownSection: (section) => {
//     console.warn(`[unixsee] Unknown section: ${section.type}`);
//   },
// });

export type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: HomePageProps) {
  const t = await getTranslations(`Layout.HomeSecondaryNavigation`);

  const sectionIds = HOME_PAGE_SECTION_IDS.map((key) => t(`${key}.href`));

  // const draft = await draftMode();

  // const data = await wordpressClient.home({
  //   lang: locale,
  //   mode: draft.isEnabled ? "preview" : "published",
  //   next: {
  //     tags: ["unixsee:home", `unixsee:home:${locale}`],
  //   },
  // });

  // adapter.assertHomePage(data.page);

  return (
    // <main>{adapter.renderHome(data)}</main>

    <main>
      <HeroSection />
      <ProblemSection id={sectionIds[0]} />
      {/* <AboutUsSection id={sectionIds[1]} /> */}
      <SolutionOverviewSection id={sectionIds[1]} />
      {/* <NumberOfSuccessSection id={sectionIds[2]} /> */}
      <InfrastructureSection id={sectionIds[2]} />
      <ProcessSection id={sectionIds[3]} />
      {/* <PortfolioLogos id={sectionIds[6]} /> */}
      <ConsultationSection id={sectionIds[4]} />
      <FaqSection id={sectionIds[5]} />
      {/* <TestimonialsSection id={sectionIds[5]} /> */}
      {/* <BlogSection id={sectionIds[9]} /> */}

      {/* <WhyChooseUsSection />
      <CoreServicesSection />
      <AudienceFitSection />
      <MonitoringSection />
      <AdditionalServicesSection />
      <SocialProofSection />
      <CallToActionSection /> */}
    </main>
  );
}
