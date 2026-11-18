import fs from "node:fs";

function fail(message) {
  console.error(message);
  process.exit(1);
}

const chrome = fs.readFileSync(new URL("../public/site-chrome.css", import.meta.url), "utf8");
const studio = fs.readFileSync(new URL("../public/studio.html", import.meta.url), "utf8");
const layout = fs.readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
const story = fs.readFileSync(new URL("../lib/showcase-story.ts", import.meta.url), "utf8");

for (const banned of [".article-content", "#articleBody", "#articlePage", ".inline-highlight", "buildCopyHtml"]) {
  if (chrome.includes(banned)) fail(`site-chrome.css 碰到了文章样式：${banned}`);
}
if (!studio.includes("studio-ui.css?v=mobile-fit-v1")) fail("工作台手机样式缓存丢了");
if (!studio.includes("site-theme-boot.js")) fail("工作台没有在样式前设置日夜");
if (!studio.includes('data-site-value="day"') || !studio.includes('data-site-value="night"')) fail("工作台没有白天黑夜按钮");
if (!studio.includes(">登录<")) fail("工作台登录按钮不是中文");
if (studio.includes(">Log in<")) fail("工作台登录按钮还是 Log in");
if (!layout.includes("site-theme-boot.js")) fail("首页没有提前设置日夜");
for (const needed of ["manuscript", "fresh", "nocturne", "yooco-wechat-layout", "清氧绿", "深空青"]) {
  if (!story.includes(needed)) fail(`首页故事缺少 ${needed}`);
}
const beats = story.split("SHOWCASE_BEATS")[1] || "";
if (beats.includes("newsprint") || beats.includes("texture") || beats.includes("classic")) {
  fail("首页故事又堆了第三拍以外的主题");
}

console.log("site chrome checks passed");
