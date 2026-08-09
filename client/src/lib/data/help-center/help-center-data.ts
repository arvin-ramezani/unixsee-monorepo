/**
 * Help Center fixtures.
 *
 * Deterministic, typed view models for the static Help Center landing page.
 * Copy is stored as message keys resolved at the route/composition boundary,
 * never inside presentation components. No values are generated at render time.
 *
 * The page is a calm, low-border knowledge surface with exactly five regions:
 * introduction, guide search, browse-by-topic grid, popular guides, and the
 * full topic taxonomy. It is not a ticketing workflow.
 */

/** The full topic taxonomy. Keys are stable; labels come from messages. */
export type HelpTopicKey =
  | "gettingStarted"
  | "managedWoo"
  | "performanceCaching"
  | "monitoringAvailability"
  | "wooOperations"
  | "securityBackups"
  | "domainsDnsSslMigrations"
  | "campaignReadiness"
  | "accountServices"
  | "seoDesignContent";

/** Valid article message-key segments across every Help Center topic. */
export type HelpArticleKey =
  | "access"
  | "autoscale"
  | "basics"
  | "cdn"
  | "changePlan"
  | "checklist"
  | "checks"
  | "connectSite"
  | "dashboardTour"
  | "dnsRecords"
  | "essentials"
  | "firewall"
  | "firstChecks"
  | "firstLogin"
  | "fixSsl"
  | "images"
  | "inventory"
  | "inviteTeam"
  | "invoices"
  | "issueSsl"
  | "loadTest"
  | "manageOrders"
  | "migrateSite"
  | "pageVsObject"
  | "phpVersions"
  | "planLimits"
  | "pointDomain"
  | "products"
  | "readTimeline"
  | "refunds"
  | "resourceLimits"
  | "respond"
  | "restore"
  | "roles"
  | "schedule"
  | "sitemaps"
  | "stack"
  | "staging"
  | "statusHistory"
  | "storefront"
  | "taxes"
  | "trafficSpikes"
  | "transfer"
  | "whatIsCache"
  | "whatIsTtfb"
  | "whatIsUnixsee"
  | "whenPurge"
  | "whySlow";

/** Valid article-group message-key segments across every Help Center topic. */
export type HelpArticleGroupKey =
  | "account"
  | "basics"
  | "billing"
  | "catalog"
  | "connect"
  | "content"
  | "harden"
  | "incidents"
  | "intro"
  | "migrate"
  | "orders"
  | "platform"
  | "prepare"
  | "recover"
  | "scale"
  | "scaling"
  | "seo"
  | "ssl"
  | "team"
  | "troubleshoot"
  | "tune"
  | "uptime";

export type HelpArticleTitleKey = `articles.${HelpArticleKey}.title`;
export type HelpArticleDescriptionKey =
  `articles.${HelpArticleKey}.description`;
export type HelpArticleGroupMessageKey = `groups.${HelpArticleGroupKey}`;
export type HelpTopicArticleCountKey =
  `topics.items.${HelpTopicKey}.articleCount`;

export function getHelpArticleTitleKey(key: HelpArticleKey) {
  return `articles.${key}.title` as const;
}

export function getHelpArticleDescriptionKey(key: HelpArticleKey) {
  return `articles.${key}.description` as const;
}

export function getHelpArticleGroupKey(key: HelpArticleGroupKey) {
  return `groups.${key}` as const;
}

export const helpTopicArticleCountKeys = {
  gettingStarted: "topics.items.gettingStarted.articleCount",
  managedWoo: "topics.items.managedWoo.articleCount",
  performanceCaching: "topics.items.performanceCaching.articleCount",
  monitoringAvailability: "topics.items.monitoringAvailability.articleCount",
  wooOperations: "topics.items.wooOperations.articleCount",
  securityBackups: "topics.items.securityBackups.articleCount",
  domainsDnsSslMigrations: "topics.items.domainsDnsSslMigrations.articleCount",
  campaignReadiness: "topics.items.campaignReadiness.articleCount",
  accountServices: "topics.items.accountServices.articleCount",
  seoDesignContent: "topics.items.seoDesignContent.articleCount",
} as const satisfies Record<HelpTopicKey, HelpTopicArticleCountKey>;

