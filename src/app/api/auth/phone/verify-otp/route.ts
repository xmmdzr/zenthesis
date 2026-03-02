import { jsonError, jsonOk } from "@/lib/api";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | {
        requestId?: string;
        code?: string;
      }
    | null;

  if (!payload?.requestId || !payload?.code) {
    return jsonError("requestId and code are required", 400);
  }

  return jsonOk({
    verified: true,
    userId: "demo-user",
    sessionToken: `session-${Date.now()}`,
  });
}
