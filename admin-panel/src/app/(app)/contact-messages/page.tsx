import { ContactMessagesView } from "@/components/contact-messages/contact-messages-view";
import { mapApiError, STAFF_API_ERROR_MESSAGES } from "@/lib/api/map-api-error";
import { serverFetch } from "@/lib/api/server-fetch";
import {
  CONTACT_MESSAGE_STATUS,
  type ContactMessageStatusType,
  type ContactMessageType,
} from "@/lib/data/contact-messages-data";
import {
  mapAdminContactMessageListToUi,
  type AdminContactMessageListResponse,
} from "@/lib/contact-messages/map-admin-contact-message";
import { readEnumParam } from "@/lib/url-search-params";

const PAGE_SIZE = 50;

const STATUS_FILTER_VALUES = [
  "ALL",
  ...Object.values(CONTACT_MESSAGE_STATUS),
] as const;

export type ContactMessagesPageProps = {
  searchParams: Promise<{
    status?: string | string[];
    page?: string | string[];
  }>;
};

function readPageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? "1", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

export default async function ContactMessagesPage({
  searchParams,
}: ContactMessagesPageProps) {
  const params = await searchParams;
  const status =
    readEnumParam(params.status, STATUS_FILTER_VALUES) ??
    CONTACT_MESSAGE_STATUS.NEW;
  const page = readPageParam(params.page);
  const skip = (page - 1) * PAGE_SIZE;

  const query = new URLSearchParams({
    skip: String(skip),
    take: String(PAGE_SIZE),
  });
  if (status !== "ALL") {
    query.set("status", status);
  }

  let messages: ContactMessageType[] = [];
  let total = 0;
  let loadError: string | null = null;

  try {
    const response = await serverFetch<AdminContactMessageListResponse>(
      `/admin/contact-messages?${query.toString()}`,
      { method: "GET" },
    );
    if (!response.success || !response.data) {
      const mapped = mapApiError(response);
      loadError = mapped
        ? STAFF_API_ERROR_MESSAGES[mapped.key]
        : STAFF_API_ERROR_MESSAGES.generic;
    } else {
      messages = mapAdminContactMessageListToUi(response.data);
      total = response.data.total;
    }
  } catch {
    loadError = STAFF_API_ERROR_MESSAGES.unavailable;
  }

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);

  return (
    <div className="flex flex-1 flex-col gap-6 pt-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">پیام‌های تماس</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          بررسی پیام‌های فرم تماس با ما (متمایز از پیام‌های یونیکسی)
        </p>
      </div>

      {!!loadError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {loadError}
        </div>
      ) : (
        <ContactMessagesView
          messages={messages}
          initialStatus={status as ContactMessageStatusType | "ALL"}
          total={total}
          page={safePage}
          pageSize={PAGE_SIZE}
        />
      )}
    </div>
  );
}
