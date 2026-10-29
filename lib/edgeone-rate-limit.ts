import { AppError } from "./deepseek-normalizer";
import { quotaRemaining } from "./invite-quota";
import { consumeInviteBonus, peekInviteBonus } from "./invite-store";
import { currentQuotaAccount, parseDailyLimit, type QuotaAccount } from "./local-accounts";
import { TRIAL_LIMIT, UPGRADE_PROMPT } from "./trial-quota";

export { TRIAL_LIMIT, UPGRADE_PROMPT };

const GLOBAL_DAILY_LIMIT = 500;
const IP_PER_MINUTE_LIMIT = 2;
const STORE_NAME = "yooco-rate-limit";
const CACHE_ORIGIN = "https://yooco-rate-limit.invalid";

export const UPGRADE_OFFER = {
  monthly: "¥9.9/月",
  yearly: "¥59.9/年",
} as const;

type Counter = { count: number };

/** 和 trial 同一套数字。旧字段留着，新客户端读 credits。1 次 = 1 积分，不换存储。 */
export type CreditSnapshot = {
  remaining: number | null;
  limit: number;
  bonus: number;
  unlimited: boolean;
  action?: string;
  cost?: number;
};

export type CreditUser = {
  request: Request;
  unlimited: boolean;
  skipped: boolean;
  userId: number | null;
  limit: number;
  bonus: number;
};

