import {
  TICKET_STATUS,
  type TicketStatusType,
  type TicketType,
} from "@/lib/data/tickets-data";

export const TICKET_STATUS_CONFIG: Record<
  TicketStatusType,
  { label: string; emoji: string; className: string }
> = {
  [TICKET_STATUS.WAITING_CUSTOMER]: {
    label: "در انتظار کاربر",
    emoji: "🔵",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  [TICKET_STATUS.IN_PROGRESS]: {
    label: "در حال بررسی",
    emoji: "🟡",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  [TICKET_STATUS.SUBMITTED]: {
    label: "جدید",
    emoji: "🔵",
    className: "bg-primary text-primary-foreground",
  },
  [TICKET_STATUS.RESOLVED]: {
    label: "حل شده",
    emoji: "🟢",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  [TICKET_STATUS.CLOSED]: {
    label: "بسته‌شده",
    emoji: "⚫",
    className: "bg-muted text-muted-foreground",
  },
};

export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

export function formatTicketNumber(id: string, number?: string): string {
  if (number) {
    return number;
  }

  const match = id.match(/(\d+)$/);
  if (!match) return `#${id}`;

  return `#${toPersianDigits(match[1].padStart(3, "0"))}`;
}

export function getLastMessage(ticket: TicketType) {
  return ticket.messages.at(-1);
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 1);

  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`;
}

export function formatRelativeTime(
  dateString: string,
  now: Date = new Date(),
): string {
  const date = new Date(dateString);
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return "همین الان";
  if (diffMinutes < 60) {
    return `${toPersianDigits(diffMinutes)} دقیقه پیش`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${toPersianDigits(diffHours)} ساعت پیش`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `${toPersianDigits(diffDays)} روز پیش`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  return `${toPersianDigits(diffMonths)} ماه پیش`;
}

export type TicketSortOption = "updated-desc" | "updated-asc" | "created-desc";

export function sortTickets(
  tickets: TicketType[],
  sortBy: TicketSortOption,
): TicketType[] {
  const sorted = [...tickets];

  sorted.sort((a, b) => {
    switch (sortBy) {
      case "updated-asc":
        return (
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        );
      case "created-desc":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "updated-desc":
      default:
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }
  });

  return sorted;
}

export function filterTickets(
  tickets: TicketType[],
  {
    query,
    status,
  }: {
    query: string;
    status: TicketStatusType | "ALL";
  },
): TicketType[] {
  const normalizedQuery = query.trim().toLowerCase();

  return tickets.filter((ticket) => {
    if (status !== "ALL" && ticket.status !== status) return false;

    if (!normalizedQuery) return true;

    const lastMessage = getLastMessage(ticket)?.text ?? "";

    return (
      ticket.id.toLowerCase().includes(normalizedQuery) ||
      ticket.fullName.toLowerCase().includes(normalizedQuery) ||
      lastMessage.toLowerCase().includes(normalizedQuery) ||
      formatTicketNumber(ticket.id, ticket.number)
        .toLowerCase()
        .includes(normalizedQuery)
    );
  });
}

export function getUniqueUsers(tickets: TicketType[]) {
  const users = new Map<string, string>();

  for (const ticket of tickets) {
    users.set(ticket.userId, ticket.fullName);
  }

  return Array.from(users.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "fa"));
}
