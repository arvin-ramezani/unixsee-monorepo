import type { UnixseeMessageItem } from "@/lib/unixsee-messages/types";

export function pickOldestUnread(
  items: UnixseeMessageItem[],
): UnixseeMessageItem | null {
  const unread = items.filter((item) => !item.isRead);
  if (unread.length === 0) return null;
  return [...unread].sort((a, b) => {
    const aTime = a.publishedAt ?? a.createdAt;
    const bTime = b.publishedAt ?? b.createdAt;
    return aTime.localeCompare(bTime);
  })[0];
}
