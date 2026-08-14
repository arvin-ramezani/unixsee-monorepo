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

export type AuthUser = {
  id: string;
  phoneNumber: string | null;
  email: string | null;
  username: string | null;
  fullName: string | null;
  role?: string;
  locale?: string | null;
  phoneVerifiedAt?: string | null;
  emailVerifiedAt?: string | null;
};

export type AuthSessionPayload = AuthTokens & AuthUser;

export type SafeAuthUser = Omit<AuthUser, never> & {
  id: string;
};
