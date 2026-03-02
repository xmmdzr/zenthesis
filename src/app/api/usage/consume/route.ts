import { jsonError, jsonOk } from "@/lib/api";
import { getRequestUserId } from "@/lib/request-user";
import { consumeUsage } from "@/lib/usage-store";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as { units?: number } | null;
  if (typeof payload?.units !== "number") {
    return jsonError("units must be a number", 400);
  }

  const userId = await getRequestUserId(request);
  return jsonOk({ quota: await consumeUsage(userId, payload.units) });
}
