"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { RequestAssessmentMultiStepForm } from "@/app/[locale]/(website)/_components/others/request-assessment-multi-step-form";
import { RadialRevealButton } from "@/components/common/radial-reveal/radial-reveal-button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover-improved";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { useLightHeaderStore } from "@/providers/light-header-provider";

export type RequestAssessmentDialogDesktopProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function RequestAssessmentDialogDesktop({
  open,
  setOpen,
}: RequestAssessmentDialogDesktopProps) {
  const tNavigation = useTranslations("Layout.Navigation.primaryCta");
  const t = useTranslations(
    "HomePage.ConsultationSection.requestAssessment.form",
  );

  const headerTone = useLightHeaderStore((state) => state.tone);

  useScrollLock(open, "request-assessment-form-dialog-desktop");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            onClick={() => setOpen(false)}
            className={cn(
              "w-full-scrollbar -inset-s-scrollbar-width absolute -inset-bs-1 z-10 h-full min-h-dvh bg-black/10 supports-backdrop-filter:backdrop-blur-xs",
            )}
          />
        )}
      </AnimatePresence>

      <PopoverTrigger
        asChild
        className={cn("relative z-10 transition-all", {
          "bg-popover dark:bg-popover shadow-lg": open,
        })}
      >
        <div
          className={cn(
            "pointer-events-none flex h-15 w-47.5 items-center justify-center rounded-sm rounded-b-none border-b-0 border-transparent pb-1 text-xs! transition-colors duration-100 xl:px-4",
            {
              "border-border": open,
            },
          )}
        >
          <RadialRevealButton className="bg-primary pointer-events-auto flex h-10 items-center justify-center rounded-sm text-xs lg:flex">
            {tNavigation("label")}
          </RadialRevealButton>
        </div>
      </PopoverTrigger>

      <PopoverContent
        preventOutsideClose
        showCloseButton={false}
        align="end"
        className={cn(
          "fixed inset-e-0 -top-1.75 w-md origin-top-right! overflow-visible rounded-se-none border-t-0 bg-transparent p-0 ring-0 duration-100",
          {
            dark: headerTone === "dark",
          },
        )}
        open={open}
      >
        <motion.div
          initial={{ height: "0px" }}
          animate={{ height: "auto" }}
          exit={{ height: "0px" }}
          transition={{ duration: 0.15 }}
          className="bg-popover origin-top-left overflow-hidden rounded rounded-se-none px-4 pb-4"
        >
          <RequestAssessmentMultiStepForm
            formId="request-assessment-form-dialog-desktop"
            variant="embedded"
            formClassName="gap-4"
            selectContentClassName={cn({ dark: headerTone === "dark" })}
            submitButtonClassName="h-12 text-sm"
            onSubmitted={() => setOpen(false)}
          />

          <PopoverClose asChild>
            <Button
              type="button"
              className="mt-2 h-12 w-full"
              variant="outline"
            >
              {t("actions.cancel")}
            </Button>
          </PopoverClose>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}
