import { jsonError, jsonOk } from "@/lib/api";
import { aiChat } from "@/lib/ai";
import {
  appendConversationMessage,
  createConversation,
  getConversationSummary,
  getConversationWithMessages,
  linkConversationLibraryItems,
} from "@/lib/chat-store";
import { getDoc } from "@/lib/docs-store";
import { getLibraryItemsByIds } from "@/lib/library-store";
import { consumeUsage } from "@/lib/usage-store";
import { getRequestUserId } from "@/lib/request-user";
import type { ChatRequestPayload } from "@/lib/types";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as ChatRequestPayload | null;
  if (!payload?.prompt) {
    return jsonError("prompt is required", 400);
  }

  if (payload.useWeb !== undefined && typeof payload.useWeb !== "boolean") {
    return jsonError("useWeb must be a boolean", 400);
  }

  if (payload.useLibrary !== undefined && typeof payload.useLibrary !== "boolean") {
    return jsonError("useLibrary must be a boolean", 400);
  }

  if (payload.useCurrentDoc !== undefined && typeof payload.useCurrentDoc !== "boolean") {
    return jsonError("useCurrentDoc must be a boolean", 400);
  }

  if (
    payload.attachmentItemIds !== undefined &&
    (!Array.isArray(payload.attachmentItemIds) || payload.attachmentItemIds.some((id) => typeof id !== "string"))
  ) {
    return jsonError("attachmentItemIds must be a string array", 400);
  }

  if (payload.conversationId !== undefined && typeof payload.conversationId !== "string") {
    return jsonError("conversationId must be a string", 400);
  }

  const userId = await getRequestUserId(request);
  await consumeUsage(userId, 3);

  let conversationId = payload.conversationId?.trim() || "";
  let conversationSummary =
    conversationId.length > 0
      ? await getConversationSummary(userId, conversationId)
      : null;

  if (!conversationSummary) {
    const created = await createConversation(userId);
    conversationId = created.id;
    conversationSummary = created;
  }

  const attachmentIds = Array.from(
    new Set((payload.attachmentItemIds ?? []).map((id) => id.trim()).filter(Boolean)),
  );
  if (attachmentIds.length > 0) {
    await linkConversationLibraryItems(conversationId, attachmentIds);
  }

  const existingConversation = await getConversationWithMessages(userId, conversationId);
  const linkedAttachmentIds = Array.from(
    new Set([
      ...attachmentIds,
      ...existingConversation.attachments.map((item) => item.libraryItemId),
    ]),
  );
  const linkedAttachments = await getLibraryItemsByIds(userId, linkedAttachmentIds);

  const includeCurrentDoc = Boolean(payload.useCurrentDoc && payload.contextDocId);
  const currentDoc = includeCurrentDoc
    ? await getDoc(userId, payload.contextDocId as string)
    : undefined;

  const result = await aiChat({
    prompt: payload.prompt,
    useWeb: payload.useWeb ?? false,
    useLibrary: payload.useLibrary ?? false,
    useCurrentDoc: payload.useCurrentDoc ?? false,
    contextDocId: payload.contextDocId,
    conversationHistory: existingConversation.messages,
    currentDocument: currentDoc
      ? {
          id: currentDoc.id,
          title: currentDoc.title,
          content: currentDoc.content,
        }
      : null,
    attachments: linkedAttachments,
  });

  await appendConversationMessage(userId, {
    conversationId,
    role: "user",
    content: payload.prompt,
    useWeb: payload.useWeb ?? false,
    useLibrary: payload.useLibrary ?? false,
    useCurrentDoc: payload.useCurrentDoc ?? false,
    contextDocId: payload.contextDocId,
  });

  await appendConversationMessage(userId, {
    conversationId,
    role: "assistant",
    content: result.response,
    useWeb: payload.useWeb ?? false,
    useLibrary: payload.useLibrary ?? false,
    useCurrentDoc: payload.useCurrentDoc ?? false,
    contextDocId: payload.contextDocId,
  });

  if (result._meta.usedFallback) {
    console.warn("[api/ai/chat] fallback response", {
      reason: result._meta.providerReason,
      status: result._meta.status ?? null,
      model: result._meta.model,
      baseUrl: result._meta.baseUrl,
      upstreamMessage: result._meta.upstreamMessage ?? null,
      userId,
    });
  }

  const publicResult = {
    response: result.response,
    suggestions: result.suggestions,
    toolContext: result.toolContext,
    conversationId,
  };
  return jsonOk(publicResult);
}
