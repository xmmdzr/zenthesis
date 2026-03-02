import { jsonError, jsonOk } from "@/lib/api";
import { getSessionUserIdFromRequest } from "@/lib/auth/session";
import { getDoc } from "@/lib/docs-store";
import { resolveShareToken } from "@/lib/share-store";

interface RouteContext {
  params: Promise<{ token: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const userId = await getSessionUserIdFromRequest(request);
  if (!userId) {
    return jsonError("authentication required", 401);
  }

  const { token } = await context.params;
  const resolved = await resolveShareToken(userId, token);
  if (!resolved) {
    return jsonError("invalid or expired share link", 404);
  }

  const doc = await getDoc(userId, resolved.docId);
  if (!doc) {
    return jsonError("document not found", 404);
  }

  return jsonOk({
    docId: resolved.docId,
    canEdit: resolved.canEdit,
    title: doc.title,
  });
}

