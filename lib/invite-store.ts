import { randomInt } from "node:crypto";

export const INVITE_REDEEM_LIMIT = 5;
export const INVITE_BONUS_USES = 5;
const CODE_LENGTH = 6;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const STORE_NAME = "yooco-invites";
const STORE_KEY = "invites/v1";
const CACHE_ORIGIN = "https://yooco-invites.invalid";
const CACHE_TTL_SECONDS = 400 * 24 * 3600;
const MAX_CODES = 20000;

export type InviteFailure = "invalid" | "exhausted" | "own" | "already" | "unavailable";

type CodeRecord = {
  code: string;
  ownerId: number;
  redeemCount: number;
  createdAt: string;
};

type UserInvite = {
  userId: number;
  code: string;
  bonusRemaining: number;
  redeemedCode?: string;
};

type InviteDoc = {
  version: 1;
  codes: CodeRecord[];
  users: UserInvite[];
};

type InviteStore = {
  read(): Promise<InviteDoc>;
  write(doc: InviteDoc): Promise<void>;
};

const CODE_PATTERN = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/;

export function inviteSentence(code: string): string {
  return `你的邀请码：${code}。一码最多用 5 次。好友注册填码，可多 5 次免费。`;
}

export function inviteFailureMessage(reason: InviteFailure): string {
  switch (reason) {
    case "invalid":
      return "邀请码不对。";
    case "exhausted":
      return "这个邀请码已经用满 5 次。";
    case "own":
      return "不能使用自己的邀请码。";
    case "already":
      return "这个账号已经领过邀请加成。";
    case "unavailable":
      return "邀请码暂时存不上，请稍后再试。";
  }
}

export function inviteFailureStatus(reason: InviteFailure): number {
  if (reason === "unavailable") return 503;
  if (reason === "exhausted" || reason === "already") return 409;
  return 400;
}

/** 空着当没填。填了但不是 6 位邀请码，算无效。 */
export function readInviteInput(value: unknown): { kind: "absent" } | { kind: "code"; code: string } | { kind: "invalid" } {
  if (value == null) return { kind: "absent" };
  if (typeof value !== "string") return { kind: "invalid" };
  const trimmed = value.trim();
  if (!trimmed) return { kind: "absent" };
  const code = trimmed.toUpperCase().replace(/[\s-]/g, "");
  if (!CODE_PATTERN.test(code)) return { kind: "invalid" };
  return { kind: "code", code };
}

function emptyDoc(): InviteDoc {
  return { version: 1, codes: [], users: [] };
}

