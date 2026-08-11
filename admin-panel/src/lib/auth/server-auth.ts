import { shouldRefreshToken } from "@/lib/auth/jwt";
import {
  getAccessTokenFromCookies,
  getServerClockOffsetInSeconds,
} from "@/lib/auth/server-cookie";

export async function getServerAccessToken(): Promise<string | null> {
  const accessToken = await getAccessTokenFromCookies();

  if (!accessToken) {
    return null;
  }

  const serverClockOffsetInSeconds = await getServerClockOffsetInSeconds();

  if (shouldRefreshToken(accessToken, serverClockOffsetInSeconds)) {
    return null;
  }

  return accessToken;
}
