import type { ApiResponse } from "@/types/auth.types";

export type MappedApiErrorKey =
  | "generic"
  | "unavailable"
  | "unauthorized"
  | "forbidden"
  | "notFound"
  | "rateLimited"
  | "validation"
  | "conflict";

export type MappedApiError = {
  key: MappedApiErrorKey;
  code: string | null;
  statusCode: number | null;
};

const ERROR_CODE_TO_KEY: Record<string, MappedApiErrorKey> = {
  RECOVERY_CHANNEL_UNAVAILABLE: "validation",
  VALIDATION_ERROR: "validation",
  BAD_REQUEST: "validation",
  UNAUTHORIZED: "unauthorized",
  FORBIDDEN: "forbidden",
  NOT_FOUND: "notFound",
  TOO_MANY_REQUESTS: "rateLimited",
  CONFLICT: "conflict",
  INTERNAL_SERVER_ERROR: "generic",
  HTTP_EXCEPTION: "generic",
};

function mapStatusToKey(
  status: number | null,
  code: string | null,
): MappedApiErrorKey {
  if (status === 401 || code === "UNAUTHORIZED") {
    return "unauthorized";
  }
  if (status === 403 || code === "FORBIDDEN") {
    return "forbidden";
  }
  if (status === 404 || code === "NOT_FOUND") {
    return "notFound";
  }
  if (status === 429 || code === "TOO_MANY_REQUESTS") {
    return "rateLimited";
  }
  if (status === 409 || code === "CONFLICT") {
    return "conflict";
  }
  if (status === 400 || code === "BAD_REQUEST") {
    return "validation";
  }

  return "generic";
}

export function mapApiError(
  response: Pick<ApiResponse<unknown>, "success" | "statusCode" | "error"> | null,
  httpStatus?: number,
): MappedApiError | null {
  if (!response) {
    return {
      key: "unavailable",
      code: null,
      statusCode: httpStatus ?? null,
    };
  }

  if (response.success) {
    return null;
  }

  const status = response.statusCode || httpStatus || null;
  const code = response.error?.code ?? null;
  const codeKey = code ? ERROR_CODE_TO_KEY[code] : undefined;

  return {
    key: codeKey ?? mapStatusToKey(status, code),
    code,
    statusCode: status,
  };
}

export const STAFF_API_ERROR_MESSAGES: Record<MappedApiErrorKey, string> = {
  generic: "خطایی رخ داد. لطفاً دوباره تلاش کنید.",
  unavailable: "سرویس در دسترس نیست. لطفاً بعداً تلاش کنید.",
  unauthorized: "نشست شما منقضی شده است. دوباره وارد شوید.",
  forbidden: "اجازه دسترسی به این عملیات را ندارید.",
  notFound: "مورد درخواستی پیدا نشد.",
  rateLimited: "تعداد درخواست‌ها زیاد است. کمی صبر کنید.",
  validation: "اطلاعات واردشده معتبر نیست.",
  conflict: "این عملیات با وضعیت فعلی سازگار نیست.",
};

export function resolveStaffApiErrorMessage(
  response: Pick<ApiResponse<unknown>, "success" | "statusCode" | "error"> | null,
  httpStatus?: number,
): string {
  const mapped = mapApiError(response, httpStatus);
  return mapped
    ? STAFF_API_ERROR_MESSAGES[mapped.key]
    : STAFF_API_ERROR_MESSAGES.generic;
}
