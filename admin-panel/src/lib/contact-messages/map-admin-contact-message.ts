import {
  CONTACT_MESSAGE_STATUS,
  CONTACT_MESSAGE_SUBJECT,
  CONTACT_MESSAGE_SUBJECT_LABELS,
  type ContactMessageAttachmentType,
  type ContactMessageStatusType,
  type ContactMessageSubjectType,
  type ContactMessageType,
} from "@/lib/data/contact-messages-data";

export type AdminContactMessageDto = {
  id: string;
  subject: string;
  fullName: string;
  email: string;
  phone: string;
  website: string | null;
  activityBasin: string | null;
  message?: string;
  locale: string | null;
  source: string | null;
  status: string;
  attachmentCount: number;
  attachments?: Array<{
    storageKey: string;
    downloadUrl: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type AdminContactMessageListResponse = {
  items: AdminContactMessageDto[];
  total: number;
};

function mapStatus(value: string): ContactMessageStatusType {
  if (value === CONTACT_MESSAGE_STATUS.READ) {
    return CONTACT_MESSAGE_STATUS.READ;
  }
  if (value === CONTACT_MESSAGE_STATUS.ARCHIVED) {
    return CONTACT_MESSAGE_STATUS.ARCHIVED;
  }
  return CONTACT_MESSAGE_STATUS.NEW;
}

function mapSubject(value: string): ContactMessageSubjectType {
  const subjects = Object.values(CONTACT_MESSAGE_SUBJECT);
  if (subjects.includes(value as ContactMessageSubjectType)) {
    return value as ContactMessageSubjectType;
  }
  return CONTACT_MESSAGE_SUBJECT.managedServer;
}

function mapAttachments(
  attachments: AdminContactMessageDto["attachments"] | undefined,
): ContactMessageAttachmentType[] {
  if (!Array.isArray(attachments)) return [];
  return attachments.flatMap((item) => {
    if (!item?.storageKey) return [];
    return [
      {
        storageKey: item.storageKey,
        downloadUrl: item.downloadUrl ?? null,
      },
    ];
  });
}

export function mapAdminContactMessageToUi(
  dto: AdminContactMessageDto,
): ContactMessageType {
  const subject = mapSubject(dto.subject);
  const attachments = mapAttachments(dto.attachments);
  return {
    id: dto.id,
    subject,
    subjectLabel: CONTACT_MESSAGE_SUBJECT_LABELS[subject],
    fullName: dto.fullName,
    email: dto.email,
    phone: dto.phone,
    website: dto.website,
    activityBasin: dto.activityBasin,
    message: dto.message ?? null,
    locale: dto.locale,
    source: dto.source,
    status: mapStatus(dto.status),
    attachmentCount: dto.attachmentCount ?? attachments.length,
    attachments,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export function mapAdminContactMessageListToUi(
  data: AdminContactMessageListResponse,
): ContactMessageType[] {
  return (data.items ?? []).map(mapAdminContactMessageToUi);
}
