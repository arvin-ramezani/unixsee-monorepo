import type { RequestAssessmentSchemaType } from "@/lib/zod-schemas/request-assessment-schema";
import { getRequestAssessmentDefaultValues } from "@/lib/zod-schemas/request-assessment-schema";

export type RequestAssessmentVerifiedChannel = "phone" | "email";

export const REQUEST_ASSESSMENT_DRAFT_STORAGE_KEY =
  "unixsee:request-assessment-draft";

export const REQUEST_ASSESSMENT_STEP_COUNT = 3;

export type RequestAssessmentStep = 1 | 2 | 3;

export type RequestAssessmentFormDraft = {
  version: 1;
  step: RequestAssessmentStep;
  values: RequestAssessmentSchemaType;
  verifiedChannel: RequestAssessmentVerifiedChannel | null;
  otpVerifiedPhone: string | null;
  otpVerifiedEmail: string | null;
  updatedAt: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidStep(value: unknown): value is RequestAssessmentStep {
  return value === 1 || value === 2 || value === 3;
}

export function loadRequestAssessmentFormDraft(): RequestAssessmentFormDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(
      REQUEST_ASSESSMENT_DRAFT_STORAGE_KEY,
    );
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== 1) {
      return null;
    }

    if (!isValidStep(parsed.step) || !isRecord(parsed.values)) {
      return null;
    }

    const verifiedChannel = parsed.verifiedChannel;
    if (
      verifiedChannel !== null &&
      verifiedChannel !== "phone" &&
      verifiedChannel !== "email"
    ) {
      return null;
    }

    const values = {
      ...getRequestAssessmentDefaultValues(),
      ...(parsed.values as RequestAssessmentSchemaType),
    };

    const otpVerifiedPhone =
      typeof parsed.otpVerifiedPhone === "string"
        ? parsed.otpVerifiedPhone
        : verifiedChannel === "phone"
          ? values.phone
          : null;
    const otpVerifiedEmail =
      typeof parsed.otpVerifiedEmail === "string"
        ? parsed.otpVerifiedEmail
        : verifiedChannel === "email"
          ? values.email
          : null;

    return {
      version: 1,
      step: parsed.step,
      values,
      verifiedChannel,
      otpVerifiedPhone,
      otpVerifiedEmail,
      updatedAt:
        typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function saveRequestAssessmentFormDraft(
  draft: Omit<RequestAssessmentFormDraft, "version" | "updatedAt">,
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const payload: RequestAssessmentFormDraft = {
      version: 1,
      step: draft.step,
      values: draft.values,
      verifiedChannel: draft.verifiedChannel,
      otpVerifiedPhone: draft.otpVerifiedPhone,
      otpVerifiedEmail: draft.otpVerifiedEmail,
      updatedAt: Date.now(),
    };

    window.sessionStorage.setItem(
      REQUEST_ASSESSMENT_DRAFT_STORAGE_KEY,
      JSON.stringify(payload),
    );
  } catch {
    // Ignore quota or privacy mode errors.
  }
}

export function clearRequestAssessmentFormDraft(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(REQUEST_ASSESSMENT_DRAFT_STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}
