import { AppError } from "./deepseek-normalizer.js";
import { humanizeSystemPrompt } from "./tool-prompts.js";

const TOOL_TIMEOUT_MS = 30_000;

function cleanRewrite(value) {
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

export async function humanizeText(text, apiKey, model = "deepseek-flash") {
  if (!apiKey) {
    throw new AppError("DEEPSEEK_API_KEY_MISSING", "人味改写还没配好密钥，请稍后再试。", 503);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TOOL_TIMEOUT_MS);
  let response;
  try {
    response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        stream: false,
        max_tokens: 4096,
        messages: [
          { role: "system", content: humanizeSystemPrompt() },
          { role: "user", content: text },
        ],
      }),
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
  const rewritten = cleanRewrite(payload?.choices?.[0]?.message?.content || "");
  if (!rewritten) {
    throw new AppError("DEEPSEEK_INVALID_OUTPUT", "改写结果是空的，请再试一次。", 502);
  }
  return rewritten;
}
