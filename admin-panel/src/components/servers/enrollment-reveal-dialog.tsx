"use client";

import { useState } from "react";
import { AlertTriangle, Copy, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { EnrollmentRevealPayload } from "@/actions/servers/server-actions";

type EnrollmentRevealDialogProps = {
  open: boolean;
  serverLabel: string;
  payload: EnrollmentRevealPayload | null;
  onOpenChange: (open: boolean) => void;
  onDismissed: () => void;
};

function EnrollmentRevealContent({
  serverLabel,
  payload,
  acknowledged,
  onAcknowledgedChange,
  onDismiss,
}: {
  serverLabel: string;
  payload: EnrollmentRevealPayload;
  acknowledged: boolean;
  onAcknowledgedChange: (value: boolean) => void;
  onDismiss: () => void;
}) {
  const [copiedField, setCopiedField] = useState<"token" | "command" | null>(
    null,
  );

  const handleCopy = async (field: "token" | "command", value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
    } catch {
      setCopiedField(null);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-6">
        <div
          className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          role="alert"
        >
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <p>
            این توکن فقط یک‌بار نمایش داده می‌شود. پس از بستن این پنجره دیگر
            قابل بازیابی نیست. در صورت تردید، توکن را باطل و دوباره صادر کنید.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <KeyRound className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-medium">
                {payload.mode === "reissue"
                  ? "صدور مجدد توکن"
                  : "توکن اتصال Agent"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                سرور <span dir="ltr">{serverLabel}</span> · انقضا:{" "}
                {payload.expiresAt}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
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

        <div className="flex flex-col gap-2">
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
            checked={acknowledged}
            onChange={(event) => onAcknowledgedChange(event.target.checked)}
          />
          <span className="select-none">
            توکن را ذخیره کردم و می‌دانم پس از بستن پنجره دیگر نمایش داده
            نمی‌شود.
          </span>
        </label>
      </div>

      <DialogFooter>
        <Button type="button" disabled={!acknowledged} onClick={onDismiss}>
          بستن و ادامه
        </Button>
      </DialogFooter>
    </div>
  );
}

export function EnrollmentRevealDialog({
  open,
  serverLabel,
  payload,
  onOpenChange,
  onDismissed,
}: EnrollmentRevealDialogProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !acknowledged) return;
    onOpenChange(nextOpen);
    if (!nextOpen) setAcknowledged(false);
  };

  const handleDismiss = () => {
    if (!acknowledged) return;
    onDismissed();
    onOpenChange(false);
    setAcknowledged(false);
  };

  return (
    <Dialog
      open={open}
      disablePointerDismissal
      onOpenChange={handleOpenChange}
    >
      <DialogContent
        className="max-w-xl gap-0"
        showCloseButton={false}
        aria-describedby="enrollment-reveal-description"
      >
        <DialogHeader className="border-b border-border">
          <DialogTitle>
            {payload?.mode === "reissue"
              ? "صدور مجدد توکن اتصال"
              : "صدور توکن اتصال"}
          </DialogTitle>
          <DialogDescription id="enrollment-reveal-description">
            توکن را کپی کنید و روی VPS نصب کنید. مقدار متنی توکن بعداً قابل
            مشاهده نیست.
          </DialogDescription>
        </DialogHeader>

        {open && payload ? (
          <EnrollmentRevealContent
            key={`${serverLabel}-${payload.tokenId}`}
            serverLabel={serverLabel}
            payload={payload}
            acknowledged={acknowledged}
            onAcknowledgedChange={setAcknowledged}
            onDismiss={handleDismiss}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
