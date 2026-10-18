import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { normalizeEmail, validEmail } from "./email-address";
import { normalizePhone, validPhone } from "./phone-number";

export { normalizeEmail, validEmail };

const SESSION_COOKIE = "yooco_session";
const SESSION_DAYS = 30;
const STORE_NAME = "yooco-accounts";
const DOC_KEY = "accounts";

type UserRecord = {
  id: number;
  /** 邮箱注册存邮箱。手机注册没有邮箱时，这里存 11 位手机号，方便现有登录会话继续用这个字段。 */
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
  /** 为 true 时，排版不扣每天试用次数，也不扣邀请加成。只给运维账号。 */
  unlimitedUses?: boolean;
  /** 手机注册时记下。邮箱注册不写。 */
  phone?: string;
  /** OneID 注册成功返回的 sub。旧账号和本地邮箱验证码回退没有这个字段。 */
  oneIdSub?: string;
};

export type PublicAccount = {
  id: number;
  email: string;
  name: string;
  phone?: string;
  unlimitedUses?: true;
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

function cleanPhone(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const phone = normalizePhone(value);
  return validPhone(phone) ? phone : undefined;
}

function cleanSub(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const sub = value.trim();
  if (!sub || sub.length > 200 || /[\r\n]/.test(sub)) return undefined;
  return sub;
}

function normalizeUser(value: unknown): UserRecord | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as UserRecord;
  const next = { ...raw };
  if (next.unlimitedUses === true) next.unlimitedUses = true;
  else delete next.unlimitedUses;
  const phone = cleanPhone(next.phone);
  if (phone) next.phone = phone;
  else delete next.phone;
  const oneIdSub = cleanSub(next.oneIdSub);
  if (oneIdSub) next.oneIdSub = oneIdSub;
  else delete next.oneIdSub;
  return next;
}

/** 从 blob 读出账号文档。保留已有字段；只有严格的 true 才留下 unlimitedUses。 */
export function accountDocFromStored(value: unknown): AccountDoc {
  if (!value || typeof value !== "object") return emptyDoc();
  const doc = value as Partial<AccountDoc>;
  const users: UserRecord[] = [];
  if (Array.isArray(doc.users)) {
    for (const item of doc.users) {
      const user = normalizeUser(item);
      if (user) users.push(user);
    }
  }
  return {
    users,
    sessions: Array.isArray(doc.sessions) ? doc.sessions : [],
  };
}

export function toPublicAccount(user: UserRecord): PublicAccount {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    ...(user.phone ? { phone: user.phone } : {}),
    ...(user.unlimitedUses === true ? { unlimitedUses: true as const } : {}),
  };
}

export type LoginLookup = { email?: string; phone?: string };

/** 登录框里可以填邮箱，也可以填手机号。 */
export function loginLookup(raw: string): LoginLookup {
  const email = normalizeEmail(raw);
  if (validEmail(email)) return { email };
  const phone = normalizePhone(raw);
  if (validPhone(phone)) return { phone };
  return {};
}

export function userMatchesLogin(user: { email: string; phone?: string }, lookup: LoginLookup): boolean {
  if (lookup.email && user.email === lookup.email) return true;
  if (lookup.phone && (user.phone === lookup.phone || user.email === lookup.phone)) return true;
  return false;
}

