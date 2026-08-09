"use client";

import { useEffect, useRef } from "react";

import { usePathname } from "@/i18n/navigation";
import { markNotificationAsSeen } from "@/components/notifications/notification-seen-store";

export function NotificationSeenMarker({
  notificationId,
}: {
  notificationId: string;
}) {
  const pathname = usePathname();
  const mounted = useRef(false);

  useEffect(() => {
    markNotificationAsSeen(notificationId);
  }, [notificationId]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    document.getElementById("notification-heading")?.focus();
  }, [pathname]);

  return null;
}
