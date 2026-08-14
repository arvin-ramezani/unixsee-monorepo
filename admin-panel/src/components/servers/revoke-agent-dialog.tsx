"use client";

import { useState, type FormEvent } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

type RevokeAgentDialogProps = {
  open: boolean;
  serverLabel: string;
  onOpenChange: (open: boolean) => void;
  onRevoke: (reason: string) => Promise<boolean> | boolean;
};

export function RevokeAgentDialog({
  open,
  serverLabel,
  onOpenChange,
  onRevoke,
}: RevokeAgentDialogProps) {
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reason.trim()) return;
    setPending(true);
    try {
      const ok = await onRevoke(reason.trim());
      if (ok) {
        onOpenChange(false);
        setReason("");
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) setReason("");
      }}
    >
      <AlertDialogContent aria-describedby="revoke-agent-description">
        <AlertDialogHeader className="border-b border-border">
          <AlertDialogTitle>باطل‌سازی Agent</AlertDialogTitle>
          <AlertDialogDescription id="revoke-agent-description">
            اعتبار فعلی Agent برای سرور {serverLabel} باطل می‌شود و اتصال مجدد
            نیازمند توکن جدید است.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
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
                این اقدام برگشت‌پذیر نیست. تا صدور توکن جدید، داده‌های پایش از
                این سرور دریافت نمی‌شود.
              </p>
            </div>

            <div className="flex flex-col gap-2">
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
                disabled={pending}
              />
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <p>
                NestJS اعتبار قبلی Agent را باطل می‌کند. برای اتصال مجدد باید
                توکن جدید صادر کنید.
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <Button
              type="submit"
              variant="destructive"
              disabled={!reason.trim() || pending}
            >
              {pending ? "در حال باطل‌سازی…" : "تأیید باطل‌سازی"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              انصراف
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
