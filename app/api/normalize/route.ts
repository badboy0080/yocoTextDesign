import { AppError, normalizeWithDeepSeek, validateRequest } from "../../../lib/deepseek-normalizer";
import {
  consumeNormalizeQuota,
  peekNormalizeQuota,
  RateLimitError,
  TRIAL_LIMIT,
  UPGRADE_OFFER,
} from "../../../lib/edgeone-rate-limit";
import { getDeepseekApiKey, getDeepseekModel } from "../../../lib/runtime-env";

const MAX_BODY_BYTES = 512 * 1024;

export const dynamic = "force-dynamic";

function trialHeaders(): Record<string, string> {
  return { "cache-control": "no-store" };
}

export async function GET(request: Request) {
  const trial = await peekNormalizeQuota(request);
  return Response.json(
    {
      ok: true,
      trial,
      upgrade: trial.remaining === 0 ? UPGRADE_OFFER : undefined,
    },
    { headers: trialHeaders() },
  );
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) {
      throw new AppError("REQUEST_TOO_LARGE", "提交内容过大，请控制在 160,000 个字符以内。", 413);
    }
    const body = await request.json();
    const source = validateRequest(body);
    const trial = await consumeNormalizeQuota(request);
    const data = await normalizeWithDeepSeek(source, getDeepseekApiKey(), getDeepseekModel());
    return Response.json({ ok: true, data, trial }, { headers: trialHeaders() });
  } catch (error) {
    const known = error instanceof AppError;
    const status = known ? error.status : 500;
    const code = known ? error.code : "INTERNAL_ERROR";
    const message = known ? error.message : "服务出现意外错误，请稍后重试。";
    const headers: Record<string, string> = trialHeaders();
    const payload: {
      ok: false;
      error: {
        code: string;
        message: string;
        remaining?: number;
        limit?: number;
        upgrade?: typeof UPGRADE_OFFER;
      };
    } = { ok: false, error: { code, message } };
    if (error instanceof RateLimitError) {
      headers["retry-after"] = String(error.retryAfter);
      payload.error.remaining = error.remaining;
      payload.error.limit = error.limit;
      if (error.code === "TRIAL_EXHAUSTED") {
        payload.error.upgrade = UPGRADE_OFFER;
      }
    } else {
      payload.error.limit = TRIAL_LIMIT;
    }
    return Response.json(payload, { status, headers });
  }
}
