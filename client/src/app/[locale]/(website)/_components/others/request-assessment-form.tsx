"use client";

import { RequestAssessmentMultiStepForm } from "./request-assessment-multi-step-form";

export type RequestAssessmentFormType = object;

export default function RequestAssessmentForm({}: RequestAssessmentFormType) {
  return (
    <RequestAssessmentMultiStepForm formId="request-assessment-form" />
  );
}
