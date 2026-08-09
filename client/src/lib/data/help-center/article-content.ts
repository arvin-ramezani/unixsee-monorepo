/**
 * Help Center article body structures.
 *
 * Text stays in next-intl message files:
 * HelpCenter.articleBodies.{topicKey}.{articleKey}
 *
 * This file contains only:
 * - block types
 * - reusable article structure builder
 * - article structure registrations
 * - optional metadata
 */

import type { MessageKeys, Messages, NestedKeyOf } from "next-intl";

import type { HelpArticleKey, HelpTopicKey } from "./help-center-data";

type HelpCenterMessages = Messages["HelpCenter"];
type HelpCenterMessageKey = MessageKeys<
  HelpCenterMessages,
  NestedKeyOf<HelpCenterMessages>
>;
export type ArticleBodyMessageKey = Extract<
  HelpCenterMessageKey,
  `articleBodies.${string}`
>;
type ExtractArticleBodyTextKey<Key extends string> =
  Key extends `articleBodies.${string}.${string}.${infer TextKey}`
    ? TextKey
    : never;
export type ArticleBodyTextKey =
  ExtractArticleBodyTextKey<ArticleBodyMessageKey>;

export function getArticleBodyMessageKey(
  topicKey: HelpTopicKey,
  articleKey: HelpArticleKey,
  textKey: ArticleBodyTextKey,
): ArticleBodyMessageKey {
  return `articleBodies.${topicKey}.${articleKey}.${textKey}` as ArticleBodyMessageKey;
}

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type NoticeVariant = "beforeYouBegin" | "tip" | "important" | "warning";

export interface ArticleStep {
  textKey: ArticleBodyTextKey;
  code?: string;
  note?: {
    variant: NoticeVariant;
    textKey: ArticleBodyTextKey;
  };
}

export type ArticleBlock =
  | {
      kind: "paragraph";
      textKey: ArticleBodyTextKey;
    }
  | {
      kind: "heading";
      id: string;
      textKey: ArticleBodyTextKey;
    }
  | {
      kind: "list";
      ordered?: boolean;
      itemKeys: ArticleBodyTextKey[];
    }
  | {
      kind: "steps";
      items: ArticleStep[];
    }
  | {
      kind: "notice";
      variant: NoticeVariant;
      textKey: ArticleBodyTextKey;
    }
  | {
      kind: "code";
      code: string;
      captionKey?: ArticleBodyTextKey;
    }
  | {
      kind: "checklist";
      items: {
        id: string;
        textKey: ArticleBodyTextKey;
      }[];
    }
  | {
      kind: "table";
      headKeys: ArticleBodyTextKey[];
      rowKeys: ArticleBodyTextKey[][];
    }
  | {
      kind: "keyTakeaways";
      itemKeys: ArticleBodyTextKey[];
    }
  | {
      kind: "image";
      src: {
        ltr: string;
        rtl: string;
      };
      /** Alt text; empty string for decorative images. */
      alt?: string;
    }
  | {
      kind: "outcome";
      itemKeys: ArticleBodyTextKey[];
    };

export interface HelpArticleMeta {
  readingMinutes?: number;
  reviewedAt?: string;
  /** Optional hero image path shown beside the article header. */
  heroImage?: {
    ltr: string;
    rtl: string;
  };
}

/** Deterministic fallback for prototype articles without authored metadata. */
export const defaultHelpArticleUpdatedAt = "2025-06-01T00:00:00Z";

/* -------------------------------------------------------------------------- */
/* Reusable article builder                                                   */
/* -------------------------------------------------------------------------- */

// interface ArticleSection {
//   /** Stable HTML anchor used by the table of contents. */
//   id: string;

//   /** Heading key inside the article's next-intl namespace. */
//   headingKey: string;

//   /** Paragraph keys displayed below the heading. */
//   paragraphKeys?: string[];

//   /** Optional list displayed after the paragraphs. */
//   listKeys?: string[];

