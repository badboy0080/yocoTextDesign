import { accountDocFromStored, applyKnownAccountSeeds, isAdminAccount } from "../lib/local-accounts.ts";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const EMAIL = "ycheng0208@foxmail.com";
const PASSWORD_HASH =
  "scrypt$6fd2d007d7fb9bfb5055e094132ffd14$43776c10e128bfae131b83c0a8b19ecbda5eacf50c8be57abcdad68ca85abf45";

function baseUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 7,
    email: "other@yoooco.com",
    name: "别人",
    passwordHash: "scrypt$salt$hash",
    createdAt: "2026-04-01T00:00:00.000Z",
    ...overrides,
  };
}

const empty = accountDocFromStored({ users: [], sessions: [{ tokenHash: "abc", userId: 1, expiresAt: 1 }] });
assert(applyKnownAccountSeeds(empty) === true, "库里没有这个邮箱时要建占位账号");
assert(empty.users.length === 1, "只多这一个账号");
const created = empty.users[0]!;
assert(created.email === EMAIL, "占位账号邮箱要是保底名单里的那个");
assert(created.plan === "member" && created.dailyLimit === 30, "新建时是会员，每天 30 次");
assert(created.unlimitedUses === undefined, "新建时不要不限次数");
assert(created.passwordHash === PASSWORD_HASH, "新建时写入事先算好的密码哈希");
assert(created.name === "ycheng0208" && created.id === 1, "称呼用邮箱名，编号从 1 起");
assert(empty.sessions.length === 1, "补账号时不要动登录会话");
assert(isAdminAccount(created, new Set()) === false, "这个会员不能靠保底进后台");
assert(applyKnownAccountSeeds(empty) === false, "已经是保底权益时不要再写一次");

const again = accountDocFromStored(JSON.parse(JSON.stringify(empty)));
assert(again.users[0]?.plan === "member" && again.users[0]?.dailyLimit === 30, "写回后再读，会员和 30 次还在");
assert(again.users[0]?.passwordHash === PASSWORD_HASH, "写回后再读，密码哈希还在");
assert(again.users[0]?.unlimitedUses === undefined, "写回后再读，仍然不是不限次数");

const existing = accountDocFromStored({
  users: [
    baseUser(),
    baseUser({
      id: 4,
      email: "YCHENG0208@foxmail.com",
      name: "已注册",
      passwordHash: "scrypt$own$secret",
      plan: "free",
    }),
  ],
  sessions: [],
});
assert(applyKnownAccountSeeds(existing) === true, "已注册但低于保底时要抬上去");
assert(existing.users.length === 2, "已有账号时不要再复制一个");
const raised = existing.users[1]!;
assert(raised.plan === "member" && raised.dailyLimit === 30, "免费且没填额度时抬到会员、每天 30 次");
assert(raised.passwordHash === "scrypt$own$secret", "已注册的密码不能换成种子密码");
assert(raised.name === "已注册" && raised.email === "YCHENG0208@foxmail.com", "称呼和原来的邮箱写法留着");
assert(raised.unlimitedUses === undefined, "抬权益时不要打开不限次数");
assert(existing.users[0]?.email === "other@yoooco.com" && existing.users[0]?.passwordHash === "scrypt$salt$hash", "别人的账号不动");
assert(applyKnownAccountSeeds(existing) === false, "抬完后再读不应反复改");

const higher = accountDocFromStored({
  users: [
    baseUser({
      id: 9,
      email: EMAIL,
      passwordHash: "scrypt$own$secret",
      plan: "admin",
      dailyLimit: 100,
      unlimitedUses: true,
    }),
  ],
  sessions: [],
});
const beforeHigher = JSON.stringify(higher.users[0]);
assert(applyKnownAccountSeeds(higher) === false, "已经更高或不限次数时不要改回去");
assert(JSON.stringify(higher.users[0]) === beforeHigher, "管理员、更高额度和不限次数都要原样留下");

const partial = accountDocFromStored({
  users: [
    baseUser({
      id: 3,
      email: EMAIL,
      passwordHash: "scrypt$own$secret",
      plan: "member",
      dailyLimit: 10,
    }),
  ],
  sessions: [],
});
assert(applyKnownAccountSeeds(partial) === true, "额度低于 30 时要抬到 30");
assert(partial.users[0]?.plan === "member" && partial.users[0]?.dailyLimit === 30, "已经是会员就保持会员，额度抬到 30");
assert(partial.users[0]?.passwordHash === "scrypt$own$secret", "只抬额度时密码仍留着");

const rich = accountDocFromStored({
  users: [
    baseUser({
      id: 8,
      email: EMAIL,
      passwordHash: "scrypt$own$secret",
      plan: "free",
      dailyLimit: 80,
    }),
  ],
  sessions: [],
});
assert(applyKnownAccountSeeds(rich) === true, "额度已经更高时仍要把免费抬到会员");
assert(rich.users[0]?.plan === "member" && rich.users[0]?.dailyLimit === 80, "高于 30 的额度不要降下来");

const numbered = accountDocFromStored({
  users: [baseUser({ id: 12 })],
  sessions: [],
});
assert(applyKnownAccountSeeds(numbered) === true, "旁边已有账号时也要能补上保底账号");
assert(numbered.users[1]?.id === 13 && numbered.users[1]?.email === EMAIL, "新编号要接在现有最大编号后面");

console.log("known account seed ok");
