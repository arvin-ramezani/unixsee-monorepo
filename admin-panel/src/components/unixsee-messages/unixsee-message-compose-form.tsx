"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  createUnixseeMessageAction,
  publishUnixseeMessageAction,
  removeUnixseeMessageAttachmentAction,
  updateUnixseeMessageAction,
  uploadUnixseeMessageAttachmentAction,
} from "@/actions/unixsee-messages/unixsee-message-actions";
import { toastApiErrorMessage } from "@/lib/api/toast-api-error";
import {
  UNIXSEE_CONTENT_LOCALE,
  UNIXSEE_CONTENT_LOCALE_LABELS,
  type UnixseeContentLocaleType,
  type UnixseeMessageAttachmentType,
  type UnixseeMessageLinkType,
  type UnixseeMessageType,
} from "@/lib/data/unixsee-messages-data";
import type { AdminUnixseeComposeContextDto } from "@/lib/unixsee-messages/map-admin-unixsee-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type TenantOption = {
  id: string;
  label: string;
};

type UnixseeMessageComposeFormProps = {
  mode: "create" | "edit";
  tenants: TenantOption[];
  initialMessage?: UnixseeMessageType;
  loadComposeContext: (
    tenantId: string,
  ) => Promise<AdminUnixseeComposeContextDto | null>;
};

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
]);
const MAX_FILES = 5;
const MAX_BYTES = 5 * 1024 * 1024;

type PendingFile = {
  id: string;
  file: File;
};

