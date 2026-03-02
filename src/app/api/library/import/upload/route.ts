import { jsonError, jsonOk } from "@/lib/api";
import { linkConversationLibraryItems } from "@/lib/chat-store";
import { createLibraryItem } from "@/lib/library-store";
import { getRequestUserId } from "@/lib/request-user";
import type { SourceType } from "@/lib/types";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

function inferSourceType(file: File): SourceType | null {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return "pdf";
  }

  if (ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "image";
  }

  return null;
}

export async function POST(request: Request) {
  const userId = await getRequestUserId(request);
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return jsonError("form data is required", 400);
  }

  const conversationIdRaw = formData.get("conversationId");
  const conversationId =
    typeof conversationIdRaw === "string" && conversationIdRaw.trim().length > 0
      ? conversationIdRaw.trim()
      : undefined;

  const fileEntries = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (fileEntries.length === 0) {
    return jsonError("at least one file is required", 400);
  }

  const createdItems = [];
  for (const file of fileEntries) {
    if (file.size > MAX_FILE_SIZE) {
      return jsonError(`file too large: ${file.name}`, 400);
    }

    const sourceType = inferSourceType(file);
    if (!sourceType) {
      return jsonError(`unsupported file type: ${file.name}`, 400);
    }

    const item = await createLibraryItem(userId, sourceType, file.name);
    createdItems.push(item);
  }

  if (conversationId && createdItems.length > 0) {
    await linkConversationLibraryItems(
      conversationId,
      createdItems.map((item) => item.id),
    );
  }

  return jsonOk(
    {
      items: createdItems,
      conversationId: conversationId ?? null,
    },
    201,
  );
}

