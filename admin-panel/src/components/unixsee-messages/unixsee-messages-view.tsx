"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  UNIXSEE_CONTENT_LOCALE_LABELS,
  UNIXSEE_MESSAGE_STATUS,
  UNIXSEE_MESSAGE_STATUS_LABELS,
  type UnixseeMessageStatusType,
  type UnixseeMessageType,
} from "@/lib/data/unixsee-messages-data";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
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

type UnixseeMessagesViewProps = {
  messages: UnixseeMessageType[];
  initialStatus: UnixseeMessageStatusType | "ALL";
  total: number;
  page: number;
  pageSize: number;
};

function buildHref(status: UnixseeMessageStatusType | "ALL", page: number) {
  const next = new URLSearchParams();
  if (status !== "ALL") next.set("status", status);
  if (page > 1) next.set("page", String(page));
  const qs = next.toString();
  return qs ? `/unixsee-messages?${qs}` : "/unixsee-messages";
}

function formatWhen(value: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("fa-IR");
  } catch {
    return value;
  }
}

export function UnixseeMessagesView({
  messages,
  initialStatus,
  total,
  page,
  pageSize,
}: UnixseeMessagesViewProps) {
  const router = useRouter();
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const statusLabel =
    initialStatus === "ALL"
      ? "همه وضعیت‌ها"
      : UNIXSEE_MESSAGE_STATUS_LABELS[initialStatus];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select
            value={initialStatus}
            onValueChange={(value) => {
              router.push(
                buildHref((value as UnixseeMessageStatusType | "ALL") ?? "ALL", 1),
              );
            }}
          >
            <SelectTrigger className="w-44" aria-label="فیلتر وضعیت">
              <SelectValue>{statusLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectItem value="ALL">همه وضعیت‌ها</SelectItem>
              {Object.values(UNIXSEE_MESSAGE_STATUS).map((status) => (
                <SelectItem key={status} value={status}>
                  {UNIXSEE_MESSAGE_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            {total.toLocaleString("fa-IR")} پیام
          </p>
        </div>
        <Link href="/unixsee-messages/new" className={buttonVariants()}>
          پیام جدید
        </Link>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          هنوز پیامی ثبت نشده است.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>عنوان</TableHead>
                <TableHead>مستأجر</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>زبان</TableHead>
                <TableHead>انتشار</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <TableRow
                  key={message.id}
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => router.push(`/unixsee-messages/${message.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(`/unixsee-messages/${message.id}`);
                    }
                  }}
                  tabIndex={0}
                  role="link"
                  aria-label={`مشاهده پیام ${message.title}`}
                >
                  <TableCell className="font-medium">{message.title}</TableCell>
                  <TableCell>{message.tenantLabel}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs",
                        message.status === "PUBLISHED" &&
                          "bg-emerald-500/10 text-emerald-700",
                        message.status === "DRAFT" &&
                          "bg-amber-500/10 text-amber-700",
                        message.status === "WITHDRAWN" &&
                          "bg-muted text-muted-foreground",
                      )}
                    >
                      {UNIXSEE_MESSAGE_STATUS_LABELS[message.status]}
                    </span>
                  </TableCell>
                  <TableCell>
                    {UNIXSEE_CONTENT_LOCALE_LABELS[message.contentLocale]}
                  </TableCell>
                  <TableCell>{formatWhen(message.publishedAt)}</TableCell>
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
