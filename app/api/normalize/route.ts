import { AppError, normalizeWithDeepSeek, validateRequest } from "../../../lib/deepseek-normalizer";
import { consumeNormalizeRateLimit, RateLimitError } from "../../../lib/edgeone-rate-limit";
import { commitSuccessfulOptimize, peekAccountUsage } from "../../../lib/local-accounts";
import { getDeepseekApiKey, getDeepseekModel } from "../../../lib/runtime-env";

const MAX_BODY_BYTES = 512 * 1024;

export const dynamic = "force-dynamic";

function trialHeaders(): Record<string, string> {
  return { "cache-control": "no-store" };
}

export async function GET() {
  const usage = await peekAccountUsage();
  if (!usage.login) {
    return Response.json(
      { ok: true, loginRequired: true, trial: { remaining: null, enforced: true } },
      { headers: trialHeaders() },
    );
  }
  return Response.json(
    { ok: true, loginRequired: false, trial: { remaining: usage.credits, enforced: true } },
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
    const { source, assignment } = validateRequest(body);
    const usage = await peekAccountUsage();
    if (!usage.login) {
      throw new AppError("LOGIN_REQUIRED", "请先登录后再优化。", 401);
    }
    if (usage.credits <= 0) {
      throw new AppError("CREDITS_EXHAUSTED", "使用机会已用完。", 403);
    }
    await consumeNormalizeRateLimit(request);
    const data = await normalizeWithDeepSeek(source, getDeepseekApiKey(), getDeepseekModel(), assignment);
    const committed = await commitSuccessfulOptimize();
    if (!committed.ok) {
      throw new AppError(committed.code, committed.message, committed.status);
    }
    return Response.json(
      { ok: true, data, trial: { remaining: committed.credits, enforced: true } },
      { headers: trialHeaders() },
    );
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
      };
    } = { ok: false, error: { code, message } };
    if (error instanceof RateLimitError) {
      headers["retry-after"] = String(error.retryAfter);
      const usage = await peekAccountUsage().catch(() => null);
      if (usage?.login) payload.error.remaining = usage.credits;
    } else if (code === "CREDITS_EXHAUSTED") {
      payload.error.remaining = 0;
    }
    return Response.json(payload, { status, headers });
  }
}
