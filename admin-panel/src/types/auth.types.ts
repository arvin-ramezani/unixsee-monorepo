export type ApiResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: unknown;
  } | null;
  meta?: unknown;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  serverTimeInSeconds: number;
};

export type StaffRole = "ADMIN" | "OPERATOR";

export type SafeAuthUser = {
  id: string;
  phoneNumber: string | null;
  email: string | null;
  username: string | null;
  fullName: string | null;
  role: string;
};

export function isStaffRole(role: string | null | undefined): role is StaffRole {
  return role === "ADMIN" || role === "OPERATOR";
}
