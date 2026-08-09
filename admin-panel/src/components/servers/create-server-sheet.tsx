"use client";

import { useState, type FormEvent } from "react";
import { Server } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";

export type CreateServerValues = {
  label: string;
  location: string;
  capacitySummary: string;
  notes: string;
};

type CreateServerSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (values: CreateServerValues) => void;
};

const CREATE_SERVER_FIELDS = [
  {
    key: "label",
    label: "شناسه سرور",
    placeholder: "مثلاً VPS-IR-16",
    dir: "ltr" as const,
    required: true,
  },
  {
    key: "location",
    label: "موقعیت",
    placeholder: "مثلاً تهران، ایران",
    required: true,
  },
  {
    key: "capacitySummary",
    label: "ظرفیت",
    placeholder: "مثلاً ۴ vCPU · ۱۶ GB RAM · ۲۰۰ GB NVMe",
    dir: "ltr" as const,
    required: true,
  },
] as const;

function CreateServerForm({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (values: CreateServerValues) => void;
}) {
  const [label, setLabel] = useState("");
  const [location, setLocation] = useState("");
  const [capacitySummary, setCapacitySummary] = useState("");
  const [notes, setNotes] = useState("");

  const fieldValues: Record<(typeof CREATE_SERVER_FIELDS)[number]["key"], string> =
    {
      label,
      location,
      capacitySummary,
    };

  const fieldSetters: Record<
    (typeof CREATE_SERVER_FIELDS)[number]["key"],
    (value: string) => void
  > = {
    label: setLabel,
    location: setLocation,
    capacitySummary: setCapacitySummary,
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onCreate({
      label: label.trim(),
      location: location.trim(),
      capacitySummary: capacitySummary.trim(),
      notes: notes.trim(),
    });
  };

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
      <div className="app-scrollbar flex-1 space-y-5 overflow-y-auto px-4 pb-6">
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

        {CREATE_SERVER_FIELDS.map((field) => (
          <div key={field.key} className="space-y-2">
            <label htmlFor={`server-${field.key}`} className="text-sm font-medium">
              {field.label}
            </label>
            <Input
              id={`server-${field.key}`}
              value={fieldValues[field.key]}
              onChange={(event) => fieldSetters[field.key](event.target.value)}
              placeholder={field.placeholder}
              dir={"dir" in field ? field.dir : undefined}
              required={field.required}
            />
          </div>
        ))}

        <div className="space-y-2">
          <label htmlFor="server-notes" className="text-sm font-medium">
            یادداشت داخلی
          </label>
          <Textarea
            id="server-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="یادداشت عملیاتی برای تیم"
            className="min-h-24"
          />
        </div>
      </div>

      <SheetFooter className="border-t border-border bg-card">
        <Button type="submit">ایجاد سرور</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          انصراف
        </Button>
      </SheetFooter>
    </form>
  );
}

export function CreateServerSheet({
  open,
  onOpenChange,
  onCreate,
}: CreateServerSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 sm:max-w-xl"
        aria-describedby="create-server-description"
      >
        <SheetHeader className="border-b border-border pe-12">
          <SheetTitle>ایجاد سرور</SheetTitle>
          <SheetDescription id="create-server-description">
            یک VPS جدید را در پنل ثبت کنید تا بتوانید توکن اتصال Agent را صادر
            کنید.
          </SheetDescription>
        </SheetHeader>

        {open && (
          <CreateServerForm
            key={String(open)}
            onCancel={() => onOpenChange(false)}
            onCreate={(values) => {
              onCreate(values);
              onOpenChange(false);
            }}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
