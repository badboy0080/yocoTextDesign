import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { appendAdminAudit, type AdminAuditEvent } from "./admin-audit";
import { normalizeEmail, validEmail } from "./email-address";
import { readInviteBonusMap, peekInviteBonus } from "./invite-store";
import { TRIAL_LIMIT } from "./trial-quota";

export { normalizeEmail, validEmail };

const SESSION_COOKIE = "yooco_session";
const SESSION_DAYS = 30;
const STORE_NAME = "yooco-accounts";
const DOC_KEY = "accounts";

/** 人工开通的等级。没有收款。缺省当 free，旧文档不补写。 */
export const ACCOUNT_PLANS = ["free", "member", "admin"] as const;
export type AccountPlan = (typeof ACCOUNT_PLANS)[number];

/** 单个账号每天最多能手填的排版次数。留空则走全站 TRIAL_LIMIT。 */
export const MAX_ACCOUNT_DAILY_LIMIT = 10000;

const PLAN_LABEL: Record<AccountPlan, string> = {
  free: "免费",
  member: "会员",
  admin: "管理员",
};

const PLAN_RANK: Record<AccountPlan, number> = {
  free: 0,
  member: 1,
  admin: 2,
};

/**
 * 代码里点名的邮箱。明文密码不在仓库里，只留和注册相同的 scrypt 哈希。
 * 哈希只在第一次建号时写入；已经有账号的不改密码。
 */
const KNOWN_ACCOUNT_SEEDS: readonly {
  email: string;
  name: string;
  passwordHash: string;
  plan: AccountPlan;
  dailyLimit: number;
}[] = [
  {
    email: "ycheng0208@foxmail.com",
    name: "ycheng0208",
    passwordHash:
      "scrypt$6fd2d007d7fb9bfb5055e094132ffd14$43776c10e128bfae131b83c0a8b19ecbda5eacf50c8be57abcdad68ca85abf45",
    plan: "member",
    dailyLimit: 30,
  },
];

type UserRecord = {
  id: number;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
  /** 为 true 时，排版不扣每天试用次数，也不扣邀请加成。这样的账号也能进后台。 */
  unlimitedUses?: boolean;
  /** 人工开通的等级。不自动打开后台，也不自动不限次数。 */
  plan?: AccountPlan;
  /** 该账号每天排版次数。缺省时走全站 TRIAL_LIMIT。 */
  dailyLimit?: number;
};

export type PublicAccount = {
  id: number;
  email: string;
  name: string;
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

export function parsePlan(value: unknown): AccountPlan | undefined {
  if (value === "free" || value === "member" || value === "admin") return value;
  return undefined;
}

export function planLabel(plan: AccountPlan): string {
  return PLAN_LABEL[plan];
}

/** 合法的每日额度。空、null 和非整数都不算已设置。 */
export function parseDailyLimit(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isInteger(value)) return undefined;
  if (value < 0 || value > MAX_ACCOUNT_DAILY_LIMIT) return undefined;
  return value;
}

export function adminEmailSet(raw = process.env.ADMIN_EMAILS || ""): Set<string> {
  const emails = new Set<string>();
  for (const part of raw.split(",")) {
    const email = normalizeEmail(part);
    if (validEmail(email)) emails.add(email);
  }
  return emails;
}

/** 不限次数，或邮箱在 ADMIN_EMAILS 里。种子 admin@yoooco.com 靠已有的 unlimitedUses。 */
export function isAdminAccount(
  user: { email?: string; unlimitedUses?: boolean } | null | undefined,
  emails: Set<string> = adminEmailSet(),
): boolean {
  if (!user) return false;
  if (user.unlimitedUses === true) return true;
  const email = normalizeEmail(user.email || "");
  return validEmail(email) && emails.has(email);
}

function normalizeUser(value: unknown): UserRecord | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as UserRecord & { plan?: unknown; dailyLimit?: unknown };
  const next: UserRecord = { ...raw };
  if (next.unlimitedUses !== true) delete next.unlimitedUses;
  const plan = parsePlan(raw.plan);
  if (plan) next.plan = plan;
  else delete next.plan;
  const limit = parseDailyLimit(raw.dailyLimit);
  if (limit === undefined) delete next.dailyLimit;
  else next.dailyLimit = limit;
  return next;
}

/**
 * 读账号库时补上点名邮箱的保底。
 * 没有这个人就建占位账号（会员、每天 30 次、上面的密码哈希），不设不限次数。
 * 已经有的：不改密码。等级低于保底才抬高，每日额度低于保底才抬高。
 * 已经是更高的等级或额度，或已经不限次数，保持原样。不会打开不限次数。
 * 有改动返回 true。
 */