//   /** Whether the optional list is ordered. */
//   orderedList?: boolean;

//   /** Optional notice displayed after paragraphs and list. */
//   notice?: {
//     variant: NoticeVariant;
//     textKey: string;
//   };
// }

// interface CreateArticleOptions {
//   /** Introductory paragraph before the first heading. */
//   ledeKey?: string;

//   /** First article section. */
//   overview: ArticleSection;

//   /** Remaining article sections. */
//   sections?: ArticleSection[];

//   /** Final key-takeaway messages. */
//   takeawayKeys?: string[];
// }

/**
 * Creates the common structure used by the authored Help Center articles:
 *
 * lede
 * overview heading
 * overview paragraphs
 * sections
 * optional lists/notices
 * key takeaways
 */
// function createArticle({
//   ledeKey = "lede",
//   overview,
//   sections = [],
//   takeawayKeys = ["k1", "k2", "k3"],
// }: CreateArticleOptions): ArticleBlock[] {
//   const blocks: ArticleBlock[] = [
//     {
//       kind: "paragraph",
//       textKey: ledeKey,
//     },
//   ];

//   const appendSection = (section: ArticleSection) => {
//     blocks.push({
//       kind: "heading",
//       id: section.id,
//       textKey: section.headingKey,
//     });

//     for (const paragraphKey of section.paragraphKeys ?? []) {
//       blocks.push({
//         kind: "paragraph",
//         textKey: paragraphKey,
//       });
//     }

//     if (section.listKeys?.length) {
//       blocks.push({
//         kind: "list",
//         ordered: section.orderedList,
//         itemKeys: section.listKeys,
//       });
//     }

//     if (section.notice) {
//       blocks.push({
//         kind: "notice",
//         variant: section.notice.variant,
//         textKey: section.notice.textKey,
//       });
//     }
//   };

//   appendSection(overview);

//   for (const section of sections) {
//     appendSection(section);
//   }

//   if (takeawayKeys.length > 0) {
//     blocks.push({
//       kind: "keyTakeaways",
//       itemKeys: takeawayKeys,
//     });
//   }

//   return blocks;
// }

/* -------------------------------------------------------------------------- */
/* Article metadata                                                           */
/* -------------------------------------------------------------------------- */

export const helpArticleMeta: Partial<
  Record<HelpTopicKey, Record<string, HelpArticleMeta>>
> = {
  performanceCaching: {
    whatIsTtfb: {
      readingMinutes: 6,
      reviewedAt: "2025-06-02T00:00:00Z",
    },
    firstChecks: {
      readingMinutes: 4,
      reviewedAt: "2025-05-20T00:00:00Z",
    },
    whenPurge: {
      readingMinutes: 5,
      reviewedAt: "2025-06-15T00:00:00Z",
    },
  },

  gettingStarted: {
    firstLogin: {
      readingMinutes: 3,
      reviewedAt: "2025-06-18T00:00:00Z",
    },
    whatIsUnixsee: {
      heroImage: {
        ltr: "/images/help-center/what-is-unixsee/hero-section.png",
        rtl: "/images/help-center/what-is-unixsee/hero-section-rtl.png",
      },
    },
  },

  domainsDnsSslMigrations: {
    migrateSite: {
      heroImage: {
        ltr: "/images/help-center/migrate-to-unixsee/hero-section.png",
        rtl: "/images/help-center/migrate-to-unixsee/hero-section-rtl.png",
      },
    },
  },
};

/* -------------------------------------------------------------------------- */
/* Article bodies                                                             */
/* -------------------------------------------------------------------------- */

export const helpArticleBodies: Partial<
  Record<HelpTopicKey, Record<string, ArticleBlock[]>>
