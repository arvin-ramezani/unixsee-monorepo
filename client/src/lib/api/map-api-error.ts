import type { ApiResponse } from "@/types/auth.types";

export type MappedApiErrorKey =
  | "generic"
  | "unavailable"
  | "unauthorized"
  | "forbidden"
  | "notFound"
  | "rateLimited"
  | "validation"
  | "conflict"
  | "accountExists";

export type MappedApiError = {
  key: MappedApiErrorKey;
  code: string | null;
  statusCode: number | null;
};

const ERROR_CODE_TO_KEY: Record<string, MappedApiErrorKey> = {
  ACCOUNT_EXISTS: "accountExists",
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
