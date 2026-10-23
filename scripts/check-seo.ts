import { readFileSync } from "node:fs";
import { SITE_CONFIG } from "../lib/site-config.ts";
import { SITE_FAQ } from "../lib/site-faq.ts";
import {
  FAQ_DESCRIPTION,
  FAQ_TITLE,
  HOME_DESCRIPTION,
  HOME_TITLE,
  homeJsonLd,
  homeMetadata,
  INDEXABLE_PATHS,
  ROBOTS_DISALLOW,
  LANDING_DESCRIPTION,
  LANDING_PATH,
  LANDING_TITLE,
  WORKS_DESCRIPTION,
  WORKS_TITLE,
  absoluteUrl,
} from "../lib/site-seo.ts";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

assert(SITE_CONFIG.siteUrl === "https://www.yoooco.com", "正式站地址用三个 o，并带 www");
assert(HOME_TITLE.startsWith("公众号排版"), "首页标题先写公众号排版");
assert(HOME_TITLE.includes("AI 文章排版") && HOME_TITLE.includes("Yooco"), "首页标题带上 AI 文章排版和品牌");
assert(
  HOME_DESCRIPTION ===
    "Yooco 是公众号排版工具：粘贴或上传文章，一键优化排版、换主题，复制到微信公众号就能发。免费试用。",
  "首页说明用直白产品句",
);
assert(HOME_DESCRIPTION.includes("公众号排版"), "首页说明含主词公众号排版");
assert(!HOME_DESCRIPTION.includes("好文章值得好排版"), "首页说明不再附品牌散文");
assert(!HOME_DESCRIPTION.includes("一篇评论") && !HOME_DESCRIPTION.includes("颜色少"), "首页说明不要抽模板卡片散文");
const og = homeMetadata.openGraph;
assert(og && !Array.isArray(og), "首页要有分享卡片");
assert(
  og && !Array.isArray(og) && og.title === HOME_TITLE && og.description === HOME_DESCRIPTION,
  "分享标题和说明跟首页搜索文案一致",
);
assert(
  og && !Array.isArray(og) && og.siteName === "Yooco" && og.locale === "zh_CN" && og.type === "website",
  "分享卡片标明 Yooco 中文网站",
);
assert(og && !Array.isArray(og) && String(og.url) === "https://www.yoooco.com", "分享地址是正式站首页");
assert(!og || Array.isArray(og) || !("images" in og) || og.images == null, "没有现成分享图时不编图片地址");
const twitter = homeMetadata.twitter;
assert(
  twitter && "card" in twitter && twitter.card === "summary_large_image" && twitter.title === HOME_TITLE && twitter.description === HOME_DESCRIPTION,
  "Twitter 卡片跟首页说明一致",
);
assert(homeJsonLd["@type"] === "SoftwareApplication", "首页结构化数据标明这是软件");
assert(
  homeJsonLd.name === "Yooco" && homeJsonLd.description === HOME_DESCRIPTION && homeJsonLd.url === "https://www.yoooco.com",
  "结构化数据用同一句产品说明",
);
assert(WORKS_TITLE.includes("微信文章排版") && WORKS_TITLE.includes("Yooco"), "精品模板标题对准微信文章排版");
assert(WORKS_DESCRIPTION.includes("微信文章排版模板") && WORKS_DESCRIPTION.includes("独立工作台"), "精品模板说明不要再写成同一页打开工作台");
assert(FAQ_TITLE.includes("公众号排版工具") && FAQ_TITLE.includes("Yooco"), "常见问题标题对准公众号排版工具");
assert(FAQ_DESCRIPTION.includes("邀请") && FAQ_DESCRIPTION.includes("Yooco"), "常见问题说明提到邀请和产品");
assert(!HOME_TITLE.startsWith("Yooco ·") && !WORKS_TITLE.startsWith("Yooco ·") && !FAQ_TITLE.startsWith("Yooco ·"), "这三个标题不要只剩品牌句");

