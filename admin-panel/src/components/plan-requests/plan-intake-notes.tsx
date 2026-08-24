"use client";

import { Globe2, ShoppingCart, Users, HardDrive, FileText } from "lucide-react";

type IntakeField = {
  key: string;
  label: string;
  value: string;
  icon?: typeof Globe2;
};

const INTAKE_LABELS: Record<string, string> = {
  Website: "وب‌سایت",
  "Database size": "حجم دیتابیس",
  "Daily visitors": "بازدید روزانه",
  "Content size": "حجم محتوا",
  "WooCommerce today": "ووکامرس",
  "Preferred contact": "روش تماس",
};

const INTAKE_ICONS: Record<string, typeof Globe2> = {
  Website: Globe2,
  "Database size": HardDrive,
  "Daily visitors": Users,
  "Content size": FileText,
  "WooCommerce today": ShoppingCart,
};

const VALUE_LABELS: Record<string, string> = {
  // Database size
  under_1gb: "کمتر از ۱ گیگابایت",
  "1_to_5gb": "۱ تا ۵ گیگابایت",
  "5_to_20gb": "۵ تا ۲۰ گیگابایت",
  over_20gb: "بیش از ۲۰ گیگابایت",
  // Daily visitors
  under_100: "کمتر از ۱۰۰",
  "100_to_500": "۱۰۰ تا ۵۰۰",
  "500_to_2k": "۵۰۰ تا ۲٬۰۰۰",
  over_2k: "بیش از ۲٬۰۰۰",
  // Content size
  under_100mb: "کمتر از ۱۰۰ مگابایت",
  "100mb_to_1gb": "۱۰۰ مگابایت تا ۱ گیگابایت",
  "1gb_to_10gb": "۱ تا ۱۰ گیگابایت",
  over_10gb: "بیش از ۱۰ گیگابایت",
  // WooCommerce
  yes: "بله",
  no: "خیر",
  not_sure: "مطمئن نیستم",
  // Contact
  phone: "تلفن",
  email: "ایمیل",
};

function parseIntakeNotes(notes: string): {
  header: string | null;
  fields: IntakeField[];
  freeText: string | null;
} {
  const lines = notes.split("\n").filter((line) => line.trim());
  let header: string | null = null;
  const fields: IntakeField[] = [];
  const freeTextLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Header line: [Plan intake — ...]
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      header = trimmed.slice(1, -1);
      continue;
    }

    // Key: Value pair
    const colonIndex = trimmed.indexOf(": ");
    if (colonIndex > 0) {
      const key = trimmed.slice(0, colonIndex).trim();
      const value = trimmed.slice(colonIndex + 2).trim();

      // Skip if it looks like a URL value (already shown elsewhere)
      if (key === "Website" && value.startsWith("http")) {
        fields.push({
          key,
          label: INTAKE_LABELS[key] ?? key,
          value,
          icon: INTAKE_ICONS[key],
        });
        continue;
      }

      // Skip store sizing skip note
      if (value === "skipped (no website yet)") {
        continue;
      }

      fields.push({
        key,
        label: INTAKE_LABELS[key] ?? key,
        value: VALUE_LABELS[value] ?? value,
        icon: INTAKE_ICONS[key],
      });
    } else if (trimmed && !trimmed.startsWith("Attachments")) {
      // Free text (not attachment lines)
      freeTextLines.push(trimmed);
    }
  }

  return {
    header,
    fields,
    freeText: freeTextLines.length > 0 ? freeTextLines.join("\n") : null,
  };
}

export function PlanIntakeNotes({ notes }: { notes: string }) {
  const { header, fields, freeText } = parseIntakeNotes(notes);

  if (fields.length === 0 && !freeText) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="size-3.5 text-primary" aria-hidden="true" />
        </div>
        <h4 className="text-sm font-semibold">اطلاعات درخواست</h4>
      </div>

      {header && (
        <p className="mb-3 text-xs text-muted-foreground" dir="ltr">
          {header}
        </p>
      )}

      {fields.length > 0 && (
        <dl className="grid gap-2.5 text-sm sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.key} className="flex items-start gap-2.5">
              {field.icon && (
                <field.icon
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
              <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">{field.label}</dt>
                <dd
                  className="mt-0.5 font-medium truncate"
                  dir={field.key === "Website" ? "ltr" : undefined}
                >
                  {field.key === "Website" ? (
                    <a
                      href={field.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {field.value}
                    </a>
                  ) : (
                    field.value
                  )}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      )}

      {freeText && (
        <div className="mt-3 rounded-lg bg-background p-3 text-sm text-muted-foreground">
          <p className="text-xs text-muted-foreground mb-1">توضیحات</p>
          <p className="whitespace-pre-wrap">{freeText}</p>
        </div>
      )}
    </div>
  );
}
