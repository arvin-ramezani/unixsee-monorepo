import { shouldRefreshToken } from "@/lib/auth/jwt";
import {
  getAccessTokenFromCookies,
  getServerClockOffsetInSeconds,
} from "@/lib/auth/server-cookie";
import { isAccessSessionAlive } from "@/lib/auth/session-alive";

export async function getServerAccessToken(): Promise<string | null> {
  const accessToken = await getAccessTokenFromCookies();

  if (!accessToken) {
    return null;
  }

  const serverClockOffsetInSeconds = await getServerClockOffsetInSeconds();

  if (shouldRefreshToken(accessToken, serverClockOffsetInSeconds)) {
    return null;
  }

  if (!(await isAccessSessionAlive(accessToken))) {
    return null;
  }

  return accessToken;
}
