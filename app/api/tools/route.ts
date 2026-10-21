import { AppError } from "../../../lib/deepseek-normalizer";
import { humanizeText } from "../../../lib/deepseek-tools";
import { creditCost } from "../../../lib/credits";
import { HUMANIZE_MAX_CHARS } from "../../../lib/tool-prompts";
import {
  prepareCreditSpend,
  RateLimitError,
  spendCredits,
  TRIAL_LIMIT,
  UPGRADE_OFFER,
  type CreditSnapshot,
} from "../../../lib/edgeone-rate-limit";
import { getDeepseekModel, getDeepseekToolsApiKey } from "../../../lib/runtime-env";

const MAX_BODY_BYTES = 64 * 1024;

export const dynamic = "force-dynamic";

function headers(): Record<string, string> {
  return { "cache-control": "no-store" };
}

function creditsOf(error: RateLimitError): CreditSnapshot {
  return {
    remaining: error.remaining,
    limit: error.limit,
    bonus: error.bonus,
    unlimited: false,
  };
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) {
      throw new AppError("REQUEST_TOO_LARGE", "选中的文字太长了。", 413);
    }
    const body = (await request.json()) as { tool?: string; text?: string };
    const tool = typeof body?.tool === "string" ? body.tool : "";
    if (tool !== "humanize") {
      throw new AppError("UNKNOWN_TOOL", "还没有这个工具。", 400);
    }
    const rawText = typeof body?.text === "string" ? body.text : "";
    if ([...rawText].length > HUMANIZE_MAX_CHARS) {
      throw new AppError("TEXT_TOO_LONG", `单次最多 ${HUMANIZE_MAX_CHARS} 字，请少选一点。`, 400);
    }
    const text = rawText.trim();
    if (!text) {
      throw new AppError("EMPTY_INPUT", "先在原文里选中要改的段落。", 400);
    }
    const cost = creditCost("humanize");
    if (!cost) throw new AppError("UNKNOWN_TOOL", "还没有这个工具。", 400);
    const creditUser = await prepareCreditSpend(request, cost);
    const rewritten = await humanizeText(text, getDeepseekToolsApiKey(), getDeepseekModel());
    const trial = await spendCredits(creditUser, "humanize", cost);
    return Response.json(
      { ok: true, tool: "humanize", text: rewritten, trial, credits: trial.credits },
      { headers: headers() },
    );
  } catch (error) {
    const known = error instanceof AppError;
    const status = known ? error.status : 500;
    const code = known ? error.code : "INTERNAL_ERROR";
    const message = known ? error.message : "改写没有完成，请稍后再试。";
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
      payload.credits = creditsOf(error);
      payload.error.credits = payload.credits;
      if (error.code === "TRIAL_EXHAUSTED") payload.error.upgrade = UPGRADE_OFFER;
    } else {
      payload.error.limit = TRIAL_LIMIT;
    }
    return Response.json(payload, { status, headers: responseHeaders });
  }
}
