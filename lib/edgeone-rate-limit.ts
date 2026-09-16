import { AppError } from "./deepseek-normalizer";

const IP_DAILY_LIMIT = 10;
const GLOBAL_DAILY_LIMIT = 500;
const IP_PER_MINUTE_LIMIT = 2;
const STORE_NAME = "yooco-rate-limit";

type Counter = { count: number };

export class RateLimitError extends AppError {
  retryAfter: number;

  constructor(code: string, message: string, retryAfter: number) {
    super(code, message, 429);
    this.retryAfter = retryAfter;
  }
}

function beijingDateKey(now = Date.now()): string {
  return new Date(now + 8 * 3600 * 1000).toISOString().slice(0, 10);
}

function minuteSlot(now = Date.now()): number {
  return Math.floor(now / 60_000);
}

function secondsUntilNextMinute(now = Date.now()): number {
  return 60 - Math.floor((now / 1000) % 60);
}

function secondsUntilBeijingTomorrow(now = Date.now()): number {
  const bj = new Date(now + 8 * 3600 * 1000);
  const next = Date.UTC(bj.getUTCFullYear(), bj.getUTCMonth(), bj.getUTCDate() + 1);
  return Math.max(1, Math.ceil((next - bj.getTime()) / 1000));
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  const first = forwarded.split(",")[0]?.trim();
  return (
    first ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("eo-connecting-ip")?.trim() ||
    request.headers.get("true-client-ip")?.trim() ||
    "unknown"
  );
}

function ipKeyPart(ip: string): string {
  return ip.replace(/[^a-zA-Z0-9.:]/g, "_").slice(0, 64);
}

/** Cloudflare Workers expose caches.default; EdgeOne Next cloud functions do not. */
function isCloudflareWorker(): boolean {
  return Boolean((globalThis as { caches?: { default?: unknown } }).caches?.default);
}

function isRateLimitEnabled(): boolean {
  const flag = (process.env.RATE_LIMIT_ENABLED || "").trim().toLowerCase();
  if (flag === "0" || flag === "false" || flag === "off") return false;
  if (flag === "1" || flag === "true" || flag === "on") return true;
  return !isCloudflareWorker();
}

async function getStore() {
  const { getStore } = await import("@edgeone/pages-blob");
  return getStore(STORE_NAME);
}

async function readCount(store: Awaited<ReturnType<typeof getStore>>, key: string): Promise<number> {
  const value = await store.get(key, { type: "json", consistency: "strong" });
  const count = Number((value as Counter | null)?.count);
  return Number.isFinite(count) && count > 0 ? count : 0;
}

async function writeCount(store: Awaited<ReturnType<typeof getStore>>, key: string, count: number) {
  await store.setJSON(key, { count } satisfies Counter);
}

/**
 * Consume one AI-normalize quota. No-op on Cloudflare / when Blob is unavailable.
 */
export async function consumeNormalizeQuota(request: Request): Promise<void> {
  if (!isRateLimitEnabled()) return;

  let store;
  try {
    store = await getStore();
  } catch (error) {
    console.warn("[rate-limit] Blob store unavailable, skip quota", error);
    return;
  }

  const now = Date.now();
  const day = beijingDateKey(now);
  const slot = minuteSlot(now);
  const ip = ipKeyPart(clientIp(request));
  const minuteKey = `ip/${day}/${ip}/m/${slot}`;
  const dayKey = `ip/${day}/${ip}/d`;
  const globalKey = `global/${day}`;

  try {
    const [minuteCount, dayCount, globalCount] = await Promise.all([
      readCount(store, minuteKey),
      readCount(store, dayKey),
      readCount(store, globalKey),
    ]);

    if (minuteCount >= IP_PER_MINUTE_LIMIT) {
      throw new RateLimitError(
        "RATE_LIMITED",
        "操作太频繁，请稍等一分钟再试。",
        secondsUntilNextMinute(now),
      );
    }
    if (dayCount >= IP_DAILY_LIMIT) {
      throw new RateLimitError(
        "RATE_LIMITED",
        "今日免费次数已用完（每天 10 次），明天再来。",
        secondsUntilBeijingTomorrow(now),
      );
    }
    if (globalCount >= GLOBAL_DAILY_LIMIT) {
      throw new RateLimitError(
        "RATE_LIMITED",
        "今天全站试用名额已满，请明天再来。",
        secondsUntilBeijingTomorrow(now),
      );
    }

    await Promise.all([
      writeCount(store, minuteKey, minuteCount + 1),
      writeCount(store, dayKey, dayCount + 1),
      writeCount(store, globalKey, globalCount + 1),
    ]);
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.warn("[rate-limit] quota check failed, skip", error);
  }
}
