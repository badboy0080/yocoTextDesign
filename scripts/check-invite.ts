import { planNormalizeSpend, quotaRemaining } from "../lib/invite-quota.ts";
import { TRIAL_LIMIT } from "../lib/trial-quota.js";
import {
  consumeInviteBonus,
  ensureInviteCode,
  inspectInviteCode,
  inviteFailureMessage,
  inviteSentence,
  readInviteInput,
  redeemInviteCode,
  resetInviteMemory,
} from "../lib/invite-store.ts";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const expectedSentence = "你的邀请码：ABC234。一码最多用 5 次。好友注册填码，可多 5 次免费。";
assert(inviteSentence("ABC234") === expectedSentence, "文案必须跟张默原句一致");
assert(readInviteInput("  ").kind === "absent", "空邀请码应当没填");
assert(readInviteInput("abc234").kind === "code", "小写邀请码要能认");
assert(readInviteInput("000000").kind === "invalid", "不合法的码要拒绝");

assert(TRIAL_LIMIT === 3, "访客每天仍是 3 次");
assert(quotaRemaining(0, TRIAL_LIMIT, 0) === 3, "没加成时剩余就是每天 3 次");
assert(quotaRemaining(0, TRIAL_LIMIT, 5) === 8, "每天 3 次加邀请 5 次");
assert(planNormalizeSpend(0, TRIAL_LIMIT, 5).action === "daily", "还有当天次数时先扣当天的");
assert(planNormalizeSpend(0, TRIAL_LIMIT, 5).remaining === 7, "扣掉 1 次当天后还剩 2 次当天加 5 次加成");
assert(planNormalizeSpend(TRIAL_LIMIT, TRIAL_LIMIT, 0).action === "exhausted", "每天用完且没有加成就停");
assert(planNormalizeSpend(TRIAL_LIMIT, TRIAL_LIMIT, 5).action === "bonus", "每天用完才扣邀请加成");
assert(planNormalizeSpend(TRIAL_LIMIT, TRIAL_LIMIT, 5).remaining === 4, "加成用掉 1 次还剩 4");

resetInviteMemory();
const owner = await ensureInviteCode(1);
assert(owner.ok, "账号要能领到邀请码");
if (!owner.ok) throw new Error("unreachable");
assert(inviteSentence(owner.card.code) === owner.card.sentence, "接口句子用同一句文案");

const own = await redeemInviteCode({ code: owner.card.code, userId: 1 });
assert(!own.ok && own.reason === "own", "不能用自己的码");
assert(inviteFailureMessage("own") === "不能使用自己的邀请码。", "自己的码要说清楚");

for (let userId = 2; userId <= 6; userId += 1) {
  const redeemed = await redeemInviteCode({ code: owner.card.code, userId });
  assert(redeemed.ok && redeemed.bonusRemaining === 5, `第 ${userId - 1} 次兑换应成功`);
}
const sixth = await redeemInviteCode({ code: owner.card.code, userId: 7 });
assert(!sixth.ok && sixth.reason === "exhausted", "第 6 次必须用满");
assert(inviteFailureMessage("exhausted") === "这个邀请码已经用满 5 次。", "用满要说清楚");

const again = await redeemInviteCode({ code: owner.card.code, userId: 2 });
assert(!again.ok && again.reason === "already", "同一个账号不能再领一次");

const missing = await inspectInviteCode("ABCDEF");
assert(!missing.ok && missing.reason === "invalid", "不存在的码要说不对");

const friend = await ensureInviteCode(2);
assert(friend.ok, "被邀请的人自己也有码");
if (!friend.ok) throw new Error("unreachable");
const nested = await redeemInviteCode({ code: friend.card.code, userId: 8 });
assert(nested.ok, "好友可以再邀请别人，但每张码仍然最多 5 次");

let left = 5;
for (let i = 0; i < 5; i += 1) {
  const spent = await consumeInviteBonus(2);
  assert(spent.ok && spent.spent, "加成要能一次次扣掉");
  if (spent.ok) left = spent.bonusRemaining;
}
assert(left === 0, "5 次加成用完就是 0");
const extra = await consumeInviteBonus(2);
assert(extra.ok && extra.spent === false, "没有加成时不能再扣");

console.log("invite checks ok");
