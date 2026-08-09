import type { UnixseeMedia, UnixseeSection } from "./unixsee-contracts";

export type UnixseeHomeSectionType =
  | "HomeHeroSection"
  | "HomeProblemSection"
  | "HomeAboutUsSection"
  | "HomeSolutionOverviewSection"
  | "HomeSuccessNumbersSection"
  | "HomeInfrastructureSection"
  | "HomeProcessSection"
  | "HomeTestimonialsSection"
  | "HomeConsultationSection"
  | "HomeFaqSection";

export type HomeHeroSectionProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  primaryCta?: UnixseeCta;
  secondaryCta?: UnixseeCta;
  image?: UnixseeMedia | null;
  media?: UnixseeMedia | null;
  [key: string]: unknown;
};

export type HomeProblemSectionProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  items?: UnixseeRichItem[];
  [key: string]: unknown;
};

export type HomeAboutUsSectionProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  image?: UnixseeMedia | null;
  stats?: UnixseeStatItem[];
  [key: string]: unknown;
};

export type HomeSolutionOverviewSectionProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  cards?: UnixseeRichItem[];
  [key: string]: unknown;
};

export type HomeSuccessNumbersSectionProps = {
  eyebrow?: string;
  title?: string;
  numbers?: UnixseeStatItem[];
  [key: string]: unknown;
};

export type HomeInfrastructureSectionProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  items?: UnixseeRichItem[];
  image?: UnixseeMedia | null;
  [key: string]: unknown;
};

export type HomeProcessSectionProps = {
  eyebrow?: string;
  title?: string;
  steps?: UnixseeRichItem[];
  [key: string]: unknown;
};

export type HomeTestimonialsSectionProps = {
  source?: "testimonials" | string;
  limit?: number;
  order?: "latest" | "manual" | "featured" | string;
  selectedIds?: number[];
  items?: UnixseeTestimonialItem[];
  [key: string]: unknown;
};

export type HomeConsultationSectionProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  formTitle?: string;
  cta?: UnixseeCta;
  [key: string]: unknown;
};

export type HomeFaqSectionProps = {
  source?: "faq" | string;
  limit?: number;
  order?: "latest" | "manual" | "featured" | string;
  category?: string;
  selectedIds?: number[];
  items?: UnixseeFaqItem[];
  title?: string;
  description: string;
  [key: string]: unknown;
};

export type UnixseeHomeSection =
  | UnixseeSection<"HomeHeroSection", HomeHeroSectionProps>
  | UnixseeSection<"HomeProblemSection", HomeProblemSectionProps>
  | UnixseeSection<"HomeAboutUsSection", HomeAboutUsSectionProps>
  | UnixseeSection<
      "HomeSolutionOverviewSection",
      HomeSolutionOverviewSectionProps
    >
  | UnixseeSection<"HomeSuccessNumbersSection", HomeSuccessNumbersSectionProps>
  | UnixseeSection<"HomeInfrastructureSection", HomeInfrastructureSectionProps>
  | UnixseeSection<"HomeProcessSection", HomeProcessSectionProps>
  | UnixseeSection<"HomeTestimonialsSection", HomeTestimonialsSectionProps>
  | UnixseeSection<"HomeConsultationSection", HomeConsultationSectionProps>
  | UnixseeSection<"HomeFaqSection", HomeFaqSectionProps>;

export type UnixseeCta = {
  label?: string;
  href?: string;
  target?: string;
  rel?: string;
};

export type UnixseeRichItem = {
  id?: number | string;
  title?: string;
  description?: string;
  icon?: string;
  image?: UnixseeMedia | null;
  [key: string]: unknown;
};

export type UnixseeStatItem = {
  label?: string;
  value?: string | number;
  suffix?: string;
  description?: string;
};

export type UnixseeTestimonialItem = {
  id: number;
  lang?: string;
  title?: string;
  name?: string;
  role?: string;
  company?: string;
  quote?: string;
  rating?: number;
  avatar?: UnixseeMedia | null;
  [key: string]: unknown;
};

export type UnixseeFaqItem = {
  id: number;
  lang?: string;
  question?: string;
  answer?: string;
  category?: string;
  [key: string]: unknown;
};
