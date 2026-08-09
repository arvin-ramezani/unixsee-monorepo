"use client";

import { type FormEvent, useState } from "react";
import {
  CheckCircle2,
  Copy,
  LoaderCircle,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Alert } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TwoFactorState } from "@/lib/data/profile/profile-data";
import { DashboardButton } from "@/app/[locale]/(dashboard)/dashboard/_components/common";

export function TwoFactorCard({
  initialState,
  recoveryCodes,
}: {
  initialState: TwoFactorState;
  recoveryCodes: readonly string[];
}) {
  const t = useTranslations("Profile.security.twoFactor");
  const [state, setState] = useState(initialState);
  const [open, setOpen] = useState(false);
  return (
    <section className="border-border rounded-xl border p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="dark:bg-link/12 dark:text-link bg-muted text-muted-foreground grid size-11 shrink-0 place-items-center rounded-lg">
          <ShieldCheck aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold">
            {state === "enabled" ? t("onTitle") : t("offTitle")}
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            {state === "enabled" ? t("method") : t("offDescription")}
          </p>
        </div>
        <DashboardButton
          revealClassName="bg-muted dark:bg-accent"
          type="button"
          variant="outline"
          size="xl"
          onClick={() => setOpen(true)}
          className="border-border hover:bg-muted focus-visible:ring-ring min-h-11 rounded-lg border px-4 text-sm font-medium focus-visible:ring-2"
        >
          {state === "enabled" ? t("manage") : t("enable")}
        </DashboardButton>
      </div>
      <TwoFactorSetupDialog
        open={open}
        state={state}
        recoveryCodes={recoveryCodes}
        onClose={() => setOpen(false)}
        onStateChange={(next) => {
          setState(next);
          setOpen(false);
        }}
      />
    </section>
  );
}

export function TwoFactorSetupDialog({
  open,
  state,
  recoveryCodes,
  onClose,
  onStateChange,
}: {
  open: boolean;
  state: TwoFactorState;
  recoveryCodes: readonly string[];
  onClose: () => void;
  onStateChange: (state: TwoFactorState) => void;
}) {
  const t = useTranslations("Profile.security.twoFactor.dialog");
  const [code, setCode] = useState("");
  const [saved, setSaved] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [showCodes, setShowCodes] = useState(state === "disabled");
  function enable(event: FormEvent) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code) || !saved) {
      setError(t("error"));
      return;
    }
    setWorking(true);
    window.setTimeout(() => onStateChange("enabled"), 600);
  }
  function disable() {
    setWorking(true);
    window.setTimeout(() => onStateChange("disabled"), 500);
  }
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="border-border bg-popover max-h-[92dvh] max-w-xl gap-0 overflow-y-auto rounded-xl p-5 shadow-xl sm:p-6"
      >
        <DialogTitle id="two-factor-title" className="text-xl font-semibold">
          {state === "enabled" ? t("manageTitle") : t("setupTitle")}
        </DialogTitle>
        {state === "disabled" ? (
          <form onSubmit={enable}>
            <div className="mt-5 grid gap-5 sm:grid-cols-[150px_1fr]">
              <div className="border-border bg-background grid aspect-square place-items-center rounded-xl border">
                <QrCode
                  aria-hidden="true"
                  className="text-foreground size-24"
                />
                <span className="sr-only">{t("qr")}</span>
              </div>
              <div>
                <p className="text-muted-foreground text-sm leading-6">
                  {t("scan")}
                </p>
                <p className="text-muted-foreground mt-3 text-xs font-medium">
                  {t("secretLabel")}
                </p>
                <code
                  dir="ltr"
                  className="bg-muted mt-1 block rounded-md p-2 text-start text-sm"
                >
                  UNIXSEE-JBSW-Y3DP-EHPK
                </code>
                <div className="mt-4">
                  <Label
                    htmlFor="two-factor-code"
                    className="block text-sm font-medium"
                  >
                    {t("code")}
                  </Label>
                  <Input
                    id="two-factor-code"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    className="border-input bg-background focus-visible:ring-ring mt-2 h-11 w-full rounded-lg border px-3 outline-none focus-visible:ring-2"
                  />
                </div>
              </div>
            </div>
            <RecoveryCodes codes={recoveryCodes} title={t("recoveryTitle")} />
            <Label className="mt-4 flex items-start gap-3 text-sm">
              <Checkbox
                checked={saved}
                onCheckedChange={(checked) => setSaved(checked === true)}
                className="mt-0.5"
              />
              {t("savedCodes")}
            </Label>
            <p aria-live="polite" className="text-destructive mt-3 text-sm">
              {error}
            </p>
            <DialogActions
              onClose={onClose}
              working={working}
              primary={t("confirmEnable")}
            />
          </form>
        ) : (
          <div className="mt-5">
            <Alert className="border-success/25 bg-success/10 text-success-foreground flex items-center gap-3 rounded-lg p-4">
              <CheckCircle2 aria-hidden="true" className="size-5" />
              <p className="text-sm font-medium">{t("enabled")}</p>
            </Alert>
            {showCodes ? (
              <RecoveryCodes codes={recoveryCodes} title={t("newRecovery")} />
            ) : null}
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="plain"
                onClick={() => setShowCodes(true)}
                className="border-border min-h-10 rounded-lg border px-3 text-sm font-medium"
              >
                {t("viewCodes")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="plain"
                onClick={() => setShowCodes(true)}
                className="border-border min-h-10 rounded-lg border px-3 text-sm font-medium"
              >
                {t("regenerate")}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    size="plain"
                    className="border-destructive/30 text-destructive min-h-10 rounded-lg border px-3 text-sm font-medium"
                  >
                    {t("disable")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("disable")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("disableConfirm")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={disable}
                      disabled={working}
                      variant="destructive"
                    >
                      {working ? t("working") : t("confirmDisable")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <div className="mt-5 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="plain"
                onClick={onClose}
                className="border-border min-h-10 rounded-lg border px-4 text-sm font-medium"
              >
                {t("done")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RecoveryCodes({
  codes,
  title,
}: {
  codes: readonly string[];
  title: string;
}) {
  return (
    <div className="border-border bg-background mt-5 rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <Copy aria-hidden="true" className="text-muted-foreground size-4" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <ul
        dir="ltr"
        className="mt-3 grid grid-cols-2 gap-2 text-start font-mono text-xs"
      >
        {codes.map((code) => (
          <li key={code} className="bg-muted rounded px-2 py-1.5">
            {code}
          </li>
        ))}
      </ul>
    </div>
  );
}
function DialogActions({
  onClose,
  working,
  primary,
}: {
  onClose: () => void;
  working: boolean;
  primary: string;
}) {
  const t = useTranslations("Profile.security.twoFactor.dialog");
  return (
    <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button
        type="button"
        variant="outline"
        size="plain"
        onClick={onClose}
        className="border-border min-h-11 rounded-lg border px-4 text-sm font-medium"
      >
        {t("cancel")}
      </Button>
      <Button
        type="submit"
        size="plain"
        disabled={working}
        className="bg-primary text-primary-foreground inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium disabled:opacity-60"
      >
        {working ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : null}
        {working ? t("working") : primary}
      </Button>
    </div>
  );
}
