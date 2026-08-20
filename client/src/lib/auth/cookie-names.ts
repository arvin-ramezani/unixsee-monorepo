export const AUTH_COOKIE_NAMES = {
  accessToken:
    process.env.ACCESS_TOKEN_COOKIE_NAME?.trim() || "unixsee_access_token",
  refreshToken:
    process.env.REFRESH_TOKEN_COOKIE_NAME?.trim() || "unixsee_refresh_token",
  serverClockOffset:
    process.env.SERVER_CLOCK_OFFSET_COOKIE_NAME?.trim() ||
    "unixsee_server_clock_offset",
  pendingLoginPhone:
    process.env.PHONE_NUMBER_TO_LOGIN_KEY?.trim() ||
    "unixsee_pending_login_phone",
} as const;

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
