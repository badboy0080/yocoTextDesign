import {
  parseFunnelEvent,
  recordFunnelEvent,
  sanitizeDeviceId,
} from "../../../lib/analytics-store";

const MAX_BODY_BYTES = 4 * 1024;

export const dynamic = "force-dynamic";

function ok() {
  return Response.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}

async function readBody(request: Request): Promise<unknown> {
  const text = await request.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return Response.json(
        { ok: false, error: { code: "REQUEST_TOO_LARGE", message: "事件内容过大。" } },
        { status: 413, headers: { "cache-control": "no-store" } },
      );
    }
    const body = await readBody(request);
    if (!body || typeof body !== "object") {
      return Response.json(
        { ok: false, error: { code: "INVALID_JSON", message: "无法解析事件。" } },
        { status: 400, headers: { "cache-control": "no-store" } },
      );
    }
    const event = parseFunnelEvent((body as { event?: unknown }).event);
    if (!event) {
      return Response.json(
        { ok: false, error: { code: "UNKNOWN_EVENT", message: "只接受 visit、trial_click、optimize_ok。" } },
        { status: 400, headers: { "cache-control": "no-store" } },
      );
    }
    const deviceId = sanitizeDeviceId((body as { deviceId?: unknown }).deviceId);
    await recordFunnelEvent(event, deviceId);
    return ok();
  } catch (error) {
    console.warn("[analytics] track failed", error);
    return ok();
  }
}
