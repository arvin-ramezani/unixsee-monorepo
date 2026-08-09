export type TicketStatus =
  "submitted" | "in_progress" | "waiting_for_user" | "resolved" | "closed";

export type TicketService =
  | "managed_server"
  | "migration_optimization"
  | "woocommerce_support"
  | "seo"
  | "graphic_design"
  | "product_data_entry"
  | "social_media_support";

export type TicketSubjectKey =
  | "checkoutRecovery"
  | "migrationPlan"
  | "seoReport"
  | "brandAssets"
  | "productImport"
  | "serverReview";

export interface TicketWebsite {
  id: string;
  name: string;
  domain: string;
}

export interface TicketAttachment {
  id: string;
  name: string;
  sizeKb: number;
}

export interface TicketMessage {
  id: string;
  sender: "user" | "support";
  senderName: string;
  occurredAt: string;
  contentKey?:
    | "checkoutInitial"
    | "supportInvestigating"
    | "userDetails"
    | "supportResolved";
  content?: string;
  attachments: TicketAttachment[];
}

export interface TicketRecord {
  id: string;
  number: string;
  subjectKey: TicketSubjectKey;
  service: TicketService;
  website?: TicketWebsite;
  status: TicketStatus;
  unread: boolean;
  lastActivityAt: string;
  lastActor: "user" | "support";
  createdAt: string;
  messages: TicketMessage[];
}

export const ticketWebsites: TicketWebsite[] = [
  { id: "greenario-store", name: "Greenario Store", domain: "greenario.com" },
  { id: "luna-studio", name: "Luna Studio", domain: "lunastudio.co" },
  { id: "orbit-labs", name: "Orbit Labs", domain: "orbitlabs.io" },
  { id: "nova-agency", name: "Nova Agency", domain: "novaagency.com" },
  { id: "pixel-nest", name: "Pixel Nest", domain: "pixelnest.dev" },
];

const checkoutMessages: TicketMessage[] = [
  {
    id: "msg-1",
    sender: "user",
    senderName: "Jane",
    occurredAt: "2026-07-18T08:14:00Z",
    contentKey: "checkoutInitial",
    attachments: [{ id: "att-1", name: "checkout-error.png", sizeKb: 842 }],
  },
  {
    id: "msg-2",
    sender: "support",
    senderName: "Nima",
    occurredAt: "2026-07-18T08:36:00Z",
    contentKey: "supportInvestigating",
    attachments: [],
  },
  {
    id: "msg-3",
    sender: "user",
    senderName: "Jane",
    occurredAt: "2026-07-18T09:02:00Z",
    contentKey: "userDetails",
    attachments: [{ id: "att-2", name: "gateway-response.txt", sizeKb: 18 }],
  },
];

export const ticketRecords: TicketRecord[] = [
  {
    id: "TCK-1052",
    number: "TCK-1052",
    subjectKey: "checkoutRecovery",
    service: "woocommerce_support",
    website: ticketWebsites[0],
    status: "waiting_for_user",
    unread: true,
    createdAt: "2026-07-18T08:14:00Z",
    lastActivityAt: "2026-07-19T15:20:00Z",
    lastActor: "support",
    messages: checkoutMessages,
  },
  {
    id: "TCK-1049",
    number: "TCK-1049",
    subjectKey: "migrationPlan",
    service: "migration_optimization",
    website: ticketWebsites[1],
    status: "in_progress",
    unread: false,
    createdAt: "2026-07-16T11:30:00Z",
    lastActivityAt: "2026-07-19T13:45:00Z",
    lastActor: "support",
    messages: [],
  },
  {
    id: "TCK-1044",
    number: "TCK-1044",
    subjectKey: "seoReport",
    service: "seo",
    website: ticketWebsites[3],
    status: "submitted",
    unread: false,
    createdAt: "2026-07-15T14:10:00Z",
    lastActivityAt: "2026-07-18T17:12:00Z",
    lastActor: "user",
    messages: [],
  },
  {
    id: "TCK-1038",
    number: "TCK-1038",
    subjectKey: "brandAssets",
    service: "graphic_design",
    status: "resolved",
    unread: false,
    createdAt: "2026-07-10T09:00:00Z",
    lastActivityAt: "2026-07-17T10:28:00Z",
    lastActor: "support",
    messages: [],
  },
  {
    id: "TCK-1031",
    number: "TCK-1031",
    subjectKey: "productImport",
    service: "product_data_entry",
    website: ticketWebsites[0],
    status: "resolved",
    unread: false,
    createdAt: "2026-07-05T16:40:00Z",
    lastActivityAt: "2026-07-14T12:05:00Z",
    lastActor: "support",
    messages: [],
  },
  {
    id: "TCK-1022",
    number: "TCK-1022",
    subjectKey: "serverReview",
    service: "managed_server",
    website: ticketWebsites[2],
    status: "closed",
    unread: false,
    createdAt: "2026-06-28T07:25:00Z",
    lastActivityAt: "2026-07-09T08:16:00Z",
    lastActor: "user",
    messages: [],
  },
];

export const ticketServices: TicketService[] = [
  "managed_server",
  "migration_optimization",
  "woocommerce_support",
  "seo",
  "graphic_design",
  "product_data_entry",
  "social_media_support",
];

export function getTicket(ticketId: string) {
  return ticketRecords.find((ticket) => ticket.id === ticketId);
}
