import { AppError } from "./deepseek-normalizer";
import { planNormalizeSpend, quotaRemaining } from "./invite-quota";
import { consumeInviteBonus, peekInviteBonus } from "./invite-store";
import { currentAccount } from "./local-accounts";

export const TRIAL_LIMIT = 10;
const IP_DAILY_LIMIT = TRIAL_LIMIT;
const GLOBAL_DAILY_LIMIT = 500;
const IP_PER_MINUTE_LIMIT = 2;
const STORE_NAME = "yooco-rate-limit";
const CACHE_ORIGIN = "https://yooco-rate-limit.invalid";

export const UPGRADE_PROMPT =
  "免费试用次数已用完（每天 10 次）。升级专业版：¥9.9/月 或 ¥59.9/年。";

export const UPGRADE_OFFER = {
  monthly: "¥9.9/月",
  yearly: "¥59.9/年",
} as const;

type Counter = { count: number };

export type TrialQuota = {
  remaining: number | null;
  limit: number;
  enforced: boolean;
  /** 账号上还没用完的邀请加成。已经算进 remaining。访客是 0。 */
  bonus: number;
};

export class RateLimitError extends AppError {
  retryAfter: number;
  remaining: number;
  limit: number;

  bonus: number;

  constructor(
    code: string,
    message: string,
    retryAfter: number,
    remaining = 0,
    limit = TRIAL_LIMIT,
    bonus = 0,
  ) {
    super(code, message, 429);
    this.retryAfter = retryAfter;
    this.remaining = remaining;
    this.limit = limit;
    this.bonus = bonus;
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

function skippedQuota(bonus = 0): TrialQuota {
  return { remaining: null, limit: TRIAL_LIMIT, enforced: false, bonus };
}

function memoryCounterStore(): CounterStore {
  const g = globalThis as typeof globalThis & { __yoocoRateLimit?: Map<string, number> };
  if (!g.__yoocoRateLimit) g.__yoocoRateLimit = new Map();
  const counts = g.__yoocoRateLimit;
  return {
    async read(key) {
      return counts.get(key) || 0;
    },
    async write(key, count) {
      counts.set(key, count);
    },
  };
}

async function readAccountBonus(): Promise<{ userId: number | null; bonus: number }> {
  try {
    const account = await currentAccount();
    if (!account) return { userId: null, bonus: 0 };
    const bonus = await peekInviteBonus(account.id);
    return { userId: account.id, bonus };
  } catch (error) {
    console.warn("[rate-limit] account bonus unavailable", error);
    return { userId: null, bonus: 0 };
  }
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
    // 本机没有 Blob 时记在内存里，邀请加成才能跟每天次数加在一起验。线上 Blob 失败仍放行。
    if (process.env.NODE_ENV !== "production") return memoryCounterStore();
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
    dayKey: `ip/${day}/${ip}/d`,
    globalKey: `global/${day}`,
    dayTtl: secondsUntilBeijingTomorrow(now),
    minuteTtl: secondsUntilNextMinute(now),
  };
}

async function readQuota(store: CounterStore, request: Request) {
  const keys = quotaKeys(request);
  const [minuteCount, dayCount, globalCount] = await Promise.all([
    store.read(keys.minuteKey),
    store.read(keys.dayKey),
    store.read(keys.globalKey),
  ]);
  return { keys, minuteCount, dayCount, globalCount };
}

/**
 * Read remaining free AI-normalize uses without consuming a slot.
 * Guest daily uses plus this account's invite bonus.
 * No-op when the backing store is unavailable.
 */
export async function peekNormalizeQuota(request: Request): Promise<TrialQuota> {
  if (!isRateLimitEnabled()) return skippedQuota();
  const accountBonus = await readAccountBonus();

  let store: CounterStore | null;
  try {
    store = await openStore();
  } catch (error) {
    console.warn("[rate-limit] store unavailable, skip quota", error);
    return skippedQuota(accountBonus.bonus);
  }
  if (!store) return skippedQuota(accountBonus.bonus);

  try {
    const { dayCount } = await readQuota(store, request);
    return {
      remaining: quotaRemaining(dayCount, IP_DAILY_LIMIT, accountBonus.bonus),
      limit: TRIAL_LIMIT,
      enforced: true,
      bonus: accountBonus.bonus,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.warn("[rate-limit] quota peek failed, skip", error);
    return skippedQuota(accountBonus.bonus);
  }
}

/**
 * Consume one AI-normalize quota. No-op when the backing store is unavailable.
 */
export async function consumeNormalizeQuota(request: Request): Promise<TrialQuota> {
  if (!isRateLimitEnabled()) return skippedQuota();
  const accountBonus = await readAccountBonus();

  let store: CounterStore | null;
  try {
    store = await openStore();
  } catch (error) {
    console.warn("[rate-limit] store unavailable, skip quota", error);
    return skippedQuota(accountBonus.bonus);
  }
  if (!store) return skippedQuota(accountBonus.bonus);

  try {
    const { keys, minuteCount, dayCount, globalCount } = await readQuota(store, request);
    const bonus = accountBonus.userId ? accountBonus.bonus : 0;
    const remaining = quotaRemaining(dayCount, IP_DAILY_LIMIT, bonus);
    const plan = planNormalizeSpend(dayCount, IP_DAILY_LIMIT, bonus);

    if (minuteCount >= IP_PER_MINUTE_LIMIT) {
      throw new RateLimitError(
        "RATE_LIMITED",
        "操作太频繁，请稍等一分钟再试。",
        secondsUntilNextMinute(keys.now),
        remaining,
        TRIAL_LIMIT,
        bonus,
      );
    }
    if (globalCount >= GLOBAL_DAILY_LIMIT) {
      throw new RateLimitError(
        "RATE_LIMITED",
        "今天全站试用名额已满，请明天再来。",
        secondsUntilBeijingTomorrow(keys.now),
        remaining,
        TRIAL_LIMIT,
        bonus,
      );
    }
    if (plan.action === "exhausted") {
      throw new RateLimitError(
        "TRIAL_EXHAUSTED",
        UPGRADE_PROMPT,
        secondsUntilBeijingTomorrow(keys.now),
        0,
        TRIAL_LIMIT,
        0,
      );
    }

    if (plan.action === "bonus") {
      if (!accountBonus.userId) {
        throw new RateLimitError(
          "TRIAL_EXHAUSTED",
          UPGRADE_PROMPT,
          secondsUntilBeijingTomorrow(keys.now),
          0,
        );
      }
      const spent = await consumeInviteBonus(accountBonus.userId);
      if (!spent.ok) {
        throw new AppError("QUOTA_UNAVAILABLE", "这次没扣成次数，请稍后再试。", 503);
      }
      if (!spent.spent) {
        throw new RateLimitError(
          "TRIAL_EXHAUSTED",
          UPGRADE_PROMPT,
          secondsUntilBeijingTomorrow(keys.now),
          0,
          TRIAL_LIMIT,
          0,
        );
      }
      await Promise.all([
        store.write(keys.minuteKey, minuteCount + 1, keys.minuteTtl),
        store.write(keys.globalKey, globalCount + 1, keys.dayTtl),
      ]);
      return {
        remaining: spent.bonusRemaining,
        limit: TRIAL_LIMIT,
        enforced: true,
        bonus: spent.bonusRemaining,
      };
    }

    await Promise.all([
      store.write(keys.minuteKey, minuteCount + 1, keys.minuteTtl),
      store.write(keys.dayKey, dayCount + 1, keys.dayTtl),
      store.write(keys.globalKey, globalCount + 1, keys.dayTtl),
    ]);

    return {
      remaining: plan.remaining,
      limit: TRIAL_LIMIT,
      enforced: true,
      bonus,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.warn("[rate-limit] quota check failed, skip", error);
    return skippedQuota(accountBonus.bonus);
  }
}
