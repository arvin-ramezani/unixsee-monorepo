"use client";

import { useState, type FormEvent } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";

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

type SecurityActionSheetProps = {
  open: boolean;
  action: SecurityActionType | null;
  user: CustomerUserType;
  onOpenChange: (open: boolean) => void;
  onConfirm: (action: SecurityActionType, reason: string) => void;
};

export function SecurityActionSheet({
  open,
  action,
  user,
  onOpenChange,
  onConfirm,
}: SecurityActionSheetProps) {
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

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 sm:max-w-lg"
        aria-describedby="security-action-description"
      >
        <SheetHeader className="border-b border-border pe-12">
          <SheetTitle>{actionLabel}</SheetTitle>
          <SheetDescription id="security-action-description">
            این اقدام روی حساب {user.displayName} اعمال می‌شود و با ثبت دلیل در
            سابقه قابل بازبینی است.
          </SheetDescription>
        </SheetHeader>

        {action && (
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
            <div className="app-scrollbar flex-1 space-y-5 overflow-y-auto px-4 pb-6">
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

              <div className="space-y-2">
                <label
                  htmlFor="security-action-reason"
                  className="text-sm font-medium"
                >
                  دلیل اقدام
                </label>
                <Textarea
                  id="security-action-reason"
                  autoFocus
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
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
                  دلیل الزامی است و همراه اقدام‌کننده و زمان در سابقه ثبت
                  می‌شود. این اقدام برگشت خودکار ندارد.
                </p>
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">
                <ShieldCheck
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <p>
                  رمز عبور، کد یک‌بارمصرف و اطلاعات بازیابی هرگز در پنل نمایش
                  داده نمی‌شوند. در نسخه نهایی، NestJS اقدام را اعتبارسنجی و
                  اعمال می‌کند.
                </p>
              </div>
            </div>

            <SheetFooter className="border-t border-border bg-card">
              <Button
                type="submit"
                variant={isDestructive ? "destructive" : "default"}
                disabled={!reason.trim()}
              >
                تأیید {actionLabel}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                انصراف
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
