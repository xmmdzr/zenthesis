import { jsonError, jsonOk } from "@/lib/api";
import { createLibraryItem } from "@/lib/library-store";
import { getRequestUserId } from "@/lib/request-user";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as { title?: string } | null;
  if (!payload?.title) {
    return jsonError("title is required", 400);
  }

  const userId = await getRequestUserId(request);
  const item = await createLibraryItem(userId, "bib_ris", payload.title);
  return jsonOk({ jobStatus: "completed", item }, 201);
}
