"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  Download,
  Paperclip,
  Send,
  X,
} from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";

import {
  addTicketMessageAction,
  assignTicketToMeAction,
  requestTicketInfoAction,
  resolveTicketAction,
} from "@/actions/tickets/ticket-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  TICKET_STATUS,
  type TicketServiceType,
  type TicketType,
} from "@/lib/data/tickets-data";
import {
  formatTicketNumber,
  getInitials,
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_CONFIG,
  toPersianDigits,
} from "@/lib/tickets-utils";
import { cn } from "@/lib/utils";
import { TicketStatusBadge } from "./ticket-status-badge";

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
              src={ticket.userImage.url || undefined}
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
          {ticket.priority ? (
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">اولویت</span>
              <span className="font-medium">
                {TICKET_PRIORITY_LABELS[ticket.priority]}
              </span>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">مسئول</span>
            <span className="font-medium">
              {ticket.assigneeName?.trim() || "بدون مسئول"}
            </span>
          </div>
          {ticket.tenant?.name ? (
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">مستأجر</span>
              <span className="font-medium">{ticket.tenant.name}</span>
            </div>
          ) : null}
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
          {ticket.resolvedAt ? (
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">زمان حل</span>
              <span className="font-medium">
                {formatPersianDateTime(ticket.resolvedAt)}
              </span>
            </div>
          ) : null}
          {ticket.status === TICKET_STATUS.RESOLVED && ticket.autoCloseAt ? (
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">بستن خودکار</span>
              <span className="font-medium">
                {formatPersianDateTime(ticket.autoCloseAt)}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function TicketDetailsView({ ticket }: TicketDetailsViewProps) {
  const router = useRouter();
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAssign = ticket.status === TICKET_STATUS.SUBMITTED || !ticket.assigneeId;
  const canRequestInfo = ticket.status === TICKET_STATUS.IN_PROGRESS;
  const canResolve =
    ticket.status !== TICKET_STATUS.RESOLVED &&
    ticket.status !== TICKET_STATUS.CLOSED;
  const canReply = ticket.status !== TICKET_STATUS.CLOSED;

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length > 0) {
      setSelectedFiles((currentFiles) => [...currentFiles, ...files]);
    }

    event.target.value = "";
  };

  async function runAction(
    key: string,
    action: () => Promise<{ ok: true } | { ok: false; message: string }>,
  ) {
    setActionError(null);
    setPendingAction(key);
    const result = await action();
    setPendingAction(null);

    if (!result.ok) {
      setActionError(result.message);
      return;
    }

    router.refresh();
  }

  async function handleSend() {
    if (!messageText.trim() || !canReply) {
      return;
    }

    await runAction("message", () =>
      addTicketMessageAction({
        ticketId: ticket.id,
        body: messageText,
        isInternal,
      }),
    );

    setMessageText("");
    setSelectedFiles([]);
    setIsInternal(false);
  }

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
                  {formatTicketNumber(ticket.id, ticket.number)}
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

          <div className="flex flex-wrap items-center gap-2">
            <TicketStatusBadge status={ticket.status} />
            {canAssign ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pendingAction !== null}
                onClick={() =>
                  void runAction("assign", () =>
                    assignTicketToMeAction(ticket.id),
                  )
                }
              >
                تخصیص به من
              </Button>
            ) : null}
            {canRequestInfo ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pendingAction !== null}
                onClick={() =>
                  void runAction("request-info", () =>
                    requestTicketInfoAction(ticket.id),
                  )
                }
              >
                درخواست اطلاعات
              </Button>
            ) : null}
            {canResolve ? (
              <Button
                type="button"
                size="sm"
                disabled={pendingAction !== null}
                onClick={() =>
                  void runAction("resolve", () => resolveTicketAction(ticket.id))
                }
              >
                حل‌شده
              </Button>
            ) : null}
          </div>
        </div>
        {actionError ? (
          <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {actionError}
          </p>
        ) : null}
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
                <TicketStatusBadge status={ticket.status} />
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.03),transparent_55%)] p-4">
              {ticket.messages.map((message) => {
                const isUser = message.sender === "USER";
                const isInternalNote = message.isInternal === true;

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
                        isInternalNote
                          ? "border-amber-500/30 bg-amber-500/10"
                          : isUser
                            ? "border-border bg-background"
                            : "border-primary/15 bg-primary text-primary-foreground",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar size="sm">
                          <AvatarImage
                            src={
                              isUser ? ticket.userImage.url || undefined : undefined
                            }
                            alt={isUser ? ticket.userImage.alt : "ادمین"}
                          />
                          <AvatarFallback>
                            {isUser ? getInitials(ticket.fullName) : "A"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold">
                            {isInternalNote
                              ? "یادداشت داخلی"
                              : isUser
                                ? ticket.fullName
                                : "ادمین"}
                          </p>
                          <p
                            className={cn(
                              "text-xs",
                              isUser || isInternalNote
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

                                <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
                                  <Download className="size-3.5" />
                                  به‌زودی
                                </span>
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
                  placeholder={
                    canReply
                      ? "یک پاسخ بنویسید..."
                      : "تیکت بسته‌شده است و امکان پاسخ وجود ندارد."
                  }
                  disabled={!canReply || pendingAction !== null}
                  className="max-h-34 w-full resize-none border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />

                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2 rounded-xl border border-border/60 bg-muted/20 p-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      آپلود فایل در این نسخه فعال نیست
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedFiles.map((file) => (
                        <div
                          key={file.name}
                          className="flex w-fit items-center justify-between gap-2 rounded-lg border border-border/60 bg-background/80 px-3 py-2 text-sm"
                        >
                          <div className="min-w-0">
                            <p className="truncate">{file.name}</p>
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
                  <div className="flex flex-wrap items-center gap-3">
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
                      disabled
                      title="آپلود پیوست هنوز به Nest وصل نشده است"
                    >
                      <Paperclip className="size-4" />
                      افزودن فایل
                    </Button>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={isInternal}
                        disabled={!canReply || pendingAction !== null}
                        onChange={(event) =>
                          setIsInternal(event.target.checked)
                        }
                      />
                      یادداشت داخلی
                    </label>
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      void handleSend();
                    }}
                    disabled={
                      !canReply ||
                      !messageText.trim() ||
                      pendingAction !== null
                    }
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
