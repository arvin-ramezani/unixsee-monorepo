import type { ApiResponse } from "@/types/auth.types";

export type MappedApiErrorKey =
  | "generic"
  | "unavailable"
  | "unauthorized"
  | "forbidden"
  | "notFound"
  | "rateLimited"
  | "validation";

export type MappedApiError = {
  key: MappedApiErrorKey;
  code: string | null;
  statusCode: number | null;
};

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

  if (status === 401 || code === "UNAUTHORIZED") {
    return { key: "unauthorized", code, statusCode: status };
  }
  if (status === 403 || code === "FORBIDDEN") {
    return { key: "forbidden", code, statusCode: status };
  }
  if (status === 404 || code === "NOT_FOUND") {
    return { key: "notFound", code, statusCode: status };
  }
  if (status === 429 || code === "TOO_MANY_REQUESTS") {
    return { key: "rateLimited", code, statusCode: status };
  }
  if (status === 400 || code === "BAD_REQUEST") {
    return { key: "validation", code, statusCode: status };
  }

  return { key: "generic", code, statusCode: status };
}
