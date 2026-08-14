"use client";

import { useState, type FormEvent } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type DeleteServerSheetProps = {
  open: boolean;
  serverLabel: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<boolean>;
};

export function DeleteServerSheet({
  open,
  serverLabel,
  onOpenChange,
  onConfirm,
}: DeleteServerSheetProps) {
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
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) setConfirmation("");
      }}
    >
      <SheetContent
        side="right"
        className="w-full gap-0 sm:max-w-lg"
        aria-describedby="delete-server-description"
      >
        <SheetHeader className="border-b border-border pe-12">
          <SheetTitle>حذف سرور</SheetTitle>
          <SheetDescription id="delete-server-description">
            سرور {serverLabel} حذف می‌شود. ابتدا توکن‌های اتصال و اعتبار Agent
            باطل می‌شوند.
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
                این اقدام برگشت‌پذیر نیست. توکن‌های فعال باطل می‌شوند، Agent قطع
                می‌شود، سپس رکورد سرور حذف می‌گردد. اگر وب‌سایتی به این سرور
                وصل باشد، حذف رد می‌شود.
              </p>
            </div>

            <div className="space-y-2">
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

          <SheetFooter className="border-t border-border bg-card">
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
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
