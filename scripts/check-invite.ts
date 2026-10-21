import { readFileSync } from "node:fs";
import { inviteShareText } from "../lib/invite-copy.ts";
import { planNormalizeSpend, quotaRemaining } from "../lib/invite-quota.ts";
import { SITE_FAQ, faqCategories } from "../lib/site-faq.ts";
import { TRIAL_LIMIT } from "../lib/trial-quota.js";
import {
  consumeInviteBonus,
  ensureInviteCode,
  inspectInviteCode,
  inviteFailureMessage,
  inviteSentence,
  INVITE_BONUS_USES,
  peekInviteBonus,
  readInviteInput,
  redeemInviteCode,
  resetInviteMemory,
} from "../lib/invite-store.ts";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const expectedSentence = "你的邀请码：ABC234。好友注册成功后，双方各 +5 积分。一码最多用 5 次。";
assert(inviteSentence("ABC234") === expectedSentence, "弹窗要写双方各加 5 积分");
const expectedShare = "好的文章就应该有好的排版！\n快来https://yoooco.com/一起体验排版的乐趣吧！\n邀请码：ABC234\n好友注册成功后，双方各 +5 积分。";
assert(inviteShareText("ABC234") === expectedShare, "复制模板要在原三行后写双方各加 5 积分");
assert(expectedShare.includes(`双方各 +${INVITE_BONUS_USES} 积分`), "复制模板的加积分要跟常量一致");
const studioCopy = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const registerCopy = readFileSync(new URL("../components/auth-page.tsx", import.meta.url), "utf8");
assert(studioCopy.includes("好友注册成功后，双方各 +5 积分。"), "工作室复制模板也要写双方各加 5 积分");
assert(!studioCopy.includes("可多 5 次免费"), "工作室不要留只给好友加次的旧句");
assert(registerCopy.includes("注册成功后，双方各 +5 积分"), "注册页要写双方各加 5 积分");
assert(!registerCopy.includes("填了多 5 次免费"), "注册页不要留旧提示");
assert(SITE_FAQ.length === 4, "常见问题正好四条");
assert(faqCategories().join("|") === "积分|验证码|邀请", "常见问题按积分、验证码、邀请分组");
const faqPage = readFileSync(new URL("../app/faq/page.tsx", import.meta.url), "utf8");
const faqTabs = readFileSync(new URL("../components/faq-tabs-card.tsx", import.meta.url), "utf8");
const faqBrief = readFileSync(new URL("../components/home-faq.tsx", import.meta.url), "utf8");
const homeLanding = readFileSync(new URL("../app/home-landing.tsx", import.meta.url), "utf8");
assert(faqPage.includes("FaqTabsCard"), "常见问题页用分类卡片");
assert(faqTabs.includes("SITE_FAQ") && faqBrief.includes("SITE_FAQ"), "首页和常见问题读同一份问答");
assert(!faqTabs.includes("未登录每天免费") && !faqBrief.includes("未登录每天免费"), "页面不要再抄一份问答正文");
assert(homeLanding.includes("HomeFaq"), "首页底部要放简版问答");
assert(faqBrief.includes('href="/faq"'), "首页要能去完整常见问题");
const inviteModal = readFileSync(new URL("../components/invite-modal.tsx", import.meta.url), "utf8");
assert(inviteModal.includes("inviteShareText"), "复制仍用原来的整段话");
assert(inviteModal.includes("invite_share"), "打开和复制仍记 invite_share");
assert(inviteModal.includes("双方各 +5 积分"), "邀请卡写双方各加 5 积分");
const studioHtml = readFileSync(new URL("../public/studio.html", import.meta.url), "utf8");
assert(studioHtml.includes("邀请好友，双方各 +5 积分"), "工作室邀请卡写双方各加 5 积分");
assert(studioHtml.includes('id="waitlistForm"') && studioHtml.includes('id="waitlistEmail"'), "留邮箱表单还在");
assert(SITE_FAQ.map((item) => item.title).join("|") === "试用积分|收不到邮箱验证码|邀请好友|邀请码用不了", "常见问题标题里，试用改成积分");
assert(
  SITE_FAQ[0].body === "未登录每天免费 3 积分，当天用完第二天自动恢复。用完了：留下邮箱等开放订阅通知，或注册拿额度；也可走邀请好友加积分。请勿重复注册刷积分。",
  "试用积分说明",
);
assert(
  SITE_FAQ[1].body === "① 查垃圾箱/广告邮件；② 确认邮箱后重发，等 1–2 分钟；③ 仍没有，把注册邮箱发给客服人工协助。（只有邮箱验证码。）",
  "验证码说明用客服定稿",
);
assert(
  SITE_FAQ[2].body === "个人信息里拿邀请码。好友注册时填码并注册成功后，邀请人与被邀请人各 +5 积分。一码最多核销 5 次；同一账号只能核销一次。",
  "邀请说明里的加次改成积分",
);
assert(
  SITE_FAQ[3].body === "常见原因：码不对 / 已用满 5 次 / 该账号已领过。仍失败把邀请码截图发客服核实。",
  "邀请码失败说明用客服定稿",
);
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
  assert(await peekInviteBonus(1) === (userId - 1) * 5, "每成功核销一次，邀请人再加 5 次");
}
assert(await peekInviteBonus(1) === 25, "五个人核销后，邀请人一共加 25 次");
const sixth = await redeemInviteCode({ code: owner.card.code, userId: 7 });
assert(!sixth.ok && sixth.reason === "exhausted", "第 6 次必须用满");
assert(await peekInviteBonus(1) === 25, "用满之后邀请人不再加");
assert(inviteFailureMessage("exhausted") === "这个邀请码已经用满 5 次。", "用满要说清楚");

