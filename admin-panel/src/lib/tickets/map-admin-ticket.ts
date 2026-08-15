import type {
  TicketPriorityType,
  TicketServiceType,
  TicketStatusType,
  TicketType,
} from "@/lib/data/tickets-data";
import { TICKET_PRIORITY } from "@/lib/data/tickets-data";

export type AdminTicketListItemDto = {
  id: string;
  number: string;
  subject: string;
  service: TicketServiceType;
  status: TicketStatusType;
  priority: TicketPriorityType | string;
  tenant: {
    id: string;
    name: string;
    status: string;
  };
  website: {
    id: string;
    name: string;
    domain: string;
  } | null;
  assignee: {
    id: string;
    fullName: string | null;
  } | null;
  createdBy: {
    id: string;
    fullName: string | null;
    phoneNumber?: string | null;
    email?: string | null;
  };
  resolvedAt: string | null;
  autoCloseAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function mapPriority(value: string): TicketPriorityType | undefined {
  const priorities = Object.values(TICKET_PRIORITY) as string[];
  return priorities.includes(value) ? (value as TicketPriorityType) : undefined;
}

export type AdminTicketMessageDto = {
  id: string;
  body: string;
  sender: "USER" | "SUPPORT";
  isInternal: boolean;
  author: {
    id: string;
    fullName: string | null;
  };
  attachments: Array<{
    id: string;
    fileName: string;
    contentType: string;
    sizeBytes: number;
    storageKey: string;
    createdAt: string;
  }>;
  createdAt: string;
};

export type AdminTicketDetailDto = AdminTicketListItemDto & {
  messages: AdminTicketMessageDto[];
  attachments: Array<{
    id: string;
    fileName: string;
    contentType: string;
    sizeBytes: number;
    storageKey: string;
    createdAt: string;
  }>;
};

export type AdminTicketListResponse = {
  items: AdminTicketListItemDto[];
  total: number;
};

function mapListItemToTicket(item: AdminTicketListItemDto): TicketType {
  const fullName = item.createdBy.fullName?.trim() || "مشتری";
  const assigneeName = item.assignee?.fullName?.trim() || null;

  return {
    id: item.id,
    number: item.number,
    userId: item.createdBy.id,
    fullName,
    phoneNumber: item.createdBy.phoneNumber?.trim() || null,
    email: item.createdBy.email?.trim() || null,
    subject: item.subject,
    section: item.service,
    website: item.website
      ? {
          id: item.website.id,
          name: item.website.name,
          domain: item.website.domain,
        }
      : undefined,
    userImage: {
      url: "",
      alt: fullName,
    },
    messages: [],
    status: item.status,
    priority: mapPriority(item.priority),
    tenant: {
      id: item.tenant.id,
      name: item.tenant.name,
    },
    assigneeId: item.assignee?.id ?? null,
    assigneeName,
    resolvedAt: item.resolvedAt,
    autoCloseAt: item.autoCloseAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function mapAdminTicketListToUi(
  response: AdminTicketListResponse,
): TicketType[] {
  return response.items.map(mapListItemToTicket);
}

export function mapAdminTicketDetailToUi(
  detail: AdminTicketDetailDto,
): TicketType {
  const base = mapListItemToTicket(detail);

  return {
    ...base,
    messages: detail.messages.map((message) => ({
      id: message.id,
      text: message.body,
      sender: message.sender === "SUPPORT" ? "ADMIN" : "USER",
      isInternal: message.isInternal,
      files: message.attachments.map((file) => ({
        url: `#${file.storageKey}`,
        name: file.fileName,
        type: file.contentType,
      })),
      createdAt: message.createdAt,
    })),
  };
}
