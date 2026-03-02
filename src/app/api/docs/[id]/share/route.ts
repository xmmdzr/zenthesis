import { jsonError, jsonOk } from "@/lib/api";
import { getSessionUserIdFromRequest } from "@/lib/auth/session";
import { createShareLink, getActiveShareLink, revokeShareLink } from "@/lib/share-store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function requireOrigin(request: Request) {
  return new URL(request.url).origin;
}

export async function GET(request: Request, context: RouteContext) {
  const userId = await getSessionUserIdFromRequest(request);
  if (!userId) {
    return jsonError("authentication required", 401);
  }

  const { id } = await context.params;
  const link = await getActiveShareLink(userId, id);
  return jsonOk({ share: link });
}

export async function POST(request: Request, context: RouteContext) {
  const userId = await getSessionUserIdFromRequest(request);
  if (!userId) {
    return jsonError("authentication required", 401);
  }

  const { id } = await context.params;
  const link = await createShareLink(userId, id);
  if (!link) {
    return jsonError("document not found", 404);
  }

  const origin = requireOrigin(request);
  return jsonOk({
    share: {
      id: link.id,
      canEdit: link.canEdit,
      createdAt: link.createdAt.toISOString(),
      shareUrl: `${origin}/app/shared/${link.token}`,
    },
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  const userId = await getSessionUserIdFromRequest(request);
  if (!userId) {
    return jsonError("authentication required", 401);
  }

  const { id } = await context.params;
  const revoked = await revokeShareLink(userId, id);
  if (!revoked) {
    return jsonError("share link not found", 404);
  }

  return jsonOk({ revoked: true });
}

