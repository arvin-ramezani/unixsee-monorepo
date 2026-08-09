"use client";

import { type FormEvent, useState } from "react";
import { Eye, EyeOff, KeyRound, LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";

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
import { Label } from "@/components/ui/label";
import type { PasswordState } from "@/lib/data/profile/profile-data";
import { DashboardButton } from "@/app/[locale]/(dashboard)/dashboard/_components/common";
import { AnimatedEyeIcon } from "../common/animated-icons/animated-eye-icon";

export function PasswordSecurityCard({
  initialState,
}: {
  initialState: PasswordState;
}) {
  const t = useTranslations("Profile.security.password");
  const [state, setState] = useState(initialState);
  const [open, setOpen] = useState(false);

  return (
    <section className="border-border rounded-xl border p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="bg-muted dark:bg-link/12 dark:text-link text-muted-foreground grid size-11 shrink-0 place-items-center rounded-lg">
          <KeyRound aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold">
            {state === "set" ? t("title") : t("notSetTitle")}
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            {state === "set" ? t("lastChanged") : t("notSetDescription")}
          </p>
        </div>
        <DashboardButton
          type="button"
          variant="outline"
          revealClassName="bg-muted dark:bg-accent"
          size="xl"
          onClick={() => setOpen(true)}
          className="border-border hover:bg-muted focus-visible:ring-ring min-h-11 rounded-lg border px-4 text-sm font-medium focus-visible:ring-2"
        >
          {state === "set" ? t("change") : t("set")}
        </DashboardButton>
      </div>
      <PasswordDialog
        open={open}
        state={state}
        onClose={() => setOpen(false)}
        onSuccess={() => {
          setState("set");
          setOpen(false);
        }}
      />
    </section>
  );
}

export function PasswordDialog({
  open,
  state,
  onClose,
  onSuccess,
}: {
  open: boolean;
  state: PasswordState;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const t = useTranslations("Profile.security.password.dialog");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (
      (state === "set" && !current) ||
      next.length < 8 ||
      next !== confirm ||
      (state === "not-set" && !/^\d{6}$/.test(code))
    ) {
      setError(t("error"));
      return;
    }
    setError("");
    setSaving(true);
    window.setTimeout(onSuccess, 600);
  }
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="border-border bg-popover max-w-lg gap-0 rounded-xl p-5 shadow-xl sm:p-6"
      >
        <form onSubmit={submit} className="w-full">
          <DialogHeader className="gap-1 text-start">
            <DialogTitle
              id="password-dialog-title"
              className="text-xl font-semibold"
            >
              {state === "set" ? t("changeTitle") : t("setTitle")}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {t("requirements")}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 space-y-4">
            {state === "set" && (
              <PasswordInput
                id="current-password"
                label={t("current")}
                value={current}
                onChange={setCurrent}
                visible={visible}
                autoFocus
              />
            )}
            <PasswordInput
              id="new-password"
              label={t("new")}
              value={next}
              onChange={setNext}
              visible={visible}
              autoFocus={state === "not-set"}
            />
            <PasswordInput
              id="confirm-password"
              label={t("confirm")}
              value={confirm}
              onChange={setConfirm}
              visible={visible}
            />
            {state === "not-set" && (
              <div>
                <Label
                  className="block text-sm font-medium"
                  htmlFor="password-code"
                >
                  {t("code")}
                </Label>
                <Input
                  id="password-code"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  className="border-input bg-background focus-visible:ring-ring mt-2 h-11 w-full rounded-lg border px-3 outline-none focus-visible:ring-2"
                />
              </div>
            )}
            <Button
              type="button"
              variant="link"
              size="plain"
              onClick={() => setVisible((value) => !value)}
              className="text-link inline-flex min-h-10 items-center gap-2 text-sm font-medium"
            >
              <AnimatedEyeIcon aria-hidden="true" off={visible} />

              {visible ? t("hide") : t("show")}
            </Button>
          </div>
          {!!error && (
            <p aria-live="polite" className="text-destructive mt-3 text-sm">
              {error}
            </p>
          )}
          <DialogFooter className="mt-5">
            <DashboardButton
              revealClassName="bg-muted dark:bg-accent"
              type="button"
              variant="outline"
              size="xl"
              onClick={onClose}
              className="border-border min-h-11 rounded-lg border px-4 text-sm font-medium"
            >
              {t("cancel")}
            </DashboardButton>
            <DashboardButton
              type="submit"
              size="xl"
              disabled={saving}
              className="bg-primary text-primary-foreground inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium disabled:opacity-60"
            >
              {saving && (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-4 animate-spin"
                />
              )}
              {saving ? t("saving") : t("submit")}
            </DashboardButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  visible,
  autoFocus,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <Label className="block text-sm font-medium" htmlFor={id}>
        {label}
      </Label>
      <Input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoFocus={autoFocus}
        className="border-input bg-background focus-visible:ring-ring mt-2 h-11 w-full border px-3 outline-none focus-visible:ring-2"
      />
    </div>
  );
}
