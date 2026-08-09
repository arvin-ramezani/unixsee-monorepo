"use client";

import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Download,
  Paperclip,
  Send,
  X,
} from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TICKET_STATUS,
  TICKET_STATUS_LABELS,
  type TicketServiceType,
  type TicketStatusType,
  type TicketType,
} from "@/lib/data/tickets-data";
import {
  formatTicketNumber,
  getInitials,
  TICKET_STATUS_CONFIG,
  toPersianDigits,
} from "@/lib/tickets-utils";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import { TicketStatusBadge } from "./ticket-status-badge";
import { Input } from "../ui/input";

const ticketSectionLabels: Record<TicketServiceType, string> = {
  MANAGED_SERVER: "سرور مدیریت شده",
  MIGRATION_OPTIMIZATION: "بهینه‌سازی مهاجرت",
  WOOCOMMERCE_SUPPORT: "پشتیبانی ووکامرس",
  SEO: "سئو",
  GRAPHIC_DESIGN: "طراحی گرافیک",
  PRODUCT_DATA_ENTRY: "ورود داده محصول",
  SOCIAL_MEDIA_SUPPORT: "پشتیبانی شبکه‌های اجتماعی",
};

function formatPersianDate(dateString: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateString));
}

function formatPersianDateTime(dateString: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}

function getAttachmentName(
  file: { name?: string; url: string },
  index: number,
) {
  if (file.name) {
    return file.name;
  }

  const fallbackName = file.url.split("/").pop() ?? `attachment-${index + 1}`;
  return fallbackName || `attachment-${index + 1}`;
}

type TicketDetailsViewProps = {
  ticket: TicketType;
};