export type TrialQuota = {
  remaining: number | null;
  limit: number;
  enforced: boolean;
  /** 账号上还没用完的邀请加成。已经算进 remaining。访客是 0。 */
  bonus: number;
  /** 当前登录账号不限积分。为 true 时这次没有扣每日积分，也没有扣邀请加成。 */
  unlimited?: boolean;
  credits?: CreditSnapshot;
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

function unlimitedQuota(): TrialQuota {
  return { remaining: null, limit: TRIAL_LIMIT, enforced: false, bonus: 0, unlimited: true };
}

function presentQuota(trial: TrialQuota, extra?: { action?: string; cost?: number }): TrialQuota {
  const credits: CreditSnapshot = {
    remaining: trial.remaining,
    limit: trial.limit,
    bonus: trial.bonus,
    unlimited: trial.unlimited === true,
  };
  if (extra?.action) credits.action = extra.action;
  if (typeof extra?.cost === "number") credits.cost = extra.cost;
  return { ...trial, credits };
}

type AccountQuotaReader = (request?: Request) => Promise<Partial<QuotaAccount> | null>;

let readAccountForQuota: AccountQuotaReader = (request) => currentQuotaAccount(request);

/** 检查脚本用来换掉当前登录账号。传入 null 则恢复读真实会话。 */
export function useAccountReaderForTests(reader: AccountQuotaReader | null) {
  readAccountForQuota = reader ?? (() => currentQuotaAccount());
}

function effectiveDailyLimit(account: Partial<QuotaAccount> | null): number {
  const custom = parseDailyLimit(account?.dailyLimit);
  return custom === undefined ? TRIAL_LIMIT : custom;
}

async function readQuotaAccount(request?: Request): Promise<Partial<QuotaAccount> | null> {
  try {
    return await readAccountForQuota(request);
  } catch (error) {
    console.warn("[rate-limit] account check failed", error);
    return null;
  }
}

async function readBonus(userId: number | null): Promise<number> {
  if (!userId) return 0;
  try {
    return await peekInviteBonus(userId);
  } catch (error) {
    console.warn("[rate-limit] account bonus unavailable", error);
    return 0;
  }
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

function quotaKeys(request: Request, userId: number | null, now = Date.now()) {
  const day = beijingDateKey(now);
  const slot = minuteSlot(now);
  const ip = ipKeyPart(clientIp(request));
  return {
    now,
    minuteKey: `ip/${day}/${ip}/m/${slot}`,
    dayKey: userId ? `user/${day}/${userId}/d` : `ip/${day}/${ip}/d`,
    globalKey: `global/${day}`,
    dayTtl: secondsUntilBeijingTomorrow(now),
    minuteTtl: secondsUntilNextMinute(now),
  };
}

async function readQuota(store: CounterStore, request: Request, userId: number | null) {
  const keys = quotaKeys(request, userId);
  const [minuteCount, dayCount, globalCount] = await Promise.all([
    store.read(keys.minuteKey),
    store.read(keys.dayKey),
    store.read(keys.globalKey),
  ]);
  return { keys, minuteCount, dayCount, globalCount };
}

type QuotaSubject = {
  userId: number | null;
  limit: number;
  bonus: number;
};

/** 不限积分直接返回。已登录用账号每天额度和 userId 计数；访客仍按 IP 和全站 3 积分。 */
async function readQuotaSubject(request?: Request): Promise<{ unlimited: true } | { unlimited: false; subject: QuotaSubject }> {
  const account = await readQuotaAccount(request);
  if (account?.unlimitedUses === true) return { unlimited: true };
  const userId = typeof account?.id === "number" && Number.isInteger(account.id) && account.id > 0 ? account.id : null;
  return {
    unlimited: false,
    subject: {
      userId,
      limit: userId ? effectiveDailyLimit(account) : TRIAL_LIMIT,
      bonus: await readBonus(userId),
    },
  };
}

/**
 * Read remaining free AI-normalize uses without consuming a slot.
 * Logged-in accounts use their own daily limit and user id.
 * Guests stay on the IP counter plus no invite bonus.
 * No-op when the backing store is unavailable.
 */
export async function peekNormalizeQuota(request: Request): Promise<TrialQuota> {
  const subject = await readQuotaSubject(request);
  if (subject.unlimited) return presentQuota(unlimitedQuota());
  if (!isRateLimitEnabled()) return presentQuota(skippedQuota());
  const { limit, bonus } = subject.subject;

  let store: CounterStore | null;
  try {
    store = await openStore();
  } catch (error) {
    console.warn("[rate-limit] store unavailable, skip quota", error);
    return presentQuota(skippedQuota(bonus));
  }
  if (!store) return presentQuota(skippedQuota(bonus));

  try {
    const { dayCount } = await readQuota(store, request, subject.subject.userId);
    return presentQuota({
      remaining: quotaRemaining(dayCount, limit, bonus),
      limit,
      enforced: true,
      bonus,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.warn("[rate-limit] quota peek failed, skip", error);
    return presentQuota(skippedQuota(bonus));
  }
}

function creditUserFrom(
  request: Request,
  account: { unlimited: true } | { unlimited: false; subject: QuotaSubject },
  skipped: boolean,
): CreditUser {
  if (account.unlimited) {
    return { request, unlimited: true, skipped: false, userId: null, limit: TRIAL_LIMIT, bonus: 0 };
  }
  return {
    request,
    unlimited: false,
    skipped,
    userId: account.subject.userId,
    limit: account.subject.limit,
    bonus: account.subject.bonus,
  };
}

/**
 * 先看积分够不够，并记一笔限流（同一 IP 一分钟、全站当天名额）。
 * 这里不扣每日积分，也不扣邀请加成。AI 成功后再调 spendCredits。
 */
export async function prepareCreditSpend(request: Request, cost: number): Promise<CreditUser> {
  if (!Number.isInteger(cost) || cost < 1) {
    throw new AppError("INVALID_INPUT", "这次扣分不对。", 400);
  }
  const subject = await readQuotaSubject(request);
  if (subject.unlimited) return creditUserFrom(request, subject, false);
  const { userId, limit, bonus } = subject.subject;
  if (!isRateLimitEnabled()) return creditUserFrom(request, subject, true);

  let store: CounterStore | null;
  try {
    store = await openStore();
  } catch (error) {
    console.warn("[rate-limit] store unavailable, skip quota", error);
    return creditUserFrom(request, subject, true);
  }
  if (!store) return creditUserFrom(request, subject, true);

  try {
    const { keys, minuteCount, dayCount, globalCount } = await readQuota(store, request, userId);
    const remaining = quotaRemaining(dayCount, limit, bonus);
    if (minuteCount >= IP_PER_MINUTE_LIMIT) {
      throw new RateLimitError(
        "RATE_LIMITED",
        "操作太频繁，请稍等一分钟再试。",
        secondsUntilNextMinute(keys.now),
        remaining,
        limit,
        bonus,
      );
    }
    if (globalCount >= GLOBAL_DAILY_LIMIT) {
      throw new RateLimitError(
        "RATE_LIMITED",
        "今天全站试用名额已满，请明天再来。",
        secondsUntilBeijingTomorrow(keys.now),
        remaining,
        limit,
        bonus,
      );
    }
    if (remaining < cost) {
      throw new RateLimitError(
        "TRIAL_EXHAUSTED",
        UPGRADE_PROMPT,
        secondsUntilBeijingTomorrow(keys.now),
        remaining,
        limit,
        bonus,
      );
    }
    await Promise.all([
      store.write(keys.minuteKey, minuteCount + 1, keys.minuteTtl),
      store.write(keys.globalKey, globalCount + 1, keys.dayTtl),
    ]);
    return creditUserFrom(request, subject, false);
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.warn("[rate-limit] quota check failed, skip", error);
    return creditUserFrom(request, subject, true);
  }
}

/**
 * AI 成功之后才扣积分。先扣当天额度，再扣邀请加成。失败不要调这个函数。
 * user 用 prepareCreditSpend 的返回值。cost 见 lib/credits.js。
 */
export async function spendCredits(user: CreditUser, action: string, cost: number): Promise<TrialQuota> {
  const extra = { action, cost };
  if (user.unlimited) return presentQuota(unlimitedQuota(), extra);
  if (user.skipped) return presentQuota(skippedQuota(user.bonus), extra);
  if (!Number.isInteger(cost) || cost < 1) {
    throw new AppError("INVALID_INPUT", "这次扣分不对。", 400);
  }

  let store: CounterStore | null;
  try {
    store = await openStore();
  } catch (error) {
    console.warn("[rate-limit] store unavailable, skip quota", error);
    return presentQuota(skippedQuota(user.bonus), extra);
  }
  if (!store) return presentQuota(skippedQuota(user.bonus), extra);

  try {
    const { keys, dayCount } = await readQuota(store, user.request, user.userId);
    const bonus = user.userId ? await readBonus(user.userId) : 0;
    const remaining = quotaRemaining(dayCount, user.limit, bonus);
    if (remaining < cost) {
      throw new RateLimitError(
        "TRIAL_EXHAUSTED",
        UPGRADE_PROMPT,
        secondsUntilBeijingTomorrow(keys.now),
        remaining,
        user.limit,
        bonus,
      );
    }
    const dailyLeft = Math.max(0, user.limit - Math.max(0, dayCount));
    const fromDaily = Math.min(cost, dailyLeft);
    const needBonus = cost - fromDaily;
    let bonusLeft = bonus;
    if (fromDaily > 0) {
      await store.write(keys.dayKey, dayCount + fromDaily, keys.dayTtl);
    }
    if (needBonus > 0) {
      if (!user.userId) {
        throw new RateLimitError(
          "TRIAL_EXHAUSTED",
          UPGRADE_PROMPT,
          secondsUntilBeijingTomorrow(keys.now),
          0,
          user.limit,
          0,
        );
      }
      for (let index = 0; index < needBonus; index += 1) {
        const spent = await consumeInviteBonus(user.userId);
        if (!spent.ok) {
          throw new AppError("QUOTA_UNAVAILABLE", "这次没扣成积分，请稍后再试。", 503);
        }
        if (!spent.spent) {
          throw new RateLimitError(
            "TRIAL_EXHAUSTED",
            UPGRADE_PROMPT,
            secondsUntilBeijingTomorrow(keys.now),
            0,
            user.limit,
            bonusLeft,
          );
        }
        bonusLeft = spent.bonusRemaining;
      }
    }
    return presentQuota(
      {
        remaining: quotaRemaining(dayCount + fromDaily, user.limit, bonusLeft),
        limit: user.limit,
        enforced: true,
        bonus: bonusLeft,
      },
      extra,
    );
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.warn("[rate-limit] credit spend failed, skip", error);
    return presentQuota(skippedQuota(user.bonus), extra);
  }
}

/** 排版仍走这一层：先限流，再扣 1 积分。检查脚本还在用它。 */
export async function consumeNormalizeQuota(request: Request): Promise<TrialQuota> {
  const user = await prepareCreditSpend(request, 1);
  return spendCredits(user, "layout", 1);
}
