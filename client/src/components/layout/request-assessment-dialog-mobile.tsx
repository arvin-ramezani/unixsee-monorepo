"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { RequestAssessmentMultiStepForm } from "@/app/[locale]/(website)/_components/others/request-assessment-multi-step-form";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover-improved";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useScrollLock } from "@/hooks/use-scroll-lock";

export default function RequestAssessmentDialogMobile() {
  const tNavigation = useTranslations("Layout.Navigation.primaryCta");
  const t = useTranslations(
    "HomePage.ConsultationSection.requestAssessment.form",
  );

  const [open, setOpen] = useState(false);

  useScrollLock(open, "request-assessment-form-dialog-mobile");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            className={cn(
              "absolute inset-0 z-10 h-full min-h-dvh w-full bg-black/10 supports-backdrop-filter:backdrop-blur-xs",
            )}
          />
        )}
      </AnimatePresence>

      <PopoverTrigger
        asChild
        className={cn("relative z-10 transition-transform", {
          // "bg-popover": open,
        })}
      >
        <div
          className={cn(
            "pointer-events-none flex h-15 w-full items-center justify-center rounded-sm rounded-t-none border-b-0 border-transparent px-4 text-xs! transition-colors duration-100 xl:px-4",
            {
              "bg-popover": open,
            },
          )}
        >
          <Button
            className={cn(
              "bg-primary pointer-events-auto flex h-10 w-full items-center justify-center rounded-sm text-xs lg:flex",
              {
                hidden: open,
              },
            )}
          >
            {tNavigation("label")}
          </Button>

          <PopoverClose asChild className="">
            <Button
              variant={"outline"}
              className={cn(
                "pointer-events-auto hidden h-10 w-full items-center justify-center rounded-sm text-xs lg:flex",
                {
                  flex: open,
                },
              )}
            >
              {t("actions.cancel")}
            </Button>
          </PopoverClose>
        </div>
      </PopoverTrigger>
      <PopoverContent
        showCloseButton={false}
        side="top"
        align="center"
        className="fixed inset-s-1/2 -inset-be-2 w-[calc(100dvw-32px)] max-w-104 -translate-x-1/2 overflow-visible rounded-none bg-transparent p-0 shadow-none ring-0 rtl:translate-x-1/2"
        open={open}
      >
        <motion.div
          initial={{ height: "0px" }}
          animate={{ height: "auto" }}
          exit={{ height: "0px" }}
          transition={{ duration: 0.15 }}
          className="bg-popover w-[calc(100dvw-32px)] max-w-104 overflow-hidden rounded-md rounded-b-none px-4 pb-4"
        >
          <div className="relative flex items-center justify-between py-4">
            <PopoverTitle className="sr-only">{t("title")}</PopoverTitle>

            <PopoverClose className="absolute inset-e-0">
              <X className="size-5" />
            </PopoverClose>
          </div>

          <RequestAssessmentMultiStepForm
            formId="request-assessment-form-dialog-mobile"
            variant="embedded"
            formClassName="text-xs [&_input::placeholder]:text-sm [&_textarea::placeholder]:text-sm"
            submitButtonClassName="h-10 rounded-md text-xs"
            onSubmitted={() => setOpen(false)}
          />
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}
