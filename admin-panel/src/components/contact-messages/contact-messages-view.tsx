"use client";

import { useRouter } from "next/navigation";

import {
  CONTACT_MESSAGE_STATUS,
  CONTACT_MESSAGE_STATUS_LABELS,
  type ContactMessageStatusType,
  type ContactMessageType,
} from "@/lib/data/contact-messages-data";
import { cn } from "@/lib/utils";
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

type ContactMessagesViewProps = {
  messages: ContactMessageType[];
  initialStatus: ContactMessageStatusType | "ALL";
  total: number;
  page: number;
  pageSize: number;
};

function buildHref(status: ContactMessageStatusType | "ALL", page: number) {
  const next = new URLSearchParams();
  if (status !== "ALL") next.set("status", status);
  if (page > 1) next.set("page", String(page));
  const qs = next.toString();
  return qs ? `/contact-messages?${qs}` : "/contact-messages";
}

function formatWhen(value: string) {
  try {
    return new Date(value).toLocaleString("fa-IR");
  } catch {
    return value;
  }
}

function statusClassName(status: ContactMessageStatusType) {
  if (status === CONTACT_MESSAGE_STATUS.NEW) {
    return "bg-amber-500/10 text-amber-700";
  }
  if (status === CONTACT_MESSAGE_STATUS.READ) {
    return "bg-emerald-500/10 text-emerald-700";
  }
  return "bg-muted text-muted-foreground";
}

export function ContactMessagesView({
  messages,
  initialStatus,
  total,
  page,
  pageSize,
}: ContactMessagesViewProps) {
  const router = useRouter();
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const statusLabel =
    initialStatus === "ALL"
      ? "همه وضعیت‌ها"
      : CONTACT_MESSAGE_STATUS_LABELS[initialStatus];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select
            value={initialStatus}
            onValueChange={(value) => {
              router.push(
                buildHref(
                  (value as ContactMessageStatusType | "ALL") ?? "ALL",
                  1,
                ),
              );
            }}
          >
            <SelectTrigger className="w-44" aria-label="فیلتر وضعیت">
              <SelectValue>{statusLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectItem value="ALL">همه وضعیت‌ها</SelectItem>
              {Object.values(CONTACT_MESSAGE_STATUS).map((status) => (
                <SelectItem key={status} value={status}>
                  {CONTACT_MESSAGE_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {total.toLocaleString("fa-IR")} پیام
          </p>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          پیامی با این فیلتر یافت نشد.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>موضوع</TableHead>
                <TableHead>فرستنده</TableHead>
                <TableHead>تماس</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>پیوست</TableHead>
                <TableHead>زمان</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <TableRow
                  key={message.id}
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => router.push(`/contact-messages/${message.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(`/contact-messages/${message.id}`);
                    }
                  }}
                  tabIndex={0}
                  role="link"
                  aria-label={`مشاهده پیام ${message.fullName}`}
                >
                  <TableCell className="font-medium">
                    {message.subjectLabel}
                  </TableCell>
                  <TableCell>{message.fullName}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 text-sm">
                      <span>{message.email}</span>
                      <span className="text-muted-foreground">
                        {message.phone}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs",
                        statusClassName(message.status),
                      )}
                    >
                      {CONTACT_MESSAGE_STATUS_LABELS[message.status]}
                    </span>
                  </TableCell>
                  <TableCell>
                    {message.attachmentCount > 0
                      ? message.attachmentCount.toLocaleString("fa-IR")
                      : "—"}
                  </TableCell>
                  <TableCell>{formatWhen(message.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => router.push(buildHref(initialStatus, page - 1))}
          >
            قبلی
          </Button>
          <span className="text-sm text-muted-foreground">
            صفحه {page.toLocaleString("fa-IR")} از{" "}
            {pageCount.toLocaleString("fa-IR")}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount}
            onClick={() => router.push(buildHref(initialStatus, page + 1))}
          >
            بعدی
          </Button>
        </div>
      )}
    </div>
  );
}
