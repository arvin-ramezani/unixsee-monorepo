export type UnixseeMessageLink = {
  label?: string;
  url: string;
  kind: "external" | "dashboard";
};

export type UnixseeMessageAttachment = {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  storageKey: string;
  /**
   * Signed or public download URL when object storage is wired.
   * Absent / null while S3 upload+signing is deferred — UI stays ready.
   */
  downloadUrl?: string | null;
};

export type UnixseeMessageItem = {
  id: string;
  tenantId: string;
  websiteId: string | null;
  title: string;
  body: string;
  contentLocale: string;
  links: UnixseeMessageLink[];
  publishedAt: string | null;
  createdAt: string;
  website: {
    id: string;
    domain: string;
    displayName?: string | null;
  } | null;
  attachments: UnixseeMessageAttachment[];
  isRead: boolean;
  readAt: string | null;
};

export type UnixseeMessageListResponse = {
  items: UnixseeMessageItem[];
  total: number;
  hasUnread: boolean;
};
