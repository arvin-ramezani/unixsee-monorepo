export type WebsiteAvailability =
  | "online"
  | "needsAttention"
  | "unavailable"
  | "unknown";

export type WebsiteAlertSeverity = "critical" | "warning" | "info";
export type WebsiteAlertKind =
  | "unavailable"
  | "storage"
  | "updates"
  | "security"
  | "renewal"
  | "statusUnknown";

export type WebsitePlanKey =
  | "starter"
  | "business"
  | "pro"
  | "premium"
  | "dedicatedPlan"
  | "none";

export interface RelativeCheckTime {
  value: number;
  unit: "minute" | "hour";
}

export interface WebsiteAlert {
  id: string;
  kind: WebsiteAlertKind;
  severity: WebsiteAlertSeverity;
  detected: RelativeCheckTime;
  technicalCode?: "HTTP 503" | "SSL_ERROR";
}

export interface WebsiteServiceDetails {
  fixtureKind: "website-details-ux-spec";
  id: string;
  name: string;
  domain: string;
  monogram: string;
  tone: "green" | "violet" | "blue" | "red" | "orange";
  plan?: WebsitePlanKey;
  managementCoverage?: string;
  availability: WebsiteAvailability;
  lastChecked?: RelativeCheckTime;
  latestCheckCode?: "HTTP 503" | "SSL_ERROR";
  alerts?: WebsiteAlert[];
  recommendedAction:
    | "openWordPress"
    | "reviewStorage"
    | "renewService"
    | "viewIssue"
    | "retryStatus";
  links?: {
    publicWebsite: string;
    wordPressAdmin?: string;
    wordPressAdminUsername?: string;
    wordPressAdminPassword?: string;
    directAdmin?: string;
    directAdminUsername?: string;
    directAdminPassword?: string;
  };
  service?: {
    serverLocation: "frankfurtGermany" | "helsinkiFinland" | "unavailable";
    controlPanel: "DirectAdmin";
  };
  billing: {
    startDate: string;
    dueDate: string;
    cycle: "monthly" | "quarterly" | "yearly";
    renewable: boolean;
    renewalAmount: number;
    renewalCurrency: "USD";
  } | null;
  software?: {
    wordpressVersion: string;
    phpVersion: string;
    imagickVersion: string;
    wordpressUpdates: {
      status: "upToDate" | "updatesAvailable" | "unknown";
      count?: number;
      checked: RelativeCheckTime;
    };
    securityScan: {
      status:
        | "noIssues"
        | "issuesFound"
        | "inProgress"
        | "unavailable"
        | "notScanned";
      issueCount?: number;
      checked: RelativeCheckTime;
    };
  };
  traffic?: {
    activeNow: number | null;
    activeLast24Hours: number | null;
    freshness: RelativeCheckTime;
  };
  storage?: {
    usedGb: number;
    quotaGb: number;
  };
}

const commonDetails = {
  fixtureKind: "website-details-ux-spec" as const,
  links: {
    publicWebsite: "",
    wordPressAdmin: "",
    directAdmin: "",
  },
  service: {
    serverLocation: "frankfurtGermany" as const,
    controlPanel: "DirectAdmin" as const,
  },
  billing: {
    startDate: "2025-08-12T00:00:00Z",
    dueDate: "2027-08-12T00:00:00Z",
    cycle: "yearly" as const,
    renewable: true,
    renewalAmount: 199,
    renewalCurrency: "USD" as const,
  },
  software: {
    wordpressVersion: "6.8.2",
    phpVersion: "8.3.23",
    imagickVersion: "3.8.0",
    wordpressUpdates: {
      status: "upToDate" as const,
      checked: { value: -18, unit: "minute" as const },
    },
    securityScan: {
      status: "noIssues" as const,
      checked: { value: -3, unit: "hour" as const },
    },
  },
  traffic: {
    activeNow: 12,
    activeLast24Hours: 487,
    freshness: { value: -1, unit: "minute" as const },
  },
  storage: {
    usedGb: 42.6,
    quotaGb: 80,
  },
};

