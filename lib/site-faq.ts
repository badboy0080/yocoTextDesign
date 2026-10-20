/** 客服定稿。标题和正文一个字都不能改。category 只用来分组展示。 */
export const SITE_FAQ = [
  {
    id: "trial",
    category: "次数",
    title: "试用次数",
    body: "未登录每天免费 3 次，当天用完第二天自动恢复。用完了：留下邮箱等开放订阅通知，或注册拿额度；也可走邀请好友加次。请勿重复注册刷次。",
  },
  {
    id: "otp",
    category: "验证码",
    title: "收不到邮箱验证码",
    body: "① 查垃圾箱/广告邮件；② 确认邮箱后重发，等 1–2 分钟；③ 仍没有，把注册邮箱发给客服人工协助。（只有邮箱验证码。）",
  },
  {
    id: "invite",
    category: "邀请",
    title: "邀请好友",
    body: "个人信息里拿邀请码。好友注册时填码并注册成功后，邀请人与被邀请人各 +5 次。一码最多核销 5 次；同一账号只能核销一次。",
    emphasis: "邀请人与被邀请人各 +5 次",
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
