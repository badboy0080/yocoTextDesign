import { env } from "cloudflare:workers";
import { AppError, normalizeWithDeepSeek, validateRequest } from "../../../lib/deepseek-normalizer";

const MAX_BODY_BYTES = 512 * 1024;

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) {
      throw new AppError("REQUEST_TOO_LARGE", "提交内容过大，请控制在 160,000 个字符以内。", 413);
    }
    const body = await request.json();
    const source = validateRequest(body);
    const data = await normalizeWithDeepSeek(source, env.DEEPSEEK_API_KEY, env.DEEPSEEK_MODEL || "deepseek-flash");
    return Response.json({ ok: true, data }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const known = error instanceof AppError;
    const status = known ? error.status : 500;
    const code = known ? error.code : "INTERNAL_ERROR";
    const message = known ? error.message : "服务出现意外错误，请稍后重试。";
    return Response.json({ ok: false, error: { code, message } }, { status, headers: { "cache-control": "no-store" } });
  }
}
