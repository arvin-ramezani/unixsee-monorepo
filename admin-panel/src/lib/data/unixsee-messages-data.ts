export const UNIXSEE_MESSAGE_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  WITHDRAWN: "WITHDRAWN",
} as const;

export type UnixseeMessageStatusType =
  (typeof UNIXSEE_MESSAGE_STATUS)[keyof typeof UNIXSEE_MESSAGE_STATUS];

export const UNIXSEE_MESSAGE_STATUS_LABELS: Record<
  UnixseeMessageStatusType,
  string
> = {
  DRAFT: "پیش‌نویس",
  PUBLISHED: "منتشرشده",
  WITHDRAWN: "بازپس‌گرفته",
};

export const UNIXSEE_CONTENT_LOCALE = {
  fa: "fa",
  en: "en",
} as const;

export type UnixseeContentLocaleType =
  (typeof UNIXSEE_CONTENT_LOCALE)[keyof typeof UNIXSEE_CONTENT_LOCALE];

export const UNIXSEE_CONTENT_LOCALE_LABELS: Record<
  UnixseeContentLocaleType,
  string
> = {
  fa: "فارسی",
  en: "English",
};

export type UnixseeMessageLinkType = {
  label?: string;
  url: string;
  kind: "external" | "dashboard";
};

export type UnixseeMessageAttachmentType = {
  id?: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  storageKey: string;
  downloadUrl?: string | null;
};

export type UnixseeMessageType = {
  id: string;
  tenantId: string;
  tenantLabel: string;
  websiteId: string | null;
  websiteLabel: string | null;
  status: UnixseeMessageStatusType;
  title: string;
  body: string;
  contentLocale: UnixseeContentLocaleType;
  links: UnixseeMessageLinkType[];
  attachments: UnixseeMessageAttachmentType[];
  publishedAt: string | null;
  withdrawnAt: string | null;
  createdAt: string;
  updatedAt: string;
  recipientPreferredLocale?: UnixseeContentLocaleType;
  recipientPreferredLocaleLabel?: string;
};
