/** 积分和邀请说明用已定稿的句子。category 只用来分组展示。 */
export const SITE_FAQ = [
  {
    id: "trial",
    category: "积分",
    title: "试用积分",
    body: "未登录每天免费 3 积分，当天用完第二天自动恢复。请勿重复注册刷积分。一经核实，相关积分清零。",
  },
  {
    id: "credits-out",
    category: "积分",
    title: "当天积分用完了怎么办",
    body: "未登录每天 3 积分，当天用完第二天自动恢复。当天用完可：留下邮箱等订阅通知，或注册拿额度，或走邀请好友加积分。",
  },
  {
    id: "otp",
    category: "验证码",
    title: "收不到邮箱验证码",
    body: "① 别连点重发，等 1–2 分钟再试；② 查垃圾箱/广告邮件；③ 确认邮箱无误后再发一次；④ 仍没有，把注册邮箱发给客服。只有邮箱验证码。",
  },
  {
    id: "invite",
    category: "邀请",
    title: "邀请好友",
    body: "登录后，点工作台头像上方的礼包图标，复制邀请码发给朋友。未登录看不到这个入口。朋友注册时填上这个码并注册成功后，你们俩各得 +5 积分。一个码最多给 5 个朋友用；同一个账号只能核销一次。",
    emphasis: "未登录看不到这个入口。",
  },
  {
    id: "invite-success",
    category: "邀请",
    title: "怎样算邀请成功",
    body: "好友注册时填上你的邀请码，并且注册成功，才算核销。只复制码、没注册成功，双方都不得分。",
  },
  {
    id: "invite-fail",
    category: "邀请",
    title: "邀请码用不了",
    body: "常见原因：码不对 / 已用满 5 次 / 该账号已领过。仍失败把邀请码截图发客服核实。",
  },
] as const;

export type SiteFaqItem = (typeof SITE_FAQ)[number];

/** 按出现顺序取出分类，首页和 /faq 共用这一份。 */
export function faqCategories(): string[] {
  const labels: string[] = [];
  for (const item of SITE_FAQ) {
    if (!labels.includes(item.category)) labels.push(item.category);
  }
  return labels;
}
