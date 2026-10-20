import { getDeepseekApiKey, getDeepseekModel } from "../../../lib/runtime-env";
import { AppError, parseLayoutCopy, validateLayoutRequest } from "../../../lib/layout-parse";

const MAX_BODY_BYTES = 64 * 1024;

export const dynamic = "force-dynamic";

// TODO: 版式分析还没单独计次，也不占用「优化排版」每天 3 次。上线前再定要不要按 IP 限流。

function headers(): Record<string, string> {
  return { "cache-control": "no-store" };
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) {
      throw new AppError("REQUEST_TOO_LARGE", "提交内容过大。海报文案请控制在 8000 字以内。", 413);
    }
    const body = await request.json();
    const { source } = validateLayoutRequest(body);
    const data = await parseLayoutCopy(source, getDeepseekApiKey(), getDeepseekModel());
    return Response.json({ ok: true, data }, { headers: headers() });
  } catch (error) {
    const known = error instanceof AppError;
    const status = known ? error.status : 500;
    const code = known ? error.code : "INTERNAL_ERROR";
    const message = known ? error.message : "服务出现意外错误，请稍后重试。";
    return Response.json({ ok: false, error: { code, message } }, { status, headers: headers() });
  }
}
