"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, LoaderCircle, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProfileAvatarField({
  name,
  initialUrl,
  onChange,
}: {
  name: string;
  initialUrl?: string;
  onChange: (url?: string, file?: File) => void;
}) {
  const t = useTranslations("Profile.avatar");
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | undefined>(undefined);
  const preview = initialUrl;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  function selectFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
      setError(t("invalid"));
      return;
    }
    setError("");
    setUploading(true);
    const nextUrl = URL.createObjectURL(file);
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = nextUrl;
    window.setTimeout(() => {
      onChange(nextUrl, file);
      setUploading(false);
    }, 450);
  }

  function remove() {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = undefined;
    onChange(undefined, undefined);
    setConfirmingRemove(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="bg-primary text-primary-foreground relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-full text-xl font-semibold sm:size-24 lg:size-28">
        {preview ? (
          <Image
            src={preview}
            alt={t("alt", { name })}
            fill
            sizes="(min-width: 1024px) 112px, (min-width: 640px) 96px, 80px"
            unoptimized
            className="object-cover"
          />
        ) : (
          initials
        )}
        {uploading && (
          <span className="bg-foreground/50 absolute inset-0 grid place-items-center">
            <LoaderCircle
              aria-hidden="true"
              className="text-background size-6 animate-spin"
            />
          </span>
        )}
      </div>
      <div className="text-center sm:text-start">
        <h3 className="font-semibold">{t("title")}</h3>
        <p className="text-muted-foreground mt-1 text-xs">{t("hint")}</p>
        <div className="mt-3 flex h-20 flex-col items-center justify-center gap-2 sm:h-auto sm:flex-row sm:justify-start lg:h-20 lg:flex-col">
          <Button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            variant="outline"
            size="lg"
            className="px-3 text-nowrap"
          >
            <Camera aria-hidden="true" className="size-4 shrink-0" />
            {preview ? t("replace") : t("upload")}
          </Button>
          {!!preview && (
            <Button
              type="button"
              onClick={() => setConfirmingRemove(true)}
              variant="outline"
              size="lg"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive px-3 text-nowrap"
            >
              <Trash2 aria-hidden="true" className="size-4 shrink-0" />
              {t("remove")}
            </Button>
          )}
          <Input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="absolute size-px! overflow-hidden border-0 p-0 whitespace-nowrap [clip:rect(0,0,0,0)]"
            onChange={(event) => selectFile(event.target.files?.[0])}
            aria-label={t("upload")}
          />
        </div>
        <div aria-live="polite">
          {!!error && <p className="text-destructive mt-2 text-xs">{error}</p>}
        </div>
        <AlertDialog open={confirmingRemove} onOpenChange={setConfirmingRemove}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("remove")}</AlertDialogTitle>
              <AlertDialogDescription>{t("confirm")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={remove}>
                {t("confirmRemove")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
