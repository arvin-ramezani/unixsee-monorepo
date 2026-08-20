"use client";

import { Check, CheckCircle2, PhoneCall } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";

import { RadialRevealLink } from "@/components/common/radial-reveal/radial-reveal-link";
import { Link } from "@/i18n/navigation";

export function GuestPlanRequestSuccessView({
  planName,
}: {
  planName: string | null;
}) {
  const t = useTranslations("GuestPlanRequestPage.success");
  const shouldReduceMotion = useReducedMotion();
  const steps = [t("step1"), t("step2"), t("step3")];

  return (
    <main className="container-lg py-10 lg:py-16">
      <div className="mx-auto flex max-w-xl flex-col items-center py-6 text-center lg:py-10">
        <motion.span
          className="grid size-16 place-items-center rounded-full bg-success/15 text-success"
          {...(shouldReduceMotion
            ? {}
            : {
                initial: { opacity: 0, scale: 0.85 },
                animate: { opacity: 1, scale: 1 },
                transition: { duration: 0.35, ease: "easeOut" },
              })}
        >
          <CheckCircle2 aria-hidden="true" className="size-9" />
        </motion.span>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          {t("description")}
        </p>

        {planName ? (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-1.5 text-sm">
            <span className="text-muted-foreground">{t("planLabel")}:</span>
            <span className="font-medium">{planName}</span>
          </p>
        ) : null}

        <section className="mt-8 w-full rounded-3xl border bg-white p-5 text-start dark:bg-card sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <PhoneCall aria-hidden="true" className="size-4 text-primary" />
            {t("nextTitle")}
          </h2>
          <ol className="mt-4 space-y-3">
            {steps.map((step, index) => (
              <motion.li
                key={step}
                className="flex items-center gap-3 text-sm"
                {...(shouldReduceMotion
                  ? {}
                  : {
                      initial: { opacity: 0, y: 8 },
                      animate: { opacity: 1, y: 0 },
                      transition: {
                        duration: 0.3,
                        delay: 0.08 * (index + 1),
                        ease: "easeOut",
                      },
                    })}
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-success/15 text-success">
                  <Check aria-hidden="true" className="size-3.5" />
                </span>
                {step}
              </motion.li>
            ))}
          </ol>
        </section>

        <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <RadialRevealLink
            href="/dashboard/authorization"
            className="h-12 w-full text-base font-bold sm:w-auto"
          >
            {t("authorizationCta")}
          </RadialRevealLink>
          <Link
            href="/services/managed-woocommerce-server#plans"
            className="inline-flex h-12 items-center justify-center rounded-full border px-6 text-base font-medium"
          >
            {t("backToPlans")}
          </Link>
        </div>
      </div>
    </main>
  );
}