const required = ["/", "/works", "/faq", "/studio.html", LANDING_PATH];
assert(LANDING_TITLE === "公众号排版怎么做好看？粘贴原文一键优化｜Yooco", "落地页标题用张默定稿");
assert(LANDING_DESCRIPTION.includes("优化排版") && LANDING_DESCRIPTION.includes("www.yoooco.com"), "落地页说明带到试用地址");
assert(absoluteUrl(LANDING_PATH) === "https://www.yoooco.com/gongzhonghao-paiban", "落地页绝对地址");
for (const path of required) {
  assert(INDEXABLE_PATHS.includes(path as (typeof INDEXABLE_PATHS)[number]), `sitemap 要有 ${path}`);
  assert(!ROBOTS_DISALLOW.some((rule) => path === rule || path.startsWith(rule)), `robots 不能挡住 ${path}`);
}
assert(!INDEXABLE_PATHS.includes("/subscribe" as (typeof INDEXABLE_PATHS)[number]), "订阅页不进 sitemap");
assert(!INDEXABLE_PATHS.includes("/admin" as (typeof INDEXABLE_PATHS)[number]), "后台不进 sitemap");
assert(!INDEXABLE_PATHS.includes("/metrics" as (typeof INDEXABLE_PATHS)[number]), "统计页不进 sitemap");
assert(ROBOTS_DISALLOW.includes("/admin") && ROBOTS_DISALLOW.includes("/metrics"), "后台和统计页不给抓");
assert(absoluteUrl("/") === "https://www.yoooco.com", "首页绝对地址");
assert(absoluteUrl("/faq") === "https://www.yoooco.com/faq", "常见问题绝对地址");

const invite = SITE_FAQ.find((item) => item.id === "invite");
assert(invite?.emphasis === "未登录看不到这个入口。", "邀请答案加粗未登录那句");

const studio = readFileSync(new URL("../public/studio.html", import.meta.url), "utf8");
assert(!/noindex/i.test(studio), "工作台静态页不要写 noindex");
assert(studio.includes('rel="canonical" href="https://www.yoooco.com/studio.html"'), "工作台静态页指向正式站");

const faqPage = readFileSync(new URL("../app/faq/page.tsx", import.meta.url), "utf8");
const worksPage = readFileSync(new URL("../app/works/page.tsx", import.meta.url), "utf8");
const homePage = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const homeLanding = readFileSync(new URL("../app/home-landing.tsx", import.meta.url), "utf8");
assert(homeLanding.includes("Yooco：粘贴文章，一键做好公众号排版。"), "首页首屏用张默短句");
assert(homePage.includes("application/ld+json") && homePage.includes("homeJsonLd"), "首页挂上结构化数据");
const metrics = readFileSync(new URL("../app/metrics/layout.tsx", import.meta.url), "utf8");
const admin = readFileSync(new URL("../app/admin/page.tsx", import.meta.url), "utf8");
assert(faqPage.includes("faqMetadata") && worksPage.includes("worksMetadata") && homePage.includes("homeMetadata"), "三个公开页用同一份标题");
const landingPage = readFileSync(new URL("../app/gongzhonghao-paiban/page.tsx", import.meta.url), "utf8");
assert(landingPage.includes("landingMetadata"), "落地页用同一份标题");
assert(landingPage.includes("公众号排版：乱文一键变成能发的样子"), "落地页只有这一句主标题");
assert(landingPage.includes("微信文章排版") && landingPage.includes("AI 文章排版"), "落地页自然提到另外两个词");
assert(landingPage.includes('href="/studio.html"'), "落地页主按钮进工作台");
assert(landingPage.includes("上素文 · 下 Yooco 优化排版"), "对比图是上下排，图注跟着改");
assert(!/noindex/i.test(faqPage + worksPage + homePage + landingPage), "首页、精品模板、常见问题、落地页不要 noindex");
const compareImage = readFileSync(new URL("../public/gongzhonghao-paiban/compare-1080x1440.png", import.meta.url));
assert(compareImage.length > 10000, "对比图要能打开");
assert(metrics.includes("index: false") && admin.includes("index: false"), "统计页和后台继续不收录");

console.log("seo ok");