/** Icon family for a topic card; mapped to a Lucide icon in the component. */
export type HelpTopicIcon =
  | "gettingStarted"
  | "managedWoo"
  | "performance"
  | "monitoring"
  | "wooOperations"
  | "security"
  | "domains"
  | "campaign"
  | "account"
  | "seo";

/** A topic in the "Browse by topic" grid and the full taxonomy list. */
export interface HelpTopic {
  id: string;
  key: HelpTopicKey;
  /** Visible ordinal (1–10); kept because it links every region. */
  order: number;
  icon: HelpTopicIcon;
  /** Whether the topic appears in the trimmed "Browse by topic" grid. */
  featured: boolean;
}

/**
 * Article content type, shown as a metadata chip and mapped to a Lucide icon
 * in the component (topic page, UX spec §7).
 */
export type HelpArticleType =
  | "stepByStep"
  | "explainer"
  | "checklist"
  | "reference";

/** A single article link inside a topic page. Copy comes from messages. */
export interface HelpArticle {
  id: string;
  /** Message-key segment under `HelpCenter.topicPages.{topic}.articles`. */
  key: HelpArticleKey;
  type: HelpArticleType;
}

/** A goal-oriented group of articles (UX spec §5 — grouped by user goal). */
export interface HelpArticleGroup {
  id: string;
  /** Message-key segment under `HelpCenter.topicPages.{topic}.groups`. */
  key: HelpArticleGroupKey;
  articles: HelpArticle[];
}

/** The article structure rendered on a single topic page. */
export interface HelpTopicContent {
  /** Optional foundational reading path (≤3, UX spec §6). */
  startHere?: HelpArticle[];
  groups: HelpArticleGroup[];
}

/** Contextual icon for a popular guide row. */
export type HelpGuideIcon = "domain" | "performance" | "security" | "migration";

/** The kind of guide, shown as a metadata chip. */
export type HelpGuideType = "stepByStep" | "checklist";

/** A row in the "Popular guides" surface. */
export interface HelpGuide {
  id: string;
  key: "domainConnect" | "speedCdn" | "securitySettings" | "migrateToUnixsee";
  icon: HelpGuideIcon;
  type: HelpGuideType;
  /** Owning topic, drives the category chip; reuses a taxonomy key. */
  topicKey: HelpTopicKey;
  /** ISO date; formatted (Jalali/Gregorian) at the boundary. */
  updatedAt: string;
}

// --- Data ---------------------------------------------------------------

/**
 * Ten topics in approved order; shared by the grid and the full taxonomy.
 * `featured` marks the six entry topics surfaced in the "Browse by topic" grid
 * (UX spec §2); the rest live only in the complete "All topics" index.
 */
export const helpTopics: HelpTopic[] = [
  {
    id: "getting-started",
    key: "gettingStarted",
    order: 1,
    icon: "gettingStarted",
    featured: true,
  },
  {
    id: "managed-woo",
    key: "managedWoo",
    order: 2,
    icon: "managedWoo",
    featured: true,
  },
  {
    id: "performance-caching",
    key: "performanceCaching",
    order: 3,
    icon: "performance",
    featured: true,
  },
  {
    id: "monitoring-availability",
    key: "monitoringAvailability",
    order: 4,
    icon: "monitoring",
    featured: false,
  },
  {
    id: "woo-operations",
    key: "wooOperations",
    order: 5,
    icon: "wooOperations",
    featured: true,
  },
  {
    id: "security-backups",
    key: "securityBackups",
    order: 6,
    icon: "security",
    featured: true,
  },
  {
    id: "domains-dns-ssl",
    key: "domainsDnsSslMigrations",
    order: 7,
    icon: "domains",
    featured: true,
  },
  {
    id: "campaign-readiness",
    key: "campaignReadiness",
    order: 8,
    icon: "campaign",
    featured: false,
  },
  {
    id: "account-services",
    key: "accountServices",
    order: 9,
    icon: "account",
    featured: false,
  },
  {
    id: "seo-design-content",
    key: "seoDesignContent",
    order: 10,
    icon: "seo",
    featured: false,
  },
];

