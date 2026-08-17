import {
  UNIXSEE_CONTENT_LOCALE,
  UNIXSEE_MESSAGE_STATUS,
  type UnixseeContentLocaleType,
  type UnixseeMessageAttachmentType,
  type UnixseeMessageLinkType,
  type UnixseeMessageStatusType,
  type UnixseeMessageType,
} from "@/lib/data/unixsee-messages-data";

function looksLikePhoneLabel(value: string): boolean {
  const normalized = value.replace(/[\s\-()]/g, "");
  return /^\+?\d{8,15}$/.test(normalized);
}

function humanTenantLabel(
  tenant:
    | { id: string; name: string; displayName?: string | null }
    | null
    | undefined,
  fallbackId: string,
): string {
  if (!tenant) return fallbackId;
  const candidates = [tenant.displayName?.trim(), tenant.name?.trim()].filter(
    (value): value is string => Boolean(value),
  );
  const human = candidates.find((value) => !looksLikePhoneLabel(value));
  return human || candidates[0] || fallbackId;
}

export type AdminUnixseeMessageDto = {
  id: string;
  tenantId: string;
  authorId: string;
  websiteId: string | null;
  status: string;
  title: string;
  body: string;
  contentLocale: string;
  links: Array<{ label?: string | null; url: string; kind: string }>;
  publishedAt: string | null;
  withdrawnAt: string | null;
  createdAt: string;
  updatedAt: string;
  tenant?: { id: string; name: string; displayName?: string | null } | null;
  website?: {
    id: string;
    domain: string;
    displayName?: string | null;
  } | null;
  attachments: Array<{
    id: string;
    fileName: string;
    contentType: string;
    sizeBytes: number;
    storageKey: string;
  }>;
  recipientPreferredLocale?: string;
  recipientPreferredLocaleLabel?: string;
};

export type AdminUnixseeMessageListResponse = {
  items: AdminUnixseeMessageDto[];
  total: number;
};

export type AdminUnixseeComposeContextDto = {
  tenant: { id: string; name: string; displayName?: string | null };
  websites: Array<{
    id: string;
    domain: string;
    displayName?: string | null;
  }>;
  recipientPreferredLocale: string;
  recipientPreferredLocaleLabel: string;
};

function mapStatus(value: string): UnixseeMessageStatusType {
  if (value === UNIXSEE_MESSAGE_STATUS.PUBLISHED) {
    return UNIXSEE_MESSAGE_STATUS.PUBLISHED;
  }
  if (value === UNIXSEE_MESSAGE_STATUS.WITHDRAWN) {
    return UNIXSEE_MESSAGE_STATUS.WITHDRAWN;
  }
  return UNIXSEE_MESSAGE_STATUS.DRAFT;
}

function mapLocale(value: string | undefined): UnixseeContentLocaleType {
  return value === UNIXSEE_CONTENT_LOCALE.en
    ? UNIXSEE_CONTENT_LOCALE.en
    : UNIXSEE_CONTENT_LOCALE.fa;
}

function mapLinks(
  links: AdminUnixseeMessageDto["links"] | undefined,
): UnixseeMessageLinkType[] {
  if (!Array.isArray(links)) return [];
  return links.flatMap((link) => {
    if (!link?.url) return [];
    const kind =
      link.kind === "dashboard" || link.kind === "external"
        ? link.kind
        : "external";
    return [
      {
        url: link.url,
        kind,
        ...(link.label ? { label: link.label } : {}),
      },
    ];
  });
}

function mapAttachments(
  attachments: AdminUnixseeMessageDto["attachments"] | undefined,
): UnixseeMessageAttachmentType[] {
  if (!Array.isArray(attachments)) return [];
  return attachments.map((attachment) => ({
    id: attachment.id,
    fileName: attachment.fileName,
    contentType: attachment.contentType,
    sizeBytes: attachment.sizeBytes,
    storageKey: attachment.storageKey,
  }));
}

export function mapAdminUnixseeMessageToUi(
  dto: AdminUnixseeMessageDto,
): UnixseeMessageType {
  const tenantLabel = humanTenantLabel(dto.tenant, dto.tenantId);

  return {
    id: dto.id,
    tenantId: dto.tenantId,
    tenantLabel,
    websiteId: dto.websiteId,
    websiteLabel: dto.website
      ? dto.website.displayName?.trim() || dto.website.domain
      : null,
    status: mapStatus(dto.status),
    title: dto.title,
    body: dto.body,
    contentLocale: mapLocale(dto.contentLocale),
    links: mapLinks(dto.links),
    attachments: mapAttachments(dto.attachments),
    publishedAt: dto.publishedAt,
    withdrawnAt: dto.withdrawnAt,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    ...(dto.recipientPreferredLocale
      ? {
          recipientPreferredLocale: mapLocale(dto.recipientPreferredLocale),
          recipientPreferredLocaleLabel:
            dto.recipientPreferredLocaleLabel ||
            (dto.recipientPreferredLocale === "en" ? "English" : "فارسی"),
        }
      : {}),
  };
}

export function mapAdminUnixseeMessageListToUi(
  data: AdminUnixseeMessageListResponse,
): UnixseeMessageType[] {
  return data.items.map(mapAdminUnixseeMessageToUi);
}
