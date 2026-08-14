"use client";

import { useState, type FormEvent } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DeleteServerDialogProps = {
  open: boolean;
  serverLabel: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<boolean>;
};

export function DeleteServerDialog({
  open,
  serverLabel,
  onOpenChange,
  onConfirm,
}: DeleteServerDialogProps) {
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const canDelete = confirmation.trim() === serverLabel;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canDelete || pending) return;
    setPending(true);
    try {
      const ok = await onConfirm();
      if (ok) {
        setConfirmation("");
        onOpenChange(false);
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
        if (!nextOpen) setConfirmation("");
      }}
    >
      <AlertDialogContent aria-describedby="delete-server-description">
        <AlertDialogHeader className="border-b border-border">
          <AlertDialogTitle>حذف سرور</AlertDialogTitle>
          <AlertDialogDescription id="delete-server-description">
            سرور {serverLabel} حذف می‌شود. ابتدا توکن‌های اتصال و اعتبار Agent
            باطل می‌شوند.
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
                این اقدام برگشت‌پذیر نیست. توکن‌های فعال باطل می‌شوند، Agent قطع
                می‌شود، سپس رکورد سرور حذف می‌گردد. اگر وب‌سایتی به این سرور
                وصل باشد، حذف رد می‌شود.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="delete-server-confirm" className="text-sm font-medium">
                برای تأیید، شناسه سرور را وارد کنید
              </label>
              <Input
                id="delete-server-confirm"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                dir="ltr"
                className="w-fit min-w-full"
                placeholder={serverLabel}
                autoComplete="off"
                disabled={pending}
                required
              />
            </div>
          </div>

          <AlertDialogFooter>
            <Button
              type="submit"
              variant="destructive"
              disabled={!canDelete || pending}
            >
              {pending ? "در حال حذف…" : "حذف سرور"}
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
