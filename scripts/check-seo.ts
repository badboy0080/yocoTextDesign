import { readFileSync } from "node:fs";
import { SITE_CONFIG } from "../lib/site-config.ts";
import { SITE_FAQ } from "../lib/site-faq.ts";
import {
  LANDING_COMPARE_CAPTION,
  LANDING_COMPARE_SRC,
  LANDING_DEFINITION,
  LANDING_FAQS,
  LANDING_H1,
  LANDING_UPDATED,
  TRIAL_URL,
  landingJsonLd,
} from "../lib/landing-answer.ts";
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
assert(LANDING_TITLE === "公众号排版工具怎么用？粘贴原文一键优化｜Yooco", "落地页标题用张默定稿");
assert(
  LANDING_DESCRIPTION ===
    "Yooco 是公众号排版工具：粘贴或上传文章，点「优化排版」、换主题，复制到微信公众号就能发。免费试用。适合写完正文、不想手工调格式的人。",
  "落地页说明用张默定稿",
);
assert(absoluteUrl(LANDING_PATH) === "https://www.yoooco.com/gongzhonghao-paiban", "落地页绝对地址");
assert(TRIAL_URL === "https://www.yoooco.com", "试用链到官网首页");
assert(LANDING_H1 === "公众号排版：粘贴原文，一键变成能发的样子", "落地页只有这一句主标题");
assert(LANDING_DEFINITION.length >= 40 && LANDING_DEFINITION.length <= 80, "开篇定义控制在 40 到 80 字");
assert(LANDING_FAQS.length === 8, "常见问题是 8 条");
assert(LANDING_UPDATED === "2026-10-26", "答案页更新日期是 2026-10-26");
assert(
  LANDING_COMPARE_CAPTION === "同一篇《出师表》节选 · 上素文 · 下 Yooco 优化排版（清氧绿）· 真站实测",
  "图注按定稿，方向改成这张图实际的上下排",
);
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
const landingCopy = [
  landingPage,
  LANDING_DEFINITION,
  LANDING_H1,
  LANDING_TITLE,
  ...LANDING_FAQS.flatMap((item) => [item.question, item.answer]),
].join("\n");
assert(landingPage.includes("landingMetadata"), "落地页用同一份标题");
assert(landingPage.includes("landingJsonLd"), "落地页挂上结构化数据");
assert((landingPage.match(/<h1>/g) || []).length === 1, "落地页只有一个主标题");
assert(landingPage.includes("微信文章排版") && landingPage.includes("AI文章排版"), "落地页自然提到微信文章排版和 AI文章排版");
assert(landingCopy.includes("公众号排版") && landingCopy.includes("公众号排版工具"), "落地页含公众号排版和公众号排版工具");
assert(!landingPage.includes('href="/studio.html"'), "落地页试用不再链到工作台路径");
assert(landingPage.includes("TRIAL_URL"), "落地页试用链用官网地址");
assert(landingPage.includes("LANDING_COMPARE_SRC"), "对比图用站内静态地址");
assert(LANDING_COMPARE_SRC === "/gongzhonghao-paiban/compare-1080x1440.png", "对比图相对地址不变");
const graph = landingJsonLd["@graph"] as Array<Record<string, unknown>>;
const software = graph.find((node) => node["@type"] === "SoftwareApplication");
const faqNode = graph.find((node) => node["@type"] === "FAQPage");
const webPage = graph.find((node) => node["@type"] === "WebPage");
assert(software?.name === "Yooco" && software.applicationCategory === "BusinessApplication", "软件说明和首页同一类");
assert(software?.operatingSystem === "Web" && software.url === "https://www.yoooco.com", "软件说明指向官网");
assert(software?.description === LANDING_DEFINITION, "软件说明和开篇定义是同一句");
const offer = software?.offers as { description?: string; price?: unknown };
assert(typeof offer?.description === "string" && LANDING_FAQS.some((item) => item.answer.includes(offer.description ?? "")), "试用说明出自页面上的问答");
assert(offer?.price == null && !/元\d|\d\s*元/.test(offer?.description ?? ""), "试用说明不写死价格");
const features = software?.featureList as string[];
assert(features?.every((feature) => landingPage.includes(feature)), "软件功能都写在页面上");
const faqEntities = faqNode?.mainEntity as Array<{ name: string; acceptedAnswer: { text: string } }>;
assert(faqEntities?.length === 8, "结构化数据里的问答是 8 条");
for (const item of LANDING_FAQS) {
  const found = faqEntities?.find((entry) => entry.name === item.question && entry.acceptedAnswer.text === item.answer);
  assert(found, `问答和页面原文不一致：${item.question}`);
}
assert(webPage?.dateModified === "2026-10-26", "结构化数据里的更新日期和页面一致");
assert(!/noindex/i.test(faqPage + worksPage + homePage + landingPage), "首页、精品模板、常见问题、落地页不要 noindex");
const compareImage = readFileSync(new URL("../public/gongzhonghao-paiban/compare-1080x1440.png", import.meta.url));
assert(compareImage.length > 10000, "对比图要能打开");
assert(compareImage.readUInt32BE(16) === 1080 && compareImage.readUInt32BE(20) === 1440, "对比图是 1080×1440");
assert(metrics.includes("index: false") && admin.includes("index: false"), "统计页和后台继续不收录");

console.log("seo ok");
