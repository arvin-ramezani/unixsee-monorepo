import type { FieldPath, UseFormReturn } from "react-hook-form";
import type { ZodIssue } from "zod";

import {
  requestAssessmentSchema,
  type RequestAssessmentSchemaType,
} from "./request-assessment-schema";

import type { RequestAssessmentStep } from "@/lib/request-assessment/form-draft-storage";

const STEP1_ROOT_FIELDS = new Set([
  "fullName",
  "preferredContact",
  "phone",
  "email",
  "aboutProject",
  "services",
]);

function issuesForStep(
  step: RequestAssessmentStep,
  issues: ZodIssue[],
): ZodIssue[] {
  if (step === 1) {
    return issues.filter((issue) => {
      const root = issue.path[0];
      return typeof root === "string" && STEP1_ROOT_FIELDS.has(root);
    });
  }

  if (step === 2) {
    return issues.filter((issue) => issue.path[0] === "serviceDetails");
  }

  return [];
}

export function validateRequestAssessmentStep(
  step: RequestAssessmentStep,
  data: RequestAssessmentSchemaType,
): { success: true } | { success: false; issues: ZodIssue[] } {
  if (step === 3) {
    return { success: true };
  }

  const parsed = requestAssessmentSchema.safeParse(data);
  if (parsed.success) {
    return { success: true };
  }

  const stepIssues = issuesForStep(step, parsed.error.issues);
  if (stepIssues.length === 0) {
    return { success: true };
  }

  return { success: false, issues: stepIssues };
}

export function applyRequestAssessmentIssues(
  form: UseFormReturn<RequestAssessmentSchemaType>,
  issues: ZodIssue[],
) {
  for (const issue of issues) {
    if (issue.path.length === 0) {
      continue;
    }

    const path = issue.path.join(".") as FieldPath<RequestAssessmentSchemaType>;
    form.setError(path, { type: "manual", message: issue.message });
  }
}
