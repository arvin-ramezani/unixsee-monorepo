import type { PlanRequestType } from "@/lib/data/plan-requests-data";
import {
  isLoggedInPlanRequest,
  isPublicPlanRequest,
} from "@/lib/plan-requests/plan-request-intake";
import { maskEmail, maskMobile } from "@/lib/users-utils";

export function resolvePlanRequestContactPrimary(
  request: PlanRequestType,
): string {
  if (isLoggedInPlanRequest(request)) {
    return request.linkedUserName ?? request.contactName;
  }
  return request.contactName;
}

export function resolvePlanRequestContactSecondary(
  request: PlanRequestType,
): string {
  if (isLoggedInPlanRequest(request)) {
    if (request.linkedUserName && request.contactName !== request.linkedUserName) {
      return request.contactName;
    }
    if (request.contactMobile) {
      return maskMobile(request.contactMobile);
    }
    if (request.contactEmail) {
      return maskEmail(request.contactEmail);
    }
    return "—";
  }

  if (request.contactMobile) {
    return maskMobile(request.contactMobile);
  }
  if (request.contactEmail) {
    return maskEmail(request.contactEmail);
  }
  return "—";
}

export function resolvePlanRequestAccountLabel(request: PlanRequestType): string {
  if (isPublicPlanRequest(request)) {
    if (request.linkedUserName) {
      return request.linkedUserName;
    }
    if (request.linkedUserId) {
      return "کاربر متصل";
    }
    return "نیاز به اتصال";
  }

  if (request.linkedUserName) {
    return request.linkedUserName;
  }
  if (request.linkedUserId) {
    return "حساب متصل";
  }
  return "حساب ناقص";
}

export function resolvePlanRequestWebsiteLabel(request: PlanRequestType): string {
  return request.targetWebsiteDomain ?? request.domainHint ?? "—";
}
