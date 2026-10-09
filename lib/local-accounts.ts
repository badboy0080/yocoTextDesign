import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createAccountUsage, type UsageAccount } from "./account-usage";

const SESSION_COOKIE = "yooco_session";
const SESSION_DAYS = 30;
const STORE_NAME = "yooco-accounts";
const DOC_KEY = "accounts";

type UserRecord = {
  id: number;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
  credits?: number;
  shareCode?: string;
  shareClaimed?: boolean;
};

type SessionRecord = {
  tokenHash: string;
  userId: number;
  expiresAt: number;
};

type AccountDoc = {
  users: UserRecord[];
  sessions: SessionRecord[];
};

const memory: AccountDoc = { users: [], sessions: [] };

function emptyDoc(): AccountDoc {
  return { users: [], sessions: [] };
}

function normalizeDoc(value: unknown): AccountDoc {
  if (!value || typeof value !== "object") return emptyDoc();
  const doc = value as Partial<AccountDoc>;
  return {
    users: Array.isArray(doc.users) ? doc.users : [],
    sessions: Array.isArray(doc.sessions) ? doc.sessions : [],
  };
}

async function openDoc(): Promise<{ doc: AccountDoc; save: (next: AccountDoc) => Promise<void> }> {
  try {
    const { getStore } = await import("@edgeone/pages-blob");
    const store = await getStore(STORE_NAME);
    const value = await store.get(DOC_KEY, { type: "json", consistency: "strong" });
    return {
      doc: normalizeDoc(value),
      save: async (next) => {
        await store.setJSON(DOC_KEY, next);
      },
    };
  } catch {
    return {
      doc: memory,
      save: async (next) => {
        memory.users = next.users;
        memory.sessions = next.sessions;
      },
    };
  }
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

function passwordMatches(password: string, stored: string) {
  const [method, salt, hash] = stored.split("$");
  if (method !== "scrypt" || !salt || !hash) return false;
  const actual = scryptSync(password, salt, 32);
  const expected = Buffer.from(hash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function startSession(doc: AccountDoc, userId: number) {
  const token = randomBytes(32).toString("base64url");
  doc.sessions.push({
    tokenHash: hashToken(token),
    userId,
    expiresAt: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

function usageFromUsers(users: UserRecord[]): UsageAccount[] {
  return users.map((user) => ({
    id: user.id,
    email: user.email,
    credits: typeof user.credits === "number" && Number.isFinite(user.credits) ? user.credits : null,
    shareCode: typeof user.shareCode === "string" && user.shareCode ? user.shareCode : null,
    shareClaimed: user.shareClaimed === true,
  }));
}

function applyUsageAccounts(users: UserRecord[], accounts: UsageAccount[]) {
  for (const account of accounts) {
    const user = users.find((item) => item.id === account.id);
    if (!user) continue;
    if (account.credits == null) delete user.credits;
    else user.credits = account.credits;
    if (account.shareCode) user.shareCode = account.shareCode;
    else delete user.shareCode;
    if (account.shareClaimed) user.shareClaimed = true;
    else delete user.shareClaimed;
  }
}

export async function registerAccount(input: { name: string; email: string; password: string; shareCode?: string }) {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  if (!name || name.length > 40) return { ok: false as const, status: 400, message: "请填写称呼，最多 40 个字。" };
  if (!validEmail(email)) return { ok: false as const, status: 400, message: "请填写有效的邮箱。" };
  if (input.password.length < 8) return { ok: false as const, status: 400, message: "密码至少 8 位。" };
  const { doc, save } = await openDoc();
  const usage = createAccountUsage(usageFromUsers(doc.users));
  const result = usage.register({ email, shareCode: input.shareCode });
  if (!result.ok) {
    return { ok: false as const, status: result.status, message: result.message || "无法注册。" };
  }
  const created = usage.snapshot().find((account) => account.email === result.email);
  if (!created) return { ok: false as const, status: 500, message: "暂时无法完成，请稍后再试。" };
  doc.users.push({
    id: created.id,
    email: result.email,
    name,
    passwordHash: hashPassword(input.password),
    createdAt: new Date().toISOString(),
  });
  applyUsageAccounts(doc.users, usage.snapshot());
  await startSession(doc, created.id);
  await save(doc);
  return {
    ok: true as const,
    email: result.email,
    name,
    credits: result.credits,
    shareApplied: result.shareApplied,
    message: result.message,
  };
}

export async function peekAccountUsage() {
  const account = await currentAccount();
  if (!account) return { login: false as const };
  const { doc } = await openDoc();
  const usage = createAccountUsage(usageFromUsers(doc.users));
  const credits = usage.credits(account.email);
  if (credits == null) return { login: false as const };
  return { login: true as const, credits };
}

export async function commitSuccessfulOptimize() {
  const account = await currentAccount();
  if (!account) {
    return { ok: false as const, status: 401, code: "LOGIN_REQUIRED" as const, message: "请先登录后再优化。" };
  }
  const { doc, save } = await openDoc();
  const usage = createAccountUsage(usageFromUsers(doc.users));
  const result = usage.optimize(account.email, true);
  if (!result.deducted) {
    return {
      ok: false as const,
      status: 403,
      code: "CREDITS_EXHAUSTED" as const,
      message: "使用机会已用完。",
      credits: result.credits,
    };
  }
  applyUsageAccounts(doc.users, usage.snapshot());
  await save(doc);
  return { ok: true as const, credits: result.credits };
}

export async function issueShareCode() {
  const account = await currentAccount();
  if (!account) return { ok: false as const, status: 401, message: "请先登录。" };
  const { doc, save } = await openDoc();
  const before = doc.users.find((user) => user.email === account.email)?.shareCode || "";
  const usage = createAccountUsage(usageFromUsers(doc.users));
  let code = "";
  try {
    code = usage.shareCode(account.email);
  } catch {
    return { ok: false as const, status: 401, message: "请先登录。" };
  }
  if (before !== code) {
    applyUsageAccounts(doc.users, usage.snapshot());
    await save(doc);
  }
  return { ok: true as const, code };
}

export async function loginAccount(input: { email: string; password: string }) {
  const email = normalizeEmail(input.email);
  const { doc, save } = await openDoc();
  const user = doc.users.find((item) => item.email === email);
  if (!user || !passwordMatches(input.password, user.passwordHash)) {
    return { ok: false as const, status: 401, message: "邮箱或密码不正确。" };
  }
  await startSession(doc, user.id);
  await save(doc);
  return { ok: true as const, email: user.email, name: user.name };
}

export async function currentAccount() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const { doc } = await openDoc();
  const session = doc.sessions.find((item) => item.tokenHash === hashToken(token) && item.expiresAt > Date.now());
  if (!session) return null;
  const user = doc.users.find((item) => item.id === session.userId);
  return user ? { email: user.email, name: user.name } : null;
}

export async function logoutAccount() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const { doc, save } = await openDoc();
    doc.sessions = doc.sessions.filter((item) => item.tokenHash !== hashToken(token));
    await save(doc);
  }
  jar.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}
