import { metricsAuthState, recordFunnelEvent, sanitizeDeviceId } from "../../../lib/analytics-store";
import { readWaitlist, saveWaitlistEmail } from "../../../lib/waitlist-store";

const MAX_BODY_BYTES = 4 * 1024;

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
  const entries = await readWaitlist();
  return json({ ok: true, count: entries.length, entries });
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return json(
        { ok: false, error: { code: "REQUEST_TOO_LARGE", message: "内容过大。" } },
        413,
      );
    }
    const text = await request.text();
    let body: unknown = {};
    if (text) {
      try {
        body = JSON.parse(text) as unknown;
      } catch {
        return json(
          { ok: false, error: { code: "INVALID_JSON", message: "无法解析。" } },
          400,
        );
      }
    }
    if (!body || typeof body !== "object") {
      return json(
        { ok: false, error: { code: "INVALID_JSON", message: "无法解析。" } },
        400,
      );
    }
    const result = await saveWaitlistEmail((body as { email?: unknown }).email);
    if (result === "invalid") {
      return json(
        { ok: false, error: { code: "INVALID_EMAIL", message: "请填写有效的邮箱。" } },
        400,
      );
    }
    if (result === "full") {
      return json(
        { ok: false, error: { code: "FULL", message: "名单暂时已满，请稍后再留。" } },
        503,
      );
    }
    if (result === "unavailable") {
      return json(
        { ok: false, error: { code: "UNAVAILABLE", message: "暂时没记下，请稍后再试。" } },
        503,
      );
    }
    const deviceId = sanitizeDeviceId((body as { deviceId?: unknown }).deviceId);
    await recordFunnelEvent("waitlist_email_submit", deviceId);
    return json({ ok: true, already: result === "already" });
  } catch (error) {
    console.warn("[waitlist] save failed", error);
    return json(
      { ok: false, error: { code: "UNAVAILABLE", message: "暂时没记下，请稍后再试。" } },
      503,
    );
  }
}
