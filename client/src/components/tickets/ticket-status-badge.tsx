import {
  CheckCircle2,
  Circle,
  CircleDot,
  Clock3,
  MessageCircleMore,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type { TicketStatus } from "@/lib/data/tickets/ticket-records";
import { cn } from "@/lib/utils";

const styles: Record<TicketStatus, string> = {
  submitted: "border-link/20 bg-popover text-link",
  in_progress: "border-link/20 bg-accent text-link",
  waiting_for_user:
    "border-warning/50 bg-warning/20 text-warning-foreground dark:text-warning shadow-sm",
  resolved:
    "border-success/25 bg-success/10 text-success-foreground dark:text-success",
  closed: "border-border bg-muted text-muted-foreground",
};

const icons = {
  submitted: CircleDot,
  in_progress: Clock3,
  waiting_for_user: MessageCircleMore,
  resolved: CheckCircle2,
  closed: Circle,
} satisfies Record<TicketStatus, typeof Circle>;

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const t = useTranslations("Tickets.statuses");
  const Icon = icons[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex min-h-8 items-center gap-2 border px-3 py-1 text-xs font-medium whitespace-nowrap",
        styles[status],
      )}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {t(status)}
    </Badge>
  );
}
