"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  TICKET_SERVICE_LABELS,
  TICKET_STATUS,
  type TicketStatusType,
  type TicketType,
} from "@/lib/data/tickets-data";
import {
  filterTickets,
  formatRelativeTime,
  formatTicketNumber,
  getInitials,
  sortTickets,
  TICKET_STATUS_CONFIG,
  type TicketSortOption,
} from "@/lib/tickets-utils";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TicketStatusBadge } from "@/components/tickets/ticket-status-badge";
import SearchInput from "../common/search-input";

type TicketsViewProps = {
  tickets: TicketType[];
  initialStatus?: TicketStatusType | "ALL";
};

function TicketCustomer({
  ticket,
  linkUser = false,
}: {
  ticket: TicketType;
  linkUser?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar size="sm">
        <AvatarImage src={ticket.userImage.url} alt={ticket.userImage.alt} />
        <AvatarFallback>{getInitials(ticket.fullName)}</AvatarFallback>
      </Avatar>
      {linkUser ? (
        <Link
          href={`/users/${ticket.userId}`}
          className="truncate hover:underline"
        >
          {ticket.fullName}
        </Link>
      ) : (
        <span className="truncate">{ticket.fullName}</span>
      )}
    </div>
  );
}

function TicketTableRow({ ticket }: { ticket: TicketType }) {
  const router = useRouter();

  const ticketHref = `/tickets/${ticket.id}`;
  const ticketLabel = `مشاهده تیکت ${formatTicketNumber(ticket.id)}`;

  const navigateToTicket = () => {
    router.push(ticketHref);
  };

  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
    const target = event.target as HTMLElement;

    if (
      target.closest(
        "a, button, [data-slot='dropdown-menu-trigger'], [data-slot='dropdown-menu-content']",
      )
    ) {
      return;
    }

    navigateToTicket();
  };

  const handleRowKeyDown = (
    event: React.KeyboardEvent<HTMLTableRowElement>,
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    navigateToTicket();
  };

  return (
    <TableRow
      className="group cursor-pointer border-b border-border/60 odd:bg-secondary/50 transition-colors hover:bg-muted/40"
      onClick={handleRowClick}
      onKeyDown={handleRowKeyDown}
      tabIndex={0}
      role="link"
      aria-label={ticketLabel}
    >
      <TableCell className="px-4 py-3">
        <span dir="ltr" className="font-medium text-foreground">
          {formatTicketNumber(ticket.id)}
        </span>
      </TableCell>
      <TableCell className="px-4 py-3">
        <TicketCustomer ticket={ticket} linkUser />
      </TableCell>
      <TableCell className="max-w-xs px-4 py-3">
        <span className="block truncate text-muted-foreground">
          {ticket?.subject}
        </span>
      </TableCell>
      <TableCell className="max-w-xs px-4 py-3">
        <span className="block truncate text-muted-foreground">
          {TICKET_SERVICE_LABELS[ticket.section]}
        </span>
      </TableCell>
      <TableCell className="px-4 py-3">
        <TicketStatusBadge status={ticket.status} />
      </TableCell>
      <TableCell className="px-4 py-3 text-sm whitespace-nowrap text-muted-foreground">
        {formatRelativeTime(ticket.updatedAt)}
      </TableCell>
    </TableRow>
  );
}

function TicketCard({ ticket }: { ticket: TicketType }) {
  // const lastMessage = getLastMessage(ticket);

  return (
    <Link
      href={`/tickets/${ticket.id}`}
      className="block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/30"
    >
      <div className="flex items-start justify-between gap-3">
        <span dir="ltr" className="font-medium">
          {formatTicketNumber(ticket.id)}
        </span>
        <TicketStatusBadge status={ticket.status} />
      </div>

      <div className="mt-3">
        <TicketCustomer ticket={ticket} />
      </div>

      <p className="mt-3 line-clamp-1 text-sm text-muted-foreground">
        <strong>بخش: </strong>
        <span>{TICKET_SERVICE_LABELS[ticket.section]}</span>
      </p>
      <p className="mt-3 line-clamp-1 text-sm text-muted-foreground">
        {ticket?.subject}
      </p>

      <p className="mt-3 text-xs text-muted-foreground">
        {formatRelativeTime(ticket.updatedAt)}
      </p>
    </Link>
  );
}

export function TicketsView({
  tickets,
  initialStatus = "ALL",
}: TicketsViewProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<TicketStatusType | "ALL">(initialStatus);
  const [sortBy, setSortBy] = useState<TicketSortOption>("updated-desc");

  const filteredTickets = useMemo(() => {
    const filtered = filterTickets(tickets, { query, status });
    return sortTickets(filtered, sortBy);
  }, [tickets, query, status, sortBy]);

  const statusLabel =
    status === "ALL"
      ? "همه وضعیت‌ها"
      : `${TICKET_STATUS_CONFIG[status].emoji} ${TICKET_STATUS_CONFIG[status].label}`;

  const sortByLabels: Record<TicketSortOption, string> = {
    "updated-desc": "جدیدترین بروزرسانی",
    "updated-asc": "قدیمی‌ترین بروزرسانی",
    "created-desc": "جدیدترین تیکت",
  };

  const sortByLabel = sortByLabels[sortBy];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        {/* <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"> */}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(220px,480px)_repeat(3,minmax(130px,170px))]">
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جستجو در تیکت، مشتری یا پیام..."
            className="sm:col-span-2 lg:col-span-1"
          />

          <Select
            value={status}
            onValueChange={(value) =>
              setStatus(value as TicketStatusType | "ALL")
            }
          >
            <SelectTrigger className="w-full" aria-label="فیلتر وضعیت">
              <SelectValue>{statusLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectItem value="ALL">همه وضعیت‌ها</SelectItem>
              {Object.values(TICKET_STATUS).map((value) => (
                <SelectItem key={value} value={value}>
                  {TICKET_STATUS_CONFIG[value].emoji}{" "}
                  {TICKET_STATUS_CONFIG[value].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as TicketSortOption)}
          >
            <SelectTrigger
              className={cn("w-full", "lg:col-span-1")}
              aria-label="مرتب‌سازی"
            >
              <SelectValue>{sortByLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectItem value="updated-desc">جدیدترین بروزرسانی</SelectItem>
              <SelectItem value="updated-asc">قدیمی‌ترین بروزرسانی</SelectItem>
              <SelectItem value="created-desc">جدیدترین تیکت</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{filteredTickets.length.toLocaleString("fa-IR")} تیکت</span>
      </div>

      <div className="hidden rounded-xl border border-border bg-card lg:block">
        <Table className="w-full min-w-190 text-sm">
          <TableHeader className="border-b border-border bg-muted/30 text-muted-foreground">
            <TableRow>
              <TableHead className="px-4 py-3 text-right font-medium">
                تیکت
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-medium">
                مشتری
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-medium">
                موضوع
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-medium">
                بخش
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-medium">
                وضعیت
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-medium">
                بروزرسانی
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => (
                <TicketTableRow key={ticket.id} ticket={ticket} />
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  تیکتی با این فیلترها پیدا نشد.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid md:grid-cols-2 gap-3 lg:hidden">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))
        ) : (
          <div className="rounded-xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            تیکتی با این فیلترها پیدا نشد.
          </div>
        )}
      </div>
    </div>
  );
}
