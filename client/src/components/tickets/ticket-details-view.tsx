"use client";

import { type FormEvent, useState } from "react";
import {
  CheckCircle2,
  Paperclip,
  LoaderCircle,
  MessageSquareReply,
  RotateCcw,
  Send,
  X,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useFormatter, useTranslations } from "next-intl";

import { Panel } from "@/components/dashboard/panel";
import { TicketStatusBadge } from "@/components/tickets/ticket-status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";
import type {
  TicketMessage,
  TicketRecord,
  TicketStatus,
} from "@/lib/data/tickets/ticket-records";
import { cn } from "@/lib/utils";
import {
  DashboardButton,
  DashboardButtonLink,
} from "@/app/[locale]/(dashboard)/dashboard/_components/common";

export function TicketDetailsView({ ticket }: { ticket: TicketRecord }) {
  const t = useTranslations("Tickets");
  const format = useFormatter();
  const prefersReducedMotion = useReducedMotion();
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [messages, setMessages] = useState(ticket.messages);
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState(false);
  const repliesAllowed = status !== "closed";

  function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) {
      setReplyError(true);
      return;
    }
    setSending(true);
    window.setTimeout(() => {
      const message: TicketMessage = {
        id: `local-${messages.length + 1}`,
        sender: "user",
        senderName: t("detail.you"),
        occurredAt: "2026-07-19T15:40:00Z",
        content: draft.trim(),
        attachments: attachments.map((file, index) => ({
          id: `local-att-${index}`,
          name: file.name,
          sizeKb: Math.max(1, Math.round(file.size / 1024)),
        })),
      };
      setMessages((current) => [...current, message]);
      setDraft("");
      setAttachments([]);
      setReplyError(false);
      setSending(false);
      if (status === "waiting_for_user") setStatus("in_progress");
    }, 500);
  }

  return (
    <div className="py-7">
      <Link
        href="/dashboard/tickets"
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex items-center justify-between gap-2 rounded-md text-sm transition-colors focus-visible:ring-2"
      >
        <ArrowLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
        {t("detail.back")}{" "}
      </Link>
      <header className="border-border mt-3 flex flex-col gap-5 border-b pb-6 lg:flex-row lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              {t(`fixtures.subjects.${ticket.subjectKey}`)}
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
              value={format.dateTime(
                new Date(ticket.lastActivityAt),
                "shortDate",
              )}
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
            {status === "resolved" && (
              <DashboardButton
                type="button"
                variant="outline"
                revealClassName="dark:bg-accent bg-muted"
                // size="plain"
                onClick={() => setStatus("in_progress")}
                className="border-border hover:bg-muted data-[radial-active=true]:text-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium focus-visible:ring-2"
              >
                <RotateCcw aria-hidden="true" className="size-4" />
                {t("detail.reopen")}
              </DashboardButton>
            )}
            {status !== "closed" && (
              <DashboardButton
                type="button"
                variant="outline"
                revealClassName="dark:bg-accent bg-muted"
                // size="plain"
                onClick={() => setStatus("closed")}
                className="border-border hover:bg-muted data-[radial-active=true]:text-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium focus-visible:ring-2"
              >
                {t("detail.close")}
              </DashboardButton>
            )}
          </div>
        </div>
      </header>

      {status === "resolved" && (
        <Alert className="border-success/25 bg-success/10 dark:text-success text-success-foreground mt-6 flex items-start gap-3 rounded-xl p-4">
          <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <div>
            <AlertTitle className="font-semibold">
              {t("detail.resolvedTitle")}
            </AlertTitle>
            <AlertDescription className="mt-1 text-sm leading-6 text-current">
              {t("detail.resolvedDescription")}
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
            </dl>
          </Panel>
        </aside>
      </div>

      <Panel id="ticket-reply" className="mt-6 p-5 sm:p-6">
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
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
              <div>
                <Label className="border-border dark:hover:border-link/12 dark:hover:bg-accent dark:hover:text-accent-foreground hover:bg-muted focus-within:ring-ring inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-medium focus-within:ring-2">
                  <Paperclip aria-hidden="true" className="size-4" />
                  {t("reply.attach")}
                  <Input
                    type="file"
                    multiple
                    className="absolute size-px! overflow-hidden border-0 p-0 whitespace-nowrap [clip:rect(0,0,0,0)]"
                    onChange={(event) =>
                      setAttachments(Array.from(event.target.files ?? []))
                    }
                  />
                </Label>
                <ul
                  className={cn(
                    "flex flex-wrap gap-2",
                    attachments.length > 0 && "mt-2",
                  )}
                >
                  <AnimatePresence initial={false} mode="popLayout">
                    {attachments.map((file, index) => (
                      <motion.li
                        key={`${file.name}-${file.size}`}
                        layout={!prefersReducedMotion}
                        initial={
                          prefersReducedMotion
                            ? { opacity: 0 }
                            : { opacity: 0, y: 6, scale: 0.9 }
                        }
                        animate={
                          prefersReducedMotion
                            ? { opacity: 1 }
                            : { opacity: 1, y: 0, scale: 1 }
                        }
                        exit={
                          prefersReducedMotion
                            ? { opacity: 0, transition: { duration: 0.12 } }
                            : {
                                opacity: 0,
                                scale: 0.85,
                                y: -4,
                                transition: { duration: 0.15, ease: "easeOut" },
                              }
                        }
                        transition={
                          prefersReducedMotion
                            ? { duration: 0.15 }
                            : {
                                duration: 0.28,
                                ease: [0.22, 1, 0.36, 1],
                                delay: index * 0.05,
                                layout: {
                                  duration: 0.25,
                                  ease: [0.22, 1, 0.36, 1],
                                },
                              }
                        }
                        className="bg-muted inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs"
                      >
                        <span className="max-w-48 truncate" dir="auto">
                          {file.name}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() =>
                            setAttachments((files) =>
                              files.filter((item) => item !== file),
                            )
                          }
                          aria-label={t("reply.remove", { name: file.name })}
                        >
                          <X aria-hidden="true" className="size-3.5" />
                        </Button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
              <DashboardButton
                type="submit"
                // size="plain"
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

  return (
    <article
      className={cn(
        "px-5 py-5 sm:px-6",
        message.sender === "support" && "bg-muted/30",
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{message.senderName}</h3>
          <p className="text-muted-foreground mt-1 text-xs">
            {t(`conversation.roles.${message.sender}`)}
          </p>
        </div>
        <time
          dateTime={message.occurredAt}
          className="text-muted-foreground text-xs tabular-nums"
        >
          {format.dateTime(new Date(message.occurredAt), "shortDate")} ·{" "}
          {format.dateTime(new Date(message.occurredAt), "shortTime")}
        </time>
      </header>
      <p className="mt-4 text-sm leading-7 whitespace-pre-line">
        {message.content ??
          (message.contentKey && t(`fixtures.messages.${message.contentKey}`))}
      </p>
      {message.attachments.length && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {message.attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="border-border bg-background inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 text-xs"
            >
              <Paperclip
                aria-hidden="true"
                className="text-muted-foreground size-3.5"
              />
              <span dir="ltr">{attachment.name}</span>
              <span className="text-muted-foreground">
                {t("conversation.attachmentSize", {
                  size: attachment.sizeKb,
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