function ContextPanel({ ticket }: { ticket: TicketType }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-muted/20 p-4">
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarImage
              src={ticket.userImage.url}
              alt={ticket.userImage.alt}
            />
            <AvatarFallback>{getInitials(ticket.fullName)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-muted-foreground">مشتری</p>
            <p className="font-semibold">{ticket.fullName}</p>
            <Link
              href={`/users/${ticket.userId}`}
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              کاربر {formatTicketNumber(ticket.userId)}
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="mb-3 text-sm text-muted-foreground">خدمات</p>
        <div className="space-y-3 text-sm">
          <div className="rounded-xl bg-muted/40 p-3">
            <p className="text-muted-foreground">بخش</p>
            <p className="mt-1 font-medium">
              {ticketSectionLabels[ticket.section]}
            </p>
          </div>
          {ticket.website ? (
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-muted-foreground">وب‌سایت</p>
              <p className="mt-1 font-medium">{ticket.website.name}</p>
              <p className="text-xs text-muted-foreground">
                {ticket.website.domain}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="mb-3 text-sm text-muted-foreground">تیکت</p>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">وضعیت</span>
            <span className="font-medium">
              {TICKET_STATUS_CONFIG[ticket.status].label}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">ایجاد شد</span>
            <span className="font-medium">
              {formatPersianDate(ticket.createdAt)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">آخرین بروزرسانی</span>
            <span className="font-medium">
              {formatPersianDate(ticket.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TicketDetailsView({ ticket }: TicketDetailsViewProps) {
  const [status, setStatus] = useState<TicketStatusType>(ticket.status);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasPendingChanges =
    messageText.trim().length > 0 ||
    selectedFiles.length > 0 ||
    status !== ticket.status;

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length > 0) {
      setSelectedFiles((currentFiles) => [...currentFiles, ...files]);
    }

    event.target.value = "";
  };

  const handleSend = () => {
    if (!hasPendingChanges) {
      return;
    }

    setMessageText("");
    setSelectedFiles([]);
    setStatus(ticket.status);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 pt-4">
      <header className="rounded-2xl border border-border bg-card/90 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/tickets"
              className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted"
              aria-label="بازگشت به لیست تیکت‌ها"
            >
              <ArrowRight className="size-4" />
            </Link>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">تیکت‌ها</p>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  dir="ltr"
                  className="text-sm font-semibold text-foreground"
                >
                  {formatTicketNumber(ticket.id)}
                </span>
                <span className="hidden text-muted-foreground sm:inline">
                  •
                </span>
                <h1 className="truncate text-base font-semibold text-foreground">
                  {ticket.subject}
                </h1>
              </div>
            </div>
          </div>

          <Select
            value={status}
            onValueChange={(value) => setStatus(value as TicketStatusType)}
          >
            <SelectTrigger className="w-45" aria-label="تغییر وضعیت تیکت">
              <SelectValue>{TICKET_STATUS_LABELS[status]}</SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectItem value={TICKET_STATUS.WAITING_FOR_USER}>
                {TICKET_STATUS_CONFIG[TICKET_STATUS.WAITING_FOR_USER].label}
              </SelectItem>
              <SelectItem value={TICKET_STATUS.IN_PROGRESS}>
                {TICKET_STATUS_CONFIG[TICKET_STATUS.IN_PROGRESS].label}
              </SelectItem>
              <SelectItem value={TICKET_STATUS.NEW}>
                {TICKET_STATUS_CONFIG[TICKET_STATUS.NEW].label}
              </SelectItem>
              <SelectItem value={TICKET_STATUS.RESOLVED}>
                {TICKET_STATUS_CONFIG[TICKET_STATUS.RESOLVED].label}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          <Collapsible
            open={detailsOpen}
            onOpenChange={setDetailsOpen}
            className="lg:hidden"
          >
            <div className="rounded-2xl border border-border bg-card">
              <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-right">
                <span className="font-medium">جزئیات تیکت</span>
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform",
                    detailsOpen && "rotate-180",
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="border-t border-border px-4 py-4">
                <ContextPanel ticket={ticket} />
              </CollapsibleContent>
            </div>
          </Collapsible>

          <section className="flex min-h-140 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border bg-muted/20 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">گفت‌وگو</p>
                  <p className="text-sm text-muted-foreground">
                    {ticket.messages.length.toLocaleString("fa-IR")} پیام
                  </p>
                </div>
                <TicketStatusBadge status={status} />
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.03),transparent_55%)] p-4">
              {ticket.messages.map((message) => {
                const isUser = message.sender === "USER";

                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      isUser ? "justify-start" : "justify-end",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[90%] rounded-2xl border px-4 py-3 shadow-sm sm:max-w-[78%]",
                        isUser
                          ? "border-border bg-background"
                          : "border-primary/15 bg-primary text-primary-foreground",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar size="sm">
                          <AvatarImage
                            src={isUser ? ticket.userImage.url : undefined}
                            alt={isUser ? ticket.userImage.alt : "ادمین"}
                          />
                          <AvatarFallback>
                            {isUser ? getInitials(ticket.fullName) : "A"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold">
                            {isUser ? ticket.fullName : "ادمین"}
                          </p>
                          <p
                            className={cn(
                              "text-xs",
                              isUser
                                ? "text-muted-foreground"
                                : "text-primary-foreground/80",
                            )}
                          >
                            {formatPersianDateTime(message.createdAt)}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 whitespace-pre-line text-sm leading-7">
                        {message.text}
                      </p>

                      {message.files.length > 0 && (
                        <div className="mt-3 space-y-2 rounded-xl border border-border/60 bg-muted/10 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-medium text-muted-foreground">
                              {message.files.length > 1
                                ? `${toPersianDigits(message.files.length)} فایل ضمیمه`
                                : "فایل ضمیمه"}
                            </p>
                            {message.files.length > 1 ? (
                              <a
                                href={message.files[0].url}
                                download
                                className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                              >
                                <Download className="size-3.5" />
                                دانلود همه
                              </a>
                            ) : null}
                          </div>

                          {message.files.map((file, index) => {
                            const attachmentName = getAttachmentName(
                              file,
                              index,
                            );

                            return (
                              <div
                                key={`${message.id}-${index}`}
                                className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/80 px-3 py-2"
                              >
                                <div className="flex min-w-0 items-center gap-2">
                                  <div className="rounded-md border border-border bg-muted/70 p-2 text-muted-foreground">
                                    <Paperclip className="size-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">
                                      {attachmentName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {file.type ?? "فایل پیوست"}
                                    </p>
                                  </div>
                                </div>

                                <a
                                  href={file.url}
                                  download
                                  className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-transparent px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                                >
                                  <Download className="size-3.5" />
                                  دانلود
                                </a>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="sticky bottom-0 border-t border-border bg-card/95 p-4 backdrop-blur">
              <div className="rounded-2xl border border-border bg-background/90 p-3">
                <Textarea
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  placeholder="یک پاسخ بنویسید..."
                  className="w-full resize-none border-0 bg-transparent max-h-34 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />

                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2 rounded-xl border border-border/60 bg-muted/20 p-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      فایل‌های انتخاب‌شده
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedFiles.map((file) => (
                        <div
                          key={file.name}
                          className="flex w-fit items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/80 px-3 py-2 text-sm"
                        >
                          <div className="min-w-0">
                            <p className="truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {file.type || "فایل"}
                            </p>
                          </div>
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            className="rounded-full"
                            aria-label={`حذف ${file.name}`}
                            onClick={() =>
                              setSelectedFiles((currentFiles) =>
                                currentFiles.filter(
                                  (currentFile) =>
                                    currentFile.name !== file.name,
                                ),
                              )
                            }
                          >
                            <X className="size-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileSelection}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="size-4" />
                      افزودن فایل
                    </Button>
                  </div>

                  <Button
                    type="button"
                    onClick={handleSend}
                    disabled={!hasPendingChanges}
                  >
                    <Send className="size-4" />
                    ارسال
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <ContextPanel ticket={ticket} />
          </div>
        </aside>
      </div>
    </div>
  );
}
