import { jsonError, jsonOk } from "@/lib/api";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as { phone?: string } | null;

  if (!payload?.phone) {
    return jsonError("phone is required", 400);
  }

  return jsonOk({
    requestId: `otp-${Date.now()}`,
    phone: payload.phone,
    status: "sent",
  });
}
