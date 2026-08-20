"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { markUnixseeMessageReadAction } from "@/actions/unixsee-messages/mark-read";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { clientFetch } from "@/lib/api/client-fetch";
import { Link } from "@/i18n/navigation";
import type {
  UnixseeMessageItem,
  UnixseeMessageListResponse,
} from "@/lib/unixsee-messages/types";
import { pickOldestUnread } from "@/lib/unixsee-messages/unixsee-messages-utils";
import { useScrollLock } from "@/hooks/use-scroll-lock";

const SESSION_SUPPRESS_KEY = "unixsee-messages-popup-dismissed-at";

type UnixseeMessagesPresenceProps = {
  onUnreadChange: (hasUnread: boolean) => void;
};

export function UnixseeMessagesPresence({
  onUnreadChange,
}: UnixseeMessagesPresenceProps) {
  const t = useTranslations("UnixseeMessages");
  const [popupMessage, setPopupMessage] = useState<UnixseeMessageItem | null>(
    null,
  );
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useScrollLock(open, "unixsee-message-popup");

  const load = useCallback(async () => {
    try {
      const response = await clientFetch<UnixseeMessageListResponse>(
        "/unixsee-messages?take=50&skip=0",
        { method: "GET" },
      );
      if (!response.success || !response.data) {
        onUnreadChange(false);
        return;
      }

      onUnreadChange(response.data.hasUnread);

      const suppressed = sessionStorage.getItem(SESSION_SUPPRESS_KEY);
      if (suppressed === "1") {
        return;
      }

      const oldest = pickOldestUnread(response.data.items);
      if (oldest) {
        setPopupMessage(oldest);
        setOpen(true);
      }
    } catch {
      onUnreadChange(false);
    }
  }, [onUnreadChange]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleOpenChange = (next: boolean) => {
    // Esc / backdrop: close without marking read (keep unread).
    if (!next) {
      setOpen(false);
      sessionStorage.setItem(SESSION_SUPPRESS_KEY, "1");
    }
  };

  const handleGotIt = () => {
    if (!popupMessage) return;
    setError(null);
    startTransition(async () => {
      const result = await markUnixseeMessageReadAction(popupMessage.id);
      if (!result.ok) {
        setError(t("markReadError"));
        return;
      }
      setOpen(false);
      setPopupMessage(null);
      sessionStorage.setItem(SESSION_SUPPRESS_KEY, "1");
      onUnreadChange(false);
      // Refresh presence without chaining another popup this visit.
      try {
        const response = await clientFetch<UnixseeMessageListResponse>(
          "/unixsee-messages?take=50&skip=0",
          { method: "GET" },
        );
        if (response.success && response.data) {
          onUnreadChange(response.data.hasUnread);
        }
      } catch {
        // keep cleared until next navigation
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md"
        aria-describedby="unixsee-message-popup-desc"
      >
        <DialogHeader>
          <DialogTitle>{popupMessage?.title ?? t("title")}</DialogTitle>
          <DialogDescription id="unixsee-message-popup-desc">
            {popupMessage?.body}
          </DialogDescription>
        </DialogHeader>

        {!!popupMessage?.website && (
          <p className="text-muted-foreground text-sm">
            {t("websiteContext", {
              website:
                popupMessage.website.displayName?.trim() ||
                popupMessage.website.domain,
            })}
          </p>
        )}

        {!!popupMessage?.links?.length && (
          <ul className="space-y-1 text-sm">
            {popupMessage.links.map((link, index) => (
              <li key={`${link.url}-${index}`}>
                {link.kind === "dashboard" ? (
                  <Link
                    href={link.url}
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    {link.label || link.url}
                  </Link>
                ) : (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    {link.label || link.url}
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}

        {!!error && (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button type="button" disabled={pending} onClick={handleGotIt}>
            {t("gotIt")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
