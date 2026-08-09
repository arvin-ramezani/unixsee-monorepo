export const NAVIGATION_ITEMS = [
  {
    key: "server",
    href: "/servers",
    items: [
      { key: "overview", href: "/managed-hosting" },
      { key: "infrastructure", href: "/managed-hosting#infrastructure" },
      { key: "monitoring", href: "/managed-hosting#monitoring" },
      { key: "support", href: "/managed-hosting#support" },
    ],
  },

  {
    key: "services",
    href: "/services",
    items: [
      {
        key: "migrationOptimization",
        href: "/services/managed-woocommerce-server",
      },
      { key: "performanceTuning", href: "/services/woocommerce-seo-content" },
      { key: "securityHardening", href: "/services/woocommerce-design" },
      { key: "technicalConsulting", href: "/services/social-media-marketing" },
    ],
  },

  {
    key: "customers",
    href: "/customers",
    items: [
      { key: "caseStudies", href: "/customers#case-studies" },
      { key: "testimonials", href: "/customers#testimonials" },
    ],
  },

  {
    key: "resources",
    href: "/resources",
    items: [
      { key: "knowledgeBase", href: "/resources" },
      { key: "faq", href: "/#faq" },
    ],
  },

  {
    key: "aboutUs",
    href: "/about",
    items: [
      { key: "about", href: "/about-us" },
      { key: "contact", href: "/contact-us" },
    ],
  },
] as const;