> = {
  gettingStarted: {
    whatIsUnixsee: [
      { kind: "paragraph", textKey: "lede" },
      {
        kind: "heading",
        id: "what-is-unixsee",
        textKey: "h1",
      },
      { kind: "paragraph", textKey: "p1" },
      { kind: "paragraph", textKey: "p2" },
      {
        kind: "heading",
        id: "how-it-works",
        textKey: "h2",
      },
      { kind: "paragraph", textKey: "p3" },
      {
        kind: "heading",
        id: "managed-infrastructure",
        textKey: "h3",
      },
      { kind: "paragraph", textKey: "p4" },
      {
        kind: "heading",
        id: "website-monitoring",
        textKey: "h4",
      },
      { kind: "paragraph", textKey: "p5" },
      {
        kind: "heading",
        id: "key-takeaways",
        textKey: "h5",
      },
      {
        kind: "keyTakeaways",
        itemKeys: ["k1", "k2", "k3"],
      },
    ],

    firstLogin: [
      { kind: "paragraph", textKey: "outcome" },
      {
        kind: "notice",
        variant: "beforeYouBegin",
        textKey: "before",
      },
      {
        kind: "heading",
        id: "steps",
        textKey: "h1",
      },
      {
        kind: "steps",
        items: [
          { textKey: "s1" },
          {
            textKey: "s2",
            code: "https://app.unixsee.com/login",
          },
          {
            textKey: "s3",
            note: {
              variant: "warning",
              textKey: "s3warn",
            },
          },
          { textKey: "s4" },
        ],
      },
      {
        kind: "heading",
        id: "verify",
        textKey: "h2",
      },
      {
        kind: "outcome",
        itemKeys: ["o1", "o2", "o3"],
      },
    ],
  },

  managedWoo: {
    stack: [
      { kind: "paragraph", textKey: "lede" },
      {
        kind: "heading",
        id: "what-is-managed-stack",
        textKey: "h1",
      },
      { kind: "paragraph", textKey: "p1" },
      { kind: "paragraph", textKey: "p2" },
      {
        kind: "heading",
        id: "stack-layers",
        textKey: "h2",
      },
      { kind: "paragraph", textKey: "p3" },
      {
        kind: "heading",
        id: "web-server",
        textKey: "h3",
      },
      { kind: "paragraph", textKey: "p4" },
      {
        kind: "heading",
        id: "php-layer",
        textKey: "h4",
      },
      { kind: "paragraph", textKey: "p5" },
      {
        kind: "heading",
        id: "database-layer",
        textKey: "h5",
      },
      { kind: "paragraph", textKey: "p6" },
      {
        kind: "heading",
        id: "why-managed-stack",
        textKey: "h6",
      },
      { kind: "paragraph", textKey: "p7" },
      {
        kind: "list",
        itemKeys: ["l1", "l2", "l3"],
      },
      {
        kind: "keyTakeaways",
        itemKeys: ["k1", "k2", "k3"],
      },
    ],

    phpVersions: [
      { kind: "paragraph", textKey: "lede" },
      {
        kind: "heading",
        id: "what-are-php-versions",
        textKey: "h1",
      },
      { kind: "paragraph", textKey: "p1" },
      { kind: "paragraph", textKey: "p2" },
      {
        kind: "heading",
        id: "supported-versions",
        textKey: "h2",
      },
      { kind: "paragraph", textKey: "p3" },
      {
        kind: "list",
        itemKeys: ["l1", "l2", "l3"],
      },
      {
        kind: "heading",
        id: "changing-php-version",
        textKey: "h3",
      },
      { kind: "paragraph", textKey: "p4" },
      {
        kind: "heading",
        id: "before-switching",
        textKey: "h4",
      },
      {
        kind: "list",
        itemKeys: ["l4", "l5", "l6"],
      },
      {
        kind: "keyTakeaways",
        itemKeys: ["k1", "k2", "k3"],
      },
    ],
  },

  performanceCaching: {
    whatIsCache: [
      { kind: "paragraph", textKey: "lede" },
      {
        kind: "heading",
        id: "what-is-caching",
        textKey: "h1",
      },
      { kind: "paragraph", textKey: "p1" },
      { kind: "paragraph", textKey: "p2" },
      {
        kind: "heading",
        id: "how-caching-works",
        textKey: "h2",
      },
      { kind: "paragraph", textKey: "p3" },
      {
        kind: "heading",
        id: "page-cache",
        textKey: "h3",
      },
      { kind: "paragraph", textKey: "p4" },
      {
        kind: "heading",
        id: "object-cache",
        textKey: "h4",
      },
      { kind: "paragraph", textKey: "p5" },
      {
        kind: "heading",
        id: "cache-benefits",
        textKey: "h5",
      },
      {
        kind: "list",
        itemKeys: ["l1", "l2", "l3"],
      },
      {
        kind: "heading",
        id: "when-cache-needs-clearing",
        textKey: "h6",
      },
      { kind: "paragraph", textKey: "p6" },
      {
        kind: "keyTakeaways",
        itemKeys: ["k1", "k2", "k3"],
      },
    ],

    whatIsTtfb: [
      { kind: "paragraph", textKey: "lede" },
      {
        kind: "heading",
        id: "what-is-ttfb",
        textKey: "h1",
      },
      { kind: "paragraph", textKey: "p1" },
      {
        kind: "heading",
        id: "factors",
        textKey: "h2",
      },
      { kind: "paragraph", textKey: "p2" },
      {
        kind: "list",
        itemKeys: ["l1", "l2", "l3", "l4"],
      },
      {
        kind: "heading",
        id: "when-problem",
        textKey: "h3",
      },
      { kind: "paragraph", textKey: "p3" },
      {
        kind: "notice",
        variant: "important",
        textKey: "n1",
      },
      {
        kind: "heading",
        id: "limitations",
        textKey: "h4",
      },
      { kind: "paragraph", textKey: "p4" },
      {
        kind: "keyTakeaways",
        itemKeys: ["k1", "k2", "k3"],
      },
    ],

    firstChecks: [
      { kind: "paragraph", textKey: "purpose" },
      {
        kind: "heading",
        id: "checks",
        textKey: "h1",
      },
      {
        kind: "checklist",
        items: [
          { id: "c1", textKey: "c1" },
          { id: "c2", textKey: "c2" },
          { id: "c3", textKey: "c3" },
          { id: "c4", textKey: "c4" },
          { id: "c5", textKey: "c5" },
        ],
      },
      {
        kind: "notice",
        variant: "tip",
        textKey: "tip",
      },
      {
        kind: "heading",
        id: "after",
        textKey: "h2",
      },
      { kind: "paragraph", textKey: "after" },
    ],

    whenPurge: [
      { kind: "paragraph", textKey: "scope" },
      {
        kind: "heading",
        id: "cases",
        textKey: "h1",
      },
      {
        kind: "table",
        headKeys: ["thWhen", "thAction"],
        rowKeys: [
          ["r1a", "r1b"],
          ["r2a", "r2b"],
          ["r3a", "r3b"],
        ],
      },
      {
        kind: "heading",
        id: "command",
        textKey: "h2",
      },
      { kind: "paragraph", textKey: "p2" },
      {
        kind: "code",
        code: "wp cache flush --all",
        captionKey: "cap",
      },
      {
        kind: "heading",
        id: "limitations",
        textKey: "h3",
      },
      {
        kind: "notice",
        variant: "important",
        textKey: "n1",
      },
      {
        kind: "keyTakeaways",
        itemKeys: ["k1", "k2"],
      },
    ],
  },

  monitoringAvailability: {
    checks: [
      { kind: "paragraph", textKey: "lede" },
      {
        kind: "heading",
        id: "what-are-uptime-checks",
        textKey: "h1",
      },
      { kind: "paragraph", textKey: "p1" },
      { kind: "paragraph", textKey: "p2" },
      {
        kind: "heading",
        id: "how-checks-work",
        textKey: "h2",
      },
      { kind: "paragraph", textKey: "p3" },
      {
        kind: "heading",
        id: "monitoring-request",
        textKey: "h3",
      },
      { kind: "paragraph", textKey: "p4" },
      {
        kind: "heading",
        id: "response-evaluation",
        textKey: "h4",
      },
      { kind: "paragraph", textKey: "p5" },
      {
        kind: "heading",
        id: "when-an-issue-is-detected",
        textKey: "h5",
      },
      { kind: "paragraph", textKey: "p6" },
      {
        kind: "list",
        itemKeys: ["l1", "l2", "l3"],
      },
      {
        kind: "keyTakeaways",
        itemKeys: ["k1", "k2", "k3"],
      },
    ],
  },

  securityBackups: {
    firewall: [
      { kind: "paragraph", textKey: "lede" },
      {
        kind: "heading",
        id: "what-is-firewall",
        textKey: "h1",
      },
      { kind: "paragraph", textKey: "p1" },
      { kind: "paragraph", textKey: "p2" },
      {
        kind: "heading",
        id: "how-firewall-works",
        textKey: "h2",
      },
      { kind: "paragraph", textKey: "p3" },
      {
        kind: "heading",
        id: "traffic-analysis",
        textKey: "h3",
      },
      { kind: "paragraph", textKey: "p4" },
      {
        kind: "heading",
        id: "blocking-threats",
        textKey: "h4",
      },
      { kind: "paragraph", textKey: "p5" },
      {
        kind: "heading",
        id: "security-rules",
        textKey: "h5",
      },
      { kind: "paragraph", textKey: "p6" },
      {
        kind: "list",
        itemKeys: ["l1", "l2", "l3"],
      },
      {
        kind: "keyTakeaways",
        itemKeys: ["k1", "k2", "k3"],
      },
    ],
  },

  domainsDnsSslMigrations: {
    migrateSite: [
      { kind: "paragraph", textKey: "lede" },
      {
        kind: "heading",
        id: "migration-overview",
        textKey: "h1",
      },
      { kind: "paragraph", textKey: "p1" },
      { kind: "paragraph", textKey: "p2" },
      {
        kind: "image",
        src: {
          ltr: "/images/help-center/migrate-to-unixsee/main-section.png",
          rtl: "/images/help-center/migrate-to-unixsee/main-section-rtl.png",
        },
      },
      {
        kind: "heading",
        id: "before-migration",
        textKey: "h2",
      },
      { kind: "paragraph", textKey: "p3" },
      {
        kind: "list",
        itemKeys: ["l1", "l2", "l3"],
      },
      {
        kind: "heading",
        id: "migration-process",
        textKey: "h3",
      },
      { kind: "paragraph", textKey: "p4" },
      {
        kind: "heading",
        id: "data-transfer",
        textKey: "h4",
      },
      { kind: "paragraph", textKey: "p5" },
      {
        kind: "heading",
        id: "testing-after-migration",
        textKey: "h5",
      },
      { kind: "paragraph", textKey: "p6" },
      {
        kind: "heading",
        id: "switching-domain",
        textKey: "h6",
      },
      { kind: "paragraph", textKey: "p7" },
      {
        kind: "keyTakeaways",
        itemKeys: ["k1", "k2", "k3"],
      },
    ],
  },
};

