"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  publishUnixseeMessageAction,
  withdrawUnixseeMessageAction,
} from "@/actions/unixsee-messages/unixsee-message-actions";
import { toastApiErrorMessage } from "@/lib/api/toast-api-error";
import {
  UNIXSEE_CONTENT_LOCALE_LABELS,
  UNIXSEE_MESSAGE_STATUS,
  UNIXSEE_MESSAGE_STATUS_LABELS,
  type UnixseeMessageType,
} from "@/lib/data/unixsee-messages-data";
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
import { UnixseeMessageComposeForm } from "@/components/unixsee-messages/unixsee-message-compose-form";
import type { TenantOption } from "@/components/unixsee-messages/unixsee-message-compose-form";
import { loadUnixseeComposeContextAction } from "@/actions/unixsee-messages/load-compose-context";

type UnixseeMessageDetailsViewProps = {
  message: UnixseeMessageType;
  tenants: TenantOption[];
};

function formatWhen(value: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("fa-IR");
  } catch {
    return value;
  }
}

export function UnixseeMessageDetailsView({
  message,
  tenants,
}: UnixseeMessageDetailsViewProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const publish = () => {
    startTransition(async () => {
      const result = await publishUnixseeMessageAction(message.id);
      if (!result.ok) {
        toastApiErrorMessage(result.message);
        return;
      }
      toast.success("پیام منتشر شد");
      router.refresh();
    });
  };

  const withdraw = () => {
    startTransition(async () => {
      const result = await withdrawUnixseeMessageAction(message.id);
      if (!result.ok) {
        toastApiErrorMessage(result.message);
        return;
      }
      toast.success("پیام بازپس گرفته شد");
      setWithdrawOpen(false);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminBackLink
        href="/unixsee-messages"
        aria-label="بازگشت به پیام‌های یونیکسی"
      >
        بازگشت به پیام‌های یونیکسی
      </AdminBackLink>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {UNIXSEE_MESSAGE_STATUS_LABELS[message.status]} ·{" "}
            {UNIXSEE_CONTENT_LOCALE_LABELS[message.contentLocale]}
          </p>
          <h2 className="mt-1 text-xl font-semibold">{message.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            مستأجر: {message.tenantLabel}
            {!!message.websiteLabel && ` · وب‌سایت: ${message.websiteLabel}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {message.status !== UNIXSEE_MESSAGE_STATUS.WITHDRAWN && (
            <Button variant="outline" onClick={() => setEditing((v) => !v)}>
              {editing ? "بستن ویرایش" : "ویرایش"}
            </Button>
          )}
          {message.status === UNIXSEE_MESSAGE_STATUS.DRAFT && (
            <Button disabled={pending} onClick={publish}>
              انتشار
            </Button>
          )}
          {message.status === UNIXSEE_MESSAGE_STATUS.PUBLISHED && (
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() => setWithdrawOpen(true)}
            >
              بازپس‌گیری
            </Button>
          )}
        </div>
      </div>

      {!editing && (
        <div className="space-y-4 rounded-xl border p-4">
          <p className="whitespace-pre-wrap text-sm leading-6">{message.body}</p>
          {message.links.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">پیوندها</p>
              <ul className="space-y-1 text-sm">
                {message.links.map((link, index) => (
                  <li key={`${link.url}-${index}`}>
                    <a
                      href={link.url}
                      className="text-primary underline-offset-2 hover:underline"
                      target={link.kind === "external" ? "_blank" : undefined}
                      rel={
                        link.kind === "external"
                          ? "noreferrer noopener"
                          : undefined
                      }
                    >
                      {link.label || link.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {message.attachments.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">پیوست‌ها</p>
              <ul className="space-y-1 text-sm">
                {message.attachments.map((attachment, index) => (
                  <li key={attachment.id ?? `${attachment.storageKey}-${index}`}>
                    {attachment.downloadUrl ? (
                      <a
                        href={attachment.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground hover:underline"
                      >
                        {attachment.fileName}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">
                        {attachment.fileName}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <dl className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <div>
              <dt>ایجاد</dt>
              <dd>{formatWhen(message.createdAt)}</dd>
            </div>
            <div>
              <dt>انتشار</dt>
              <dd>{formatWhen(message.publishedAt)}</dd>
            </div>
            <div>
              <dt>بازپس‌گیری</dt>
              <dd>{formatWhen(message.withdrawnAt)}</dd>
            </div>
          </dl>
        </div>
      )}

      {editing && (
        <UnixseeMessageComposeForm
          mode="edit"
          tenants={tenants}
          initialMessage={message}
          loadComposeContext={loadUnixseeComposeContextAction}
        />
      )}

      <AlertDialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>بازپس‌گیری پیام؟</AlertDialogTitle>
            <AlertDialogDescription>
              پس از بازپس‌گیری، این پیام دیگر در داشبورد مشتری به‌عنوان پیام فعال
              نمایش داده نمی‌شود.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={withdraw}
            >
              تأیید بازپس‌گیری
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
