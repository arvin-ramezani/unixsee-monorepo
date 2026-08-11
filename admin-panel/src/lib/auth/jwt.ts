import { decodeJwt, type JWTPayload } from "jose";

const TOKEN_EXPIRATION_BUFFER_IN_SECONDS = 60;

export function extractJwtPayload(token: string): JWTPayload {
  return decodeJwt(token);
}

export function shouldRefreshToken(
  token: string,
  serverClockOffsetInSeconds: number,
): boolean {
  try {
    const payload = extractJwtPayload(token);

    if (typeof payload.exp !== "number") {
      return true;
    }

    const localNowInSeconds = Math.floor(Date.now() / 1000);
    const backendNowInSeconds = localNowInSeconds + serverClockOffsetInSeconds;

    return (
      payload.exp - backendNowInSeconds <= TOKEN_EXPIRATION_BUFFER_IN_SECONDS
    );
  } catch {
    return true;
  }
}
