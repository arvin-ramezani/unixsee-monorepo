"use client";

import { useSyncExternalStore } from "react";

export const notificationSeenStorageKey = "unixsee.seen-notifications";
const changeEvent = "unixsee:notifications-seen-change";

function readSnapshot() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(notificationSeenStorageKey) ?? "";
}

function subscribe(onStoreChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === notificationSeenStorageKey) onStoreChange();
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(changeEvent, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(changeEvent, onStoreChange);
  };
}

function writeSeenIds(ids: Iterable<string>) {
  const value = [...new Set(ids)].sort().join(",");
  window.localStorage.setItem(notificationSeenStorageKey, value);
  window.dispatchEvent(new Event(changeEvent));
}

export function useStoredSeenNotificationIds() {
  const snapshot = useSyncExternalStore(subscribe, readSnapshot, () => "");
  return new Set(snapshot.split(",").filter(Boolean));
}

export function markNotificationAsSeen(notificationId: string) {
  if (typeof window === "undefined") return;
  const seenIds = new Set(readSnapshot().split(",").filter(Boolean));
  seenIds.add(notificationId);
  writeSeenIds(seenIds);
}

export function markNotificationsAsSeen(notificationIds: readonly string[]) {
  if (typeof window === "undefined") return;
  const seenIds = new Set(readSnapshot().split(",").filter(Boolean));
  notificationIds.forEach((id) => seenIds.add(id));
  writeSeenIds(seenIds);
}
