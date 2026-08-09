"use client";

import * as React from "react";
import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

import {
  NewsletterActionMessageKey,
  subscribeNewsletterAction,
} from "@/actions/newsletter-actions";
import { RadialRevealButton } from "@/components/common/radial-reveal/radial-reveal-button";
import { Input } from "@/components/ui/input";
import { initialServerActionState } from "@/types/server-action-state";
import { cn } from "@/lib/utils";
import { Field, FieldError } from "@/components/ui/field";
import { FormErrorKey } from "@/lib/form-errors";

type NewsletterFormValues = {
  email: string;
};

type NewsletterFormProps = {
  direction: "ltr" | "rtl";
  placeholder: string;
};

const newsletterDefaultValues: NewsletterFormValues = {
  email: "",
};

export default function NewsletterForm({
  direction,
  placeholder,
}: NewsletterFormProps) {
  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(
      z.object({ email: z.email({ error: "emailInvalid" }) }),
    ),
    defaultValues: newsletterDefaultValues,
  });

  const lastHandledSubmissionRef = React.useRef<number | null>(null);

  const locale = useLocale();

  const tFormErrors = useTranslations("FormErrors");
  const tActionMessages = useTranslations("ServerActionMessages.newsletter");

  const [actionState, submitNewsletter, isPending] = useActionState(
    subscribeNewsletterAction,
    initialServerActionState,
  );

  const onSubmit = form.handleSubmit((values) => {
    React.startTransition(() => {
      submitNewsletter({
        email: values.email,
        source: "footer",
        locale,
      });
    });
  });

  const translateError = (message?: string) => {
    if (!message) return undefined;
    return tFormErrors(message as FormErrorKey);
  };

  React.useEffect(() => {
    if (
      !actionState.submittedAt ||
      lastHandledSubmissionRef.current === actionState.submittedAt
    ) {
      return;
    }

    lastHandledSubmissionRef.current = actionState.submittedAt;

    const message = tActionMessages(
      actionState.message as NewsletterActionMessageKey,
    );

    if (actionState.message === "alreadySubscribed") {
      toast.info(message);
      form.reset(newsletterDefaultValues);
      return;
    }

    if (actionState.ok) {
      toast.success(message);
      form.reset(newsletterDefaultValues);
      return;
    }

    toast.error(message);
  }, [actionState, form, tActionMessages]);

  return (
    <form
      className="group flex items-center justify-center gap-2 lg:justify-start"
      onSubmit={onSubmit}
    >
      <div className="relative max-w-xs flex-1 lg:w-65">
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Input
                {...field}
                className="text-foreground border-primary/30 rounded-lg text-sm placeholder:text-xs"
                aria-invalid={fieldState.invalid}
                placeholder={placeholder}
                autoComplete="email"
              />
              {fieldState.error?.message && (
                <FieldError
                  className="absolute inset-s-2 top-[110%]"
                  errors={[
                    {
                      message: translateError(fieldState.error.message),
                    },
                  ]}
                />
              )}
            </Field>
          )}
        />
      </div>
      <RadialRevealButton
        type="submit"
        className="size-10.5 rounded-lg"
        disabled={isPending}
        aria-label={placeholder}
      >
        <ArrowRight
          size={18}
          className={cn({
            "rotate-180": direction === "rtl",
          })}
        />
      </RadialRevealButton>
    </form>
  );
}