export function UnixseeMessageComposeForm({
  mode,
  tenants,
  initialMessage,
  loadComposeContext,
}: UnixseeMessageComposeFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [tenantId, setTenantId] = useState(
    initialMessage?.tenantId ?? tenants[0]?.id ?? "",
  );
  const [title, setTitle] = useState(initialMessage?.title ?? "");
  const [body, setBody] = useState(initialMessage?.body ?? "");
  const [contentLocale, setContentLocale] = useState<UnixseeContentLocaleType>(
    initialMessage?.contentLocale ?? UNIXSEE_CONTENT_LOCALE.fa,
  );
  const [websiteId, setWebsiteId] = useState(initialMessage?.websiteId ?? "");
  const [links, setLinks] = useState<UnixseeMessageLinkType[]>(
    initialMessage?.links ?? [],
  );
  const [existingAttachments, setExistingAttachments] = useState<
    UnixseeMessageAttachmentType[]
  >(initialMessage?.attachments ?? []);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [preferredLocale, setPreferredLocale] = useState<UnixseeContentLocaleType>(
    initialMessage?.recipientPreferredLocale ?? UNIXSEE_CONTENT_LOCALE.fa,
  );
  const [preferredLabel, setPreferredLabel] = useState(
    initialMessage?.recipientPreferredLocaleLabel ?? "فارسی",
  );
  const [websites, setWebsites] = useState<
    Array<{ id: string; domain: string; displayName?: string | null }>
  >([]);

  useEffect(() => {
    if (!tenantId || mode === "edit") return;
    let cancelled = false;
    void (async () => {
      const context = await loadComposeContext(tenantId);
      if (cancelled || !context) return;
      const locale =
        context.recipientPreferredLocale === "en"
          ? UNIXSEE_CONTENT_LOCALE.en
          : UNIXSEE_CONTENT_LOCALE.fa;
      setPreferredLocale(locale);
      setPreferredLabel(context.recipientPreferredLocaleLabel);
      setContentLocale(locale);
      setWebsites(context.websites);
      setWebsiteId("");
    })();
    return () => {
      cancelled = true;
    };
  }, [tenantId, mode, loadComposeContext]);

  useEffect(() => {
    if (mode !== "edit" || !tenantId) return;
    let cancelled = false;
    void (async () => {
      const context = await loadComposeContext(tenantId);
      if (cancelled || !context) return;
      setPreferredLocale(
        context.recipientPreferredLocale === "en"
          ? UNIXSEE_CONTENT_LOCALE.en
          : UNIXSEE_CONTENT_LOCALE.fa,
      );
      setPreferredLabel(context.recipientPreferredLocaleLabel);
      setWebsites(context.websites);
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, tenantId, loadComposeContext]);

  const canSubmit = useMemo(
    () => Boolean(tenantId && title.trim() && body.trim() && contentLocale),
    [tenantId, title, body, contentLocale],
  );

  const selectedTenantLabel = useMemo(
    () => tenants.find((tenant) => tenant.id === tenantId)?.label,
    [tenants, tenantId],
  );

  const selectedWebsiteLabel = useMemo(() => {
    if (!websiteId) return "بدون وب‌سایت";
    const website = websites.find((item) => item.id === websiteId);
    return website?.displayName?.trim() || website?.domain || "بدون وب‌سایت";
  }, [websiteId, websites]);

  const onPickFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const next = [...pendingFiles];
    for (const file of Array.from(fileList)) {
      if (existingAttachments.length + next.length >= MAX_FILES) break;
      if (!ALLOWED_TYPES.has(file.type) || file.size > MAX_BYTES) {
        toast.error("نوع یا حجم فایل مجاز نیست");
        continue;
      }
      next.push({ id: crypto.randomUUID(), file });
    }
    setPendingFiles(next);
  };

  const save = (andPublish: boolean) => {
    if (!canSubmit) return;
    startTransition(async () => {
      const payload = {
        title: title.trim(),
        body: body.trim(),
        contentLocale,
        websiteId: websiteId || null,
        links: links.filter((link) => link.url.trim()),
      };

      const result =
        mode === "create"
          ? await createUnixseeMessageAction({
              tenantId,
              ...payload,
            })
          : await updateUnixseeMessageAction(initialMessage!.id, payload);

      if (!result.ok) {
        toastApiErrorMessage(result.message);
        return;
      }

      const id = result.id ?? initialMessage?.id;
      if (!id) {
        toast.error("شناسه پیام در دسترس نیست");
        return;
      }

      if (mode === "edit" && initialMessage) {
        const keptIds = new Set(
          existingAttachments
            .map((attachment) => attachment.id)
            .filter((value): value is string => Boolean(value)),
        );
        for (const attachment of initialMessage.attachments) {
          if (!attachment.id || keptIds.has(attachment.id)) continue;
          const removed = await removeUnixseeMessageAttachmentAction(
            id,
            attachment.id,
          );
          if (!removed.ok) {
            toastApiErrorMessage(removed.message);
            router.push(`/unixsee-messages/${id}`);
            return;
          }
        }
      }

      for (const pendingFile of pendingFiles) {
        const formData = new FormData();
        formData.append("file", pendingFile.file);
        const uploaded = await uploadUnixseeMessageAttachmentAction(
          id,
          formData,
        );
        if (!uploaded.ok) {
          toastApiErrorMessage(uploaded.message);
          router.push(`/unixsee-messages/${id}`);
          return;
        }
      }

      if (andPublish) {
        const published = await publishUnixseeMessageAction(id);
        if (!published.ok) {
          toastApiErrorMessage(published.message);
          router.push(`/unixsee-messages/${id}`);
          return;
        }
        toast.success("پیام منتشر شد");
      } else {
        toast.success(mode === "create" ? "پیش‌نویس ذخیره شد" : "پیام به‌روز شد");
      }

      router.push(`/unixsee-messages/${id}`);
      router.refresh();
    });
  };

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      {mode === "create" && (
        <div className="space-y-2">
          <label htmlFor="tenant" className="text-sm font-medium">
            مستأجر
          </label>
          <Select value={tenantId} onValueChange={(value) => setTenantId(value ?? "")}>
            <SelectTrigger id="tenant" className="w-full max-w-full min-w-0">
              <SelectValue
                placeholder="انتخاب مستأجر"
                className="min-w-0 text-start"
              >
                {selectedTenantLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              {tenants.map((tenant) => (
                <SelectItem key={tenant.id} value={tenant.id}>
                  {tenant.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {!!tenantId && (
        <div
          className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm"
          role="status"
        >
          زبان ترجیحی کاربر:{" "}
          <strong>
            {preferredLabel} ({preferredLocale})
          </strong>
          . پیام را به همین زبان بنویسید.
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="contentLocale" className="text-sm font-medium">
          زبان پیام
        </label>
        <Select
          value={contentLocale}
          onValueChange={(value) =>
            setContentLocale((value as UnixseeContentLocaleType) ?? "fa")
          }
        >
          <SelectTrigger id="contentLocale" className="w-full max-w-full min-w-0">
            <SelectValue className="min-w-0 text-start">
              {UNIXSEE_CONTENT_LOCALE_LABELS[contentLocale]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {Object.values(UNIXSEE_CONTENT_LOCALE).map((locale) => (
              <SelectItem key={locale} value={locale}>
                {UNIXSEE_CONTENT_LOCALE_LABELS[locale]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          عنوان
        </label>
        <Input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="عنوان کوتاه"
        />
        <p className="text-xs text-muted-foreground">عنوان را کوتاه نگه دارید.</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="body" className="text-sm font-medium">
          متن
        </label>
        <Textarea
          id="body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={5}
          placeholder="حدود دو تا سه خط"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="website" className="text-sm font-medium">
          وب‌سایت (اختیاری)
        </label>
        <Select
          value={websiteId || "__none__"}
          onValueChange={(value) =>
            setWebsiteId(!value || value === "__none__" ? "" : value)
          }
        >
          <SelectTrigger id="website" className="w-full max-w-full min-w-0">
            <SelectValue
              placeholder="بدون وب‌سایت"
              className="min-w-0 text-start"
            >
              {selectedWebsiteLabel}
            </SelectValue>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectItem value="__none__">بدون وب‌سایت</SelectItem>
            {websites.map((website) => (
              <SelectItem key={website.id} value={website.id}>
                {website.displayName?.trim() || website.domain}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">پیوندها (اختیاری)</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setLinks((current) => [
                ...current,
                { url: "", kind: "external" },
              ])
            }
          >
            افزودن پیوند
          </Button>
        </div>
        {links.map((link, index) => (
          <div key={index} className="grid gap-2 rounded-lg border p-3 md:grid-cols-3">
            <Input
              aria-label="آدرس پیوند"
              placeholder="https://… یا مسیر داشبورد"
              value={link.url}
              onChange={(event) => {
                const next = [...links];
                next[index] = { ...link, url: event.target.value };
                setLinks(next);
              }}
            />
            <Select
              value={link.kind}
              onValueChange={(value) => {
                const next = [...links];
                next[index] = {
                  ...link,
                  kind: value === "dashboard" ? "dashboard" : "external",
                };
                setLinks(next);
              }}
            >
              <SelectTrigger aria-label="نوع پیوند" className="w-full min-w-0">
                <SelectValue className="min-w-0 text-start">
                  {link.kind === "dashboard" ? "داشبورد" : "خارجی"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectItem value="external">خارجی</SelectItem>
                <SelectItem value="dashboard">داشبورد</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setLinks(links.filter((_, i) => i !== index))}
            >
              حذف
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <label htmlFor="attachments" className="text-sm font-medium">
          پیوست‌ها (اختیاری)
        </label>
        <Input
          id="attachments"
          type="file"
          multiple
          accept=".png,.jpg,.jpeg,.webp,.pdf"
          onChange={(event) => onPickFiles(event.target.files)}
        />
        <p className="text-xs text-muted-foreground">
          حداکثر ۵ فایل، هر کدام تا ۵ مگابایت (png/jpeg/webp/pdf). فایل‌ها پس از
          ذخیره به فضای ابری آپلود می‌شوند.
        </p>
        {(existingAttachments.length > 0 || pendingFiles.length > 0) && (
          <ul className="space-y-1 text-sm">
            {existingAttachments.map((attachment) => (
              <li
                key={attachment.id ?? attachment.storageKey}
                className="flex items-center justify-between gap-2"
              >
                <span>{attachment.fileName}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`حذف ${attachment.fileName}`}
                  onClick={() =>
                    setExistingAttachments((current) =>
                      current.filter((item) => item.id !== attachment.id),
                    )
                  }
                >
                  حذف
                </Button>
              </li>
            ))}
            {pendingFiles.map((pendingFile) => (
              <li
                key={pendingFile.id}
                className="flex items-center justify-between gap-2"
              >
                <span>{pendingFile.file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`حذف ${pendingFile.file.name}`}
                  onClick={() =>
                    setPendingFiles((current) =>
                      current.filter((item) => item.id !== pendingFile.id),
                    )
                  }
                >
                  حذف
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!canSubmit || pending}
          onClick={() => save(false)}
        >
          ذخیره پیش‌نویس
        </Button>
        <Button
          type="button"
          disabled={!canSubmit || pending}
          onClick={() => save(true)}
        >
          ذخیره و انتشار
        </Button>
      </div>
    </div>
  );
}
