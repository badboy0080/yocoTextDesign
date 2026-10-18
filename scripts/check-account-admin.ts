import { trimAuditEvents, type AdminAuditEvent } from "../lib/admin-audit.ts";
import {
  consumeNormalizeQuota,
  peekNormalizeQuota,
  RateLimitError,
  useAccountReaderForTests,
} from "../lib/edgeone-rate-limit.ts";
import { resetInviteMemory, ensureInviteCode, redeemInviteCode, peekInviteBonus } from "../lib/invite-store.ts";
import {
  accountDocFromStored,
  adminEmailSet,
  applyEntitlement,
  emailMatchesQuery,
  entitlementNeedsConfirm,
  isAdminAccount,
  parseEntitlementPatch,
  toManagedAccount,
} from "../lib/local-accounts.ts";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function requestFrom(ip: string) {
  return new Request("https://yoooco.com/api/normalize", {
    headers: { "x-forwarded-for": ip },
  });
}

const stored = accountDocFromStored({
  users: [
    {
      id: 1,
      email: "admin@yoooco.com",
      name: "站长",
      passwordHash: "scrypt$salt$hash",
      createdAt: "2026-01-01T00:00:00.000Z",
      unlimitedUses: true,
      plan: "admin",
      dailyLimit: null,
    },
    {
      id: 2,
      email: "member@yoooco.com",
      name: "会员",
      passwordHash: "scrypt$salt$hash",
      createdAt: "2026-02-01T00:00:00.000Z",
      plan: "member",
      dailyLimit: 20,
    },
    {
      id: 3,
      email: "messy@yoooco.com",
      name: "脏数据",
      passwordHash: "scrypt$salt$hash",
      createdAt: "2026-03-01T00:00:00.000Z",
      plan: "vip",
      dailyLimit: 1.5,
      unlimitedUses: "yes",
    },
  ],
  sessions: [],
});

assert(stored.users[0]?.unlimitedUses === true, "不限次数的站长要留着");
assert(stored.users[0]?.plan === "admin", "管理员等级要留着");
assert(stored.users[0]?.dailyLimit === undefined, "null 额度不当成 0 次");
assert(stored.users[0]?.passwordHash === "scrypt$salt$hash", "改权限字段时不能弄丢密码");
assert(stored.users[1]?.plan === "member" && stored.users[1]?.dailyLimit === 20, "会员每天 20 次要留着");
assert(stored.users[1]?.unlimitedUses === undefined, "会员不要被写成不限次数");
assert(stored.users[2]?.plan === undefined, "不认识的等级要丢掉");
assert(stored.users[2]?.dailyLimit === undefined, "不是整数的额度要丢掉");
assert(stored.users[2]?.unlimitedUses === undefined, "字符串不能当成不限次数");

const roundTrip = accountDocFromStored(JSON.parse(JSON.stringify(stored)));
assert(roundTrip.users[1]?.dailyLimit === 20 && roundTrip.users[1]?.plan === "member", "写回 blob 后再读，额度和等级还在");

const emails = adminEmailSet(" Member@yoooco.com , not-an-email , admin@yoooco.com ");
assert(emails.has("member@yoooco.com") && emails.has("admin@yoooco.com"), "管理员邮箱要忽略大小写和空格");
assert(!emails.has("not-an-email"), "不像邮箱的不要进名单");
assert(isAdminAccount({ email: "admin@yoooco.com", unlimitedUses: true }, new Set()) === true, "种子站长靠不限次数就能进");
assert(isAdminAccount({ email: "member@yoooco.com" }, emails) === true, "名单里的邮箱能进后台");
assert(isAdminAccount({ email: "other@yoooco.com", unlimitedUses: false }, emails) === false, "普通账号进不了后台");
assert(
  toManagedAccount(stored.users[1]!, 5).plan === "member" &&
    toManagedAccount(stored.users[1]!, 5).dailyLimit === 20 &&
    toManagedAccount(stored.users[1]!, 5).inviteBonus === 5 &&
    toManagedAccount(stored.users[1]!, 5).adminAccess === false,
  "列表要带出等级、额度和邀请加成，但不带密码",
);
assert(!("passwordHash" in toManagedAccount(stored.users[0]!, 0)), "管理列表不能带密码");
assert(toManagedAccount(stored.users[0]!, 0).adminAccess === true, "不限次数的账号在列表里标成可进后台");
assert(emailMatchesQuery("Member@yoooco.com", "member@"), "搜索按邮箱包含，不区分大小写");
assert(!emailMatchesQuery("member@yoooco.com", "other"), "对不上的邮箱不要搜出来");

const member = stored.users[1]!;
assert(entitlementNeedsConfirm(member, { plan: "free" }) === true, "改等级要二次确认");
assert(entitlementNeedsConfirm(member, { unlimitedUses: true }) === true, "改不限次数要二次确认");
assert(entitlementNeedsConfirm(member, { dailyLimit: 8 }) === false, "只改每日额度不用确认");
assert(entitlementNeedsConfirm(member, { plan: "member" }) === false, "等级没变不用确认");

