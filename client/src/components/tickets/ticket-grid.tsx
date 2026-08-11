import { TicketCard } from "@/components/tickets/ticket-card";
import type { TicketListItem } from "@/lib/tickets/types";

/**
 * Responsive grid of ticket cards. Receives the same filtered/paginated slice
 * as the table view.
 */
export function TicketGrid({ tickets }: { tickets: TicketListItem[] }) {
  return (
    <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}
