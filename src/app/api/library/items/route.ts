import { jsonOk } from "@/lib/api";
import { listLibraryItems } from "@/lib/library-store";
import { getRequestUserId } from "@/lib/request-user";

export async function GET(request: Request) {
  const userId = await getRequestUserId(request);
  return jsonOk({ items: await listLibraryItems(userId) });
}
