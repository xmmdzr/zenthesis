import { jsonError, jsonOk } from "@/lib/api";
import { getDoc } from "@/lib/docs-store";
import { getRequestUserId } from "@/lib/request-user";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const userId = await getRequestUserId(request);
  const { id } = await context.params;
  const payload = (await request.json().catch(() => null)) as { format?: "docx" | "pdf" } | null;

  if (!payload?.format || (payload.format !== "docx" && payload.format !== "pdf")) {
    return jsonError("format must be docx or pdf", 400);
  }

  const doc = await getDoc(userId, id);
  if (!doc) {
    return jsonError("document not found", 404);
  }

  return jsonOk({
    export: {
      format: payload.format,
      fileName: `${doc.title.replace(/\s+/g, "-").toLowerCase()}.${payload.format}`,
      downloadUrl: `/downloads/${id}.${payload.format}`,
      status: "ready",
    },
  });
}
