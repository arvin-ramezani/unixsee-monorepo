import type {
  TicketServiceType,
  TicketStatusType,
  TicketType,
} from "@/lib/data/tickets-data";

export type AdminTicketListItemDto = {
  id: string;
  number: string;
  subject: string;
  service: TicketServiceType;
  status: TicketStatusType;
  priority: string;
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
  };
  resolvedAt: string | null;
  autoCloseAt: string | null;
  createdAt: string;
  updatedAt: string;
};

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

  return {
    id: item.id,
    number: item.number,
    userId: item.createdBy.id,
    fullName,
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
    assigneeId: item.assignee?.id ?? null,
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
