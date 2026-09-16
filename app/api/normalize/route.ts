import { AppError, normalizeWithDeepSeek, validateRequest } from "../../../lib/deepseek-normalizer";
import { consumeNormalizeQuota, RateLimitError } from "../../../lib/edgeone-rate-limit";
import { getDeepseekApiKey, getDeepseekModel } from "../../../lib/runtime-env";

const MAX_BODY_BYTES = 512 * 1024;

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) {
      throw new AppError("REQUEST_TOO_LARGE", "提交内容过大，请控制在 160,000 个字符以内。", 413);
    }
    const body = await request.json();
    const source = validateRequest(body);
    await consumeNormalizeQuota(request);
    const data = await normalizeWithDeepSeek(source, getDeepseekApiKey(), getDeepseekModel());
    return Response.json({ ok: true, data }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const known = error instanceof AppError;
    const status = known ? error.status : 500;
    const code = known ? error.code : "INTERNAL_ERROR";
    const message = known ? error.message : "服务出现意外错误，请稍后重试。";
    const headers: Record<string, string> = { "cache-control": "no-store" };
    if (error instanceof RateLimitError) {
      headers["retry-after"] = String(error.retryAfter);
    }
    return Response.json({ ok: false, error: { code, message } }, { status, headers });
  }
}
