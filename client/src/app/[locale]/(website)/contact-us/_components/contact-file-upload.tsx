"use client";

import { useId, useRef, useState } from "react";
import { FileUp, Trash2, Upload } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useFormatter, useTranslations } from "next-intl";

import { RadialRevealButton } from "@/components/common/radial-reveal/radial-reveal-button";
import { Button } from "@/components/ui/button";
import {
  CONTACT_US_UPLOAD,
  isAcceptedContactUsFile,
} from "@/lib/zod-schemas/contact-us-schema";
import { cn } from "@/lib/utils";

type ContactFileUploadProps = {
  files: File[];
  disabled?: boolean;
  onChange: (files: File[]) => void;
  controlClassName?: string;
};

const enterEase = [0.22, 1, 0.36, 1] as const;
const exitEase = [0.4, 0, 1, 1] as const;

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.type}`;
}

export function ContactFileUpload({
  files,
  disabled,
  onChange,
  controlClassName,
}: ContactFileUploadProps) {
  const t = useTranslations(
    "ContactUsPage.ContactFormSection.form.fields.fileUpload",
  );
  const format = useFormatter();
  const prefersReducedMotion = useReducedMotion();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const statusId = `${inputId}-status`;
  const errorId = `${inputId}-error`;
  const maxMb = CONTACT_US_UPLOAD.maxFileBytes / (1024 * 1024);
  const maxFilesLabel = format.number(CONTACT_US_UPLOAD.maxFiles);
  const maxMbLabel = format.number(maxMb);

  function mergeFiles(incoming: FileList | File[]) {
    const next = [...files];
    const list = Array.from(incoming);

    for (const file of list) {
      if (next.length >= CONTACT_US_UPLOAD.maxFiles) {
        setLocalError(t("tooMany", { max: maxFilesLabel }));
        break;
      }

      if (
        next.some(
          (existing) =>
            existing.name === file.name && existing.size === file.size,
        )
      ) {
        continue;
      }

      if (!isAcceptedContactUsFile(file)) {
        setLocalError(
          file.size > CONTACT_US_UPLOAD.maxFileBytes
            ? t("tooLarge", { maxMb: maxMbLabel })
            : t("invalidType"),
        );
        continue;
      }

      next.push(file);
      setLocalError(null);
    }

    onChange(next);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeAt(index: number) {
    onChange(files.filter((_, i) => i !== index));
    setLocalError(null);
  }

  const hasError = Boolean(localError);

  return (
    <div className="col-span-2 flex flex-col gap-3">
      <div>
        <p className="text-sm font-medium">{t("label")}</p>
        <p className="text-muted-foreground mt-1 text-xs rtl:leading-[1.9]">
          {t("hint", {
            maxFiles: maxFilesLabel,
            maxMb: maxMbLabel,
          })}
        </p>
      </div>

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-describedby={hasError ? `${statusId} ${errorId}` : statusId}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onClick={() => {
          if (!disabled) inputRef.current?.click();
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (disabled) return;
          if (event.dataTransfer.files?.length) {
            mergeFiles(event.dataTransfer.files);
          }
        }}
        className={cn(
          "rounded-xl border border-dashed p-5 transition-colors",
          dragging && "border-primary bg-primary/5",
          hasError
            ? "border-destructive/50 bg-destructive/5"
            : controlClassName,
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="bg-background text-muted-foreground grid size-11 place-items-center rounded-full border">
            <Upload aria-hidden="true" className="size-5" />
          </span>
          <p id={statusId} className="text-sm" aria-live="polite">
            {files.length > 0
              ? t("selected", { count: files.length })
              : t("empty")}
          </p>
          <RadialRevealButton
            type="button"
            variant="outline"
            disabled={disabled}
            className="min-h-11 px-4"
            onClick={(event) => {
              event.stopPropagation();
              inputRef.current?.click();
            }}
          >
            <FileUp aria-hidden="true" className="size-4" />
            {t("browse")}
          </RadialRevealButton>
        </div>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept={CONTACT_US_UPLOAD.accept}
          className="sr-only"
          disabled={disabled}
          onChange={(event) => {
            if (event.target.files?.length) {
              mergeFiles(event.target.files);
            }
          }}
        />
      </div>

      {files.length > 0 && (
        <ul className="relative flex flex-col gap-2">
          <AnimatePresence initial={false} mode="popLayout">
            {files.map((file, index) => (
              <motion.li
                key={fileKey(file)}
                layout={!prefersReducedMotion}
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 8, scale: 0.98 }
                }
                animate={
                  prefersReducedMotion
                    ? {
                        opacity: 1,
                        transition: { duration: 0.12, delay: index * 0.03 },
                      }
                    : {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: {
                          duration: 0.22,
                          ease: enterEase,
                          delay: index * 0.03,
                        },
                      }
                }
                exit={
                  prefersReducedMotion
                    ? { opacity: 0, transition: { duration: 0.12 } }
                    : {
                        opacity: 0,
                        scale: 0.96,
                        y: -4,
                        transition: { duration: 0.18, ease: exitEase },
                      }
                }
                transition={
                  prefersReducedMotion
                    ? { duration: 0.12 }
                    : { layout: { duration: 0.22, ease: enterEase } }
                }
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm",
                  controlClassName,
                )}
              >
                <span className="min-w-0 truncate" dir="auto">
                  {file.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={disabled}
                  aria-label={t("remove", { name: file.name })}
                  onClick={() => removeAt(index)}
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </Button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {hasError && (
        <p id={errorId} className="text-destructive text-sm" role="alert">
          {localError}
        </p>
      )}
    </div>
  );
}