const cleared = applyEntitlement(member, { dailyLimit: null, unlimitedUses: false, plan: "free" });
assert(cleared.dailyLimit === undefined && cleared.unlimitedUses === undefined && cleared.plan === "free", "留空额度、关掉不限次数要写回默认");
assert(cleared.passwordHash === member.passwordHash, "保存权限时密码原样留下");
const opened = applyEntitlement(member, { unlimitedUses: true, dailyLimit: 0 });
assert(opened.unlimitedUses === true && opened.dailyLimit === 0, "可以打开不限次数，也可以把额度设成 0");

const badPlan = parseEntitlementPatch({ userId: 2, plan: "vip" });
assert(!badPlan.ok, "不认识的等级不能保存");
const missingConfirm = parseEntitlementPatch({ userId: 2, plan: "admin", confirm: false });
assert(missingConfirm.ok && missingConfirm.confirm === false, "确认标记必须是 true");
const goodLimit = parseEntitlementPatch({ userId: 2, dailyLimit: null });
assert(goodLimit.ok && goodLimit.patch.dailyLimit === null, "留空额度用 null 表示恢复默认");
const huge = parseEntitlementPatch({ userId: 2, dailyLimit: 10001 });
assert(!huge.ok, "额度不能超过 10000");

const sample: AdminAuditEvent = {
  at: "2026-10-18T00:00:00.000Z",
  actorId: 1,
  actorEmail: "admin@yoooco.com",
  userId: 2,
  email: "member@yoooco.com",
  changes: { dailyLimit: { from: null, to: 20 } },
};
const trimmed = trimAuditEvents(Array.from({ length: 205 }, (_, index) => ({ ...sample, userId: index + 1 })));
assert(trimmed.length === 200 && trimmed[0]?.userId === 6, "审计只留最近 200 条");

const previousNodeEnv = process.env.NODE_ENV;
const previousRateFlag = process.env.RATE_LIMIT_ENABLED;
process.env.NODE_ENV = "development";
delete process.env.RATE_LIMIT_ENABLED;
resetInviteMemory();

try {
  useAccountReaderForTests(async () => ({ id: 21, dailyLimit: 10 }));
  const first = await consumeNormalizeQuota(requestFrom("203.0.113.21"));
  assert(first.limit === 10 && first.remaining === 9, "设了每日额度就按这个数扣，不按访客的 3 次");
  const shared = await consumeNormalizeQuota(requestFrom("203.0.113.22"));
  assert(shared.remaining === 8, "同一个账号换 IP 仍扣同一天的次数");
  useAccountReaderForTests(async () => null);
  const guest = await peekNormalizeQuota(requestFrom("203.0.113.21"));
  assert(guest.limit === 3 && guest.remaining === 3, "同一 IP 上的访客仍按 IP 每天 3 次，不跟账号混用");

  useAccountReaderForTests(async () => ({ id: 22 }));
  const plain = await peekNormalizeQuota(requestFrom("203.0.113.23"));
  assert(plain.limit === 3 && plain.remaining === 3, "登录了但没设额度，每天仍是全站 3 次");

  const owner = await ensureInviteCode(1);
  assert(owner.ok, "要能生成邀请码");
  if (!owner.ok) throw new Error("unreachable");
  const redeemed = await redeemInviteCode({ code: owner.card.code, userId: 23 });
  assert(redeemed.ok && redeemed.bonusRemaining === 5, "邀请加成仍是 5 次");
  useAccountReaderForTests(async () => ({ id: 23, dailyLimit: 1 }));
  const withDaily = await consumeNormalizeQuota(requestFrom("203.0.113.24"));
  assert(withDaily.remaining === 5 && withDaily.bonus === 5, "每天 1 次用完后，剩余里还叠着邀请加成");
  const withBonus = await consumeNormalizeQuota(requestFrom("203.0.113.24"));
  assert(withBonus.remaining === 4 && withBonus.bonus === 4, "每日额度用完后改扣邀请加成");
  assert((await peekInviteBonus(23)) === 4, "邀请加成确实被扣了 1 次");

  useAccountReaderForTests(async () => ({ id: 24, dailyLimit: 0 }));
  const none = await peekNormalizeQuota(requestFrom("203.0.113.25"));
  assert(none.limit === 0 && none.remaining === 0, "额度写成 0 就没有每天次数");
  let exhausted = false;
  try {
    await consumeNormalizeQuota(requestFrom("203.0.113.25"));
  } catch (error) {
    exhausted = error instanceof RateLimitError && error.code === "TRIAL_EXHAUSTED";
  }
  assert(exhausted, "额度是 0 且没有邀请加成时，排版会被拦住");

  useAccountReaderForTests(async () => ({ id: 25, unlimitedUses: true, dailyLimit: 1 }));
  const unlimited = await consumeNormalizeQuota(requestFrom("203.0.113.26"));
  assert(unlimited.unlimited === true && unlimited.remaining === null, "不限次数优先于每日额度");
} finally {
  useAccountReaderForTests(null);
  if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previousNodeEnv;
  if (previousRateFlag === undefined) delete process.env.RATE_LIMIT_ENABLED;
  else process.env.RATE_LIMIT_ENABLED = previousRateFlag;
}

console.log("account admin checks ok");
