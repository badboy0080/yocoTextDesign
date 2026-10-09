import { AppError } from "./deepseek-normalizer";

const GLOBAL_DAILY_LIMIT = 500;
const IP_PER_MINUTE_LIMIT = 2;
const STORE_NAME = "yooco-rate-limit";
const CACHE_ORIGIN = "https://yooco-rate-limit.invalid";
const RATE_LIMIT_MESSAGE = "请稍后再试。";

type Counter = { count: number };

export class RateLimitError extends AppError {
  retryAfter: number;
  remaining: number;
  limit: number;

  constructor(
    code: string,
    message: string,
    retryAfter: number,
    remaining = 0,
    limit = 0,
  ) {
    super(code, message, 429);
    this.retryAfter = retryAfter;
    this.remaining = remaining;
    this.limit = limit;
  }
}

type CounterStore = {
  read(key: string): Promise<number>;
  write(key: string, count: number, ttlSeconds: number): Promise<void>;
};

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
  return true;
}

function cacheRequest(key: string): Request {
  return new Request(`${CACHE_ORIGIN}/${encodeURIComponent(key)}`, { method: "GET" });
}

function openCacheStore(): CounterStore {
  const cache = (globalThis as unknown as { caches: { default: Cache } }).caches.default;
  return {
    async read(key) {
      const hit = await cache.match(cacheRequest(key));
      if (!hit) return 0;
      try {
        const value = (await hit.json()) as Counter;
        const count = Number(value?.count);
        return Number.isFinite(count) && count > 0 ? count : 0;
      } catch {
        return 0;
      }
    },
    async write(key, count, ttlSeconds) {
      await cache.put(
        cacheRequest(key),
        new Response(JSON.stringify({ count } satisfies Counter), {
          headers: {
            "content-type": "application/json",
            "cache-control": `max-age=${Math.max(60, ttlSeconds)}`,
          },
        }),
      );
    },
  };
}

async function getBlobStore() {
  const { getStore } = await import("@edgeone/pages-blob");
  return getStore(STORE_NAME);
}

async function openBlobStore(): Promise<CounterStore> {
  const store = await getBlobStore();
  return {
    async read(key) {
      const value = await store.get(key, { type: "json", consistency: "strong" });
      const count = Number((value as Counter | null)?.count);
      return Number.isFinite(count) && count > 0 ? count : 0;
    },
    async write(key, count) {
      await store.setJSON(key, { count } satisfies Counter);
    },
  };
}

async function openStore(): Promise<CounterStore | null> {
  if (isCloudflareWorker()) return openCacheStore();
  try {
    return await openBlobStore();
  } catch (error) {
    console.warn("[rate-limit] Blob store unavailable, skip quota", error);
    return null;
  }
}

function quotaKeys(request: Request, now = Date.now()) {
  const day = beijingDateKey(now);
  const slot = minuteSlot(now);
  const ip = ipKeyPart(clientIp(request));
  return {
    now,
    minuteKey: `ip/${day}/${ip}/m/${slot}`,
    globalKey: `global/${day}`,
    dayTtl: secondsUntilBeijingTomorrow(now),
    minuteTtl: secondsUntilNextMinute(now),
  };
}

/**
 * Block short bursts and the site-wide daily cap.
 * Account usage credits are counted separately and are not reset here.
 * If the counter store is down, allow the request.
 */
export async function consumeNormalizeRateLimit(request: Request): Promise<void> {
  if (!isRateLimitEnabled()) return;

  let store: CounterStore | null;
  try {
    store = await openStore();
  } catch (error) {
    console.warn("[rate-limit] store unavailable, skip quota", error);
    return;
  }
  if (!store) return;

  try {
    const keys = quotaKeys(request);
    const [minuteCount, globalCount] = await Promise.all([
      store.read(keys.minuteKey),
      store.read(keys.globalKey),
    ]);

    if (minuteCount >= IP_PER_MINUTE_LIMIT || globalCount >= GLOBAL_DAILY_LIMIT) {
      const retryAfter = minuteCount >= IP_PER_MINUTE_LIMIT
        ? secondsUntilNextMinute(keys.now)
        : secondsUntilBeijingTomorrow(keys.now);
      throw new RateLimitError("RATE_LIMITED", RATE_LIMIT_MESSAGE, retryAfter);
    }

    await Promise.all([
      store.write(keys.minuteKey, minuteCount + 1, keys.minuteTtl),
      store.write(keys.globalKey, globalCount + 1, keys.dayTtl),
    ]);
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.warn("[rate-limit] quota check failed, skip", error);
  }
}
