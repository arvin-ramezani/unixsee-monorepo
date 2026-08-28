import { getServerCoreApiBaseUrl } from "@/lib/auth/auth-utils";

/**
 * Nest access strategy rejects JWTs when `hashedRt` was cleared (customer
 * logout or admin revoke-sessions). Local JWT expiry is not enough.
 */
export async function isAccessSessionAlive(
  accessToken: string,
): Promise<boolean> {
  try {
    const response = await fetch(`${getServerCoreApiBaseUrl()}/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}
