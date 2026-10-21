/**
 * Platform-agnostic env accessors for EdgeOne / Next and local Next.
 * Avoid importing `cloudflare:workers` so `next build` can succeed.
 */
export function getDeepseekApiKey(): string {
  return (process.env.DEEPSEEK_API_KEY || "").trim();
}

let toolsKeyFallbackWarned = false;

/** 人味改写优先用单独的密钥。没配时回退排版那把，并在日志里说一声。 */
export function getDeepseekToolsApiKey(): string {
  const tools = (process.env.DEEPSEEK_TOOLS_API_KEY || "").trim();
  if (tools) return tools;
  const main = getDeepseekApiKey();
  if (main && !toolsKeyFallbackWarned) {
    toolsKeyFallbackWarned = true;
    console.warn("[tools] DEEPSEEK_TOOLS_API_KEY 未配置，人味改写回退使用 DEEPSEEK_API_KEY。");
  }
  return main;
}

export function getDeepseekModel(): string {
  return (process.env.DEEPSEEK_MODEL || "deepseek-flash").trim() || "deepseek-flash";
}

export function getAnalyticsToken(): string {
  return (process.env.ANALYTICS_TOKEN || "").trim();
}