/* -------------------------------------------------------------------------- */
/* Public getters                                                             */
/* -------------------------------------------------------------------------- */

export function getArticleBody(
  topicKey: HelpTopicKey,
  articleKey: string,
): ArticleBlock[] | undefined {
  return helpArticleBodies[topicKey]?.[articleKey];
}

export function getArticleMeta(
  topicKey: HelpTopicKey,
  articleKey: string,
): HelpArticleMeta | undefined {
  return helpArticleMeta[topicKey]?.[articleKey];
}

// /**
//  * Help Center article-body fixtures.
//  *
//  * Structure-only, deterministic block models for individual article pages
//  * (article UX spec §4, §8, §10, §12). Every text slot is a message *key*
//  * resolved at the route boundary under
//  * `HelpCenter.articleBodies.{topicKey}.{articleKey}`; code samples are literal
//  * technical content and stay in English (spec §10 — LTR code inside RTL copy).
//  *
//  * Only a curated set of articles is fully authored (one per content type, so
//  * every block variant is exercised). Every other article still resolves to a
//  * real page through the generic overview body built in the route. No article is
//  * a dead end (spec §16).
//  */

// import { gettingStartedBodies } from "./article-bodies/getting-started";
// import type { HelpTopicKey } from "./help-center-data";

// /** Notice kinds (spec §9). Mapped to tone + label in presentation. */
// export type NoticeVariant = "beforeYouBegin" | "tip" | "important" | "warning";