// --- Topic pages --------------------------------------------------------

/**
 * Article structure for every topic page, keyed by topic. Structure only —
 * titles, descriptions, group headings, and the scope sentence live in
 * messages under `HelpCenter.topicPages.{topicKey}`. Deliberately light
 * fixtures so every taxonomy link resolves to a populated page and normal
 * navigation never hits the empty state (spec §10). `performanceCaching`
 * mirrors the spec §5 worked example.
 */
export const helpTopicContent: Record<HelpTopicKey, HelpTopicContent> = {
  gettingStarted: {
    startHere: [
      { id: "gs-what-is-unixsee", key: "whatIsUnixsee", type: "explainer" },
      { id: "gs-first-login", key: "firstLogin", type: "stepByStep" },
    ],
    groups: [
      {
        id: "gs-basics",
        key: "basics",
        articles: [
          { id: "gs-dashboard-tour", key: "dashboardTour", type: "explainer" },
          { id: "gs-connect-site", key: "connectSite", type: "stepByStep" },
        ],
      },
      {
        id: "gs-account",
        key: "account",
        articles: [
          { id: "gs-invite-team", key: "inviteTeam", type: "stepByStep" },
          { id: "gs-plan-limits", key: "planLimits", type: "reference" },
        ],
      },
    ],
  },
  managedWoo: {
    groups: [
      {
        id: "mw-platform",
        key: "platform",
        articles: [
          { id: "mw-stack", key: "stack", type: "explainer" },
          { id: "mw-php-versions", key: "phpVersions", type: "reference" },
        ],
      },
      {
        id: "mw-scaling",
        key: "scaling",
        articles: [
          { id: "mw-autoscale", key: "autoscale", type: "explainer" },
          {
            id: "mw-resource-limits",
            key: "resourceLimits",
            type: "reference",
          },
          { id: "mw-staging", key: "staging", type: "stepByStep" },
        ],
      },
    ],
  },
  performanceCaching: {
    startHere: [
      { id: "pc-what-is-cache", key: "whatIsCache", type: "explainer" },
      { id: "pc-what-is-ttfb", key: "whatIsTtfb", type: "explainer" },
    ],
    groups: [
      {
        id: "pc-intro",
        key: "intro",
        articles: [
          { id: "pc-cache-basics", key: "whatIsCache", type: "explainer" },
          { id: "pc-ttfb", key: "whatIsTtfb", type: "explainer" },
        ],
      },
      {
        id: "pc-troubleshoot",
        key: "troubleshoot",
        articles: [
          { id: "pc-why-slow", key: "whySlow", type: "explainer" },
          { id: "pc-first-checks", key: "firstChecks", type: "checklist" },
        ],
      },
      {
        id: "pc-tune",
        key: "tune",
        articles: [
          { id: "pc-page-vs-object", key: "pageVsObject", type: "explainer" },
          { id: "pc-when-purge", key: "whenPurge", type: "reference" },
        ],
      },
    ],
  },
  monitoringAvailability: {
    groups: [
      {
        id: "ma-uptime",
        key: "uptime",
        articles: [
          { id: "ma-checks", key: "checks", type: "explainer" },
          { id: "ma-read-timeline", key: "readTimeline", type: "reference" },
        ],
      },
      {
        id: "ma-incidents",
        key: "incidents",
        articles: [
          { id: "ma-respond", key: "respond", type: "stepByStep" },
          { id: "ma-status-history", key: "statusHistory", type: "reference" },
        ],
      },
    ],
  },
  wooOperations: {
    groups: [
      {
        id: "wo-orders",
        key: "orders",
        articles: [
          { id: "wo-manage-orders", key: "manageOrders", type: "stepByStep" },
          { id: "wo-refunds", key: "refunds", type: "stepByStep" },
        ],
      },
      {
        id: "wo-catalog",
        key: "catalog",
        articles: [
          { id: "wo-products", key: "products", type: "stepByStep" },
          { id: "wo-inventory", key: "inventory", type: "checklist" },
          { id: "wo-taxes", key: "taxes", type: "reference" },
        ],
      },
    ],
  },
  securityBackups: {
    startHere: [{ id: "sb-essentials", key: "essentials", type: "checklist" }],
    groups: [
      {
        id: "sb-harden",
        key: "harden",
        articles: [
          { id: "sb-access", key: "access", type: "stepByStep" },
          { id: "sb-firewall", key: "firewall", type: "explainer" },
        ],
      },
      {
        id: "sb-recover",
        key: "recover",
        articles: [
          { id: "sb-restore", key: "restore", type: "stepByStep" },
          { id: "sb-schedule", key: "schedule", type: "reference" },
        ],
      },
    ],
  },
  domainsDnsSslMigrations: {
    groups: [
      {
        id: "dd-connect",
        key: "connect",
        articles: [
          { id: "dd-point-domain", key: "pointDomain", type: "stepByStep" },
          { id: "dd-dns-records", key: "dnsRecords", type: "reference" },
        ],
      },
      {
        id: "dd-ssl",
        key: "ssl",
        articles: [
          { id: "dd-issue-ssl", key: "issueSsl", type: "stepByStep" },
          { id: "dd-fix-ssl", key: "fixSsl", type: "checklist" },
        ],
      },
      {
        id: "dd-migrate",
        key: "migrate",
        articles: [
          { id: "dd-migrate-site", key: "migrateSite", type: "stepByStep" },
        ],
      },
    ],
  },
  campaignReadiness: {
    groups: [
      {
        id: "cr-prepare",
        key: "prepare",
        articles: [
          { id: "cr-checklist", key: "checklist", type: "checklist" },
          { id: "cr-load-test", key: "loadTest", type: "stepByStep" },
        ],
      },
      {
        id: "cr-scale",
        key: "scale",
        articles: [
          { id: "cr-traffic-spikes", key: "trafficSpikes", type: "explainer" },
          { id: "cr-cdn", key: "cdn", type: "explainer" },
        ],
      },
    ],
  },
  accountServices: {
    groups: [
      {
        id: "as-billing",
        key: "billing",
        articles: [
          { id: "as-invoices", key: "invoices", type: "reference" },
          { id: "as-change-plan", key: "changePlan", type: "stepByStep" },
        ],
      },
      {
        id: "as-team",
        key: "team",
        articles: [
          { id: "as-roles", key: "roles", type: "reference" },
          { id: "as-transfer", key: "transfer", type: "stepByStep" },
        ],
      },
    ],
  },
  seoDesignContent: {
    groups: [
      {
        id: "sd-seo",
        key: "seo",
        articles: [
          { id: "sd-basics", key: "basics", type: "checklist" },
          { id: "sd-sitemaps", key: "sitemaps", type: "reference" },
        ],
      },
      {
        id: "sd-content",
        key: "content",
        articles: [
          { id: "sd-images", key: "images", type: "explainer" },
          { id: "sd-storefront", key: "storefront", type: "stepByStep" },
        ],
      },
    ],
  },
};