function asUserId(value: unknown): number | null {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

function clampCount(value: unknown, max: number): number {
  const count = Math.floor(Number(value));
  if (!Number.isFinite(count) || count <= 0) return 0;
  return Math.min(max, count);
}

function normalizeDoc(raw: unknown): InviteDoc {
  if (!raw || typeof raw !== "object") return emptyDoc();
  const source = raw as Partial<InviteDoc>;
  const codes: CodeRecord[] = [];
  const seenCodes = new Set<string>();
  if (Array.isArray(source.codes)) {
    for (const item of source.codes) {
      if (!item || typeof item !== "object") continue;
      const code = readInviteInput((item as CodeRecord).code);
      const ownerId = asUserId((item as CodeRecord).ownerId);
      const createdAt = (item as CodeRecord).createdAt;
      if (code.kind !== "code" || !ownerId || seenCodes.has(code.code)) continue;
      if (typeof createdAt !== "string" || !createdAt) continue;
      seenCodes.add(code.code);
      codes.push({
        code: code.code,
        ownerId,
        redeemCount: clampCount((item as CodeRecord).redeemCount, INVITE_REDEEM_LIMIT),
        createdAt,
      });
      if (codes.length >= MAX_CODES) break;
    }
  }
  const users: UserInvite[] = [];
  const seenUsers = new Set<number>();
  if (Array.isArray(source.users)) {
    for (const item of source.users) {
      if (!item || typeof item !== "object") continue;
      const userId = asUserId((item as UserInvite).userId);
      if (!userId || seenUsers.has(userId)) continue;
      const parsedCode = readInviteInput((item as UserInvite).code || "");
      const code = parsedCode.kind === "code" ? parsedCode.code : "";
      const parsedRedeemed = readInviteInput((item as UserInvite).redeemedCode || "");
      seenUsers.add(userId);
      users.push({
        userId,
        code,
        bonusRemaining: clampCount((item as UserInvite).bonusRemaining, INVITE_BONUS_USES),
        ...(parsedRedeemed.kind === "code" ? { redeemedCode: parsedRedeemed.code } : {}),
      });
    }
  }
  return { version: 1, codes, users };
}

function memorySlot(): { doc: InviteDoc } {
  const g = globalThis as typeof globalThis & { __yoocoInvites?: { doc: InviteDoc } };
  if (!g.__yoocoInvites) g.__yoocoInvites = { doc: emptyDoc() };
  return g.__yoocoInvites;
}

export function resetInviteMemory(): void {
  memorySlot().doc = emptyDoc();
}

function openMemoryStore(): InviteStore {
  return {
    async read() {
      return normalizeDoc(memorySlot().doc);
    },
    async write(doc) {
      memorySlot().doc = doc;
    },
  };
}

function isCloudflareWorker(): boolean {
  return Boolean((globalThis as { caches?: { default?: unknown } }).caches?.default);
}

function cacheRequest(): Request {
  return new Request(`${CACHE_ORIGIN}/${STORE_KEY}`, { method: "GET" });
}

function openCacheStore(): InviteStore {
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

async function openBlobStore(): Promise<InviteStore> {
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

function memoryAllowed(): boolean {
  return process.env.NODE_ENV !== "production";
}

async function openStore(): Promise<{ store: InviteStore; durable: boolean } | null> {
  if (isCloudflareWorker()) return { store: openCacheStore(), durable: true };
  try {
    return { store: await openBlobStore(), durable: true };
  } catch (error) {
    console.warn("[invite] Blob store unavailable, using memory", error);
    if (!memoryAllowed()) return null;
    return { store: openMemoryStore(), durable: false };
  }
}

let writeChain: Promise<unknown> = Promise.resolve();

function withInviteLock<T>(task: () => Promise<T>): Promise<T> {
  const run = writeChain.then(task, task);
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function newCode(doc: InviteDoc): string | null {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    let code = "";
    for (let i = 0; i < CODE_LENGTH; i += 1) code += ALPHABET[randomInt(ALPHABET.length)];
    if (!doc.codes.some((item) => item.code === code)) return code;
  }
  return null;
}

export type InviteCard = {
  code: string;
  sentence: string;
  redeemCount: number;
  redeemLimit: number;
  bonusRemaining: number;
};

function cardFor(doc: InviteDoc, user: UserInvite): InviteCard {
  const record = doc.codes.find((item) => item.code === user.code);
  return {
    code: user.code,
    sentence: inviteSentence(user.code),
    redeemCount: record?.redeemCount ?? 0,
    redeemLimit: INVITE_REDEEM_LIMIT,
    bonusRemaining: user.bonusRemaining,
  };
}

export async function ensureInviteCode(userId: number): Promise<{ ok: true; card: InviteCard } | { ok: false; reason: "unavailable" }> {
  return withInviteLock(async () => {
    const opened = await openStore();
    if (!opened) return { ok: false as const, reason: "unavailable" as const };
    try {
      const doc = await opened.store.read();
      let user = doc.users.find((item) => item.userId === userId);
      if (user?.code && doc.codes.some((item) => item.code === user?.code)) {
        return { ok: true as const, card: cardFor(doc, user) };
      }
      if (doc.codes.length >= MAX_CODES) return { ok: false as const, reason: "unavailable" as const };
      const code = user?.code && !doc.codes.some((item) => item.code === user?.code) ? user.code : newCode(doc);
      if (!code) return { ok: false as const, reason: "unavailable" as const };
      if (!doc.codes.some((item) => item.code === code)) {
        doc.codes.push({ code, ownerId: userId, redeemCount: 0, createdAt: new Date().toISOString() });
      }
      if (!user) {
        user = { userId, code, bonusRemaining: 0 };
        doc.users.push(user);
      } else {
        user.code = code;
      }
      await opened.store.write(doc);
      return { ok: true as const, card: cardFor(doc, user) };
    } catch (error) {
      console.warn("[invite] ensure failed", error);
      return { ok: false as const, reason: "unavailable" as const };
    }
  });
}

export async function inspectInviteCode(code: string): Promise<{ ok: true } | { ok: false; reason: InviteFailure }> {
  const parsed = readInviteInput(code);
  if (parsed.kind !== "code") return { ok: false, reason: "invalid" };
  const opened = await openStore();
  if (!opened) return { ok: false, reason: "unavailable" };
  try {
    const doc = await opened.store.read();
    const record = doc.codes.find((item) => item.code === parsed.code);
    if (!record) return { ok: false, reason: "invalid" };
    if (record.redeemCount >= INVITE_REDEEM_LIMIT) return { ok: false, reason: "exhausted" };
    return { ok: true };
  } catch (error) {
    console.warn("[invite] inspect failed", error);
    return { ok: false, reason: "unavailable" };
  }
}

export async function redeemInviteCode(input: {
  code: string;
  userId: number;
}): Promise<{ ok: true; bonusRemaining: number } | { ok: false; reason: InviteFailure }> {
  const parsed = readInviteInput(input.code);
  if (parsed.kind !== "code") return { ok: false, reason: "invalid" };
  return withInviteLock(async () => {
    const opened = await openStore();
    if (!opened) return { ok: false as const, reason: "unavailable" as const };
    try {
      const doc = await opened.store.read();
      const record = doc.codes.find((item) => item.code === parsed.code);
      if (!record) return { ok: false as const, reason: "invalid" as const };
      if (record.ownerId === input.userId) return { ok: false as const, reason: "own" as const };
      let user = doc.users.find((item) => item.userId === input.userId);
      if (user?.redeemedCode) return { ok: false as const, reason: "already" as const };
      if (record.redeemCount >= INVITE_REDEEM_LIMIT) return { ok: false as const, reason: "exhausted" as const };
      if (!user) {
        user = { userId: input.userId, code: "", bonusRemaining: 0 };
        doc.users.push(user);
      }
      user.bonusRemaining = Math.min(INVITE_BONUS_USES, user.bonusRemaining + INVITE_BONUS_USES);
      user.redeemedCode = parsed.code;
      record.redeemCount += 1;
      await opened.store.write(doc);
      return { ok: true as const, bonusRemaining: user.bonusRemaining };
    } catch (error) {
      console.warn("[invite] redeem failed", error);
      return { ok: false as const, reason: "unavailable" as const };
    }
  });
}

export async function peekInviteBonus(userId: number): Promise<number> {
  const opened = await openStore();
  if (!opened) return 0;
  try {
    const doc = await opened.store.read();
    const user = doc.users.find((item) => item.userId === userId);
    return user?.bonusRemaining ?? 0;
  } catch (error) {
    console.warn("[invite] peek bonus failed", error);
    return 0;
  }
}

export async function consumeInviteBonus(
  userId: number,
): Promise<{ ok: true; spent: boolean; bonusRemaining: number } | { ok: false }> {
  return withInviteLock(async () => {
    const opened = await openStore();
    if (!opened) return { ok: false as const };
    try {
      const doc = await opened.store.read();
      const user = doc.users.find((item) => item.userId === userId);
      if (!user || user.bonusRemaining <= 0) return { ok: true as const, spent: false, bonusRemaining: 0 };
      user.bonusRemaining -= 1;
      await opened.store.write(doc);
      return { ok: true as const, spent: true, bonusRemaining: user.bonusRemaining };
    } catch (error) {
      console.warn("[invite] consume bonus failed", error);
      return { ok: false as const };
    }
  });
}
