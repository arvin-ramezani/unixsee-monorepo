"use client";

import { useEffect, useTransition } from "react";
import { useTranslations } from "next-intl";

import { markUnixseeMessageReadAction } from "@/actions/unixsee-messages/mark-read";
import { DashboardFadeIn } from "@/components/dashboard/dashboard-fade-in";
import { Panel } from "@/components/dashboard/panel";
import { UnixseeMessageAttachments } from "@/components/unixsee-messages/unixsee-message-attachments";
import { UnixseeMessagesAside } from "@/components/unixsee-messages/unixsee-messages-aside";
import { Link } from "@/i18n/navigation";
import type { UnixseeMessageItem } from "@/lib/unixsee-messages/types";
import { Badge } from "../ui/badge";

type UnixseeMessageDetailViewProps = {
  message: UnixseeMessageItem;
};

export function UnixseeMessageDetailView({
  message,
}: UnixseeMessageDetailViewProps) {
  const t = useTranslations("UnixseeMessages");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (message.isRead) return;
    startTransition(async () => {
      await markUnixseeMessageReadAction(message.id);
    });
  }, [message.id, message.isRead]);

  const websiteLabel =
    message.website?.displayName?.trim() || message.website?.domain || null;

  return (
    <div className="mt-8 space-y-5">
      <div className="grid w-full gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="xl:hidden">
          <UnixseeMessagesAside
            websiteId={message.websiteId ?? message.website?.id}
            websiteLabel={websiteLabel}
          />
        </div>

        <DashboardFadeIn className="max-w-2xl min-w-0">
          <div className="space-y-5">
            <div>
              {message.isRead ? (
                <Badge
                  variant="outline"
                  className="bg-success text-success-foreground"
                >
                  {t("read")}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-destructive dark:bg-destructive/80 text-destructive-foreground dark:text-destructive-foreground/80"
                >
                  {t("unread")}
                </Badge>
              )}

              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                {message.title}
              </h1>
              {!!message.website && (
                <p className="text-muted-foreground mt-2 text-sm">
                  {t("websiteContext", {
                    website: websiteLabel ?? message.website.domain,
                  })}
                </p>
              )}
            </div>

            <p className="text-sm leading-7 whitespace-pre-wrap">
              {message.body}
            </p>

            {message.links.length > 0 && (
              <div>
                <h2 className="mb-2 text-sm font-medium">{t("links")}</h2>
                <ul className="space-y-1 text-sm">
                  {message.links.map((link, index) => (
                    <li key={`${link.url}-${index}`}>
                      {link.kind === "dashboard" ? (
                        <Link
                          href={link.url}
                          className="text-primary underline-offset-2 hover:underline"
                        >
                          {link.label || link.url}
                        </Link>
                      ) : (
                        <Link
                          href={link.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-primary underline-offset-2 hover:underline"
                        >
                          {link.label || link.url}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <UnixseeMessageAttachments attachments={message.attachments} />
          </div>
        </DashboardFadeIn>

        <UnixseeMessagesAside
          className="hidden self-start xl:sticky xl:top-24 xl:block"
          websiteId={message.websiteId ?? message.website?.id}
          websiteLabel={websiteLabel}
        />
      </div>
    </div>
  );
}
