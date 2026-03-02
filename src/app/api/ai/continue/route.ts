import { jsonError, jsonOk } from "@/lib/api";
import { aiContinue } from "@/lib/ai";
import { consumeUsage } from "@/lib/usage-store";
import { getRequestUserId } from "@/lib/request-user";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as { prompt?: string } | null;
  if (!payload?.prompt) {
    return jsonError("prompt is required", 400);
  }

  const userId = await getRequestUserId(request);
  await consumeUsage(userId, 2);
  return jsonOk(await aiContinue({ prompt: payload.prompt }));
}
