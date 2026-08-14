"use client";

import { useState, type FormEvent } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  SECURITY_ACTION,
  SECURITY_ACTION_LABELS,
  type CustomerUserType,
  type SecurityActionType,
} from "@/lib/data/users-data";

const SECURITY_ACTION_IMPACT: Record<SecurityActionType, string> = {
  [SECURITY_ACTION.SUSPEND]:
    "دسترسی مشتری به پنل و سرویس‌ها متوقف می‌شود و نشست‌های فعال پایان می‌یابد. وب‌سایت‌های مستأجر تا بازگردانی قابل تخصیص نیستند.",
  [SECURITY_ACTION.RESTORE]:
    "دسترسی مشتری بازمی‌گردد. اگر تماس تأییدنشده باقی مانده باشد، حساب در وضعیت در انتظار تأیید قرار می‌گیرد.",
  [SECURITY_ACTION.REVOKE_SESSIONS]:
    "همه نشست‌های فعال پایان می‌یابد و مشتری باید دوباره وارد شود. هیچ رمز یا کد ورودی نمایش داده نمی‌شود.",
  [SECURITY_ACTION.START_RECOVERY]:
    "فرایند بازیابی امن از کانال تأییدشده مشتری آغاز می‌شود. کارکنان هیچ‌گاه اطلاعات بازیابی را مشاهده نمی‌کنند.",
};

type SecurityActionDialogProps = {
  open: boolean;
  action: SecurityActionType | null;
  user: CustomerUserType;
  onOpenChange: (open: boolean) => void;
  onConfirm: (action: SecurityActionType, reason: string) => void;
};

function SecurityActionForm({
  action,
  actionLabel,
  isDestructive,
  reason,
  onReasonChange,
  onCancel,
  onSubmit,
}: {
  action: SecurityActionType;
  actionLabel: string;
  isDestructive: boolean;
  reason: string;
  onReasonChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const Footer = isDestructive ? AlertDialogFooter : DialogFooter;

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={onSubmit}>
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-6">
        <div
          className="flex items-start gap-2 rounded-xl border border-border bg-muted/30 p-3 text-sm"
          role="note"
        >
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <p>{SECURITY_ACTION_IMPACT[action]}</p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="security-action-reason" className="text-sm font-medium">
            دلیل اقدام
          </label>
          <Textarea
            id="security-action-reason"
            autoFocus
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            required
            aria-required="true"
            aria-describedby="security-action-reason-hint"
            className="min-h-28"
            placeholder="مثلاً درخواست واحد امنیت یا تماس تأییدشده مشتری"
          />
          <p
            id="security-action-reason-hint"
            className="text-xs text-muted-foreground"
          >
            دلیل الزامی است و همراه اقدام‌کننده و زمان در سابقه ثبت می‌شود. این
            اقدام برگشت خودکار ندارد.
          </p>
        </div>

        <div className="flex items-start gap-2 rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">
          <ShieldCheck
            className="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <p>
            رمز عبور، کد یک‌بارمصرف و اطلاعات بازیابی هرگز در پنل نمایش داده
            نمی‌شوند. در نسخه نهایی، NestJS اقدام را اعتبارسنجی و اعمال می‌کند.
          </p>
        </div>
      </div>

      <Footer>
        <Button
          type="submit"
          variant={isDestructive ? "destructive" : "default"}
          disabled={!reason.trim()}
        >
          تأیید {actionLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          انصراف
        </Button>
      </Footer>
    </form>
  );
}

export function SecurityActionDialog({
  open,
  action,
  user,
  onOpenChange,
  onConfirm,
}: SecurityActionDialogProps) {
  const [reason, setReason] = useState("");

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) setReason("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!action || !reason.trim()) return;

    onConfirm(action, reason.trim());
    handleOpenChange(false);
  };

  const actionLabel = action ? SECURITY_ACTION_LABELS[action] : "";
  const isDestructive = action === SECURITY_ACTION.SUSPEND;

  const form =
    action != null ? (
      <SecurityActionForm
        action={action}
        actionLabel={actionLabel}
        isDestructive={isDestructive}
        reason={reason}
        onReasonChange={setReason}
        onCancel={() => handleOpenChange(false)}
        onSubmit={handleSubmit}
      />
    ) : null;

  if (isDestructive) {
    return (
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent aria-describedby="security-action-description">
          <AlertDialogHeader className="border-b border-border">
            <AlertDialogTitle>{actionLabel}</AlertDialogTitle>
            <AlertDialogDescription id="security-action-description">
              این اقدام روی حساب {user.displayName} اعمال می‌شود و با ثبت دلیل در
              سابقه قابل بازبینی است.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {form}
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="gap-0"
        aria-describedby="security-action-description"
      >
        <DialogHeader className="border-b border-border">
          <DialogTitle>{actionLabel}</DialogTitle>
          <DialogDescription id="security-action-description">
            این اقدام روی حساب {user.displayName} اعمال می‌شود و با ثبت دلیل در
            سابقه قابل بازبینی است.
          </DialogDescription>
        </DialogHeader>
        {form}
      </DialogContent>
    </Dialog>
  );
}
