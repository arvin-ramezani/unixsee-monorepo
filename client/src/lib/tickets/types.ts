export type TicketStatus =
  | "SUBMITTED"
  | "IN_PROGRESS"
  | "WAITING_CUSTOMER"
  | "RESOLVED"
  | "CLOSED";

export type TicketServiceCategory =
  | "MANAGED_SERVER"
  | "MIGRATION_OPTIMIZATION"
  | "WOOCOMMERCE_SUPPORT"
  | "SEO"
  | "GRAPHIC_DESIGN"
  | "PRODUCT_DATA_ENTRY"
  | "SOCIAL_MEDIA_SUPPORT";

export type TicketMessageSender = "USER" | "SUPPORT";

export type TicketWebsiteRef = {
  id: string;
  name: string;
  domain: string;
};

export type TicketAttachment = {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  storageKey: string;
  downloadUrl: string | null;
  createdAt: string;
};

export type TicketMessage = {
  id: string;
  body: string;
  sender: TicketMessageSender;
  author: {
    id: string;
    fullName: string | null;
  };
  attachments: TicketAttachment[];
  createdAt: string;
};

export type TicketListItem = {
  id: string;
  number: string;
  subject: string;
  service: TicketServiceCategory;
  status: TicketStatus;
  website: TicketWebsiteRef | null;
  unread: boolean;
  lastActivityAt: string;
  lastActor: TicketMessageSender;
  createdAt: string;
  updatedAt: string;
};

export type TicketDetail = {
  id: string;
  number: string;
  subject: string;
  service: TicketServiceCategory;
  status: TicketStatus;
  website: TicketWebsiteRef | null;
  resolvedAt: string | null;
  autoCloseAt: string | null;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
  attachments: TicketAttachment[];
};

export type TicketServiceCatalogItem = {
  code: TicketServiceCategory;
  websiteRequired: boolean;
};

export type TicketListResponse = {
  items: TicketListItem[];
  total: number;
};

export type TicketServicesResponse = {
  items: TicketServiceCatalogItem[];
};

export type CreateTicketInput = {
  service: TicketServiceCategory;
  subject: string;
  description: string;
  websiteId?: string;
};

export type NestWebsiteListItem = {
  id: string;
  domain: string;
  displayName: string | null;
};

export const TICKET_STATUSES: TicketStatus[] = [
  "SUBMITTED",
  "IN_PROGRESS",
  "WAITING_CUSTOMER",
  "RESOLVED",
  "CLOSED",
];
