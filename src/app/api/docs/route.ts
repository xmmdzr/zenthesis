import { jsonError, jsonOk } from "@/lib/api";
import { aiGenerateSmartOutline } from "@/lib/ai";
import {
  buildStandardOutlineContent,
  contentJsonToPlainText,
  normalizeDocCreationSettings,
} from "@/lib/doc-bootstrap";
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
        creationSettings?: Record<string, unknown>;
        bootstrap?: boolean;
      }
    | null;

  if (!payload?.title && payload?.draftType !== "blank") {
    return jsonError("title is required", 400);
  }

  const userId = await getRequestUserId(request);
  const draftType = payload?.draftType ?? "standard";
  const normalizedSettings = normalizeDocCreationSettings(payload?.creationSettings || undefined);

  if (!["standard", "smart", "blank"].includes(draftType)) {
    return jsonError("draftType is invalid", 400);
  }

  const rawTitle = payload?.title ?? "";
  const rawSeedPrompt = payload?.seedPrompt?.trim() || rawTitle.trim();
  const shouldBootstrap = Boolean(payload?.bootstrap && draftType !== "blank");

  if (shouldBootstrap && draftType === "smart") {
    const generated = await aiGenerateSmartOutline({
      input: rawSeedPrompt || rawTitle || "未命名",
      settings: normalizedSettings,
    });

    if (generated.error || !generated.contentJson || !generated.content.trim()) {
      return jsonError(generated.error || "smart outline generation failed", 502);
    }

    return jsonOk(
      {
        doc: await createDoc(userId, {
          title: generated.title,
          draftType,
          seedPrompt: rawSeedPrompt,
          creationSettings: normalizedSettings,
          contentJson: generated.contentJson,
          content: generated.content,
          status: "active",
        }),
      },
      201,
    );
  }

  if (shouldBootstrap && draftType === "standard") {
    const contentJson = buildStandardOutlineContent(rawTitle || "未命名");
    const content = contentJsonToPlainText(contentJson);
    return jsonOk(
      {
        doc: await createDoc(userId, {
          title: rawTitle,
          draftType,
          seedPrompt: rawSeedPrompt,
          creationSettings: normalizedSettings,
          contentJson,
          content,
          status: "active",
        }),
      },
      201,
    );
  }

  return jsonOk(
    {
      doc: await createDoc(userId, {
        title: rawTitle,
        draftType,
        seedPrompt: rawSeedPrompt,
        creationSettings: normalizedSettings,
      }),
    },
    201,
  );
}
