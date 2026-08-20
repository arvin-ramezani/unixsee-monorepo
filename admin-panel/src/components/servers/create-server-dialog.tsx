"use client";

import { useState, type FormEvent } from "react";
import { Server } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type CreateServerValues = {
  name: string;
  ipAddress: string;
  notes: string;
};

type CreateServerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (values: CreateServerValues) => Promise<boolean> | boolean;
};

function CreateServerForm({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (values: CreateServerValues) => Promise<boolean> | boolean;
}) {
  const [name, setName] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    try {
      const ok = await onCreate({
        name: name.trim(),
        ipAddress: ipAddress.trim(),
        notes: notes.trim(),
      });
      if (ok) {
        onCancel();
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
      <div className="app-scrollbar flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-6">
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Server className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-medium">ثبت هویت VPS</p>
              <p className="mt-1 text-sm text-muted-foreground">
                فقط فراداده سرور ذخیره می‌شود. توکن اتصال Agent در مرحله بعد و
                فقط یک‌بار نمایش داده می‌شود.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="server-name" className="text-sm font-medium">
            شناسه سرور
          </label>
          <Input
            id="server-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="مثلاً VPS-IR-16"
            dir="ltr"
            required
            disabled={pending}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="server-ip" className="text-sm font-medium">
            آدرس IP
          </label>
          <Input
            id="server-ip"
            value={ipAddress}
            onChange={(event) => setIpAddress(event.target.value)}
            placeholder="مثلاً 203.0.113.10"
            dir="ltr"
            required
            disabled={pending}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="server-notes" className="text-sm font-medium">
            یادداشت داخلی
          </label>
          <Textarea
            id="server-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="یادداشت عملیاتی برای تیم"
            className="min-h-24"
            disabled={pending}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={pending}>
          {pending ? "در حال ایجاد…" : "ایجاد سرور"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={pending}
        >
          انصراف
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CreateServerDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateServerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-xl gap-0"
        aria-describedby="create-server-description"
      >
        <DialogHeader className="border-b border-border">
          <DialogTitle>ایجاد سرور</DialogTitle>
          <DialogDescription id="create-server-description">
            یک VPS جدید را در پنل ثبت کنید تا بتوانید توکن اتصال Agent را صادر
            کنید.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <CreateServerForm
            key={String(open)}
            onCancel={() => onOpenChange(false)}
            onCreate={onCreate}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
