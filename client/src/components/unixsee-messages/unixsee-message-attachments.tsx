"use client";

import { Download, Paperclip } from "lucide-react";
import { useTranslations } from "next-intl";

import type { UnixseeMessageAttachment } from "@/lib/unixsee-messages/types";
import { cn } from "@/lib/utils";

type UnixseeMessageAttachmentsProps = {
  attachments: UnixseeMessageAttachment[];
  className?: string;
};

function formatSizeBytes(sizeBytes: number): string {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(sizeBytes < 10 * 1024 ? 1 : 0)} KB`;
  }
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Attachment list with signed downloads when Nest returns `downloadUrl`.
 */
export function UnixseeMessageAttachments({
  attachments,
  className,
}: UnixseeMessageAttachmentsProps) {
  const t = useTranslations("UnixseeMessages");

  if (attachments.length === 0) return null;

  const anyDownloadable = attachments.some((item) => !!item.downloadUrl);

  return (
    <div className={cn(className)}>
      <h2 className="mb-2 text-sm font-medium">{t("attachments")}</h2>
      <ul className="space-y-2">
        {attachments.map((attachment) => {
          const sizeLabel = formatSizeBytes(attachment.sizeBytes);
          const canDownload = !!attachment.downloadUrl;

          if (canDownload) {
            return (
              <li key={attachment.id}>
                <a
                  href={attachment.downloadUrl!}
                  download={attachment.fileName}
                  className="border-border hover:bg-muted/40 focus-visible:ring-ring flex min-h-11 items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  <Paperclip
                    aria-hidden="true"
                    className="text-muted-foreground size-4 shrink-0"
                  />
                  <span className="min-w-0 flex-1 truncate text-start">
                    {attachment.fileName}
                    <span className="text-muted-foreground ms-2 text-xs">
                      {sizeLabel}
                    </span>
                  </span>
                  <Download
                    aria-hidden="true"
                    className="text-muted-foreground size-4 shrink-0"
                  />
                  <span className="sr-only">{t("attachmentDownload")}</span>
                </a>
              </li>
            );
          }

          return (
            <li key={attachment.id}>
              <div
                className="border-border text-muted-foreground flex min-h-11 items-center gap-3 rounded-lg border border-dashed px-3 py-2 text-sm"
                title={t("attachmentDownloadDeferred")}
              >
                <Paperclip aria-hidden="true" className="size-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate text-start">
                  {attachment.fileName}
                  <span className="ms-2 text-xs opacity-80">{sizeLabel}</span>
                </span>
                <Download
                  aria-hidden="true"
                  className="size-4 shrink-0 opacity-40"
                />
              </div>
            </li>
          );
        })}
      </ul>
      {!anyDownloadable && (
        <p className="text-muted-foreground mt-2 text-xs">
          {t("attachmentDownloadDeferred")}
        </p>
      )}
    </div>
  );
}
