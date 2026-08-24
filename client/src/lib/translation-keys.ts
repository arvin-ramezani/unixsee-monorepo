export const NAVIGATION_ITEMS = [
  // {
  //   key: "server",
  //   href: "/servers",
  //   items: [
  //     { key: "overview", href: "/managed-hosting" },
  //     { key: "infrastructure", href: "/managed-hosting#infrastructure" },
  //     { key: "monitoring", href: "/managed-hosting#monitoring" },
  //     { key: "support", href: "/managed-hosting#support" },
  //   ],
  // },

  {
    key: "services",

    items: [
      {
        key: "migrationOptimization",
        href: "/services/managed-woocommerce-server",
      },
      {
        key: "performanceTuning",
        href: "/services/woocommerce-seo-content",
        comingSoon: true,
      },
      {
        key: "securityHardening",
        href: "/services/woocommerce-design",
        comingSoon: true,
      },
      {
        key: "technicalConsulting",
        href: "/services/social-media-marketing",
        comingSoon: true,
      },
    ],
  },

  // {
  //   key: "customers",
  //   href: "/customers",
  //   items: [
  //     { key: "caseStudies", href: "/customers#case-studies" },
  //     { key: "testimonials", href: "/customers#testimonials" },
  //   ],
  // },

  // {
  //   key: "resources",
  //   href: "/resources",
  //   items: [
  //     { key: "knowledgeBase", href: "/resources" },
  //     { key: "faq", href: "/#faq" },
  //   ],
  // },

  {
    key: "aboutUs",
    // href: "/about",
    items: [
      { key: "about", href: "/about-us" },
      { key: "contact", href: "/contact-us" },
    ],
  },
  {
    key: "helpCenter",
    href: "/help-center",
    items: [
      { key: "startWorking", href: "/help-center/topics/getting-started" },
      { key: "managedWoocommerce", href: "/help-center/topics/managed-woo" },
      {
        key: "performanceCaching",
        href: "/help-center/topics/performance-caching",
      },
      { key: "wooOperations", href: "/help-center/topics/woo-operations" },
      { key: "securityBackups", href: "/help-center/topics/security-backups" },
      { key: "domainsDnsSsl", href: "/help-center/topics/domains-dns-ssl" },
    ],
  },
] as const;
