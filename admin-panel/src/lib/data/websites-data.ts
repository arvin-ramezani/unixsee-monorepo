export const WEBSITE_STATUS = {
  ONLINE: "ONLINE",
  NEEDS_ATTENTION: "NEEDS_ATTENTION",
  MAINTENANCE: "MAINTENANCE",
  PENDING_SETUP: "PENDING_SETUP",
} as const;

export type WebsiteStatusType =
  (typeof WEBSITE_STATUS)[keyof typeof WEBSITE_STATUS];

export type WebsiteType = {
  id: string;
  domain: string;
  title: string;
  tenantName: string;
  tenantId: string;
  serverId: string;
  status: WebsiteStatusType;
  availabilityStatus: WebsiteStatusType;
  lastAvailabilityCheckAt: string;
  lastAgentDataAt: string;
  overallHealth: "NORMAL" | "WARNING" | "PROBLEM";
  activeVisitors: number;
  visitors24h: number;
  technical: {
    wordpress: string;
    php: string;
    imagick: string;
    wordpressUpdate: {
      label: string;
      updatedAt: string;
    };
    securityScan: {
      label: string;
      updatedAt: string;
    };
  };
  service: {
    plan: string;
    serverLocation: string;
    server: string;
    controlPanel: "DirectAdmin";
    webServer: "OpenLiteSpeed";
    serviceStartDate: string;
    renewalDate: string;
    billingPeriod: string;
  };
  monitoring: {
    agentStatus: "CONNECTED" | "DISCONNECTED";
    lastSeenAt: string;
    dataFreshness: "UP_TO_DATE" | "STALE";
  };
};

