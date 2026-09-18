import { metricsAuthState, readFunnelMetrics } from "../../../lib/analytics-store";

export const dynamic = "force-dynamic";

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "cache-control": "no-store" } });
}

export async function GET(request: Request) {
  const auth = metricsAuthState(request);
  if (auth === "missing-config") {
    return json(
      { ok: false, error: { code: "NOT_CONFIGURED", message: "未配置 ANALYTICS_TOKEN。" } },
      503,
    );
  }
  if (auth !== "ok") {
    return json(
      { ok: false, error: { code: "UNAUTHORIZED", message: "统计口令不正确。" } },
      401,
    );
  }

  try {
    const metrics = await readFunnelMetrics();
    return json({ ok: true, ...metrics });
  } catch (error) {
    console.warn("[analytics] metrics failed", error);
    return json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: "暂时读不到统计。" } },
      500,
    );
  }
}
