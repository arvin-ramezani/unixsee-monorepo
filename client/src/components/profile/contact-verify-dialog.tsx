"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  requestEmailVerifyOtpAction,
  requestPhoneVerifyOtpAction,
  verifyEmailOtpAction,
  verifyPhoneOtpAction,
} from "@/actions/profile/contact-verify";
import { OtpInput } from "@/components/auth/otp-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toastMappedApiError } from "@/lib/api/toast-api-error";
import type { UserProfile } from "@/lib/data/profile/profile-data";
import { mapMeToUserProfile } from "@/lib/profile/map-me-to-profile";
import { OTP_LENGTH } from "@/lib/zod-schemas/auth-schemas";

export type ContactVerifyChannel = "phone" | "email";

export type ContactVerifyDialogProps = {
  open: boolean;
  channel: ContactVerifyChannel;
  value: string;
  onOpenChange: (open: boolean) => void;
  onVerified: (profile: UserProfile) => void;
};

export function ContactVerifyDialog({
  open,
  channel,
  value,
  onOpenChange,
  onVerified,
}: ContactVerifyDialogProps) {
  const t = useTranslations("Profile.personal");
  const tApiErrors = useTranslations("ApiErrors");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();
  const requestKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      setCode("");
      setSent(false);
      requestKeyRef.current = null;
      return;
    }

    const key = `${channel}:${value}`;
    if (requestKeyRef.current === key) return;
    requestKeyRef.current = key;

    startTransition(async () => {
      const result =
        channel === "phone"
          ? await requestPhoneVerifyOtpAction({ phoneNumber: value })
          : await requestEmailVerifyOtpAction({ email: value });

      if (!result.ok) {
        toastMappedApiError(result.error, tApiErrors);
        onOpenChange(false);
        return;
      }

      setSent(true);
      toast.success(
        channel === "phone"
          ? t("toast.phoneCodeSent")
          : t("toast.emailCodeSent"),
      );
    });
  }, [open, channel, value, onOpenChange, t, tApiErrors]);

  function resend() {
    startTransition(async () => {
      const result =
        channel === "phone"
          ? await requestPhoneVerifyOtpAction({ phoneNumber: value })
          : await requestEmailVerifyOtpAction({ email: value });

      if (!result.ok) {
        toastMappedApiError(result.error, tApiErrors);
        return;
      }

      toast.success(
        channel === "phone"
          ? t("toast.phoneCodeSent")
          : t("toast.emailCodeSent"),
      );
    });
  }

  function submit() {
    if (code.replace(/\D/g, "").length !== OTP_LENGTH) {
      toast.error(t("toast.invalidCode"));
      return;
    }

    startTransition(async () => {
      const result =
        channel === "phone"
          ? await verifyPhoneOtpAction({ phoneNumber: value, otp: code })
          : await verifyEmailOtpAction({ email: value, otp: code });

      if (!result.ok) {
        toastMappedApiError(result.error, tApiErrors);
        return;
      }

      onVerified(mapMeToUserProfile(result.data));
      toast.success(
        channel === "phone"
          ? t("toast.phoneVerified")
          : t("toast.emailVerified"),
      );
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {channel === "phone"
              ? t("verifyDialog.phoneTitle")
              : t("verifyDialog.emailTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("verifyDialog.mockDeliveryHint")}
            <span className="mt-2 block font-medium" dir="ltr">
              {value}
            </span>
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="space-y-4 py-2">
            <OtpInput
              value={code}
              onChange={setCode}
              disabled={pending}
              autoFocus
            />
            <Button
              type="button"
              variant="link"
              size="plain"
              disabled={pending}
              onClick={resend}
              className="text-link text-xs"
            >
              {t("verifyDialog.resend")}
            </Button>
          </div>
        ) : (
          <div className="text-muted-foreground flex items-center gap-2 py-6 text-sm">
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
            {t("verifyDialog.sending")}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            {t("verifyDialog.cancel")}
          </Button>
          <Button
            type="button"
            disabled={!sent || pending}
            onClick={submit}
            className="gap-2"
          >
            {pending ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
            ) : null}
            {t("verifyDialog.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
