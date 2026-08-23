"use client";

import { useId, useRef, useState } from "react";
import { FileUp, Trash2, Upload } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  isAcceptedRequestAssessmentFile,
  REQUEST_ASSESSMENT_UPLOAD,
  type RequestAssessmentAttachmentMeta,
} from "@/lib/zod-schemas/request-assessment-schema";
import { cn } from "@/lib/utils";

type RequestAssessmentFileUploadProps = {
  files: RequestAssessmentAttachmentMeta[];
  disabled?: boolean;
  error?: string;
  onChange: (files: RequestAssessmentAttachmentMeta[]) => void;
  onFilesChange?: (files: File[]) => void;
};

const enterEase = [0.22, 1, 0.36, 1] as const;
const exitEase = [0.4, 0, 1, 1] as const;

function toMeta(file: File): RequestAssessmentAttachmentMeta {
  return {
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
  };
}

function fileKey(file: RequestAssessmentAttachmentMeta) {
  return `${file.name}-${file.size}-${file.type}`;
}

export function RequestAssessmentFileUpload({
  files,
  disabled,
  error,
  onChange,
  onFilesChange,
}: RequestAssessmentFileUploadProps) {
  const t = useTranslations(
    "HomePage.ConsultationSection.requestAssessment.form.fields.attachments",
  );
  const prefersReducedMotion = useReducedMotion();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [fileStore, setFileStore] = useState<File[]>([]);
  const statusId = `${inputId}-status`;

  function mergeFiles(incoming: FileList | File[]) {
    const next = [...files];
    const list = Array.from(incoming);

    for (const file of list) {
      if (next.length >= REQUEST_ASSESSMENT_UPLOAD.maxFiles) {
        setLocalError(
          t("tooMany", { max: REQUEST_ASSESSMENT_UPLOAD.maxFiles }),
        );
        break;
      }
      if (!isAcceptedRequestAssessmentFile(file)) {
        setLocalError(
          file.size > REQUEST_ASSESSMENT_UPLOAD.maxBytes
            ? t("tooLarge", {
                maxMb: REQUEST_ASSESSMENT_UPLOAD.maxBytes / (1024 * 1024),
              })
            : t("invalidType"),
        );
        continue;
      }
      if (
        next.some(
          (existing) =>
            existing.name === file.name && existing.size === file.size,
        )
      ) {
        continue;
      }
      next.push(toMeta(file));
      setLocalError(null);
    }

    const newFileObjects = list.filter(f =>
      !fileStore.some(e => e.name === f.name && e.size === f.size)
    );
    const updatedFileStore = [...fileStore, ...newFileObjects];
    setFileStore(updatedFileStore);
    onFilesChange?.(updatedFileStore);

    onChange(next);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeAt(index: number) {
    const removed = files[index];
    const updatedFileStore = fileStore.filter(f => !(f.name === removed.name && f.size === removed.size));
    setFileStore(updatedFileStore);
    onFilesChange?.(updatedFileStore);
    onChange(files.filter((_, i) => i !== index));
    setLocalError(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-medium">{t("label")}</p>
        <p className="text-muted-foreground mt-1 text-xs">{t("hint")}</p>
      </div>

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-describedby={statusId}
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
          error || localError
            ? "border-destructive/50 bg-destructive/5"
            : "border-border bg-muted/30",
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
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className="min-h-11"
            onClick={(event) => {
              event.stopPropagation();
              inputRef.current?.click();
            }}
          >
            <FileUp aria-hidden="true" className="size-4" />
            {t("browse")}
          </Button>
        </div>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept={REQUEST_ASSESSMENT_UPLOAD.accept}
          className="sr-only"
          disabled={disabled}
          onChange={(event) => {
            if (event.target.files?.length) {
              mergeFiles(event.target.files);
            }
          }}
        />
      </div>

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
              className="border-border bg-background flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm"
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

      {(error || localError) && (
        <p className="text-destructive text-sm" role="alert">
          {error || localError}
        </p>
      )}
    </div>
  );
}
