import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/site-config";

/** 搜索标题和说明。谁在用、用来干什么、品牌名，三样都要出现。 */
export const HOME_TITLE = "公众号排版 · AI 文章排版 | Yooco";
export const HOME_DESCRIPTION =
  "写公众号的人用 Yooco 做公众号排版和 AI 文章排版：贴上文章，选出版式，复制到微信就能发。Yooco · 好文章值得好排版。";

export const WORKS_TITLE = "微信文章排版模板 | Yooco";
export const WORKS_DESCRIPTION =
  "给要发微信文章的人：Yooco 精品模板页集中看微信文章排版模板，点开预览，做同款后去独立工作台继续改。";

export const FAQ_TITLE = "公众号排版工具常见问题 | Yooco";
export const FAQ_DESCRIPTION =
  "用 Yooco 这款公众号排版工具前，先看试用积分、验证码和邀请：登录后复制邀请码发给朋友，注册成功双方各 +5 积分。";

export const LANDING_PATH = "/gongzhonghao-paiban";
export const LANDING_TITLE = "公众号排版怎么做好看？粘贴原文一键优化｜Yooco";
export const LANDING_DESCRIPTION =
  "写公众号文章排版费时？Yooco 把乱文变成可读排版：粘贴 → 点「优化排版」→ 换主题。免费试用 www.yoooco.com。";

/** 允许搜索引擎收录的公开页。后台、统计和接口不放进来。 */
export const INDEXABLE_PATHS = ["/", LANDING_PATH, "/works", "/faq", "/studio.html", "/login", "/register"] as const;

/** robots.txt 里明确不抓的路径。订阅页会跳回首页，不在这里挡。 */
export const ROBOTS_DISALLOW = ["/admin", "/metrics", "/api/"] as const;

export function absoluteUrl(path: string) {
  if (path === "/") return SITE_CONFIG.siteUrl;
  return `${SITE_CONFIG.siteUrl}${path}`;
}

export const homeMetadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: { canonical: absoluteUrl("/") },
};

export const worksMetadata: Metadata = {
  title: { absolute: WORKS_TITLE },
  description: WORKS_DESCRIPTION,
  alternates: { canonical: absoluteUrl("/works") },
};

export const faqMetadata: Metadata = {
  title: { absolute: FAQ_TITLE },
  description: FAQ_DESCRIPTION,
  alternates: { canonical: absoluteUrl("/faq") },
};

export const landingMetadata: Metadata = {
  title: { absolute: LANDING_TITLE },
  description: LANDING_DESCRIPTION,
  alternates: { canonical: absoluteUrl(LANDING_PATH) },
  robots: { index: true, follow: true },
};
