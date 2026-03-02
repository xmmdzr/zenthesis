import { jsonError, jsonOk } from "@/lib/api";
import { formatCitation } from "@/lib/citations";
import type { CitationStyle, LibraryItem } from "@/lib/types";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | {
        style?: CitationStyle;
        item?: LibraryItem;
      }
    | null;

  if (!payload?.style || !payload?.item) {
    return jsonError("style and item are required", 400);
  }

  if (!["APA", "MLA", "Chicago"].includes(payload.style)) {
    return jsonError("unsupported style", 400);
  }

  return jsonOk({ citation: formatCitation(payload.style, payload.item) });
}
