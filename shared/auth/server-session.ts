import { cookies } from "next/headers";
import { verifySessionToken, SESSION_CONFIG } from "@/shared/auth/session-token";

export async function getServerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_CONFIG.cookieName)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}