/** Resolve a topic by its URL slug (the topic `id`). */
export function getTopicBySlug(slug: string): HelpTopic | undefined {
  return helpTopics.find((topic) => topic.id === slug);
}

// --- Articles -----------------------------------------------------------

/**
 * A single article located within its topic, with a stable URL slug. The slug
 * is derived deterministically from the article `id` (already unique and
 * URL-safe) so every taxonomy link resolves to one canonical article route
 * (article UX spec §1). `pos` preserves the article's order inside its topic
 * for stable prev/next-free related selection.
 */
export interface HelpArticleLocation {
  topic: HelpTopic;
  article: HelpArticle;
  /** URL slug for `/topics/{topic}/{slug}`; equals `article.id`. */
  slug: string;
  /** Group id the article belongs to, or `"startHere"`. */
  groupId: string;
  /** Zero-based position in the topic's flattened article order. */
  pos: number;
}

/** Flatten a topic's start-here + grouped articles into ordered locations. */
function flattenTopicArticles(topic: HelpTopic): HelpArticleLocation[] {
  const content = helpTopicContent[topic.key];
  const rows: { article: HelpArticle; groupId: string }[] = [
    ...(content.startHere ?? []).map((article) => ({
      article,
      groupId: "startHere",
    })),
    ...content.groups.flatMap((group) =>
      group.articles.map((article) => ({ article, groupId: group.id })),
    ),
  ];
  return rows.map(({ article, groupId }, pos) => ({
    topic,
    article,
    slug: article.id,
    groupId,
    pos,
  }));
}