// /** One numbered step in a step-by-step guide (spec §8.1). */
// export interface ArticleStep {
//   /** Leaf message key for the instruction text. */
//   textKey: string;
//   /** Optional literal command / URL shown LTR with a copy action. */
//   code?: string;
//   /** Optional risk notice placed immediately before the action (spec §9). */
//   note?: { variant: NoticeVariant; textKey: string };
// }

// /**
//  * A single article body block. Text slots reference leaf message keys; layout,
//  * ordering, stable heading IDs, checklist item IDs, and code literals live here.
//  */
// export type ArticleBlock =
//   | { kind: "paragraph"; textKey: string }
//   | { kind: "heading"; id: string; textKey: string }
//   | { kind: "list"; ordered?: boolean; itemKeys: string[] }
//   | { kind: "steps"; items: ArticleStep[] }
//   | { kind: "notice"; variant: NoticeVariant; textKey: string }
//   | { kind: "code"; code: string; captionKey?: string }
//   | { kind: "checklist"; items: { id: string; textKey: string }[] }
//   | { kind: "table"; headKeys: string[]; rowKeys: string[][] }
//   | { kind: "keyTakeaways"; itemKeys: string[] }
//   | { kind: "outcome"; itemKeys: string[] };

// /** Per-article metadata surfaced only when governed and accurate (spec §5). */
// export interface HelpArticleMeta {
//   /** Estimated reading time in minutes; shown only when set (spec §5). */
//   readingMinutes?: number;
//   /** ISO date of last content review; formatted at the boundary. */
//   reviewedAt?: string;
// }

