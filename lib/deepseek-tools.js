import { AppError } from "./deepseek-normalizer.js";
import { humanizeSystemPrompt } from "./tool-prompts.js";

const ATTEMPT_TIMEOUT_MS = 30_000;
const TOTAL_BUDGET_MS = 30_000;
const MIN_RETRY_MS = 5_000;
const EMPTY_REWRITE_MESSAGE = "改写结果是空的，请再试一次。";

export function cleanRewrite(value) {
  let text = String(value || "").trim();
  const fenced = text.match(/^```[a-zA-Z0-9_-]*\s*\n([\s\S]*?)\n```$/);
  if (fenced) text = fenced[1].trim();
  text = text.replace(/^(改写后|改写|正文)[:：]\s*/, "");
  if (
    (text.startsWith("「") && text.endsWith("」"))
    || (text.startsWith("“") && text.endsWith("”"))
    || (text.startsWith('"') && text.endsWith('"'))
  ) {
    text = text.slice(1, -1).trim();
  }
  return text;
}

function flat(value, max = 48) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

function rawContent(message) {
  const content = message?.content;
  return typeof content === "string" ? content : "";
}

function emptyKind(message) {
  const content = message?.content;
  if (typeof content !== "string") return content == null ? "null" : "not-string";
  if (!content.trim()) return "blank";
  return "stripped";
}

function reasoningChars(message) {
  const value = message?.reasoning_content;
  return typeof value === "string" ? value.length : 0;
}

function tokenCount(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function thinkingBlockedOutput(choice, usage) {
  const reasoningTokens = tokenCount(usage?.completion_tokens_details?.reasoning_tokens);
  return choice?.finish_reason === "length" || reasoningChars(choice?.message) > 0 || reasoningTokens > 0;
}

function logEmptyRewrite(fields) {
  console.warn(
    "[humanize] empty rewrite"
    + ` attempt=${fields.attempt}`
    + ` model=${flat(fields.model)}`
    + ` kind=${fields.kind}`
    + ` finish=${flat(fields.finishReason)}`
    + ` inputChars=${fields.inputChars}`
    + ` reasoningChars=${fields.reasoningChars}`
    + ` completionTokens=${fields.completionTokens}`
    + ` reasoningTokens=${fields.reasoningTokens}`
    + ` retry=${fields.retry}`,
  );
}

function requestBody(text, model, disableThinking) {
  const body = {
    model,
    temperature: 0.7,
    stream: false,
    max_tokens: 4096,
    messages: [
      { role: "system", content: humanizeSystemPrompt() },
      { role: "user", content: text },
    ],
  };
  if (disableThinking) body.thinking = { type: "disabled" };
  return body;
}

function usageOf(payload) {
  return payload?.usage || {};
}

async function requestOnce({ text, apiKey, model, timeoutMs, disableThinking, fetchImpl }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let response;
  try {
    response = await fetchImpl("https://api.deepseek.com/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody(text, model, disableThinking)),
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new AppError("DEEPSEEK_TIMEOUT", "改写超过 30 秒还没回来，请少选一点再试。", 504);
    }
    throw new AppError("DEEPSEEK_UNREACHABLE", "暂时连不上改写服务，请稍后再试。", 502);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const providerStatus = response.status;
    const code = providerStatus === 429 ? "DEEPSEEK_RATE_LIMITED" : "DEEPSEEK_REQUEST_FAILED";
    const message = providerStatus === 401
      ? "改写密钥无效，请检查 DEEPSEEK_TOOLS_API_KEY。"
      : providerStatus === 429
        ? "改写请求太多了，请稍后再试。"
        : "这次没改写完，请稍后再试。";
    throw new AppError(code, message, providerStatus === 429 ? 429 : 502);
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new AppError("DEEPSEEK_INVALID_OUTPUT", "改写结果读不出来，请再试一次。", 502);
  }
  const choice = payload?.choices?.[0];
  return {
    rewritten: cleanRewrite(rawContent(choice?.message)),
    payload,
    choice,
  };
}

function emptyRewriteError() {
  return new AppError("DEEPSEEK_INVALID_OUTPUT", EMPTY_REWRITE_MESSAGE, 502);
}

export async function humanizeText(text, apiKey, model = "deepseek-flash", options = {}) {
  if (!apiKey) {
    throw new AppError("DEEPSEEK_API_KEY_MISSING", "人味改写还没配好密钥，请稍后再试。", 503);
  }
  const fetchImpl = options.fetchImpl || fetch;
  const attemptTimeoutMs = options.attemptTimeoutMs || ATTEMPT_TIMEOUT_MS;
  const totalBudgetMs = options.totalBudgetMs || TOTAL_BUDGET_MS;
  const minRetryMs = options.minRetryMs ?? MIN_RETRY_MS;
  const inputChars = [...String(text || "")].length;
  const started = Date.now();
  const first = await requestOnce({
    text,
    apiKey,
    model,
    fetchImpl,
    timeoutMs: Math.min(attemptTimeoutMs, totalBudgetMs),
    disableThinking: false,
  });
  if (first.rewritten) return first.rewritten;

  const usage = usageOf(first.payload);
  const blocked = thinkingBlockedOutput(first.choice, usage);
  const remain = totalBudgetMs - (Date.now() - started);
  const canRetry = remain >= minRetryMs;
  logEmptyRewrite({
    attempt: 1,
    model,
    kind: emptyKind(first.choice?.message),
    finishReason: first.choice?.finish_reason || "",
    inputChars,
    reasoningChars: reasoningChars(first.choice?.message),
    completionTokens: tokenCount(usage.completion_tokens),
    reasoningTokens: tokenCount(usage.completion_tokens_details?.reasoning_tokens),
    retry: canRetry ? (blocked ? "thinking-off" : "same") : "skipped-budget",
  });
  if (!canRetry) throw emptyRewriteError();

  const second = await requestOnce({
    text,
    apiKey,
    model,
    fetchImpl,
    timeoutMs: Math.min(attemptTimeoutMs, remain),
    disableThinking: blocked,
  });
  if (second.rewritten) return second.rewritten;

  const secondUsage = usageOf(second.payload);
  logEmptyRewrite({
    attempt: 2,
    model,
    kind: emptyKind(second.choice?.message),
    finishReason: second.choice?.finish_reason || "",
    inputChars,
    reasoningChars: reasoningChars(second.choice?.message),
    completionTokens: tokenCount(secondUsage.completion_tokens),
    reasoningTokens: tokenCount(secondUsage.completion_tokens_details?.reasoning_tokens),
    retry: "none",
  });
  throw emptyRewriteError();
}