export function parseSignupIdentity(input: {
  name: string;
  password: string;
  email?: string;
  phone?: string;
  oneIdSub?: string;
}): { ok: false; status: number; message: string } | {
  ok: true;
  name: string;
  email: string;
  phone?: string;
  oneIdSub?: string;
} {
  const name = input.name.trim();
  const email = normalizeEmail(input.email || "");
  const phone = normalizePhone(input.phone || "");
  const emailOk = Boolean(email) && validEmail(email) && email.length <= 120;
  const phoneOk = validPhone(phone);
  if (!name || name.length > 40) return { ok: false, status: 400, message: "请填写称呼，最多 40 个字。" };
  if (input.password.length < 8) return { ok: false, status: 400, message: "密码至少 8 位。" };
  if (emailOk && phoneOk) return { ok: false, status: 400, message: "请只选择邮箱或手机其中一种。" };
  if (!emailOk && !phoneOk) {
    if (input.phone?.trim()) return { ok: false, status: 400, message: "请填写国内 11 位手机号。" };
    return { ok: false, status: 400, message: "请填写有效的邮箱。" };
  }
  const oneIdSub = cleanSub(input.oneIdSub);
  if (phoneOk) {
    return { ok: true, name, email: phone, phone, ...(oneIdSub ? { oneIdSub } : {}) };
  }
  return { ok: true, name, email, ...(oneIdSub ? { oneIdSub } : {}) };
}

async function openDoc(): Promise<{ doc: AccountDoc; save: (next: AccountDoc) => Promise<void> }> {
  try {
    const { getStore } = await import("@edgeone/pages-blob");
    const store = await getStore(STORE_NAME);
    const value = await store.get(DOC_KEY, { type: "json", consistency: "strong" });
    return {
      doc: accountDocFromStored(value),
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

function identityTaken(doc: AccountDoc, identity: { email: string; phone?: string }) {
  if (identity.phone) {
    const phone = identity.phone;
    if (doc.users.some((user) => user.phone === phone || user.email === phone)) {
      return { ok: false as const, status: 409, message: "这个手机号已经注册过，请直接登录。" };
    }
    return null;
  }
  if (doc.users.some((user) => user.email === identity.email)) {
    return { ok: false as const, status: 409, message: "这个邮箱已经注册过，请直接登录。" };
  }
  return null;
}

export async function signupIdentityTaken(input: {
  name: string;
  password: string;
  email?: string;
  phone?: string;
}) {
  const parsed = parseSignupIdentity(input);
  if (!parsed.ok) return parsed;
  const { doc } = await openDoc();
  return identityTaken(doc, parsed) ?? { ok: true as const };
}

export async function registerAccount(input: {
  name: string;
  password: string;
  email?: string;
  phone?: string;
  oneIdSub?: string;
}) {
  const parsed = parseSignupIdentity(input);
  if (!parsed.ok) return parsed;
  const { doc, save } = await openDoc();
  const taken = identityTaken(doc, parsed);
  if (taken) return taken;
  const id = doc.users.reduce((max, user) => Math.max(max, user.id), 0) + 1;
  const user: UserRecord = {
    id,
    email: parsed.email,
    name: parsed.name,
    passwordHash: hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };
  if (parsed.phone) user.phone = parsed.phone;
  if (parsed.oneIdSub) user.oneIdSub = parsed.oneIdSub;
  doc.users.push(user);
  await startSession(doc, id);
  await save(doc);
  return { ok: true as const, id, email: parsed.email, name: parsed.name, ...(parsed.phone ? { phone: parsed.phone } : {}) };
}

export async function loginAccount(input: { email?: string; password: string; phone?: string }) {
  const phone = input.phone ? normalizePhone(input.phone) : "";
  const lookup = validPhone(phone) ? { phone } : loginLookup(input.email || "");
  const { doc, save } = await openDoc();
  const user = lookup.email || lookup.phone ? doc.users.find((item) => userMatchesLogin(item, lookup)) : undefined;
  if (!user || !passwordMatches(input.password, user.passwordHash)) {
    return { ok: false as const, status: 401, message: "邮箱、手机号或密码不正确。" };
  }
  await startSession(doc, user.id);
  await save(doc);
  return {
    ok: true as const,
    email: user.email,
    name: user.name,
    ...(user.phone ? { phone: user.phone } : {}),
  };
}

export async function currentAccount() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const { doc } = await openDoc();
  const session = doc.sessions.find((item) => item.tokenHash === hashToken(token) && item.expiresAt > Date.now());
  if (!session) return null;
  const user = doc.users.find((item) => item.id === session.userId);
  return user ? toPublicAccount(user) : null;
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
