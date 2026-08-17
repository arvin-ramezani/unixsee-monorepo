export const PLAN_REQUEST_SIGN_IN_PHONE_KEY =
  "unixsee:plan-request-sign-in-phone";

/** After account catch, signed-in users land on the dashboard plans list. */
export const PLAN_REQUEST_ACCOUNT_EXISTS_RETURN_TO = "/dashboard/plans";

export const PLAN_REQUEST_ACCOUNT_EXISTS_NOTICE = "account-exists";

export const PLAN_REQUEST_ACCOUNT_EXISTS_TOAST_ID =
  "plan-request-account-exists";

export function buildAccountExistsSignInHref(phone?: string): string {
  if (phone) {
    sessionStorage.setItem(PLAN_REQUEST_SIGN_IN_PHONE_KEY, phone);
  }

  const params = new URLSearchParams({
    returnTo: PLAN_REQUEST_ACCOUNT_EXISTS_RETURN_TO,
    notice: PLAN_REQUEST_ACCOUNT_EXISTS_NOTICE,
  });

  return `/auth?${params.toString()}`;
}