export function applyKnownAccountSeeds(doc: AccountDoc): boolean {
  let changed = false;
  for (const seed of KNOWN_ACCOUNT_SEEDS) {
    const email = normalizeEmail(seed.email);
    if (!validEmail(email)) continue;
    const index = doc.users.findIndex((user) => normalizeEmail(user.email) === email);
    if (index < 0) {
      const id = doc.users.reduce((max, user) => Math.max(max, user.id), 0) + 1;
      doc.users.push({
        id,
        email,
        name: seed.name,
        passwordHash: seed.passwordHash,
        createdAt: new Date().toISOString(),
        plan: seed.plan,
        dailyLimit: seed.dailyLimit,
      });
      changed = true;
      continue;
    }
    const current = doc.users[index]!;
    const next: UserRecord = { ...current };
    let userChanged = false;
    const plan = next.plan ?? "free";
    if (PLAN_RANK[plan] < PLAN_RANK[seed.plan]) {
      next.plan = seed.plan;
      userChanged = true;
    }
    if (next.dailyLimit === undefined || next.dailyLimit < seed.dailyLimit) {
      next.dailyLimit = seed.dailyLimit;
      userChanged = true;
    }
    if (!userChanged) continue;
    doc.users[index] = next;
    changed = true;
  }
  return changed;
}

/** 从 blob 读出账号文档。保留已有字段；只有严格的 true 才留下 unlimitedUses。等级和每日额度不合法就丢掉。 */
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
    ...(user.unlimitedUses === true ? { unlimitedUses: true as const } : {}),
  };
}

async function openDoc(): Promise<{ doc: AccountDoc; save: (next: AccountDoc) => Promise<void> }> {
  const opened = await readAccountDoc();
  if (applyKnownAccountSeeds(opened.doc)) await opened.save(opened.doc);
  return opened;
}

async function readAccountDoc(): Promise<{ doc: AccountDoc; save: (next: AccountDoc) => Promise<void> }> {
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

async function currentUserRecord(): Promise<UserRecord | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const { doc } = await openDoc();
  const session = doc.sessions.find((item) => item.tokenHash === hashToken(token) && item.expiresAt > Date.now());
  if (!session) return null;
  return doc.users.find((item) => item.id === session.userId) ?? null;
}

export async function currentAccount() {
  const user = await currentUserRecord();
  return user ? toPublicAccount(user) : null;
}

export type QuotaAccount = {
  id: number;
  unlimitedUses?: boolean;
  dailyLimit?: number | null;
};

/** 排版配额用。带上每日额度，不带密码。 */
export async function currentQuotaAccount(): Promise<QuotaAccount | null> {
  const user = await currentUserRecord();
  if (!user) return null;
  return {
    id: user.id,
    ...(user.unlimitedUses === true ? { unlimitedUses: true } : {}),
    ...(user.dailyLimit !== undefined ? { dailyLimit: user.dailyLimit } : {}),
  };
}

export type ManagedAccount = {
  id: number;
  email: string;
  name: string;
  plan: AccountPlan;
  dailyLimit: number | null;
  unlimitedUses: boolean;
  inviteBonus: number;
  createdAt: string;
  adminAccess: boolean;
};

export function toManagedAccount(user: UserRecord, inviteBonus = 0): ManagedAccount {
  const unlimitedUses = user.unlimitedUses === true;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan ?? "free",
    dailyLimit: user.dailyLimit ?? null,
    unlimitedUses,
    inviteBonus: Math.max(0, Math.floor(inviteBonus)),
    createdAt: user.createdAt,
    adminAccess: isAdminAccount({ email: user.email, unlimitedUses }),
  };
}

export function emailMatchesQuery(email: string, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return email.toLowerCase().includes(needle);
}

export type EntitlementPatch = {
  plan?: AccountPlan;
  dailyLimit?: number | null;
  unlimitedUses?: boolean;
};

export function parseEntitlementPatch(
  body: unknown,
): { ok: true; userId: number; patch: EntitlementPatch; confirm: boolean } | { ok: false; status: 400; message: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, status: 400, message: "请提交要改的内容。" };
  }
  const raw = body as Record<string, unknown>;
  const userId = Number(raw.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    return { ok: false, status: 400, message: "没有这个账号。" };
  }
  const patch: EntitlementPatch = {};
  if ("plan" in raw) {
    const plan = parsePlan(raw.plan);
    if (!plan) return { ok: false, status: 400, message: "等级只能是免费、会员或管理员。" };
    patch.plan = plan;
  }
  if ("dailyLimit" in raw) {
    if (raw.dailyLimit === null) patch.dailyLimit = null;
    else {
      const limit = parseDailyLimit(raw.dailyLimit);
      if (limit === undefined) {
        return {
          ok: false,
          status: 400,
          message: `每日积分请填 0 到 ${MAX_ACCOUNT_DAILY_LIMIT} 的整数，留空则用全站每天 ${TRIAL_LIMIT} 积分。`,
        };
      }
      patch.dailyLimit = limit;
    }
  }
  if ("unlimitedUses" in raw) {
    if (typeof raw.unlimitedUses !== "boolean") {
      return { ok: false, status: 400, message: "不限积分只能是开或关。" };
    }
    patch.unlimitedUses = raw.unlimitedUses;
  }
  if (patch.plan === undefined && patch.dailyLimit === undefined && patch.unlimitedUses === undefined) {
    return { ok: false, status: 400, message: "没有要保存的改动。" };
  }
  return { ok: true, userId, patch, confirm: raw.confirm === true };
}

