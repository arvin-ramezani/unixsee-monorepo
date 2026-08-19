"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Paperclip,
  LoaderCircle,
  MessageSquareReply,
  RotateCcw,
  Send,
  ArrowLeft,
  X,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { addTicketMessageAction } from "@/actions/tickets/add-ticket-message";
import { closeTicketAction } from "@/actions/tickets/close-ticket";
import { downloadTicketAttachmentAction } from "@/actions/tickets/download-ticket-attachment";
import { reopenTicketAction } from "@/actions/tickets/reopen-ticket";
import { uploadTicketAttachmentAction } from "@/actions/tickets/upload-ticket-attachment";
import {
  DashboardButton,
  DashboardButtonLink,
} from "@/app/[locale]/(dashboard)/dashboard/_components/common";
import { Panel } from "@/components/dashboard/panel";
import { TicketStatusBadge } from "@/components/tickets/ticket-status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useRouter } from "@/i18n/navigation";
import { toastMappedApiError } from "@/lib/api/toast-api-error";
import type {
  TicketAttachment,
  TicketDetail,
  TicketMessage,
  TicketStatus,
} from "@/lib/tickets/types";
import { cn } from "@/lib/utils";

const MAX_ATTACHMENTS = 20;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = new Set([
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/csv",
  "text/plain",
]);

type PendingAttachment = {
  id: string;
  file: File;
};