const websiteServiceDetailsFixtures: WebsiteServiceDetails[] = [
  {
    ...commonDetails,
    id: "greenario-store",
    name: "Greenario Store",
    domain: "greenario.com",
    monogram: "G",
    tone: "green",
    plan: "starter",
    availability: "online",
    lastChecked: { value: -2, unit: "minute" },
    alerts: [],
    recommendedAction: "openWordPress",
    links: {
      publicWebsite: "https://greenario.com",
      wordPressAdmin: "https://greenario.com/wp-admin",
      directAdmin: "https://panel.greenario.test:2222",
    },
  },
  {
    ...commonDetails,
    id: "luna-studio",
    name: "Luna Studio",
    domain: "lunastudio.co",
    monogram: "L",
    tone: "violet",
    plan: "business",
    availability: "needsAttention",
    lastChecked: { value: -1, unit: "minute" },
    alerts: [
      {
        id: "storage-92",
        kind: "storage",
        severity: "warning",
        detected: { value: -22, unit: "minute" },
      },
      {
        id: "updates-3",
        kind: "updates",
        severity: "warning",
        detected: { value: -2, unit: "hour" },
      },
    ],
    recommendedAction: "reviewStorage",
    links: {
      publicWebsite: "https://lunastudio.co",
      wordPressAdmin: "https://lunastudio.co/wp-admin",
      directAdmin: "https://panel.lunastudio.test:2222",
    },
    software: {
      ...commonDetails.software,
      wordpressUpdates: {
        status: "updatesAvailable",
        count: 3,
        checked: { value: -2, unit: "hour" },
      },
    },
    storage: {
      usedGb: 73.6,
      quotaGb: 80,
    },
  },
  {
    ...commonDetails,
    id: "orbit-labs",
    name: "Orbit Labs",
    domain: "orbitlabs.io",
    monogram: "O",
    tone: "blue",
    plan: "pro",
    availability: "unavailable",
    lastChecked: { value: -4, unit: "minute" },
    latestCheckCode: "HTTP 503",
    alerts: [
      {
        id: "availability-503",
        kind: "unavailable",
        severity: "critical",
        detected: { value: -4, unit: "minute" },
        technicalCode: "HTTP 503",
      },
    ],
    recommendedAction: "viewIssue",
    links: {
      publicWebsite: "https://orbitlabs.io",
      wordPressAdmin: "https://orbitlabs.io/wp-admin",
      directAdmin: "https://panel.orbitlabs.test:2222",
    },
    traffic: {
      activeNow: null,
      activeLast24Hours: 312,
      freshness: { value: -4, unit: "minute" },
    },
  },
  {
    ...commonDetails,
    id: "nova-agency",
    name: "Nova Agency",
    domain: "novaagency.com",
    monogram: "N",
    tone: "red",
    plan: "premium",
    availability: "needsAttention",
    lastChecked: { value: -3, unit: "minute" },
    alerts: [
      {
        id: "security-1",
        kind: "security",
        severity: "critical",
        detected: { value: -1, unit: "hour" },
      },
    ],
    recommendedAction: "viewIssue",
    links: {
      publicWebsite: "https://novaagency.com",
      wordPressAdmin: "https://novaagency.com/wp-admin",
      directAdmin: "https://panel.novaagency.test:2222",
    },
    software: {
      ...commonDetails.software,
      securityScan: {
        status: "issuesFound",
        issueCount: 1,
        checked: { value: -1, unit: "hour" },
      },
    },
  },
  {
    ...commonDetails,
    id: "pixel-nest",
    name: "Pixel Nest",
    domain: "pixelnest.dev",
    monogram: "P",
    tone: "orange",
    plan: "dedicatedPlan",
    availability: "unknown",
    lastChecked: { value: -3, unit: "hour" },
    alerts: [
      {
        id: "status-unknown",
        kind: "statusUnknown",
        severity: "info",
        detected: { value: -3, unit: "hour" },
      },
    ],
    recommendedAction: "retryStatus",
    links: {
      publicWebsite: "https://pixelnest.dev",
    },
    service: {
      serverLocation: "unavailable",
      controlPanel: "DirectAdmin",
    },
    billing: {
      ...commonDetails.billing,
      renewable: false,
    },
    software: {
      wordpressVersion: "6.8.2",
      phpVersion: "8.3.23",
      imagickVersion: "3.8.0",
      wordpressUpdates: {
        status: "unknown",
        checked: { value: -3, unit: "hour" },
      },
      securityScan: {
        status: "unavailable",
        checked: { value: -3, unit: "hour" },
      },
    },
    traffic: {
      activeNow: null,
      activeLast24Hours: null,
      freshness: { value: -3, unit: "hour" },
    },
  },
];

