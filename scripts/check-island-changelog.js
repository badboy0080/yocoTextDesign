import { readFileSync } from "node:fs";

function fail(message) {
  console.error(message);
  process.exit(1);
}

const themes = readFileSync(new URL("../public/themes.js", import.meta.url), "utf8");
const app = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../public/styles.css", import.meta.url), "utf8");
const normalizer = readFileSync(new URL("../lib/deepseek-normalizer.js", import.meta.url), "utf8");
const changelog = readFileSync(new URL("../lib/changelog.ts", import.meta.url), "utf8");
const page = readFileSync(new URL("../app/changelog/page.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../app/home-landing.tsx", import.meta.url), "utf8");
const account = readFileSync(new URL("../components/account-layout.tsx", import.meta.url), "utf8");
const studio = readFileSync(new URL("../public/studio.html", import.meta.url), "utf8");
const works = readFileSync(new URL("../components/works-frame.tsx", import.meta.url), "utf8");
const gallery = readFileSync(new URL("../components/works-gallery.tsx", import.meta.url), "utf8");
const seo = readFileSync(new URL("../lib/site-seo.ts", import.meta.url), "utf8");

const islandStart = themes.indexOf("island: {");
const islandEnd = themes.indexOf("const THEME_ORDER");
if (islandStart < 0 || islandEnd < islandStart) fail("动森没有登记进主题表");
const island = themes.slice(islandStart, islandEnd);
if (!island.includes('label: "动森"')) fail("显示名要是动森");
if (!island.includes('pageColor: "#f8f8f0"')) fail("动森纸色要用羊皮纸");
if (!island.includes('textColor: "#794f27"')) fail("动森正文字色要用棕色");
if (!island.includes('accentColor: "#19c8b9"')) fail("动森主色要用薄荷青");
if (!island.includes('highlightColor: "#f5c31c"')) fail("动森重点要用库里的警示黄");
if (!island.includes('bodyFont: "system"')) fail("动森正文字体跟现有主题一样用系统中文栈");
if (/Nunito|动物森友会|nintendo/i.test(island)) fail("动森不能搬 Nunito 或官方游戏名");
if (island.includes("#1a1a1a") || island.includes("#121212")) fail("动森不要铺炭黑底");
if (!themes.includes('"island"')) fail("主题顺序要带上 island");
if (themes.includes("杂志编辑部")) fail("主题表不要把杂志编辑部加回来");

if (!normalizer.includes("'island'")) fail("整理名单要收下 island");
if (!normalizer.includes("island 动森")) fail("提示词要认识动森");
if (!normalizer.includes("所有主题都要标 highlight：") || !normalizer.includes("texture、island")) fail("重点名单要带上 island");
if (!app.includes('"island"')) fail("工作台候选主题要带上 island");
if (!app.includes("state.theme === \"island\"")) fail("复制稿要单独带走动森样式");
if (!app.includes("border-radius:999px;background-color:#f5c31c")) fail("复制稿重点要是黄色胶囊");
if (!app.includes("background-color:#f8f8f0") && !app.includes("pageColor")) fail("复制稿纸色要能跟着主题走");
const islandCopy = app.slice(app.indexOf("const islandHighlightCss"), app.indexOf("const highlightCss"));
if (/text-align\s*:\s*(start|end)/i.test(islandCopy)) fail("动森复制样式不能用 start 或 end");
if (!css.includes('.article-page[data-theme="island"]')) fail("预览要有动森纸面样式");
if (!css.includes("background-color: #f8f8f0")) fail("预览纸色要写死羊皮纸");

for (const file of [home, account, studio, works]) {
  if (!file.includes('href="/changelog"') && !file.includes("href=\"/changelog\"")) fail("导航要能进更新日志");
}
if (!home.includes("更新日志") || !account.includes("更新日志") || !studio.includes("更新日志")) fail("入口文案要是更新日志");
if (!gallery.includes('"动森"')) fail("精品模板筛选要认到动森");
if (!gallery.includes('label !== "杂志编辑部"')) fail("杂志编辑部不能回到筛选");
if (!seo.includes('"/changelog"')) fail("更新日志要进站点地图");
if (!page.includes("CHANGELOG") || !page.includes('skin="obsidian"')) fail("日志页要用现有日夜外壳");

const dates = [...changelog.matchAll(/date: "(\d{4}-\d{2}-\d{2})"/g)].map((match) => match[1]);
if (dates[0] !== "2026-11-23") fail("最新一条要是本次更新");
for (let index = 1; index < dates.length; index += 1) {
  if (dates[index] >= dates[index - 1]) fail("日志要新的在前");
}
for (const day of ["2026-11-19", "2026-11-20", "2026-11-21", "2026-11-22", "2026-11-23"]) {
  if (!dates.includes(day)) fail(`日志缺了 ${day}`);
}
if (!changelog.includes("还没上正式站")) fail("本次更新要写明还没上正式站");
if (!changelog.includes("暖米") || !changelog.includes("素墨") || !changelog.includes("标重点")) fail("已上线的几条要写进日志");
if (/订阅|收费页|PR #|DeepSeek|EdgeOne|Nunito|动物森友会/.test(changelog)) fail("日志不要写内部词或没对上的内容");

console.log("island theme and changelog checks passed");
