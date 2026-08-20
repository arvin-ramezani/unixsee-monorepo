import { UnixseeMessagesView } from "@/components/unixsee-messages/unixsee-messages-view";
import { mapApiError, STAFF_API_ERROR_MESSAGES } from "@/lib/api/map-api-error";
import { serverFetch } from "@/lib/api/server-fetch";
import {
  UNIXSEE_MESSAGE_STATUS,
  type UnixseeMessageStatusType,
  type UnixseeMessageType,
} from "@/lib/data/unixsee-messages-data";
import {
  mapAdminUnixseeMessageListToUi,
  type AdminUnixseeMessageListResponse,
} from "@/lib/unixsee-messages/map-admin-unixsee-message";
import { readEnumParam } from "@/lib/url-search-params";

const PAGE_SIZE = 50;

const STATUS_FILTER_VALUES = [
  "ALL",
  ...Object.values(UNIXSEE_MESSAGE_STATUS),
] as const;

export type UnixseeMessagesPageProps = {
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

export default async function UnixseeMessagesPage({
  searchParams,
}: UnixseeMessagesPageProps) {
  const params = await searchParams;
  const status =
    readEnumParam(params.status, STATUS_FILTER_VALUES) ?? "ALL";
  const page = readPageParam(params.page);
  const skip = (page - 1) * PAGE_SIZE;

  const query = new URLSearchParams({
    skip: String(skip),
    take: String(PAGE_SIZE),
  });
  if (status !== "ALL") {
    query.set("status", status);
  }

  let messages: UnixseeMessageType[] = [];
  let total = 0;
  let loadError: string | null = null;

  try {
    const response = await serverFetch<AdminUnixseeMessageListResponse>(
      `/admin/unixsee-messages?${query.toString()}`,
      { method: "GET" },
    );
    if (!response.success || !response.data) {
      const mapped = mapApiError(response);
      loadError = mapped
        ? STAFF_API_ERROR_MESSAGES[mapped.key]
        : STAFF_API_ERROR_MESSAGES.generic;
    } else {
      messages = mapAdminUnixseeMessageListToUi(response.data);
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
        <h1 className="text-2xl font-semibold tracking-tight">
          پیام‌های یونیکسی
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ارسال پیام یک‌طرفه به داشبورد یک مستأجر (متمایز از اخبار و اعلان‌ها)
        </p>
      </div>

      {!!loadError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {loadError}
        </div>
      ) : (
        <UnixseeMessagesView
          messages={messages}
          initialStatus={status as UnixseeMessageStatusType | "ALL"}
          total={total}
          page={safePage}
          pageSize={PAGE_SIZE}
        />
      )}
    </div>
  );
}
