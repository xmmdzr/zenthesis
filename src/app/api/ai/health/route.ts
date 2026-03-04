import { jsonOk } from "@/lib/api";
import { aiHealthCheck } from "@/lib/ai";

export async function GET() {
  const health = await aiHealthCheck();
  return jsonOk(health);
}