export function entitlementNeedsConfirm(user: UserRecord, patch: EntitlementPatch): boolean {
  if (patch.plan !== undefined && patch.plan !== (user.plan ?? "free")) return true;
  if (patch.unlimitedUses !== undefined && patch.unlimitedUses !== (user.unlimitedUses === true)) return true;
  return false;
}

function entitlementChanged(user: UserRecord, patch: EntitlementPatch): boolean {
  if (patch.plan !== undefined && patch.plan !== (user.plan ?? "free")) return true;
  if (patch.dailyLimit !== undefined && patch.dailyLimit !== (user.dailyLimit ?? null)) return true;
  if (patch.unlimitedUses !== undefined && patch.unlimitedUses !== (user.unlimitedUses === true)) return true;
  return false;
}

export function applyEntitlement(user: UserRecord, patch: EntitlementPatch): UserRecord {
  const next: UserRecord = { ...user };
  if (patch.plan) next.plan = patch.plan;
  if (patch.dailyLimit === null) delete next.dailyLimit;
  else if (typeof patch.dailyLimit === "number") next.dailyLimit = patch.dailyLimit;
  if (patch.unlimitedUses === true) next.unlimitedUses = true;
  else if (patch.unlimitedUses === false) delete next.unlimitedUses;
  return next;
}

function entitlementChanges(before: UserRecord, after: UserRecord): AdminAuditEvent["changes"] {
  const changes: AdminAuditEvent["changes"] = {};
  const fromPlan = before.plan ?? "free";
  const toPlan = after.plan ?? "free";
  if (fromPlan !== toPlan) changes.plan = { from: fromPlan, to: toPlan };
  const fromLimit = before.dailyLimit ?? null;
  const toLimit = after.dailyLimit ?? null;
  if (fromLimit !== toLimit) changes.dailyLimit = { from: fromLimit, to: toLimit };
  const fromUnlimited = before.unlimitedUses === true;
  const toUnlimited = after.unlimitedUses === true;
  if (fromUnlimited !== toUnlimited) changes.unlimitedUses = { from: fromUnlimited, to: toUnlimited };
  return changes;
}

export async function listManagedAccounts(query = ""): Promise<{ siteDailyLimit: number; accounts: ManagedAccount[] }> {
  const { doc } = await openDoc();
  const bonuses = await readInviteBonusMap();
  const accounts = doc.users
    .filter((user) => emailMatchesQuery(user.email, query))
    .map((user) => toManagedAccount(user, bonuses.get(user.id) ?? 0))
    .sort((a, b) => a.email.localeCompare(b.email, "en"));
  return { siteDailyLimit: TRIAL_LIMIT, accounts };
}

export async function updateManagedAccount(
  actor: { id: number; email: string },
  body: unknown,
): Promise<
  | { ok: true; account: ManagedAccount; audit: "stored" | "console" }
  | { ok: false; status: number; message: string }
> {
  const parsed = parseEntitlementPatch(body);
  if (!parsed.ok) return parsed;
  const { doc, save } = await openDoc();
  const index = doc.users.findIndex((user) => user.id === parsed.userId);
  if (index < 0) return { ok: false, status: 404, message: "没有这个账号。" };
  const before = doc.users[index]!;
  if (!entitlementChanged(before, parsed.patch)) {
    return { ok: false, status: 400, message: "没有要保存的改动。" };
  }
  if (entitlementNeedsConfirm(before, parsed.patch) && !parsed.confirm) {
    return { ok: false, status: 400, message: "改等级或不限积分需要再确认一次。" };
  }
  const after = applyEntitlement(before, parsed.patch);
  doc.users[index] = after;
  await save(doc);
  const audit = await appendAdminAudit({
    at: new Date().toISOString(),
    actorId: actor.id,
    actorEmail: actor.email,
    userId: after.id,
    email: after.email,
    changes: entitlementChanges(before, after),
  });
  const bonus = await peekInviteBonus(after.id);
  return { ok: true, account: toManagedAccount(after, bonus), audit };
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