export function TicketDetailsView({ ticket }: { ticket: TicketDetail }) {
  const t = useTranslations("Tickets");
  const tApiErrors = useTranslations("ApiErrors");
  const format = useFormatter();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [messages, setMessages] = useState(ticket.messages);
  const [attachments, setAttachments] = useState(ticket.attachments);
  const [autoCloseAt, setAutoCloseAt] = useState(ticket.autoCloseAt);
  const [draft, setDraft] = useState("");
  const [pendingFiles, setPendingFiles] = useState<PendingAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [replyError, setReplyError] = useState(false);
  const repliesAllowed = status !== "CLOSED";
  const attachmentsAllowed = status !== "CLOSED";

  useEffect(() => {
    setAttachments(ticket.attachments);
  }, [ticket.attachments]);

  function addFiles(fileList: FileList | null) {
    const nextFiles = Array.from(fileList ?? []);
    if (nextFiles.some((file) => file.size > MAX_ATTACHMENT_BYTES)) {
      setAttachmentError(t("reply.tooLarge"));
      return;
    }
    if (
      nextFiles.some(
        (file) => !file.type || !ALLOWED_ATTACHMENT_TYPES.has(file.type),
      )
    ) {
      setAttachmentError(t("reply.invalidType"));
      return;
    }
    setAttachmentError(null);
    setPendingFiles((current) =>
      [
        ...current,
        ...nextFiles.map((file) => ({
          id: crypto.randomUUID(),
          file,
        })),
      ].slice(0, Math.max(0, MAX_ATTACHMENTS - attachments.length)),
    );
  }

  async function uploadPendingFiles(ticketId: string) {
    const uploaded: TicketAttachment[] = [];
    for (const pending of pendingFiles) {
      const formData = new FormData();
      formData.append("file", pending.file);
      const uploadResult = await uploadTicketAttachmentAction(
        ticketId,
        formData,
      );
      if (!uploadResult.ok) {
        return { ok: false as const, error: uploadResult.error, uploaded };
      }
      uploaded.push(uploadResult.data);
    }
    return { ok: true as const, uploaded };
  }

  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const hasMessage = Boolean(draft.trim());
    if (!hasMessage && pendingFiles.length === 0) {
      setReplyError(true);
      return;
    }
    setSending(true);
    setReplyError(false);

    if (hasMessage) {
      const result = await addTicketMessageAction({
        ticketId: ticket.id,
        body: draft,
        idempotencyKey: crypto.randomUUID(),
      });

      if (!result.ok) {
        toastMappedApiError(result.error, tApiErrors);
        setSending(false);
        return;
      }

      setMessages((current) => [...current, result.data]);
      setDraft("");
      if (status === "WAITING_CUSTOMER") setStatus("IN_PROGRESS");
    }

    if (pendingFiles.length > 0) {
      const uploadResult = await uploadPendingFiles(ticket.id);
      if (!uploadResult.ok) {
        toastMappedApiError(uploadResult.error, tApiErrors);
        if (uploadResult.uploaded.length > 0) {
          setAttachments((current) => [...current, ...uploadResult.uploaded]);
        }
        setPendingFiles((current) =>
          current.slice(uploadResult.uploaded.length),
        );
        setSending(false);
        router.refresh();
        return;
      }
      setAttachments((current) => [...current, ...uploadResult.uploaded]);
      setPendingFiles([]);
    }

    setSending(false);
    router.refresh();
  }

  async function handleDownload(attachment: TicketAttachment) {
    if (attachment.downloadUrl) {
      window.open(attachment.downloadUrl, "_blank", "noopener,noreferrer");
      return;
    }

    setDownloadingId(attachment.id);
    const result = await downloadTicketAttachmentAction(
      ticket.id,
      attachment.id,
    );
    setDownloadingId(null);

    if (!result.ok) {
      toastMappedApiError(result.error, tApiErrors);
      return;
    }

    setAttachments((current) =>
      current.map((item) =>
        item.id === attachment.id
          ? { ...item, downloadUrl: result.data.downloadUrl }
          : item,
      ),
    );
    window.open(result.data.downloadUrl, "_blank", "noopener,noreferrer");
  }

  async function handleReopen() {
    setMutating(true);
    const result = await reopenTicketAction(ticket.id);
    if (!result.ok) {
      toastMappedApiError(result.error, tApiErrors);
      setMutating(false);
      return;
    }
    setStatus(result.data.status);
    setAutoCloseAt(result.data.autoCloseAt);
    setMutating(false);
    router.refresh();
  }

  async function handleClose() {
    setMutating(true);
    const result = await closeTicketAction(ticket.id);
    if (!result.ok) {
      toastMappedApiError(result.error, tApiErrors);
      setMutating(false);
      return;
    }
    setStatus(result.data.status);
    setAutoCloseAt(result.data.autoCloseAt);
    setMutating(false);
    router.refresh();
  }

  return (
    <div className="py-7">
      <Link
        href="/dashboard/tickets"
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex items-center justify-between gap-2 rounded-md text-sm transition-colors focus-visible:ring-2"
      >
        <ArrowLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
        {t("detail.back")}
      </Link>
      <header className="border-border mt-3 flex flex-col gap-5 border-b pb-6 lg:flex-row lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              {ticket.subject}
            </h1>
            <TicketStatusBadge status={status} />
          </div>
          <p
            dir="ltr"
            className="text-muted-foreground mt-2 w-fit text-start text-sm"
          >
            #{ticket.number}
          </p>
          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <Meta
              label={t("detail.service")}
              value={t(`services.${ticket.service}`)}
            />
            <Meta
              label={t("detail.website")}
              value={ticket.website?.name ?? t("notApplicable")}
            />
            <Meta
              label={t("detail.created")}
              value={format.dateTime(new Date(ticket.createdAt), "shortDate")}
            />
            <Meta
              label={t("detail.updated")}
              value={format.dateTime(new Date(ticket.updatedAt), "shortDate")}
            />
          </dl>
        </div>
        <div className="flex flex-col justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {repliesAllowed && (
              <DashboardButtonLink
                href="#ticket-reply"
                className="bg-primary text-primary-foreground focus-visible:ring-ring inline-flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium focus-visible:ring-2"
              >
                <MessageSquareReply aria-hidden="true" className="size-4" />
                {t("detail.reply")}
              </DashboardButtonLink>
            )}
            {status === "RESOLVED" && (
              <DashboardButton
                type="button"
                variant="outline"
                revealClassName="dark:bg-accent bg-muted"
                disabled={mutating}
                onClick={handleClose}
                className="border-border hover:bg-muted data-[radial-active=true]:text-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium focus-visible:ring-2"
              >
                {t("detail.close")}
              </DashboardButton>
            )}
            {status === "CLOSED" && (
              <DashboardButton
                type="button"
                variant="outline"
                revealClassName="dark:bg-accent bg-muted"
                disabled={mutating}
                onClick={handleReopen}
                className="border-border hover:bg-muted data-[radial-active=true]:text-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium focus-visible:ring-2"
              >
                <RotateCcw aria-hidden="true" className="size-4" />
                {t("detail.reopen")}
              </DashboardButton>
            )}
          </div>
        </div>
      </header>

      {status === "RESOLVED" && (
        <Alert className="border-success/25 bg-success/10 dark:text-success text-success-foreground mt-6 flex items-start gap-3 rounded-xl p-4">
          <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <div>
            <AlertTitle className="font-semibold">
              {t("detail.resolvedTitle")}
            </AlertTitle>
            <AlertDescription className="mt-1 text-sm leading-6 text-current">
              {autoCloseAt
                ? t("detail.resolvedDescriptionWithAutoClose", {
                    date: format.dateTime(new Date(autoCloseAt), "shortDate"),
                  })
                : t("detail.resolvedDescription")}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {status === "CLOSED" && (
        <Alert className="border-border bg-muted/40 text-foreground mt-6 flex items-start gap-3 rounded-xl p-4">
          <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <div>
            <AlertTitle className="font-semibold">
              {t("detail.closedTitle")}
            </AlertTitle>
            <AlertDescription className="mt-1 text-sm leading-6 text-current">
              {t("detail.closedDescription")}
            </AlertDescription>
          </div>
        </Alert>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Panel className="overflow-hidden">
          <div className="border-border border-b px-5 py-4 sm:px-6">
            <h2 className="text-xl font-semibold">{t("conversation.title")}</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {t("conversation.description")}
            </p>
          </div>
          <div className="divide-border divide-y">
            {messages.length ? (
              messages.map((message) => (
                <TicketMessageBlock key={message.id} message={message} />
              ))
            ) : (
              <p className="text-muted-foreground px-6 py-12 text-center text-sm">
                {t("conversation.empty")}
              </p>
            )}
          </div>
        </Panel>
        <aside className="self-start xl:sticky xl:top-28">
          <Panel className="p-5">
            <h2 className="text-lg font-semibold">{t("detail.summary")}</h2>
            <dl className="mt-4 space-y-4">
              <Meta
                label={t("detail.ticketNumber")}
                value={`#${ticket.number}`}
              />
              <Meta
                label={t("detail.service")}
                value={t(`services.${ticket.service}`)}
              />
              <Meta
                label={t("detail.website")}
                value={ticket.website?.domain ?? t("notApplicable")}
              />
              <div>
                <dt className="text-muted-foreground text-xs">
                  {t("table.status")}
                </dt>
                <dd className="mt-2">
                  <TicketStatusBadge status={status} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">
                  {t("detail.attachments")}
                </dt>
                <dd className="mt-2">
                  {attachments.length > 0 ? (
                    <ul className="space-y-2">
                      {attachments.map((attachment) => (
                        <li key={attachment.id} className="min-w-0">
                          <button
                            type="button"
                            disabled={downloadingId === attachment.id}
                            onClick={() => {
                              void handleDownload(attachment);
                            }}
                            className="text-link inline-flex max-w-full items-center gap-1.5 text-start text-sm hover:underline disabled:opacity-60"
                          >
                            {downloadingId === attachment.id ? (
                              <LoaderCircle
                                aria-hidden="true"
                                className="size-3.5 shrink-0 animate-spin"
                              />
                            ) : (
                              <Paperclip
                                aria-hidden="true"
                                className="size-3.5 shrink-0"
                              />
                            )}
                            <span className="truncate">
                              {attachment.fileName}
                            </span>
                            <span className="text-muted-foreground sr-only">
                              {t("detail.download")}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {t("detail.noAttachments")}
                    </p>
                  )}
                </dd>
              </div>
            </dl>
          </Panel>
        </aside>
      </div>

      <Panel
        id="ticket-reply"
        className="mt-6 p-5 sm:p-6 xl:w-[calc(100%-344px)]"
      >
        <h2 className="text-xl font-semibold">{t("reply.title")}</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {repliesAllowed ? t("reply.description") : t("reply.closed")}
        </p>
        {repliesAllowed && (
          <form onSubmit={sendReply} className="mt-5">
            <Label className="sr-only" htmlFor="ticket-reply-message">
              {t("reply.label")}
            </Label>
            <Textarea
              id="ticket-reply-message"
              rows={6}
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setReplyError(false);
              }}
              placeholder={t("reply.placeholder")}
              aria-invalid={replyError}
              className="border-border bg-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-24 w-full resize-y rounded-lg border px-3 py-3 outline-none placeholder:text-sm focus-visible:ring-2 rtl:font-light rtl:placeholder:font-light"
            />
            {replyError && (
              <p className="text-destructive mt-2 text-xs">
                {t("reply.required")}
              </p>
            )}
            {attachmentError && (
              <p className="text-destructive mt-2 text-xs">{attachmentError}</p>
            )}
            {pendingFiles.length > 0 && (
              <ul className="mt-3 space-y-2">
                {pendingFiles.map((pending) => (
                  <li
                    key={pending.id}
                    className="border-border bg-muted/20 flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                  >
                    <span className="truncate">{pending.file.name}</span>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-md"
                      aria-label={t("reply.remove", {
                        name: pending.file.name,
                      })}
                      onClick={() =>
                        setPendingFiles((current) =>
                          current.filter((item) => item.id !== pending.id),
                        )
                      }
                    >
                      <X aria-hidden="true" className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-2">
                {attachmentsAllowed && (
                  <>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.zip,.gif,.jpg,.jpeg,.png,.webp,.csv,.txt,application/pdf,application/zip,image/gif,image/jpeg,image/png,image/webp,text/csv,text/plain"
                      className="hidden"
                      onChange={(event) => {
                        addFiles(event.target.files);
                        event.target.value = "";
                      }}
                    />
                    <DashboardButton
                      type="button"
                      variant="outline"
                      disabled={sending}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-border hover:bg-muted inline-flex min-h-10 w-fit items-center gap-2 rounded-lg border px-3 text-sm"
                    >
                      <Paperclip aria-hidden="true" className="size-3.5" />
                      {t("reply.attach")}
                    </DashboardButton>
                    <p className="text-muted-foreground text-xs">
                      {t("reply.attachmentsHint")}
                    </p>
                  </>
                )}
              </div>
              <DashboardButton
                type="submit"
                disabled={sending}
                className="bg-primary text-primary-foreground focus-visible:ring-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium focus-visible:ring-2 disabled:opacity-60 sm:w-fit"
              >
                {sending ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-4 animate-spin"
                  />
                ) : (
                  <Send
                    aria-hidden="true"
                    className="size-4 rtl:-scale-x-100"
                  />
                )}
                {sending ? t("reply.sending") : t("reply.send")}
              </DashboardButton>
            </div>
          </form>
        )}
      </Panel>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}

function TicketMessageBlock({ message }: { message: TicketMessage }) {
  const t = useTranslations("Tickets");
  const format = useFormatter();
  const senderName =
    message.sender === "USER"
      ? message.author.fullName?.trim() || t("detail.you")
      : message.author.fullName?.trim() || t("conversation.roles.SUPPORT");

  return (
    <article
      className={cn(
        "px-5 py-5 sm:px-6",
        message.sender === "SUPPORT" && "bg-muted/30",
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{senderName}</h3>
          <p className="text-muted-foreground mt-1 text-xs">
            {t(`conversation.roles.${message.sender}`)}
          </p>
        </div>
        <time
          dateTime={message.createdAt}
          className="text-muted-foreground text-xs tabular-nums"
        >
          {format.dateTime(new Date(message.createdAt), "shortDate")} ·{" "}
          {format.dateTime(new Date(message.createdAt), "shortTime")}
        </time>
      </header>
      <p className="mt-4 text-sm leading-7 whitespace-pre-line">
        {message.body}
      </p>
    </article>
  );
}
