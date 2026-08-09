"use client";

import { Check, Copy, PhoneCall, Ticket, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { DashboardButton } from "@/app/[locale]/(dashboard)/dashboard/_components/common";

interface SupportContactDialogProps {
  displayPhoneNumber: string;
  phoneNumber: string;
}

type CopyState = "idle" | "copied" | "error";

export function SupportContactDialog({
  displayPhoneNumber,
  phoneNumber,
}: SupportContactDialogProps) {
  const t = useTranslations("Dashboard.help");
  const [open, setOpen] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>("idle");

  useScrollLock(open, "support-contact-dialog");

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    setCopyState("idle");
  }

  async function copyPhoneNumber() {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  const copyLabel =
    copyState === "copied"
      ? t("copied")
      : copyState === "error"
        ? t("copyError")
        : t("copy");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild className="[&_span]:w-fit">
        <DashboardButton
          className="mt-4 md:mt-0 lg:mt-7"
          type="button"
          size="lg"
          // size="plain"
          // className="mt-7 h-10 rounded-lg px-6 text-xs font-semibold"
        >
          {t("contact")}
        </DashboardButton>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden p-0 sm:max-w-md"
      >
        <DialogClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t("close")}
            className="absolute inset-e-3 top-3 z-10"
          >
            <X aria-hidden="true" />
          </Button>
        </DialogClose>

        <DialogHeader className="p-6 pe-14 text-start">
          <div className="bg-secondary text-secondary-foreground mb-1 grid size-11 place-items-center rounded-full">
            <PhoneCall aria-hidden="true" className="size-5" />
          </div>
          <DialogTitle className="text-xl leading-7">
            {t("dialogTitle")}
          </DialogTitle>
          <DialogDescription className="leading-6">
            {t("dialogDescription")}
          </DialogDescription>
        </DialogHeader>

        <div
          dir="ltr"
          className="border-border bg-muted/40 relative border-y px-6 py-4 pe-16"
        >
          <p className="text-muted-foreground text-xs font-medium">
            {t("phoneLabel")}
          </p>
          <p className="mt-1 text-start text-xl font-semibold tracking-wide tabular-nums">
            <span dir="ltr" className="relative inline-block">
              {displayPhoneNumber}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={copyPhoneNumber}
                aria-label={copyLabel}
                disabled={copyState === "copied"}
                title={copyLabel}
                className={cn(
                  "absolute -inset-e-8 bottom-[calc(100%-8px)]",
                  // copyState === "copied" && "text-success",
                )}
              >
                {copyState === "copied" ? (
                  <Check className="size-3.5" aria-hidden="true" />
                ) : (
                  <Copy className="size-3.5" aria-hidden="true" />
                )}
              </Button>
            </span>
          </p>
        </div>

        <div className="grid gap-2 p-6 sm:grid-cols-2">
          <Link
            href={`tel:${phoneNumber}`}
            className={cn(buttonVariants(), "h-10 w-full")}
          >
            <PhoneCall aria-hidden="true" />
            {t("call")}
          </Link>
          <Link
            href="/dashboard/tickets/new"
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "h-10 w-full",
            )}
          >
            <Ticket aria-hidden="true" />
            {t("createTicket")}
          </Link>
          <p className="sr-only" aria-live="polite">
            {copyState === "idle" ? "" : copyLabel}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
