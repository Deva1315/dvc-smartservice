import { cookies, headers } from "next/headers";
import { AUTH_COOKIE_NAME } from "./auth.constants";
import { verifyAuthToken } from "./auth.session";

export async function getAuthSession() {
  const cookieStore = await cookies();
  const tokenFromCookie = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (tokenFromCookie) {
    return verifyAuthToken(tokenFromCookie);
  }

  const headerStore = await headers();
  const authorization = headerStore.get("authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }

  const tokenFromBearer = authorization.slice("Bearer ".length).trim();

  if (!tokenFromBearer) {
    return null;
  }

  return verifyAuthToken(tokenFromBearer);
}