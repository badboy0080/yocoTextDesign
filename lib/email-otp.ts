import { randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";
import { normalizeEmail, validEmail } from "./email-address";

export const OTP_TTL_MS = 5 * 60 * 1000;
export const OTP_RESEND_MS = 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_LOCK_MS = 15 * 60 * 1000;
export const OTP_IP_LIMIT = 10;
export const OTP_IP_WINDOW_MS = 60 * 60 * 1000;

const STORE_NAME = "yooco-email-otp";
const STORE_KEY = "codes/v1";
const CACHE_ORIGIN = "https://yooco-email-otp.invalid";
const CACHE_TTL_SECONDS = 24 * 3600;
const MAX_CODES = 8000;

const LOCK_MESSAGE = "验证码错误次数过多，请 15 分钟后再试。";
const COOLDOWN_MESSAGE = "发送太频繁，请稍后再试。";
const IP_MESSAGE = "当前网络发送次数过多，请稍后再试。";
const STORE_MESSAGE = "验证码暂时存不上，请稍后再试。";

type CodeRecord = {
  email: string;
  codeHash: string;
  expiresAt: number;
  attempts: number;
  lockedUntil: number;
  lastSentAt: number;
};

type IpHit = {
  ip: string;
  at: number[];
};

type OtpDoc = {
  version: 1;
  codes: CodeRecord[];
  ips: IpHit[];
};

type OtpStore = {
  read(): Promise<OtpDoc>;
  write(doc: OtpDoc): Promise<void>;
};

export type OtpIssueResult =
  | { ok: true; email: string; code: string; issuedAt: number }
  | { ok: false; status: number; message: string };

export type OtpVerifyResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

const memoryFlag = { only: false };

function emptyDoc(): OtpDoc {
  return { version: 1, codes: [], ips: [] };
}

function memorySlot(): { doc: OtpDoc } {
  const g = globalThis as typeof globalThis & { __yoocoEmailOtp?: { doc: OtpDoc } };
  if (!g.__yoocoEmailOtp) g.__yoocoEmailOtp = { doc: emptyDoc() };
  return g.__yoocoEmailOtp;
}

export function resetOtpMemory(): void {
  memorySlot().doc = emptyDoc();
}

/** 检查脚本用。正式发码不会走这里。 */
export function enableMemoryOtpStoreForTests(): void {
  memoryFlag.only = true;
  resetOtpMemory();
}

export function otpSecretsForTests(email: string): string[] {
  const normalized = normalizeEmail(email);
  return memorySlot().doc.codes.filter((item) => item.email === normalized).map((item) => item.codeHash);
}

function asNumber(value: unknown): number {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return 0;
  return Math.floor(number);
}

function normalizeDoc(raw: unknown): OtpDoc {
  if (!raw || typeof raw !== "object") return emptyDoc();
  const source = raw as Partial<OtpDoc>;
  const codes: CodeRecord[] = [];
  const seen = new Set<string>();
  if (Array.isArray(source.codes)) {
    for (const item of source.codes) {
      if (!item || typeof item !== "object") continue;
      const email = normalizeEmail(String((item as CodeRecord).email || ""));
      if (!validEmail(email) || email.length > 120 || seen.has(email)) continue;
      seen.add(email);
      const codeHash = (item as CodeRecord).codeHash;
      codes.push({
        email,
        codeHash: typeof codeHash === "string" ? codeHash : "",
        expiresAt: asNumber((item as CodeRecord).expiresAt),
        attempts: Math.min(OTP_MAX_ATTEMPTS, asNumber((item as CodeRecord).attempts)),
        lockedUntil: asNumber((item as CodeRecord).lockedUntil),
        lastSentAt: asNumber((item as CodeRecord).lastSentAt),
      });
      if (codes.length >= MAX_CODES) break;
    }
  }
  const ips: IpHit[] = [];
  if (Array.isArray(source.ips)) {
    for (const item of source.ips) {
      if (!item || typeof item !== "object") continue;
      const ip = String((item as IpHit).ip || "").slice(0, 80);
      if (!ip) continue;
      const at = Array.isArray((item as IpHit).at) ? (item as IpHit).at.map(asNumber).filter((time) => time > 0).slice(-20) : [];
      if (!at.length) continue;
      ips.push({ ip, at });
      if (ips.length >= 5000) break;
    }
  }
  return { version: 1, codes, ips };
}

function keepCode(item: CodeRecord, now: number): boolean {
  if (item.lockedUntil > now) return true;
  if (now - item.lastSentAt < OTP_RESEND_MS) return true;
  if (item.codeHash && item.expiresAt > now) return true;
  // 错码次数在锁定窗口内保留，换一张新码不能把次数清零。
  return item.attempts > 0 && now - Math.max(item.lastSentAt, item.expiresAt) < OTP_LOCK_MS;
}

function prune(doc: OtpDoc, now: number): void {
  doc.codes = doc.codes.filter((item) => keepCode(item, now));
  if (doc.codes.length > MAX_CODES) doc.codes = doc.codes.slice(-MAX_CODES);
  doc.ips = doc.ips
    .map((item) => ({ ip: item.ip, at: item.at.filter((time) => now - time < OTP_IP_WINDOW_MS).slice(-20) }))
    .filter((item) => item.at.length > 0)
    .slice(-5000);
}

function isCloudflareWorker(): boolean {
  return Boolean((globalThis as { caches?: { default?: unknown } }).caches?.default);
}

function cacheRequest(): Request {
  return new Request(`${CACHE_ORIGIN}/${STORE_KEY}`, { method: "GET" });
}

function openMemoryStore(): OtpStore {
  return {
    async read() {
      return normalizeDoc(memorySlot().doc);
    },
    async write(doc) {
      memorySlot().doc = doc;
    },
  };
}

function openCacheStore(): OtpStore {
  const cache = (globalThis as unknown as { caches: { default: Cache } }).caches.default;
  return {
    async read() {
      const hit = await cache.match(cacheRequest());
      if (!hit) return emptyDoc();
      try {
        return normalizeDoc(await hit.json());
      } catch {
        return emptyDoc();
      }
    },
    async write(doc) {
      await cache.put(
        cacheRequest(),
        new Response(JSON.stringify(doc), {
          headers: {
            "content-type": "application/json",
            "cache-control": `max-age=${CACHE_TTL_SECONDS}`,
          },
        }),
      );
    },
  };
}

async function openBlobStore(): Promise<OtpStore> {
  const { getStore } = await import("@edgeone/pages-blob");
  const store = await getStore(STORE_NAME);
  return {
    async read() {
      const value = await store.get(STORE_KEY, { type: "json", consistency: "strong" });
      return normalizeDoc(value);
    },
    async write(doc) {
      await store.setJSON(STORE_KEY, doc);
    },
  };
}

async function openStore(): Promise<OtpStore> {
  if (memoryFlag.only) return openMemoryStore();
  if (isCloudflareWorker()) return openCacheStore();
  try {
    return await openBlobStore();
  } catch (error) {
    console.warn("[otp] Blob store unavailable, using memory", error instanceof Error ? error.message : "unknown");
    return openMemoryStore();
  }
}

let writeChain: Promise<unknown> = Promise.resolve();

function withOtpLock<T>(task: () => Promise<T>): Promise<T> {
  const run = writeChain.then(task, task);
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function hashCode(code: string, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(code, salt, 32).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

function codeMatches(code: string, stored: string) {
  const [method, salt, hash] = stored.split("$");
  if (method !== "scrypt" || !salt || !hash) return false;
  const actual = scryptSync(code, salt, 32);
  const expected = Buffer.from(hash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function readCode(value: string): string | null {
  const code = value.trim();
  if (!/^\d{6}$/.test(code)) return null;
  return code;
}

function fail(status: number, message: string): OtpIssueResult {
  return { ok: false, status, message };
}

export async function issueEmailCode(input: { email: string; ip: string; now?: number }): Promise<OtpIssueResult> {
  const email = normalizeEmail(input.email);
  if (!validEmail(email) || email.length > 120) return fail(400, "请填写有效的邮箱。");
  const now = input.now ?? Date.now();
  const ip = String(input.ip || "unknown").slice(0, 80) || "unknown";
  return withOtpLock(async () => {
    try {
      const store = await openStore();
      const doc = await store.read();
      prune(doc, now);
      let record = doc.codes.find((item) => item.email === email);
      if (record && record.lockedUntil > now) return fail(429, LOCK_MESSAGE);
      if (record && now - record.lastSentAt < OTP_RESEND_MS) return fail(429, COOLDOWN_MESSAGE);
      let hits = doc.ips.find((item) => item.ip === ip);
      const recent = (hits?.at || []).filter((time) => now - time < OTP_IP_WINDOW_MS);
      if (recent.length >= OTP_IP_LIMIT) return fail(429, IP_MESSAGE);
      if (record && record.lockedUntil > 0 && record.lockedUntil <= now) {
        record.attempts = 0;
        record.lockedUntil = 0;
      }
      const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
      if (!record) {
        record = { email, codeHash: "", expiresAt: 0, attempts: 0, lockedUntil: 0, lastSentAt: 0 };
        doc.codes.push(record);
      }
      record.codeHash = hashCode(code);
      record.expiresAt = now + OTP_TTL_MS;
      record.lastSentAt = now;
      if (!hits) {
        hits = { ip, at: [] };
        doc.ips.push(hits);
      }
      hits.at = recent.concat(now);
      await store.write(doc);
      return { ok: true, email, code, issuedAt: now };
    } catch (error) {
      console.warn("[otp] issue failed", error instanceof Error ? error.message : "unknown");
      return fail(503, STORE_MESSAGE);
    }
  });
}

export async function discardIssuedCode(email: string, issuedAt: number): Promise<void> {
  const normalized = normalizeEmail(email);
  await withOtpLock(async () => {
    try {
      const store = await openStore();
      const doc = await store.read();
      const record = doc.codes.find((item) => item.email === normalized);
      if (!record || record.lastSentAt !== issuedAt) return;
      record.codeHash = "";
      record.expiresAt = 0;
      record.lastSentAt = 0;
      await store.write(doc);
    } catch (error) {
      console.warn("[otp] discard failed", error instanceof Error ? error.message : "unknown");
    }
  });
}

export async function verifyEmailCode(input: { email: string; code: string; now?: number }): Promise<OtpVerifyResult> {
  const email = normalizeEmail(input.email);
  if (!validEmail(email) || email.length > 120) return { ok: false, status: 400, message: "请填写有效的邮箱。" };
  const code = readCode(input.code);
  if (!code) return { ok: false, status: 400, message: "请填写 6 位验证码。" };
  const now = input.now ?? Date.now();
  return withOtpLock(async () => {
    try {
      const store = await openStore();
      const doc = await store.read();
      let record = doc.codes.find((item) => item.email === email);
      if (record && record.lockedUntil > now) return { ok: false, status: 429, message: LOCK_MESSAGE };
      if (record?.codeHash && record.expiresAt <= now) {
        return { ok: false, status: 400, message: "验证码已过期，请重新获取。" };
      }
      prune(doc, now);
      record = doc.codes.find((item) => item.email === email);
      if (!record || !record.codeHash) return { ok: false, status: 400, message: "请先获取验证码。" };
      if (!codeMatches(code, record.codeHash)) {
        record.attempts += 1;
        if (record.attempts >= OTP_MAX_ATTEMPTS) {
          record.lockedUntil = now + OTP_LOCK_MS;
          record.codeHash = "";
          record.expiresAt = 0;
          await store.write(doc);
          return { ok: false, status: 429, message: LOCK_MESSAGE };
        }
        await store.write(doc);
        return { ok: false, status: 400, message: "验证码不正确。" };
      }
      // 码作废，但留下发送时间，避免刚用完又能立刻再发。
      record.codeHash = "";
      record.expiresAt = 0;
      record.attempts = 0;
      record.lockedUntil = 0;
      await store.write(doc);
      return { ok: true };
    } catch (error) {
      console.warn("[otp] verify failed", error instanceof Error ? error.message : "unknown");
      return { ok: false, status: 503, message: STORE_MESSAGE };
    }
  });
}
