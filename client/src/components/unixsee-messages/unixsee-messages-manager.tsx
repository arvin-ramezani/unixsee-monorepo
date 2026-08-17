"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { markUnixseeMessageReadAction } from "@/actions/unixsee-messages/mark-read";
import { DashboardFadeIn } from "@/components/dashboard/dashboard-fade-in";
import { Link } from "@/i18n/navigation";
import type { UnixseeMessageItem } from "@/lib/unixsee-messages/types";
import { cn } from "@/lib/utils";

type UnixseeMessagesManagerProps = {
  messages: UnixseeMessageItem[];
  initialState: "ready" | "empty" | "error";
};

function formatWhen(value: string | null, locale: string) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString(locale === "fa" ? "fa-IR" : "en-US");
  } catch {
    return value;
  }
}

export function UnixseeMessagesManager({
  messages: initialMessages,
  initialState,
}: UnixseeMessagesManagerProps) {
  const t = useTranslations("UnixseeMessages");
  const [messages, setMessages] = useState(initialMessages);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const markRead = (messageId: string) => {
    const target = messages.find((item) => item.id === messageId);
    if (!target || target.isRead) return;
    setPendingId(messageId);
    startTransition(async () => {
      const result = await markUnixseeMessageReadAction(messageId);
      if (result.ok) {
        setMessages((current) =>
          current.map((item) =>
            item.id === messageId
              ? { ...item, isRead: true, readAt: new Date().toISOString() }
              : item,
          ),
        );
      }
      setPendingId(null);
    });
  };

  if (initialState === "error") {
    return (
      <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-6 text-sm">
        {t("loadError")}
      </div>
    );
  }

  if (initialState === "empty" || messages.length === 0) {
    return (
      <DashboardFadeIn className="text-muted-foreground rounded-xl border border-dashed px-4 py-10 text-center text-sm">
        {t("empty")}
      </DashboardFadeIn>
    );
  }

  return (
    <DashboardFadeIn className="space-y-3">
      <ul className="space-y-3">
        {messages.map((message) => (
          <li key={message.id}>
            <Link
              href={`/dashboard/unixsee-messages/${message.id}`}
              onClick={() => markRead(message.id)}
              className={cn(
                "hover:bg-muted/40 focus-visible:ring-ring block rounded-xl border p-4 transition-colors focus-visible:ring-2",
                !message.isRead && "border-primary/30 bg-primary/5",
              )}
              aria-busy={pending && pendingId === message.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{message.title}</p>
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                    {message.body}
                  </p>
                  {!!message.website && (
                    <p className="text-muted-foreground mt-2 text-xs">
                      {t("websiteContext", {
                        website:
                          message.website.displayName?.trim() ||
                          message.website.domain,
                      })}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-end">
                  {!message.isRead && (
                    <span className="bg-destructive inline-block size-2 rounded-full" />
                  )}
                  <p className="text-muted-foreground mt-2 text-xs">
                    {formatWhen(message.publishedAt, message.contentLocale)}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </DashboardFadeIn>
  );
}
