import { jsonOk } from "@/lib/api";
import { getRequestUserId } from "@/lib/request-user";
import { getUsageQuota } from "@/lib/usage-store";

export async function GET(request: Request) {
  const userId = await getRequestUserId(request);
  return jsonOk({ quota: await getUsageQuota(userId) });
}
