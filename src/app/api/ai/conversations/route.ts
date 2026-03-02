import { jsonError, jsonOk } from "@/lib/api";
import { createConversation, listConversations } from "@/lib/chat-store";
import { getRequestUserId } from "@/lib/request-user";

export async function GET(request: Request) {
  const userId = await getRequestUserId(request);
  return jsonOk({ conversations: await listConversations(userId) });
}

export async function POST(request: Request) {
  const userId = await getRequestUserId(request);
  const payload = (await request.json().catch(() => null)) as { title?: string } | null;

  if (payload && payload.title !== undefined && typeof payload.title !== "string") {
    return jsonError("title must be a string", 400);
  }

  const conversation = await createConversation(userId, payload?.title);
  return jsonOk({ conversation }, 201);
}

