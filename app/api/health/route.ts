import { env } from "cloudflare:workers";

export function GET() {
  return Response.json(
    { ok: true, deepseekConfigured: Boolean(env.DEEPSEEK_API_KEY) },
    { headers: { "cache-control": "no-store" } },
  );
}
