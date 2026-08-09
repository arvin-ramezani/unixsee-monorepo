"use client";

import { useState, type FormEvent } from "react";
import { AlertTriangle, CheckCircle2, Copy, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { createEnrollmentToken } from "@/lib/data/servers-data";

export type EnrollmentRevealPayload = {
  token: string;
  installCommand: string;
  issuedAt: string;
  expiresAt: string;
  mode: "issue" | "reissue";
};

type EnrollmentRevealSheetProps = {
  open: boolean;
  serverLabel: string;
  mode: "issue" | "reissue";
  onOpenChange: (open: boolean) => void;
  onIssued: (payload: EnrollmentRevealPayload) => void;
};

function EnrollmentRevealContent({
  serverLabel,
  mode,
  onClose,
  onIssued,
}: {
  serverLabel: string;
  mode: "issue" | "reissue";
  onClose: () => void;
  onIssued: (payload: EnrollmentRevealPayload) => void;
}) {
  const [payload] = useState(() => {
    const created = createEnrollmentToken(serverLabel);
    return {
      ...created,
      mode,
    } satisfies EnrollmentRevealPayload;
  });
  const [copiedField, setCopiedField] = useState<"token" | "command" | null>(
    null,
  );
  const [confirmed, setConfirmed] = useState(false);

  const handleCopy = async (field: "token" | "command", value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
    } catch {
      setCopiedField(null);
    }
  };

  const handleDismiss = () => {
    onIssued(payload);
    onClose();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="app-scrollbar flex-1 space-y-5 overflow-y-auto px-4 pb-6">
        <div
          className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          role="alert"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            این توکن فقط یک‌بار نمایش داده می‌شود. پس از بستن این پنل دیگر قابل
            بازیابی نیست. در صورت تردید، توکن را باطل و دوباره صادر کنید.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <KeyRound className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-medium">
                {mode === "reissue" ? "صدور مجدد توکن" : "توکن اتصال Agent"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                سرور <span dir="ltr">{serverLabel}</span> · انقضا:{" "}
                {payload.expiresAt}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="enrollment-token" className="text-sm font-medium">
              توکن یک‌بارمصرف
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => handleCopy("token", payload.token)}
            >
              <Copy className="size-3.5" aria-hidden="true" />
              {copiedField === "token" ? "کپی شد" : "کپی"}
            </Button>
          </div>
          <div
            id="enrollment-token"
            className="rounded-xl border border-border bg-card px-3 py-3 font-mono text-sm break-all"
            dir="ltr"
          >
            {payload.token}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="install-command" className="text-sm font-medium">
              دستور نصب روی VPS
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => handleCopy("command", payload.installCommand)}
            >
              <Copy className="size-3.5" aria-hidden="true" />
              {copiedField === "command" ? "کپی شد" : "کپی"}
            </Button>
          </div>
          <div
            id="install-command"
            className="rounded-xl border border-border bg-card px-3 py-3 font-mono text-xs break-all"
            dir="ltr"
          >
            {payload.installCommand}
          </div>
          <p className="text-xs text-muted-foreground">
            اتصال واقعی از Agent به NestJS انجام می‌شود؛ این پنل فقط راهنمای نصب
            را نشان می‌دهد.
          </p>
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 text-sm">
          <input
            type="checkbox"
            className="mt-1 size-4 accent-primary"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
          />
          <span>
            توکن را ذخیره کردم و می‌دانم پس از بستن پنل دیگر نمایش داده نمی‌شود.
          </span>
        </label>
      </div>

      <SheetFooter className="border-t border-border bg-card">
        <Button type="button" disabled={!confirmed} onClick={handleDismiss}>
          بستن و ادامه
        </Button>
      </SheetFooter>
    </div>
  );
}

export function EnrollmentRevealSheet({
  open,
  serverLabel,
  mode,
  onOpenChange,
  onIssued,
}: EnrollmentRevealSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 sm:max-w-xl"
        aria-describedby="enrollment-reveal-description"
      >
        <SheetHeader className="border-b border-border pe-12">
          <SheetTitle>
            {mode === "reissue" ? "صدور مجدد توکن اتصال" : "صدور توکن اتصال"}
          </SheetTitle>
          <SheetDescription id="enrollment-reveal-description">
            توکن را کپی کنید و روی VPS نصب کنید. مقدار متنی توکن بعداً قابل مشاهده
            نیست.
          </SheetDescription>
        </SheetHeader>

        {open && (
          <EnrollmentRevealContent
            key={`${serverLabel}-${mode}-${String(open)}`}
            serverLabel={serverLabel}
            mode={mode}
            onClose={() => onOpenChange(false)}
            onIssued={onIssued}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

type RevokeAgentSheetProps = {
  open: boolean;
  serverLabel: string;
  onOpenChange: (open: boolean) => void;
  onRevoke: (reason: string) => void;
};

export function RevokeAgentSheet({
  open,
  serverLabel,
  onOpenChange,
  onRevoke,
}: RevokeAgentSheetProps) {
  const [reason, setReason] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reason.trim()) return;
    onRevoke(reason.trim());
    onOpenChange(false);
    setReason("");
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) setReason("");
      }}
    >
      <SheetContent
        side="right"
        className="w-full gap-0 sm:max-w-lg"
        aria-describedby="revoke-agent-description"
      >
        <SheetHeader className="border-b border-border pe-12">
          <SheetTitle>باطل‌سازی Agent</SheetTitle>
          <SheetDescription id="revoke-agent-description">
            اعتبار فعلی Agent برای سرور {serverLabel} باطل می‌شود و اتصال مجدد
            نیازمند توکن جدید است.
          </SheetDescription>
        </SheetHeader>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="app-scrollbar flex-1 space-y-5 overflow-y-auto px-4 pb-6">
            <div
              className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
            >
              <AlertTriangle
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <p>
                این اقدام برگشت‌پذیر نیست. تا صدور توکن جدید، داده‌های پایش از این
                سرور دریافت نمی‌شود.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="revoke-reason" className="text-sm font-medium">
                دلیل باطل‌سازی
              </label>
              <Textarea
                id="revoke-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                required
                className="min-h-28"
                placeholder="مثلاً مشکوک به افشای اعتبار یا قطع طولانی"
              />
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <p>
                در نسخه نهایی، NestJS اعتبار قبلی را باطل می‌کند. اینجا فقط حالت
                رابط کاربری شبیه‌سازی می‌شود.
              </p>
            </div>
          </div>

          <SheetFooter className="border-t border-border bg-card">
            <Button type="submit" variant="destructive" disabled={!reason.trim()}>
              تأیید باطل‌سازی
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              انصراف
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