// /**
//  * Governed metadata for authored articles, keyed by `[topicKey][articleKey]`.
//  * Articles without an entry intentionally show no reading time or review date.
//  */
// export const helpArticleMeta: Partial<
//   Record<HelpTopicKey, Record<string, HelpArticleMeta>>
// > = {
//   performanceCaching: {
//     whatIsTtfb: { readingMinutes: 6, reviewedAt: "2025-06-02T00:00:00Z" },
//     firstChecks: { readingMinutes: 4, reviewedAt: "2025-05-20T00:00:00Z" },
//     whenPurge: { readingMinutes: 5, reviewedAt: "2025-06-15T00:00:00Z" },
//   },
//   gettingStarted: {
//     firstLogin: { readingMinutes: 3, reviewedAt: "2025-06-18T00:00:00Z" },
//   },
// };

// /**
//  * Fully authored article bodies, keyed by `[topicKey][articleKey]`. Mirrors the
//  * `topicPages` message structure so copy stays in messages. The four entries
//  * cover every content type and every block variant.
//  */
// export const helpArticleBodies: Partial<
//   Record<HelpTopicKey, Record<string, ArticleBlock[]>>
// > = {
//   gettingStarted: gettingStartedBodies,
// };

// /** Whether a fully authored body exists for an article. */
// export function getArticleBody(
//   topicKey: HelpTopicKey,
//   articleKey: string,
// ): ArticleBlock[] | undefined {
//   return helpArticleBodies[topicKey]?.[articleKey];
// }

// /** Governed metadata for an article, if any. */
// export function getArticleMeta(
//   topicKey: HelpTopicKey,
//   articleKey: string,
// ): HelpArticleMeta | undefined {
//   return helpArticleMeta[topicKey]?.[articleKey];
// }
