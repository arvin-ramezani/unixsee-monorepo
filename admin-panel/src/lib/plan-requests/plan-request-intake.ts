import type { PlanRequestType } from "@/lib/data/plan-requests-data";

export const PLAN_REQUEST_INTAKE = {
  LOGGED_IN: "logged_in",
  PUBLIC: "public",
} as const;

export type PlanRequestIntakeType =
  (typeof PLAN_REQUEST_INTAKE)[keyof typeof PLAN_REQUEST_INTAKE];

export const PLAN_REQUEST_INTAKE_LABELS: Record<PlanRequestIntakeType, string> =
  {
    [PLAN_REQUEST_INTAKE.LOGGED_IN]: "کاربر واردشده",
    [PLAN_REQUEST_INTAKE.PUBLIC]: "درخواست مهمان",
  };

export const PLAN_REQUEST_INTAKE_HINTS: Record<PlanRequestIntakeType, string> =
  {
    [PLAN_REQUEST_INTAKE.LOGGED_IN]:
      "ثبت از داشبورد مشتری؛ حساب از زمان ثبت به درخواست متصل است.",
    [PLAN_REQUEST_INTAKE.PUBLIC]:
      "ثبت از وب عمومی بدون ورود؛ ابتدا کاربر موجود را در کاربران پیدا و متصل کنید.",
  };

/** Nest sets `createdByUserId` only for authenticated customer create. */
export function resolvePlanRequestIntake(input: {
  createdByUserId: string | null | undefined;
}): PlanRequestIntakeType {
  return input.createdByUserId
    ? PLAN_REQUEST_INTAKE.LOGGED_IN
    : PLAN_REQUEST_INTAKE.PUBLIC;
}

export function isPublicPlanRequest(request: PlanRequestType): boolean {
  return request.intakeType === PLAN_REQUEST_INTAKE.PUBLIC;
}

export function isLoggedInPlanRequest(request: PlanRequestType): boolean {
  return request.intakeType === PLAN_REQUEST_INTAKE.LOGGED_IN;
}
