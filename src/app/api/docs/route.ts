import { jsonError, jsonOk } from "@/lib/api";
import { createDoc, listDocs } from "@/lib/docs-store";
import { getRequestUserId } from "@/lib/request-user";

export async function GET(request: Request) {
  const userId = await getRequestUserId(request);
  return jsonOk({ docs: await listDocs(userId) });
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | {
        title?: string;
        draftType?: "standard" | "smart" | "blank";
        seedPrompt?: string;
      }
    | null;

  if (!payload?.title && payload?.draftType !== "blank") {
    return jsonError("title is required", 400);
  }

  const userId = await getRequestUserId(request);
  const draftType = payload?.draftType ?? "standard";

  if (!["standard", "smart", "blank"].includes(draftType)) {
    return jsonError("draftType is invalid", 400);
  }

  return jsonOk(
    {
      doc: await createDoc(userId, {
        title: payload?.title ?? "",
        draftType,
        seedPrompt: payload?.seedPrompt,
      }),
    },
    201,
  );
}
