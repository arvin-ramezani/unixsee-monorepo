"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateContactMessageStatusAction } from "@/actions/contact-messages/contact-message-actions";
import { AdminBackLink } from "@/components/common/admin-back-link";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toastApiErrorMessage } from "@/lib/api/toast-api-error";
import {
  CONTACT_MESSAGE_STATUS,
  CONTACT_MESSAGE_STATUS_LABELS,
  type ContactMessageType,
} from "@/lib/data/contact-messages-data";
import { cn } from "@/lib/utils";

type ContactMessageDetailsViewProps = {
  message: ContactMessageType;
};

function formatWhen(value: string) {
  try {
    return new Date(value).toLocaleString("fa-IR");
  } catch {
    return value;
  }
}

function statusClassName(status: ContactMessageType["status"]) {
  if (status === CONTACT_MESSAGE_STATUS.NEW) {
    return "bg-amber-500/10 text-amber-700";
  }
  if (status === CONTACT_MESSAGE_STATUS.READ) {
    return "bg-emerald-500/10 text-emerald-700";
  }
  return "bg-muted text-muted-foreground";
}

export function ContactMessageDetailsView({
  message,
}: ContactMessageDetailsViewProps) {
  const router = useRouter();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const setStatus = (status: ContactMessageType["status"], success: string) => {
    startTransition(async () => {
      const result = await updateContactMessageStatusAction(message.id, status);
      if (!result.ok) {
        toastApiErrorMessage(result.message);
        return;
      }
      toast.success(success);
      setArchiveOpen(false);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminBackLink
        href="/contact-messages"
        aria-label="بازگشت به پیام‌های تماس"
      >
        بازگشت به پیام‌های تماس
      </AdminBackLink>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-0.5 text-xs",
                statusClassName(message.status),
              )}
            >
              {CONTACT_MESSAGE_STATUS_LABELS[message.status]}
            </span>
            <p className="text-sm text-muted-foreground">
              {message.subjectLabel}
              {!!message.source && ` · ${message.source}`}
              {!!message.locale && ` · ${message.locale}`}
            </p>
          </div>
          <h2 className="mt-1 text-xl font-semibold">{message.fullName}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            ثبت‌شده در {formatWhen(message.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {message.status === CONTACT_MESSAGE_STATUS.NEW && (
            <Button
              disabled={pending}
              onClick={() =>
                setStatus(CONTACT_MESSAGE_STATUS.READ, "پیام خوانده‌شده شد")
              }
            >
              علامت به‌عنوان خوانده‌شده
            </Button>
          )}
          {message.status !== CONTACT_MESSAGE_STATUS.ARCHIVED && (
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => setArchiveOpen(true)}
            >
              بایگانی
            </Button>
          )}
          {message.status === CONTACT_MESSAGE_STATUS.ARCHIVED && (
            <Button
              disabled={pending}
              onClick={() =>
                setStatus(
                  CONTACT_MESSAGE_STATUS.READ,
                  "پیام از بایگانی خارج شد",
                )
              }
            >
              خروج از بایگانی
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border p-4 md:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">ایمیل</p>
          <p className="mt-1 text-sm break-all">{message.email}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">تلفن</p>
          <p className="mt-1 text-sm" dir="ltr">
            {message.phone}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">وب‌سایت</p>
          <p className="mt-1 text-sm">{message.website || "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">حوزه فعالیت</p>
          <p className="mt-1 text-sm">{message.activityBasin || "—"}</p>
        </div>
      </div>

      <div className="space-y-2 rounded-xl border p-4">
        <p className="text-sm font-medium">متن پیام</p>
        <p className="whitespace-pre-wrap text-sm leading-6">
          {message.message || "—"}
        </p>
      </div>

      <div className="space-y-2 rounded-xl border p-4">
        <p className="text-sm font-medium">پیوست‌ها</p>
        {message.attachments.length === 0 ? (
          <p className="text-sm text-muted-foreground">پیوستی ندارد.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {message.attachments.map((attachment, index) => (
              <li
                key={`${attachment.storageKey}-${index}`}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <span className="break-all text-muted-foreground">
                  {attachment.storageKey}
                </span>
                {!!attachment.downloadUrl ? (
                  <a
                    href={attachment.downloadUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    دانلود
                  </a>
                ) : (
                  <span className="text-muted-foreground">
                    دانلود در دسترس نیست
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>بایگانی این پیام؟</AlertDialogTitle>
            <AlertDialogDescription>
              پیام از صف جدید/خوانده‌شده خارج می‌شود. در صورت نیاز می‌توانید
              بعداً آن را از بایگانی خارج کنید.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>انصراف</AlertDialogCancel>
            <Button
              disabled={pending}
              onClick={() =>
                setStatus(CONTACT_MESSAGE_STATUS.ARCHIVED, "پیام بایگانی شد")
              }
            >
              بایگانی
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
