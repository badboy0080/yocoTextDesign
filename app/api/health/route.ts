import { getDeepseekApiKey } from "../../../lib/runtime-env";

export function GET() {
  return Response.json(
    { ok: true, deepseekConfigured: Boolean(getDeepseekApiKey()) },
    { headers: { "cache-control": "no-store" } },
  );
}