const again = await redeemInviteCode({ code: owner.card.code, userId: 2 });
assert(!again.ok && again.reason === "already", "同一个账号不能再领一次");
assert(await peekInviteBonus(1) === 25, "同一被邀请人再核销，邀请人不能再加");
assert(await peekInviteBonus(2) === 5, "被邀请人仍是加过的那 5 次");

const missing = await inspectInviteCode("ABCDEF");
assert(!missing.ok && missing.reason === "invalid", "不存在的码要说不对");

const friend = await ensureInviteCode(2);
assert(friend.ok, "被邀请的人自己也有码");
if (!friend.ok) throw new Error("unreachable");
const nested = await redeemInviteCode({ code: friend.card.code, userId: 8 });
assert(nested.ok && nested.bonusRemaining === 5, "好友可以再邀请别人，但每张码仍然最多 5 次");
assert(await peekInviteBonus(2) === 10, "被邀请人自己再邀到人时，在原来的 5 次上再加 5 次");

const other = await ensureInviteCode(9);
assert(other.ok, "另一张码要能生成");
if (!other.ok) throw new Error("unreachable");
const repeatOther = await redeemInviteCode({ code: other.card.code, userId: 2 });
assert(!repeatOther.ok && repeatOther.reason === "already", "已经领过的人不能再用另一张码");
assert(await peekInviteBonus(2) === 10, "失败的第二次核销不能再给这个人加次");
assert(await peekInviteBonus(9) === 0, "没核销成功时，这张码的邀请人不能加次");

let left = 5;
for (let i = 0; i < 5; i += 1) {
  const spent = await consumeInviteBonus(8);
  assert(spent.ok && spent.spent, "加成要能一次次扣掉");
  if (spent.ok) left = spent.bonusRemaining;
}
assert(left === 0, "5 次加成用完就是 0");
const extra = await consumeInviteBonus(8);
assert(extra.ok && extra.spent === false, "没有加成时不能再扣");

const host = await ensureInviteCode(40);
assert(host.ok, "另一位邀请人要能领码");
if (!host.ok) throw new Error("unreachable");
const firstGuest = await redeemInviteCode({ code: host.card.code, userId: 41 });
assert(firstGuest.ok && (await peekInviteBonus(40)) === 5, "第一位好友注册成功，邀请人加 5 次");
const spentOwner = await consumeInviteBonus(40);
assert(spentOwner.ok && spentOwner.spent && spentOwner.bonusRemaining === 4, "邀请人用掉 1 次后剩 4");
const secondGuest = await redeemInviteCode({ code: host.card.code, userId: 42 });
assert(secondGuest.ok && (await peekInviteBonus(40)) === 9, "再用掉之后的新核销，是在剩下的次数上加 5，不是封回 5");
const sameGuest = await redeemInviteCode({ code: host.card.code, userId: 41 });
assert(!sameGuest.ok && sameGuest.reason === "already", "同一对被邀请人不能再给邀请人加一次");
assert(await peekInviteBonus(40) === 9, "重复核销后邀请人次数不变");

console.log("invite checks ok");
