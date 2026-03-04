import { jsonError, jsonOk } from "@/lib/api";
import { deleteDocForUser, getDoc, updateDoc } from "@/lib/docs-store";
import { getRequestUserId } from "@/lib/request-user";
import type { DocCreationSettings } from "@/lib/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const userId = await getRequestUserId(request);
  const { id } = await context.params;
  const doc = await getDoc(userId, id);

  if (!doc) {
    return jsonError("document not found", 404);
  }

  return jsonOk({ doc });
}

export async function PATCH(request: Request, context: RouteContext) {
  const userId = await getRequestUserId(request);
  const { id } = await context.params;
  const payload = (await request.json().catch(() => null)) as
    | {
        title?: string;
        content?: string;
        contentJson?: Record<string, unknown> | null;
        creationSettings?: Record<string, unknown> | null;
        status?: "empty" | "active";
      }
    | null;

  if (!payload) {
    return jsonError("payload is required", 400);
  }

  const updated = await updateDoc(userId, id, {
    ...payload,
    creationSettings:
      payload.creationSettings && typeof payload.creationSettings === "object"
        ? (payload.creationSettings as unknown as DocCreationSettings)
        : undefined,
  });
  if (!updated) {
    return jsonError("document not found", 404);
  }

  return jsonOk({ doc: updated });
}

export async function DELETE(request: Request, context: RouteContext) {
  const userId = await getRequestUserId(request);
  const { id } = await context.params;

  const mode = await deleteDocForUser(userId, id);
  if (mode === "not_found") {
    return jsonError("document not found", 404);
  }

  return jsonOk({ deleted: true, mode });
}
