"use client";

import * as React from "react";
import { useActionState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { getAuthSessionUser } from "@/actions/auth/get-auth-session-user";
import {
  createRequestAssessmentAction,
  type RequestAssessmentActionMessageKey,
} from "@/actions/request-assessment-action";
import type { ContactOtpChannel } from "@/app/[locale]/(website)/_components/others/request-assessment-contact-tabs";
import { useAuthStore } from "@/components/providers/auth-store-provider";
import { FormErrorKey } from "@/lib/form-errors";
import {
  getAccountContact,
  getVerifiedChannel,
  mergeAccountContactIntoValues,
} from "@/lib/request-assessment/account-contact";
import { getServerCoreApiBaseUrl } from "@/lib/auth/auth-utils";
import {
  clearRequestAssessmentFormDraft,
  loadRequestAssessmentFormDraft,
  saveRequestAssessmentFormDraft,
  type RequestAssessmentStep,
} from "@/lib/request-assessment/form-draft-storage";
import {
  getDefaultServiceDetails,
  getRequestAssessmentDefaultValues,
  requestAssessmentSchema,
  type RequestAssessmentSchemaType,
} from "@/lib/zod-schemas/request-assessment-schema";
import {
  applyRequestAssessmentIssues,
  validateRequestAssessmentStep,
} from "@/lib/zod-schemas/request-assessment-step-validation";
import { initialServerActionState } from "@/types/server-action-state";

type UseRequestAssessmentFormControllerOptions = {
  onSubmitted?: () => void;
};

export function useRequestAssessmentFormController({
  onSubmitted,
}: UseRequestAssessmentFormControllerOptions = {}) {
  const locale = useLocale();
  const tFormErrors = useTranslations("FormErrors");
  const tActionMessages = useTranslations(
    "ServerActionMessages.requestAssessment",
  );
  const tContact = useTranslations(
    "HomePage.ConsultationSection.requestAssessment.form.contact",
  );

  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [hydrated, setHydrated] = React.useState(false);
  const [step, setStep] = React.useState<RequestAssessmentStep>(1);
  const [stepDirection, setStepDirection] = React.useState<1 | -1>(1);
  const [otpVerifiedPhone, setOtpVerifiedPhone] = React.useState<string | null>(
    null,
  );
  const [otpVerifiedEmail, setOtpVerifiedEmail] = React.useState<string | null>(
    null,
  );
  const [fileObjects, setFileObjects] = React.useState<File[]>([]);

  const form = useForm<RequestAssessmentSchemaType>({
    resolver: zodResolver(requestAssessmentSchema),
    defaultValues: getRequestAssessmentDefaultValues(),
  });

  const selectedService = useWatch({
    control: form.control,
    name: "services",
  });
  const preferredContact = useWatch({
    control: form.control,
    name: "preferredContact",
  });
  const phone = useWatch({
    control: form.control,
    name: "phone",
  });
  const email = useWatch({
    control: form.control,
    name: "email",
  });

  const previousServiceRef = React.useRef(selectedService);
  const prefilledUserIdRef = React.useRef<string | null>(null);

  const account = getAccountContact(user);
  const verifiedChannel = getVerifiedChannel({
    preferredContact,
    phone: phone ?? "",
    email: email ?? "",
    accountPhone: account.phone,
    accountEmail: account.email,
    otpVerifiedPhone,
    otpVerifiedEmail,
  });

  React.useEffect(() => {
    if (!accessToken || user) {
      return;
    }

    let cancelled = false;

    void getAuthSessionUser().then((sessionUser) => {
      if (!cancelled && sessionUser) {
        setUser(sessionUser);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [accessToken, setUser, user]);

  React.useEffect(() => {
    const draft = loadRequestAssessmentFormDraft();
    if (draft) {
      form.reset(draft.values);
      setStep(draft.step);
      setOtpVerifiedPhone(draft.otpVerifiedPhone);
      setOtpVerifiedEmail(draft.otpVerifiedEmail);
      previousServiceRef.current = draft.values.services;
    }
    setHydrated(true);
  }, [form]);

  React.useEffect(() => {
    if (!hydrated || !user || prefilledUserIdRef.current === user.id) {
      return;
    }

    const merged = mergeAccountContactIntoValues(form.getValues(), user);
    form.reset(merged, { keepDirtyValues: false });
    prefilledUserIdRef.current = user.id;
    previousServiceRef.current = merged.services;
  }, [form, hydrated, user]);

  React.useEffect(() => {
    if (previousServiceRef.current === selectedService) {
      return;
    }

    form.setValue("serviceDetails", getDefaultServiceDetails());
    form.clearErrors("serviceDetails");
    previousServiceRef.current = selectedService;
  }, [form, selectedService]);

  React.useEffect(() => {
    if (!hydrated) {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const subscription = form.watch((values) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        saveRequestAssessmentFormDraft({
          step,
          values: values as RequestAssessmentSchemaType,
          verifiedChannel,
          otpVerifiedPhone,
          otpVerifiedEmail,
        });
      }, 250);
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [
    form,
    hydrated,
    otpVerifiedEmail,
    otpVerifiedPhone,
    step,
    verifiedChannel,
  ]);

  React.useEffect(() => {
    if (!hydrated) {
      return;
    }

    saveRequestAssessmentFormDraft({
      step,
      values: form.getValues(),
      verifiedChannel,
      otpVerifiedPhone,
      otpVerifiedEmail,
    });
  }, [
    form,
    hydrated,
    otpVerifiedEmail,
    otpVerifiedPhone,
    step,
    verifiedChannel,
  ]);

  const [actionState, submitRequestAssessment, isActionPending] =
    useActionState(createRequestAssessmentAction, initialServerActionState);

  const lastHandledSubmissionRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (
      !actionState.submittedAt ||
      lastHandledSubmissionRef.current === actionState.submittedAt
    ) {
      return;
    }

    lastHandledSubmissionRef.current = actionState.submittedAt;

    const message = tActionMessages(
      actionState.message as RequestAssessmentActionMessageKey,
    );

    if (actionState.ok) {
      toast.success(message);
      const defaults = mergeAccountContactIntoValues(
        getRequestAssessmentDefaultValues(),
        user,
      );
      form.reset(defaults);
      setOtpVerifiedPhone(null);
      setOtpVerifiedEmail(null);
      setStep(1);
      setStepDirection(1);
      prefilledUserIdRef.current = user?.id ?? null;
      clearRequestAssessmentFormDraft();
      onSubmitted?.();
      return;
    }

    toast.error(message);
  }, [actionState, form, onSubmitted, tActionMessages, user]);

  const isSubmitting = form.formState.isSubmitting || isActionPending;

  const translateError = React.useCallback(
    (message?: string) => {
      if (!message) {
        return undefined;
      }

      return tFormErrors(message as FormErrorKey);
    },
    [tFormErrors],
  );

  function goToStep(nextStep: RequestAssessmentStep, direction: 1 | -1) {
    setStepDirection(direction);
    setStep(nextStep);
  }

  function handleVerifiedChannelChange(channel: ContactOtpChannel | null) {
    const values = form.getValues();
    if (channel === "phone") {
      setOtpVerifiedPhone(values.phone);
      return;
    }
    if (channel === "email") {
      setOtpVerifiedEmail(values.email);
      return;
    }
    setOtpVerifiedPhone(null);
    setOtpVerifiedEmail(null);
  }

  async function goNext() {
    const values = form.getValues();

    if (step === 1) {
      const result = validateRequestAssessmentStep(1, values);
      if (!result.success) {
        applyRequestAssessmentIssues(form, result.issues);
        return;
      }

      if (
        !getVerifiedChannel({
          preferredContact: values.preferredContact,
          phone: values.phone,
          email: values.email,
          accountPhone: account.phone,
          accountEmail: account.email,
          otpVerifiedPhone,
          otpVerifiedEmail,
        })
      ) {
        toast.error(tContact("verifyContactFirst"));
        return;
      }

      goToStep(2, 1);
      return;
    }

    if (step === 2) {
      const result = validateRequestAssessmentStep(2, values);
      if (!result.success) {
        applyRequestAssessmentIssues(form, result.issues);
        return;
      }

      goToStep(3, 1);
    }
  }

  function goBack() {
    if (step === 1) {
      return;
    }

    goToStep((step - 1) as RequestAssessmentStep, -1);
  }

  async function uploadPublicFiles(files: File[]): Promise<{ fileName: string; downloadUrl: string }[]> {
    const results: { fileName: string; downloadUrl: string }[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch(`${getServerCoreApiBaseUrl()}/uploads/public`, {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const result = await res.json();
          if (result.data) {
            results.push({ fileName: result.data.fileName, downloadUrl: result.data.downloadUrl });
          }
        }
      } catch (err) {
        console.error("File upload failed:", err);
      }
    }
    return results;
  }

  async function onSubmit(data: RequestAssessmentSchemaType) {
    if (step !== 3) {
      return;
    }

    if (
      !getVerifiedChannel({
        preferredContact: data.preferredContact,
        phone: data.phone,
        email: data.email,
        accountPhone: account.phone,
        accountEmail: account.email,
        otpVerifiedPhone,
        otpVerifiedEmail,
      })
    ) {
      toast.error(tContact("verifyContactFirst"));
      return;
    }

    // Upload attached files to public storage
    let uploadedAttachments: { fileName: string; downloadUrl: string }[] = [];
    if (fileObjects.length > 0) {
      uploadedAttachments = await uploadPublicFiles(fileObjects);
    }

    React.startTransition(() => {
      submitRequestAssessment({ ...data, locale, uploadedAttachments });
    });
  }

  return {
    form,
    step,
    stepDirection,
    hydrated,
    selectedService,
    verifiedChannel,
    accountPhone: account.phone,
    accountEmail: account.email,
    isSignedIn: Boolean(accessToken),
    setVerifiedChannel: handleVerifiedChannelChange,
    isSubmitting,
    translateError,
    goNext,
    goBack,
    onSubmit,
  };
}