export const websiteServiceDetailsIds = websiteServiceDetailsFixtures.map(
  ({ id }) => id,
);


/** Map a backend website entity to the client WebsiteServiceDetails shape. */
export function mapBackendWebsiteToServiceDetails(backend: {
  id: string;
  domain: string;
  displayName?: string | null;
  managementCoverage?: string;
  lastIsUp?: boolean | null;
  plan?: { code?: string; nameEn?: string } | null;
  wordpressAdminUrl?: string | null;
  wordpressAdminUsername?: string | null;
  wordpressAdminPassword?: string | null;
  directAdminUrl?: string | null;
  directAdminUsername?: string | null;
  directAdminPassword?: string | null;
  vpsNode?: { server?: { controlPanelUrl?: string | null } | null } | null;
}): WebsiteServiceDetails {
  const name = backend.displayName?.trim() || backend.domain;
  const normalizedPlan = backend.plan?.code?.toUpperCase() ?? "";
  let plan: WebsitePlanKey = "none";
  if (normalizedPlan) {
    if (normalizedPlan.includes("PEAK")) plan = "premium";
    else if (normalizedPlan.includes("PRO")) plan = "pro";
    else if (normalizedPlan.includes("BUSINESS")) plan = "business";
    else if (normalizedPlan.includes("DEDICATED")) plan = "dedicatedPlan";
    else plan = "starter";
  }

  const availability: WebsiteAvailability =
    backend.lastIsUp === true
      ? "online"
      : backend.lastIsUp === false
        ? "needsAttention"
        : "unknown";

  return {
    fixtureKind: "website-details-ux-spec",
    id: backend.id,
    name,
    domain: backend.domain,
    monogram: name.slice(0, 1).toUpperCase(),
    tone: "blue",
    plan,
    managementCoverage: backend.managementCoverage,
    availability,
    lastChecked: { value: -2, unit: "minute" },
    alerts: [],
    recommendedAction: "openWordPress",
    links: {
      publicWebsite: "https://" + backend.domain,
      wordPressAdmin: backend.wordpressAdminUrl || undefined,
      wordPressAdminUsername: backend.wordpressAdminUsername || undefined,
      wordPressAdminPassword: backend.wordpressAdminPassword || undefined,
      directAdmin: backend.directAdminUrl || backend.vpsNode?.server?.controlPanelUrl || undefined,
      directAdminUsername: backend.directAdminUsername || undefined,
      directAdminPassword: backend.directAdminPassword || undefined,
    },
    service: {
      serverLocation: "frankfurtGermany",
      controlPanel: "DirectAdmin",
    },
    billing: plan !== "none" ? {
      startDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 365 * 86_400_000).toISOString(),
      cycle: "yearly",
      renewable: false,
      renewalAmount: 0,
      renewalCurrency: "USD",
    } : null,
    software: {
      wordpressVersion: "—",
      phpVersion: "—",
      imagickVersion: "—",
      wordpressUpdates: {
        status: "unknown",
        checked: { value: -1, unit: "hour" },
      },
      securityScan: {
        status: "unavailable",
        checked: { value: -1, unit: "hour" },
      },
    },
    traffic: {
      activeNow: null,
      activeLast24Hours: null,
      freshness: { value: -1, unit: "hour" },
    },
    storage: {
      usedGb: 0,
      quotaGb: 0,
    },
  };
}

export function getWebsiteServiceDetails(id: string) {
  return websiteServiceDetailsFixtures.find((website) => website.id === id);
}
