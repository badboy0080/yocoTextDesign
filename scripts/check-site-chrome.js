import fs from "node:fs";

function fail(message) {
  console.error(message);
  process.exit(1);
}

const chrome = fs.readFileSync(new URL("../public/site-chrome.css", import.meta.url), "utf8");
const studio = fs.readFileSync(new URL("../public/studio.html", import.meta.url), "utf8");
const layout = fs.readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
const story = fs.readFileSync(new URL("../lib/showcase-story.ts", import.meta.url), "utf8");
const boot = fs.readFileSync(new URL("../public/site-theme-boot.js", import.meta.url), "utf8");
const bootSource = fs.readFileSync(new URL("../lib/site-theme-boot-source.ts", import.meta.url), "utf8");

for (const banned of [".article-content", "#articleBody", "#articlePage", ".inline-highlight", "buildCopyHtml"]) {
  if (chrome.includes(banned)) fail(`site-chrome.css 碰到了文章样式：${banned}`);
}
if (!studio.includes("studio-ui.css?v=mobile-fit-v1")) fail("工作台手机样式缓存丢了");
if (!studio.includes("site-theme-boot.js")) fail("工作台没有在样式前设置日夜");
if (!studio.includes('data-site-value="day"') || !studio.includes('data-site-value="night"')) fail("工作台没有白天黑夜按钮");
if (!studio.includes(">登录<")) fail("工作台登录按钮不是中文");
if (studio.includes(">Log in<")) fail("工作台登录按钮还是 Log in");
const bootMarker = "export const siteThemeBoot = ";
const bootStart = bootSource.indexOf(bootMarker);
if (bootStart < 0) fail("首页日夜脚本没有导出正文");
const bootLiteral = bootSource.slice(bootStart + bootMarker.length).trim().replace(/;$/, "");
let embeddedBoot = "";
try {
  embeddedBoot = JSON.parse(bootLiteral);
} catch {
  fail("首页日夜脚本正文解析失败");
}
if (embeddedBoot !== boot) fail("首页内联的日夜脚本和 public/site-theme-boot.js 不一致");
if (!layout.includes('from "@/lib/site-theme-boot-source"')) fail("首页没有提前设置日夜");
if (!layout.includes("dangerouslySetInnerHTML") || !layout.includes("siteThemeBoot")) {
  fail("首页没有把日夜脚本写进页面");
}
if (layout.includes("?raw")) fail("首页还在用构建读不了的原文导入");
if (/<script\b[^>]*\ssrc=/.test(layout)) fail("首页日夜脚本改成了外链，首屏会闪色");
for (const needed of ["manuscript", "fresh", "nocturne", "yooco-wechat-layout", "清氧绿", "深空青"]) {
  if (!story.includes(needed)) fail(`首页故事缺少 ${needed}`);
}
const beats = story.split("SHOWCASE_BEATS")[1] || "";
if (beats.includes("newsprint") || beats.includes("texture") || beats.includes("classic")) {
  fail("首页故事又堆了第三拍以外的主题");
}

console.log("site chrome checks passed");
