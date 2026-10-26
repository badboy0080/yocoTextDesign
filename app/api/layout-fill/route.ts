import { creditCost } from "../../../lib/credits";
import {
  AppError,
  fillLayoutSlots,
  validateLayoutFillRequest,
} from "../../../lib/layout-fill";
import {
  prepareCreditSpend,
  RateLimitError,
  spendCredits,
  TRIAL_LIMIT,
  UPGRADE_OFFER,
  type CreditSnapshot,
} from "../../../lib/edgeone-rate-limit";
import { getDeepseekApiKey, getDeepseekModel } from "../../../lib/runtime-env";

const MAX_BODY_BYTES = 512 * 1024;
export const dynamic = "force-dynamic";

function headers(): Record<string, string> {
  return { "cache-control": "no-store" };
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) {
      throw new AppError("REQUEST_TOO_LARGE", "提交内容过大。", 413);
    }
    const body = await request.json();
    const ctx = validateLayoutFillRequest(body);
    const cost = creditCost("layout"); // 共用工作台额度
    if (!cost) throw new AppError("INTERNAL_ERROR", "排版积分价格没配好。", 500);
    const creditUser = await prepareCreditSpend(request, cost);
    const data = await fillLayoutSlots(ctx, getDeepseekApiKey(), getDeepseekModel());
    const trial = await spendCredits(creditUser, "layout", cost);
    return Response.json({ ok: true, data, trial, credits: trial.credits }, { headers: headers() });
  } catch (error) {
    const known = error instanceof AppError;
    const status = known ? error.status : 500;
    const code = known ? error.code : "INTERNAL_ERROR";
    const message = known ? error.message : "排版失败，再试一次";
    const responseHeaders = headers();
    const payload: {
      ok: false;
      credits?: CreditSnapshot;
      error: {
        code: string;
        message: string;
        remaining?: number;
        limit?: number;
        bonus?: number;
        credits?: CreditSnapshot;
        upgrade?: typeof UPGRADE_OFFER;
      };
    } = { ok: false, error: { code, message } };
    if (error instanceof RateLimitError) {
      responseHeaders["retry-after"] = String(error.retryAfter);
      payload.error.remaining = error.remaining;
      payload.error.limit = error.limit;
      payload.error.bonus = error.bonus;
      payload.credits = {
        remaining: error.remaining,
        limit: error.limit,
        bonus: error.bonus,
        unlimited: false,
      };
      payload.error.credits = payload.credits;
      if (error.code === "TRIAL_EXHAUSTED") payload.error.upgrade = UPGRADE_OFFER;
    } else {
      payload.error.limit = TRIAL_LIMIT;
    }
    return Response.json(payload, { status, headers: responseHeaders });
  }
}
