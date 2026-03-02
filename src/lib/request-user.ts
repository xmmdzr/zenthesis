import { getSessionUserIdFromRequest } from "@/lib/auth/session";

export async function getRequestUserId(request: Request): Promise<string> {
  const sessionUserId = await getSessionUserIdFromRequest(request).catch(() => null);
  if (sessionUserId) {
    return sessionUserId;
  }

  const fallbackUserId = request.headers.get("x-user-id")?.trim();
  return fallbackUserId || "demo-user";
}
