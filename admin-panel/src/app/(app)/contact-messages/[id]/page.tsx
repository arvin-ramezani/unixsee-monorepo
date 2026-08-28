import { notFound } from "next/navigation";

import { ContactMessageDetailsView } from "@/components/contact-messages/contact-message-details-view";
import { mapApiError, STAFF_API_ERROR_MESSAGES } from "@/lib/api/map-api-error";
import { serverFetch } from "@/lib/api/server-fetch";
import {
  mapAdminContactMessageToUi,
  type AdminContactMessageDto,
} from "@/lib/contact-messages/map-admin-contact-message";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContactMessageDetailPage({ params }: PageProps) {
  const { id } = await params;

  let loadError: string | null = null;
  let message = null;

  try {
    const response = await serverFetch<AdminContactMessageDto>(
      `/admin/contact-messages/${id}`,
      { method: "GET" },
    );
    if (!response.success || !response.data) {
      const mapped = mapApiError(response);
      if (mapped?.key === "notFound") {
        notFound();
      }
      loadError = mapped
        ? STAFF_API_ERROR_MESSAGES[mapped.key]
        : STAFF_API_ERROR_MESSAGES.generic;
    } else {
      message = mapAdminContactMessageToUi(response.data);
    }
  } catch {
    loadError = STAFF_API_ERROR_MESSAGES.unavailable;
  }

  if (!message && !loadError) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-6 pt-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          جزئیات پیام تماس
        </h1>
      </div>

      {!!loadError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {loadError}
        </div>
      )}

      {!!message && <ContactMessageDetailsView message={message} />}
    </div>
  );
}
