import { type TicketStatusType } from "@/lib/data/tickets-data";
import { TICKET_STATUS_CONFIG } from "@/lib/tickets-utils";
import { cn } from "@/lib/utils";

type TicketStatusBadgeProps = {
  status: TicketStatusType;
  className?: string;
};

export function TicketStatusBadge({
  status,
  className,
}: TicketStatusBadgeProps) {
  const config = TICKET_STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs whitespace-nowrap",
        config.className,
        className,
      )}
    >
      <span aria-hidden>{config.emoji}</span>
      {config.label}
    </span>
  );
}
