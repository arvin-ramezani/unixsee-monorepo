"use client";

import { useId, useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { AUTHORIZATION_UPLOAD } from "@/lib/data/authorization/authorization-data";
import { isAcceptedNationalIdFile } from "@/lib/zod-schemas/authorization-schema";
import { cn } from "@/lib/utils";

type NationalIdUploadProps = {
  fileName: string | null;
  previewUrl: string | null;
  error?: string;
  disabled?: boolean;
  onChange: (next: {
    fileName: string | null;
    previewUrl: string | null;
    file?: File | null;
  }) => void;
};

export function NationalIdUpload({
  fileName,
  previewUrl,
  error,
  disabled,
  onChange,
}: NationalIdUploadProps) {
  const t = useTranslations("Authorization.document");
  const tFields = useTranslations("Authorization.fields");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const statusId = `${inputId}-status`;

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!isAcceptedNationalIdFile(file)) {
      setLocalError(t("hint"));
      return;
    }
    setLocalError(null);
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    onChange({
      fileName: file.name,
      previewUrl: URL.createObjectURL(file),
      file,
    });
  }

  function remove() {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setLocalError(null);
    onChange({ fileName: null, previewUrl: null, file: null });
    if (inputRef.current) inputRef.current.value = "";
  }

  const announced = fileName
    ? t("uploaded", { name: fileName })
    : t("empty");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">{tFields("document")}</p>
        <p className="text-muted-foreground text-xs">{t("hint")}</p>
      </div>

      <div
        className={cn(
          "rounded-xl border border-dashed p-4",
          error || localError
            ? "border-destructive/50 bg-destructive/5"
            : "border-border bg-muted/30",
        )}
      >
        {previewUrl ? (
          // Prototype preview only — Nest will serve capability-gated images later.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={tFields("document")}
            className="mb-4 max-h-56 w-full rounded-lg object-contain"
          />
        ) : null}

        <p id={statusId} className="text-sm" aria-live="polite">
          {announced}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className="min-h-11"
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus aria-hidden="true" className="size-4" />
            {fileName ? t("replace") : t("upload")}
          </Button>
          {fileName ? (
            <Button
              type="button"
              variant="ghost"
              disabled={disabled}
              className="min-h-11"
              onClick={remove}
            >
              <Trash2 aria-hidden="true" className="size-4" />
              {t("remove")}
            </Button>
          ) : null}
        </div>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={AUTHORIZATION_UPLOAD.accept}
          className="sr-only"
          disabled={disabled}
          aria-describedby={statusId}
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
      </div>

      {(error || localError) && (
        <p className="text-destructive text-sm" role="alert">
          {error || localError}
        </p>
      )}
    </div>
  );
}
