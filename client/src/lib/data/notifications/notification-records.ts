import type { NotificationKind } from "@/lib/dashboard-data";

export interface NotificationArticleSection {
  id: string;
  key: "first" | "second";
}

export interface NotificationArticleRecord {
  id: string;
  kind: NotificationKind;
  publishedAt: string;
  readingMinutes: number;
  image?: {
    ltr: string;
    rtl: string;
  };
  sections: readonly NotificationArticleSection[];
  relatedIds: readonly string[];
}

export const notificationArticles: readonly NotificationArticleRecord[] = [
  {
    id: "unixsee-monthly-update-2024-05",
    kind: "platformUpdate",
    publishedAt: "2024-05-24T10:24:00Z",
    readingMinutes: 3,
    image: {
      ltr: "/images/notifications/notification-details/notification-1.png",
      rtl: "/images/notifications/notification-details/notification-1-rtl.png",
    },
    sections: [
      { id: "service-improvements", key: "first" },
      { id: "what-comes-next", key: "second" },
    ],
    relatedIds: [
      "seo-visibility-guide-2024-05",
      "design-highlights-2024-05",
      "social-media-trends-2024-05",
    ],
  },
  {
    id: "seo-visibility-guide-2024-05",
    kind: "seoGuide",
    publishedAt: "2024-05-24T10:11:00Z",
    readingMinutes: 4,
    sections: [
      { id: "strong-search-foundations", key: "first" },
      { id: "a-repeatable-routine", key: "second" },
    ],
    relatedIds: [
      "unixsee-monthly-update-2024-05",
      "design-highlights-2024-05",
      "social-media-trends-2024-05",
    ],
  },
  {
    id: "design-highlights-2024-05",
    kind: "designShowcase",
    publishedAt: "2024-05-24T09:26:00Z",
    readingMinutes: 3,
    sections: [
      { id: "clarity-before-decoration", key: "first" },
      { id: "designing-as-a-system", key: "second" },
    ],
    relatedIds: [
      "unixsee-monthly-update-2024-05",
      "seo-visibility-guide-2024-05",
      "social-media-trends-2024-05",
    ],
  },
  {
    id: "social-media-trends-2024-05",
    kind: "socialMediaTrends",
    publishedAt: "2024-05-24T07:26:00Z",
    readingMinutes: 4,
    sections: [
      { id: "formats-people-finish", key: "first" },
      { id: "consistency-over-volume", key: "second" },
    ],
    relatedIds: [
      "unixsee-monthly-update-2024-05",
      "seo-visibility-guide-2024-05",
      "design-highlights-2024-05",
    ],
  },
] as const;

export function getNotificationArticle(notificationId: string) {
  return notificationArticles.find((article) => article.id === notificationId);
}