/**
 * Complete flat article index across every topic. Deduped by article *key*
 * within a topic so a piece of content that appears both in start-here and in a
 * group resolves to exactly one canonical route (article UX spec §1). The first
 * occurrence — start-here before groups — wins and owns the canonical slug.
 */
export const helpArticleIndex: HelpArticleLocation[] = helpTopics.flatMap(
  (topic) => {
    const seen = new Set<string>();
    return flattenTopicArticles(topic).filter((loc) => {
      if (seen.has(loc.article.key)) return false;
      seen.add(loc.article.key);
      return true;
    });
  },
);

/** Resolve an article by topic slug + article slug (both must match). */
export function getArticleBySlug(
  topicSlug: string,
  articleSlug: string,
): HelpArticleLocation | undefined {
  return helpArticleIndex.find(
    (loc) => loc.topic.id === topicSlug && loc.slug === articleSlug,
  );
}

/**
 * Canonical article slug for a topic + article key. Used to build topic-page
 * links so a repeated article always points at its single canonical route.
 */
export function getCanonicalArticleSlug(
  topicId: string,
  articleKey: string,
): string | undefined {
  return helpArticleIndex.find(
    (loc) => loc.topic.id === topicId && loc.article.key === articleKey,
  )?.slug;
}

/**
 * Two to four related articles for continuation (article UX spec §13). Prefers
 * the same topic, excludes the current article and duplicates, and never
 * invents a recommendation feed — it just walks the topic's article order.
 */
export function getRelatedArticles(
  current: HelpArticleLocation,
  limit = 3,
): HelpArticleLocation[] {
  const sameTopic = helpArticleIndex.filter(
    (loc) => loc.topic.id === current.topic.id && loc.slug !== current.slug,
  );
  const seen = new Set<string>();
  const related: HelpArticleLocation[] = [];
  for (const loc of sameTopic) {
    if (seen.has(loc.article.key)) continue;
    seen.add(loc.article.key);
    related.push(loc);
    if (related.length >= limit) break;
  }
  return related;
}

/** Four popular guides, in approved order. */
export const helpGuides: HelpGuide[] = [
  {
    id: "domain-connect",
    key: "domainConnect",
    icon: "domain",
    type: "stepByStep",
    topicKey: "domainsDnsSslMigrations",
    updatedAt: "2025-06-11T00:00:00Z",
  },
  {
    id: "speed-cdn",
    key: "speedCdn",
    icon: "performance",
    type: "stepByStep",
    topicKey: "performanceCaching",
    updatedAt: "2025-06-10T00:00:00Z",
  },
  {
    id: "security-settings",
    key: "securitySettings",
    icon: "security",
    type: "checklist",
    topicKey: "securityBackups",
    updatedAt: "2025-05-18T00:00:00Z",
  },
  {
    id: "migrate-to-unixsee",
    key: "migrateToUnixsee",
    icon: "migration",
    type: "stepByStep",
    topicKey: "gettingStarted",
    updatedAt: "2025-04-04T00:00:00Z",
  },
];
