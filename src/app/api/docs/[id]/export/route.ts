import { jsonError } from "@/lib/api";
import { getDoc } from "@/lib/docs-store";
import { exportDocx, exportPdf } from "@/lib/document-export";
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

  const exported = payload.format === "docx" ? await exportDocx(doc) : await exportPdf(doc);
  const body = new Blob([exported.bytes], { type: exported.contentType });

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": exported.contentType,
      "Content-Disposition": `attachment; filename=\"${exported.fileName}\"`,
      "Cache-Control": "no-store",
    },
  });
}
