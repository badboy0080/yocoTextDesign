import { accountDocFromStored, toPublicAccount } from "../lib/local-accounts.ts";
import {
  consumeNormalizeQuota,
  peekNormalizeQuota,
  RateLimitError,
  useAccountReaderForTests,
} from "../lib/edgeone-rate-limit.ts";
import {
  consumeInviteBonus,
  ensureInviteCode,
  peekInviteBonus,
  redeemInviteCode,
  resetInviteMemory,
} from "../lib/invite-store.ts";

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
      id: 3,
      email: "admin@yoooco.com",
      name: "管理员",
      passwordHash: "scrypt$salt$hash",
      createdAt: "2026-01-01T00:00:00.000Z",
      unlimitedUses: true,
    },
    {
      id: 4,
      email: "friend@yoooco.com",
      name: "普通用户",
      passwordHash: "scrypt$salt$hash",
      createdAt: "2026-01-02T00:00:00.000Z",
      unlimitedUses: false,
    },
    {
      id: 5,
      email: "guest@yoooco.com",
      name: "没标记",
      passwordHash: "scrypt$salt$hash",
      createdAt: "2026-01-03T00:00:00.000Z",
    },
    {
      id: 9,
      email: "legacy@yoooco.com",
      name: "旧账号",
      passwordHash: "scrypt$salt$hash",
      createdAt: "2026-01-04T00:00:00.000Z",
      unlimitedUses: "true",
    },
  ],
  sessions: [{ tokenHash: "abc", userId: 3, expiresAt: 1 }],
});

assert(stored.users.length === 4, "读 blob 时不要丢掉已有账号");
assert(stored.users[0]?.unlimitedUses === true, "管理员的 unlimitedUses 要保留");
assert(stored.users[0]?.passwordHash === "scrypt$salt$hash", "密码哈希要原样留下");
assert(stored.users[1]?.unlimitedUses === undefined, "false 不要写成不限次数");
assert(stored.users[2]?.unlimitedUses === undefined, "普通账号不要凭空多出这个字段");
assert(stored.users[3]?.unlimitedUses === undefined, "只有严格的 true 才算不限次数");
assert(stored.sessions.length === 1, "会话要原样留下");

const roundTrip = accountDocFromStored(JSON.parse(JSON.stringify(stored)));
assert(roundTrip.users[0]?.unlimitedUses === true, "再写回 blob 之后，管理员仍是不限次数");
assert(roundTrip.users[1]?.unlimitedUses === undefined, "普通账号再写回后仍没有这个字段");
assert(toPublicAccount(stored.users[0]!).unlimitedUses === true, "登录态要带上不限次数");
assert(toPublicAccount(stored.users[1]!).unlimitedUses === undefined, "普通登录态不要带上不限次数");

const previousNodeEnv = process.env.NODE_ENV;
const previousRateFlag = process.env.RATE_LIMIT_ENABLED;
process.env.NODE_ENV = "development";
delete process.env.RATE_LIMIT_ENABLED;

try {
  useAccountReaderForTests(async () => ({ unlimitedUses: true }));
  for (let i = 0; i < 4; i += 1) {
    const trial = await consumeNormalizeQuota(requestFrom("203.0.113.8"));
    assert(trial.unlimited === true, "不限次数的账号排版不能被扣次");
    assert(trial.enforced === false, "不限次数不走每天 3 次");
    assert(trial.remaining === null, "不限次数没有剩余次数");
  }
  const peeked = await peekNormalizeQuota(requestFrom("203.0.113.8"));
  assert(peeked.unlimited === true, "查看剩余次数时也要告诉工作室不限次数");
  const counters = (globalThis as { __yoocoRateLimit?: Map<string, number> }).__yoocoRateLimit;
  const touched = [...(counters?.keys() ?? [])].some((key) => key.includes("203.0.113.8"));
  assert(!touched, "不限次数不能写入试用计数");

  resetInviteMemory();
  const owner = await ensureInviteCode(1);
  assert(owner.ok, "邀请码要能生成，用来确认加成没被扣");
  if (!owner.ok) throw new Error("unreachable");
  const redeemed = await redeemInviteCode({ code: owner.card.code, userId: 3 });
  assert(redeemed.ok && redeemed.bonusRemaining === 5, "邀请加成仍是 5 次");
  useAccountReaderForTests(async () => ({ id: 3, unlimitedUses: true }));
  await consumeNormalizeQuota(requestFrom("203.0.113.9"));
  assert(await peekInviteBonus(3) === 5, "不限次数不能扣掉邀请加成");
  const spent = await consumeInviteBonus(3);
  assert(spent.ok && spent.spent && spent.bonusRemaining === 4, "普通扣减邀请加成的逻辑还在");

  useAccountReaderForTests(async () => ({ id: 4, unlimitedUses: false }));
  const first = await consumeNormalizeQuota(requestFrom("203.0.113.10"));
  const second = await consumeNormalizeQuota(requestFrom("203.0.113.10"));
  assert(first.unlimited !== true && first.remaining === 2, "普通账号第一次仍扣每天次数");
  assert(second.unlimited !== true && second.remaining === 1, "普通账号第二次仍扣每天次数");
  let limited = false;
  try {
    await consumeNormalizeQuota(requestFrom("203.0.113.10"));
  } catch (error) {
    limited = error instanceof RateLimitError && error.code === "RATE_LIMITED";
  }
  assert(limited, "普通账号同一分钟超过 2 次仍会被拦住");

  useAccountReaderForTests(async () => null);
  const guest = await peekNormalizeQuota(requestFrom("203.0.113.11"));
  assert(guest.unlimited !== true && guest.remaining === 3 && guest.limit === 3, "未登录仍是每天 3 次");

  useAccountReaderForTests(async () => {
    throw new Error("blob down");
  });
  const fallback = await peekNormalizeQuota(requestFrom("203.0.113.12"));
  assert(fallback.unlimited !== true && fallback.remaining === 3, "读账号失败时不要当成不限次数");

  process.env.RATE_LIMIT_ENABLED = "0";
  useAccountReaderForTests(async () => ({ unlimitedUses: true }));
  const stillUnlimited = await peekNormalizeQuota(requestFrom("203.0.113.13"));
  assert(stillUnlimited.unlimited === true, "关掉全站限额时，不限次数账号仍要显示不限次数");
  useAccountReaderForTests(async () => null);
  const skipped = await peekNormalizeQuota(requestFrom("203.0.113.14"));
  assert(skipped.unlimited !== true && skipped.enforced === false, "关掉全站限额时，访客逻辑不变");
} finally {
  useAccountReaderForTests(null);
  if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previousNodeEnv;
  if (previousRateFlag === undefined) delete process.env.RATE_LIMIT_ENABLED;
  else process.env.RATE_LIMIT_ENABLED = previousRateFlag;
}

console.log("unlimited uses checks ok");
