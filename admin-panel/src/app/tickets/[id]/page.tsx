import { TicketDetailsView } from "@/components/tickets/ticket-details-view";
import { TICKETS } from "@/lib/data/tickets-data";

export type TicketDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TicketDetailsPage({
  params,
}: TicketDetailsPageProps) {
  const { id } = await params;
  const ticket = TICKETS.find((item) => item.id === id);

  if (!ticket) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
        تیکت موردنظر پیدا نشد.
      </div>
    );
  }

  return <TicketDetailsView ticket={ticket} />;
}
