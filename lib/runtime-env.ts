/**
 * Platform-agnostic env accessors for EdgeOne / Next and local Next.
 * Avoid importing `cloudflare:workers` so `next build` can succeed.
 */
export function getDeepseekApiKey(): string {
  return (process.env.DEEPSEEK_API_KEY || "").trim();
}

export function getDeepseekModel(): string {
  return (process.env.DEEPSEEK_MODEL || "deepseek-flash").trim() || "deepseek-flash";
}
