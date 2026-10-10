import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

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

export async function registerAccount(input: { name: string; email: string; password: string }) {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  if (!name || name.length > 40) return { ok: false as const, status: 400, message: "请填写称呼，最多 40 个字。" };
  if (!validEmail(email)) return { ok: false as const, status: 400, message: "请填写有效的邮箱。" };
  if (input.password.length < 8) return { ok: false as const, status: 400, message: "密码至少 8 位。" };
  const { doc, save } = await openDoc();
  if (doc.users.some((user) => user.email === email)) {
    return { ok: false as const, status: 409, message: "这个邮箱已经注册过，请直接登录。" };
  }
  const id = doc.users.reduce((max, user) => Math.max(max, user.id), 0) + 1;
  doc.users.push({ id, email, name, passwordHash: hashPassword(input.password), createdAt: new Date().toISOString() });
  await startSession(doc, id);
  await save(doc);
  return { ok: true as const, id, email, name };
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
  return user ? { id: user.id, email: user.email, name: user.name } : null;
}

export async function deleteAccount(userId: number) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  const { doc, save } = await openDoc();
  doc.users = doc.users.filter((user) => user.id !== userId);
  doc.sessions = doc.sessions.filter((item) => item.userId !== userId);
  await save(doc);
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
