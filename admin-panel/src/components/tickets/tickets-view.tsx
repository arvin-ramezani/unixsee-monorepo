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
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_CONFIG,
  toPersianDigits,
  type TicketSortOption,
} from "@/lib/tickets-utils";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  total: number;
  page: number;
  pageSize: number;
};

function buildTicketsHref(
  status: TicketStatusType | "ALL",
  page: number,
): string {
  const next = new URLSearchParams();
  if (status !== "ALL") {
    next.set("status", status);
  }
  if (page > 1) {
    next.set("page", String(page));
  }
  const qs = next.toString();
  return qs ? `/tickets?${qs}` : "/tickets";
}

function ticketContactSummary(ticket: TicketType) {
  const parts = [ticket.phoneNumber?.trim(), ticket.email?.trim()].filter(
    Boolean,
  ) as string[];
  return parts.length > 0 ? parts.join(" · ") : "—";
}

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
  const ticketLabel = `مشاهده تیکت ${formatTicketNumber(ticket.id, ticket.number)}`;

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
        <div className="flex flex-col gap-1">
          <span dir="ltr" className="font-medium text-foreground">
            {formatTicketNumber(ticket.id, ticket.number)}
          </span>
          {ticket.priority ? (
            <span className="text-xs text-muted-foreground">
              {TICKET_PRIORITY_LABELS[ticket.priority]}
            </span>
          ) : null}
        </div>
      </TableCell>
      <TableCell className="px-4 py-3">
        <TicketCustomer ticket={ticket} linkUser />
      </TableCell>
      <TableCell className="max-w-48 px-4 py-3">
        <span
          className="block truncate text-muted-foreground w-fit"
          dir="ltr"
          title={ticketContactSummary(ticket)}
        >
          {ticketContactSummary(ticket)}
        </span>
      </TableCell>
      <TableCell className="max-w-xs px-4 py-3">
        <span className="block truncate text-muted-foreground">
          {ticket.subject}
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
  return (
    <Link
      href={`/tickets/${ticket.id}`}
      className="block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/30"
    >
      <div className="flex items-start justify-between gap-3">
        <span dir="ltr" className="font-medium">
          {formatTicketNumber(ticket.id, ticket.number)}
        </span>
        <TicketStatusBadge status={ticket.status} />
      </div>

      <div className="mt-3">
        <TicketCustomer ticket={ticket} />
      </div>

      <p className="mt-2 line-clamp-1 text-xs text-muted-foreground" dir="ltr">
        {ticketContactSummary(ticket)}
      </p>

      <p className="mt-3 line-clamp-1 text-sm text-muted-foreground">
        <strong>بخش: </strong>
        <span>{TICKET_SERVICE_LABELS[ticket.section]}</span>
      </p>
      <p className="mt-3 line-clamp-1 text-sm text-muted-foreground">
        {ticket.subject}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {ticket.priority ? (
          <span>{TICKET_PRIORITY_LABELS[ticket.priority]}</span>
        ) : null}
        <span>{formatRelativeTime(ticket.updatedAt)}</span>
      </div>
    </Link>
  );
}

export function TicketsView({
  tickets,
  initialStatus = "ALL",
  total,
  page,
  pageSize,
}: TicketsViewProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<TicketSortOption>("updated-desc");

  const status = initialStatus;
  const hasLocalSearch = query.trim().length > 0;

  const filteredTickets = useMemo(() => {
    // Status is applied by Nest; only search client-side on the loaded page.
    const filtered = filterTickets(tickets, { query, status: "ALL" });
    return sortTickets(filtered, sortBy);
  }, [tickets, query, sortBy]);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const canGoPrev = page > 1;
  const canGoNext = page < pageCount;

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

  function replaceListParams(updates: {
    status?: TicketStatusType | "ALL";
    page?: number;
  }) {
    router.replace(
      buildTicketsHref(updates.status ?? status, updates.page ?? page),
    );
  }

  const emptyMessage = hasLocalSearch
    ? "تیکتی با این جستجو در صفحه فعلی پیدا نشد."
    : "تیکتی برای این وضعیت پیدا نشد.";

  const countLabel = hasLocalSearch
    ? `${toPersianDigits(filteredTickets.length)} نتیجه در صفحه`
    : `${toPersianDigits(total)} تیکت`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(220px,480px)_repeat(3,minmax(130px,170px))]">
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جستجو در تیکت، مشتری یا موضوع..."
            className="sm:col-span-2 lg:col-span-1"
          />

          <Select
            value={status}
            onValueChange={(value) =>
              replaceListParams({
                status: value as TicketStatusType | "ALL",
                page: 1,
              })
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

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>{countLabel}</span>
        {pageCount > 1 ? (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canGoPrev}
              onClick={() => replaceListParams({ page: page - 1 })}
            >
              قبلی
            </Button>
            <span>
              صفحه {toPersianDigits(page)} از {toPersianDigits(pageCount)}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canGoNext}
              onClick={() => replaceListParams({ page: page + 1 })}
            >
              بعدی
            </Button>
          </div>
        ) : null}
      </div>

      <div className="hidden rounded-xl border border-border bg-card lg:block">
        <Table className="w-full min-w-220 text-sm">
          <TableHeader className="border-b border-border bg-muted/30 text-muted-foreground">
            <TableRow>
              <TableHead className="px-4 py-3 text-right font-medium">
                تیکت
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-medium">
                مشتری
              </TableHead>
              <TableHead className="px-4 py-3 text-right font-medium">
                تلفن/ایمیل
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
                  colSpan={7}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:hidden">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))
        ) : (
          <div className="rounded-xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
}
