import { Role } from '#/generated/prisma/enums.js';
import type {
  Ticket,
  TicketAttachment,
  TicketMessage,
  Website,
} from '#/generated/prisma/client.js';

type TicketWebsite = Pick<Website, 'id' | 'domain' | 'displayName'>;

type TicketMessageWithAuthor = TicketMessage & {
  author: { id: string; fullName: string | null; role?: Role };
};

type TicketListRecord = Ticket & {
  website: TicketWebsite | null;
  messages: TicketMessageWithAuthor[];
};

type TicketDetailRecord = Ticket & {
  website: TicketWebsite | null;
  messages: TicketMessageWithAuthor[];
  attachments: TicketAttachment[];
};

export type TicketMessageSender = 'USER' | 'SUPPORT';

function mapWebsite(website: TicketWebsite | null) {
  if (!website) return null;
  return {
    id: website.id,
    name: website.displayName?.trim() || website.domain,
    domain: website.domain,
  };
}

function mapSender(
  author: TicketMessageWithAuthor['author'],
): TicketMessageSender {
  if (author.role === Role.ADMIN || author.role === Role.OPERATOR) {
    return 'SUPPORT';
  }
  return 'USER';
}

function mapAttachment(attachment: TicketAttachment) {
  return {
    id: attachment.id,
    fileName: attachment.fileName,
    contentType: attachment.contentType,
    sizeBytes: attachment.sizeBytes,
    storageKey: attachment.storageKey,
    createdAt: attachment.createdAt.toISOString(),
  };
}

function mapMessage(message: TicketMessageWithAuthor) {
  return {
    id: message.id,
    body: message.body,
    sender: mapSender(message.author),
    author: {
      id: message.author.id,
      fullName: message.author.fullName,
    },
    createdAt: message.createdAt.toISOString(),
  };
}

function deriveListActivity(ticket: TicketListRecord) {
  const lastMessage = ticket.messages[0];
  const lastActivityAt = (
    lastMessage?.createdAt ?? ticket.updatedAt
  ).toISOString();
  const lastActor: TicketMessageSender = lastMessage
    ? mapSender(lastMessage.author)
    : 'USER';
  return {
    lastActivityAt,
    lastActor,
    unread: lastActor === 'SUPPORT',
  };
}

export function mapTicketListItem(ticket: TicketListRecord) {
  const activity = deriveListActivity(ticket);
  return {
    id: ticket.id,
    number: ticket.number,
    subject: ticket.subject,
    service: ticket.service,
    status: ticket.status,
    website: mapWebsite(ticket.website),
    unread: activity.unread,
    lastActivityAt: activity.lastActivityAt,
    lastActor: activity.lastActor,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
  };
}

export function mapTicketDetail(ticket: TicketDetailRecord) {
  return {
    id: ticket.id,
    number: ticket.number,
    subject: ticket.subject,
    service: ticket.service,
    status: ticket.status,
    website: mapWebsite(ticket.website),
    resolvedAt: ticket.resolvedAt?.toISOString() ?? null,
    autoCloseAt: ticket.autoCloseAt?.toISOString() ?? null,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    messages: ticket.messages.map((message) => ({
      ...mapMessage(message),
      attachments: [],
    })),
    attachments: ticket.attachments.map(mapAttachment),
  };
}
