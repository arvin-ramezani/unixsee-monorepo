import { TicketCard } from "@/components/tickets/ticket-card";
import type { TicketRecord } from "@/lib/data/tickets/ticket-records";

/**
 * Responsive grid of ticket cards. Receives the same filtered/paginated slice
 * the table receives — only the presentation differs.
 */
export function TicketGrid({ tickets }: { tickets: TicketRecord[] }) {
  return (
    <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}
