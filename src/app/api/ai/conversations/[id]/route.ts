import { jsonError, jsonOk } from "@/lib/api";
import { deleteConversation, getConversationWithMessages } from "@/lib/chat-store";
import { getRequestUserId } from "@/lib/request-user";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const userId = await getRequestUserId(request);
  const { id } = await context.params;

  const data = await getConversationWithMessages(userId, id);
  if (!data.conversation) {
    return jsonError("conversation not found", 404);
  }

  return jsonOk(data);
}

export async function DELETE(request: Request, context: RouteContext) {
  const userId = await getRequestUserId(request);
  const { id } = await context.params;
  const removed = await deleteConversation(userId, id);

  if (!removed) {
    console.warn("[api/ai/conversations/[id]] delete skipped", {
      userId,
      conversationId: id,
      status: "not_found",
    });
    return jsonError("conversation not found", 404);
  }

  console.info("[api/ai/conversations/[id]] delete ok", {
    userId,
    conversationId: id,
    status: "deleted",
  });
  return jsonOk({ deleted: true });
}
