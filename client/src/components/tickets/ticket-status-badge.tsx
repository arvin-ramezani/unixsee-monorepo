import {
  CheckCircle2,
  Circle,
  CircleDot,
  Clock3,
  MessageCircleMore,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type { TicketStatus } from "@/lib/tickets/types";
import { cn } from "@/lib/utils";

const styles: Record<TicketStatus, string> = {
  SUBMITTED: "border-link/20 bg-popover text-link",
  IN_PROGRESS: "border-link/20 bg-accent text-link",
  WAITING_CUSTOMER:
    "border-warning/50 bg-warning/20 text-warning-foreground dark:text-warning shadow-sm",
  RESOLVED:
    "border-success/25 bg-success/10 text-success-foreground dark:text-success",
  CLOSED: "border-border bg-muted text-muted-foreground",
};

const icons = {
  SUBMITTED: CircleDot,
  IN_PROGRESS: Clock3,
  WAITING_CUSTOMER: MessageCircleMore,
  RESOLVED: CheckCircle2,
  CLOSED: Circle,
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