export const WEBSITES: WebsiteType[] = [
  {
    id: "website-001",
    domain: "greenario.com",
    title: "فروشگاه آرتین",
    tenantName: "فروشگاه آرتین",
    tenantId: "tenant-501",
    serverId: "server-001",
    status: WEBSITE_STATUS.ONLINE,
    availabilityStatus: WEBSITE_STATUS.ONLINE,
    lastAvailabilityCheckAt: "۲ دقیقه پیش",
    lastAgentDataAt: "حدود ۱ دقیقه پیش",
    overallHealth: "NORMAL",
    activeVisitors: 12,
    visitors24h: 487,
    technical: {
      wordpress: "6.8.2",
      php: "8.3.23",
      imagick: "3.8.0",
      wordpressUpdate: {
        label: "به‌روز",
        updatedAt: "۱۸ دقیقه پیش",
      },
      securityScan: {
        label: "موردی پیدا نشد",
        updatedAt: "۳ ساعت پیش",
      },
    },
    service: {
      plan: "UNIX SCALE",
      serverLocation: "فرانکفورت، آلمان",
      server: "VPS-DE-03",
      controlPanel: "DirectAdmin",
      webServer: "OpenLiteSpeed",
      serviceStartDate: "۱۴ اردیبهشت ۱۴۰۳",
      renewalDate: "۲۵ شهریور ۱۴۰۶",
      billingPeriod: "ماهانه",
    },
    monitoring: {
      agentStatus: "CONNECTED",
      lastSeenAt: "۱ دقیقه پیش",
      dataFreshness: "UP_TO_DATE",
    },
  },
  {
    id: "website-002",
    domain: "artin-shop.ir",
    title: "فروشگاه اینترنتی آرتین",
    tenantName: "فروشگاه آرتین",
    tenantId: "tenant-501",
    serverId: "server-002",
    status: WEBSITE_STATUS.NEEDS_ATTENTION,
    availabilityStatus: WEBSITE_STATUS.NEEDS_ATTENTION,
    lastAvailabilityCheckAt: "۵ دقیقه پیش",
    lastAgentDataAt: "۲۵ دقیقه پیش",
    overallHealth: "WARNING",
    activeVisitors: 8,
    visitors24h: 311,
    technical: {
      wordpress: "6.7.1",
      php: "8.2.16",
      imagick: "3.7.5",
      wordpressUpdate: {
        label: "در دسترس",
        updatedAt: "۲ ساعت پیش",
      },
      securityScan: {
        label: "هشدار امنیتی",
        updatedAt: "۴ ساعت پیش",
      },
    },
    service: {
      plan: "UNIX PEAK",
      serverLocation: "تهران، ایران",
      server: "VPS-IR-07",
      controlPanel: "DirectAdmin",
      webServer: "OpenLiteSpeed",
      serviceStartDate: "۲۱ خرداد ۱۴۰۲",
      renewalDate: "۱۲ مهر ۱۴۰۶",
      billingPeriod: "سه‌ماهه",
    },
    monitoring: {
      agentStatus: "CONNECTED",
      lastSeenAt: "۱۲ دقیقه پیش",
      dataFreshness: "STALE",
    },
  },
  {
    id: "website-003",
    domain: "ali-studio.ir",
    title: "پورتفولیو علی",
    tenantName: "فروشگاه آرتین",
    tenantId: "tenant-501",
    serverId: "server-003",
    status: WEBSITE_STATUS.PENDING_SETUP,
    availabilityStatus: WEBSITE_STATUS.PENDING_SETUP,
    lastAvailabilityCheckAt: "۱ ساعت پیش",
    lastAgentDataAt: "۳ ساعت پیش",
    overallHealth: "PROBLEM",
    activeVisitors: 2,
    visitors24h: 41,
    technical: {
      wordpress: "در حال نصب",
      php: "8.1",
      imagick: "در حال نصب",
      wordpressUpdate: {
        label: "در انتظار راه‌اندازی",
        updatedAt: "امروز",
      },
      securityScan: {
        label: "در انتظار بررسی",
        updatedAt: "امروز",
      },
    },
    service: {
      plan: "",
      serverLocation: "مشهد، ایران",
      server: "VPS-IR-11",
      controlPanel: "DirectAdmin",
      webServer: "OpenLiteSpeed",
      serviceStartDate: "۱۰ مرداد ۱۴۰۶",
      renewalDate: "۱۰ شهریور ۱۴۰۶",
      billingPeriod: "ماهانه",
    },
    monitoring: {
      agentStatus: "DISCONNECTED",
      lastSeenAt: "۱ روز پیش",
      dataFreshness: "STALE",
    },
  },
  {
    id: "website-004",
    domain: "parsmod.com",
    title: "پارس مد",
    tenantName: "پارس مد",
    tenantId: "tenant-502",
    serverId: "server-004",
    status: WEBSITE_STATUS.MAINTENANCE,
    availabilityStatus: WEBSITE_STATUS.MAINTENANCE,
    lastAvailabilityCheckAt: "۱۰ دقیقه پیش",
    lastAgentDataAt: "۳ دقیقه پیش",
    overallHealth: "WARNING",
    activeVisitors: 5,
    visitors24h: 182,
    technical: {
      wordpress: "6.6.8",
      php: "8.3.12",
      imagick: "3.8.2",
      wordpressUpdate: {
        label: "به‌روز",
        updatedAt: "۱ روز پیش",
      },
      securityScan: {
        label: "در حال بررسی",
        updatedAt: "۲ ساعت پیش",
      },
    },
    service: {
      plan: "UNIX SCALE",
      serverLocation: "فرانکفورت، آلمان",
      server: "VPS-DE-04",
      controlPanel: "DirectAdmin",
      webServer: "OpenLiteSpeed",
      serviceStartDate: "۸ اسفند ۱۴۰۲",
      renewalDate: "۲۸ آذر ۱۴۰۶",
      billingPeriod: "سه‌ماهه",
    },
    monitoring: {
      agentStatus: "CONNECTED",
      lastSeenAt: "۴ دقیقه پیش",
      dataFreshness: "UP_TO_DATE",
    },
  },
  {
    id: "website-005",
    domain: "mohammadi-design.ir",
    title: "استودیو طراحی محمدی",
    tenantName: "استودیو طراحی محمدی",
    tenantId: "tenant-503",
    serverId: "server-005",
    status: WEBSITE_STATUS.ONLINE,
    availabilityStatus: WEBSITE_STATUS.ONLINE,
    lastAvailabilityCheckAt: "۱۵ دقیقه پیش",
    lastAgentDataAt: "۶ دقیقه پیش",
    overallHealth: "NORMAL",
    activeVisitors: 14,
    visitors24h: 624,
    technical: {
      wordpress: "6.8.0",
      php: "8.2.18",
      imagick: "3.7.8",
      wordpressUpdate: {
        label: "به‌روز",
        updatedAt: "۴ ساعت پیش",
      },
      securityScan: {
        label: "موردی پیدا نشد",
        updatedAt: "۶ ساعت پیش",
      },
    },
    service: {
      plan: "UNIX ENTERPRISE",
      serverLocation: "لندن، انگلستان",
      server: "VPS-UK-02",
      controlPanel: "DirectAdmin",
      webServer: "OpenLiteSpeed",
      serviceStartDate: "۱۷ فروردین ۱۴۰۳",
      renewalDate: "۲۲ آذر ۱۴۰۶",
      billingPeriod: "ماهانه",
    },
    monitoring: {
      agentStatus: "CONNECTED",
      lastSeenAt: "۲ دقیقه پیش",
      dataFreshness: "UP_TO_DATE",
    },
  },
  {
    id: "website-006",
    domain: "habibeh.ir",
    title: "فروشگاه حبیبه",
    tenantName: "فروشگاه حبیبه",
    tenantId: "tenant-504",
    serverId: "server-006",
    status: WEBSITE_STATUS.NEEDS_ATTENTION,
    availabilityStatus: WEBSITE_STATUS.NEEDS_ATTENTION,
    lastAvailabilityCheckAt: "۲۵ دقیقه پیش",
    lastAgentDataAt: "۴۵ دقیقه پیش",
    overallHealth: "WARNING",
    activeVisitors: 6,
    visitors24h: 229,
    technical: {
      wordpress: "6.5.6",
      php: "8.1.13",
      imagick: "3.6.4",
      wordpressUpdate: {
        label: "در دسترس",
        updatedAt: "۱ روز پیش",
      },
      securityScan: {
        label: "هشدار امنیتی",
        updatedAt: "۳ ساعت پیش",
      },
    },
    service: {
      plan: "",
      serverLocation: "تهران، ایران",
      server: "VPS-IR-09",
      controlPanel: "DirectAdmin",
      webServer: "OpenLiteSpeed",
      serviceStartDate: "۲۸ تیر ۱۴۰۱",
      renewalDate: "۵ آبان ۱۴۰۶",
      billingPeriod: "سالانه",
    },
    monitoring: {
      agentStatus: "CONNECTED",
      lastSeenAt: "۳۰ دقیقه پیش",
      dataFreshness: "STALE",
    },
  },
];
