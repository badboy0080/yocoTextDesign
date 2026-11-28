import { readFileSync } from "node:fs";
import { normalizeWithDeepSeek } from "../lib/deepseek-normalizer.js";

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
if (!island.includes('pageColor: "#ffffff"')) fail("动森纸色要用纯白");
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
const islandCss = css.slice(css.indexOf('.article-page[data-theme="island"] {'));
if (!islandCss.slice(0, 220).includes("background-color: #ffffff")) fail("预览纸色要写死纯白");
if (!app.includes("#ffffff ${palette.fill} ${palette.fill}")) fail("折角露出的纸要是纯白");

for (const file of [home, account, studio, works]) {
  if (!file.includes('href="/changelog"') && !file.includes("href=\"/changelog\"")) fail("导航要能进更新日志");
}
if (!home.includes("更新日志") || !account.includes("更新日志") || !studio.includes("更新日志")) fail("入口文案要是更新日志");
if (!gallery.includes('"动森"')) fail("精品模板筛选要认到动森");
if (!gallery.includes('label !== "杂志编辑部"')) fail("杂志编辑部不能回到筛选");
if (!seo.includes('"/changelog"')) fail("更新日志要进站点地图");
if (!page.includes("CHANGELOG") || !page.includes('skin="obsidian"')) fail("日志页要用现有日夜外壳");

const dates = [...changelog.matchAll(/date: "(\d{4}-\d{2}-\d{2})"/g)].map((match) => match[1]);
if (dates[0] !== "2026-11-27") fail("最新一条要是等待和落入");
if (dates[1] !== "2026-11-26") fail("失败提示那条要紧跟在后面");
if (dates[2] !== "2026-11-24") fail("动森样式那条要留着");
if (!changelog.includes("动森补充浅底标签、虚线标签、浅色纸卡、提醒条，以及更淡的分隔线。本次尚未上线。")) fail("动森样式日志要留下");
if (!changelog.includes("新增「动森」文章主题与更新日志。本次尚未上线。")) fail("2026-11-23 那句尚未上线不要改");
for (let index = 1; index < dates.length; index += 1) {
  if (dates[index] >= dates[index - 1]) fail("日志要新的在前");
}
for (const day of ["2026-11-19", "2026-11-20", "2026-11-21", "2026-11-22", "2026-11-23"]) {
  if (!dates.includes(day)) fail(`日志缺了 ${day}`);
}
if (!changelog.includes("尚未上线")) fail("本次更新要写明尚未上线");
if (!app.includes("ac-title-ribbon") || !app.includes("ac-title-layer") || !app.includes("ac-title-tab")) fail("动森标题要有飘带、双层纸和折角便签");
if (!app.includes("ac-divider-wave") || !app.includes("ac-divider-squiggle")) fail("动森分隔线要有波浪和曲线");
if (!css.includes("ac-title-ribbon") || !css.includes("ac-tag-solid") || !css.includes("ac-tag-soft") || !css.includes("ac-tag-dashed") || !css.includes("ac-divider-squiggle")) fail("预览要画出动森装饰");
if (!css.includes("ac-divider-rule-hairline") || !css.includes("ac-card-soft") || !css.includes("ac-callout-tip") || !css.includes("ac-callout-warn") || !css.includes("ac-callout-ok")) fail("预览要有更淡虚线、浅色纸和提醒条");
if (!app.includes("ac-tag-soft") || !app.includes("ac-callout-tip") || !app.includes("ac-divider-hairline")) fail("复制稿要带上浅底标签、提醒条和更淡虚线");
const islandShape = app.slice(app.indexOf("function islandShapeHtml"), app.indexOf("function islandDividerHtml"));
if (/clip-path|text-align\s*:\s*(start|end)/i.test(islandShape)) fail("动森标题不要用 clip-path 或 start/end");
if (!normalizer.includes("const ISLAND_BRIEF") || !normalizer.includes("ac-title ac-title-ribbon")) fail("动森配方要单独写标签");
if (!normalizer.includes("其它主题不要输出这些标签")) fail("动森标签不能套到其它主题");
if (!changelog.includes("暖米") || !changelog.includes("素墨") || !changelog.includes("标重点")) fail("已上线的几条要写进日志");
if (/订阅|收费页|PR #|DeepSeek|EdgeOne|Nunito|动物森友会/.test(changelog)) fail("日志不要写内部词或没对上的内容");

const recipeAt = normalizer.indexOf("const THEME_RECIPE_TEXT");
const recipeEnd = normalizer.indexOf("function normalizeAssignment");
if (normalizer.slice(recipeAt, recipeEnd).includes("ac-title-ribbon")) fail("总配方不要混进动森标签");

function resultBody() {
  return {
    version: 2,
    template: { type: "universal", name: "动森样稿", params: { theme: "fresh", articleType: "lifestyle" } },
    document: {
      title: "海岛上的十分钟",
      decor: "ac-title ac-title-ribbon ac-purple",
      blocks: [
        { type: "heading", level: 2, class: "ac-title ac-title-ribbon ac-yellow", text: "沿着木栈道" },
        { type: "heading", level: 3, class: "ac-title ac-title-ribbon ac-peach", text: "长椅旁边" },
        { type: "heading", level: 3, class: "ac-title ac-title-tab ac-brown", text: "听海就好" },
        {
          type: "paragraph",
          text: "出门前先看天。记得海风，也记得慢走。坐五分钟就够。",
          tags: [
            { text: "海风", face: "solid", color: "green" },
            { text: "慢走", face: "soft", color: "brown" },
            { text: "不存在", face: "solid", color: "yellow" },
            { text: "出门", face: "dashed", color: "red" },
            { text: "先看天", face: "button", color: "purple" },
            { text: "坐五分钟", face: "outline", color: "peach" },
          ],
          marks: [{ text: "坐五分钟", type: "highlight" }],
        },
        { type: "divider", class: "ac-divider ac-divider-wave" },
        { type: "divider", class: "ac-divider ac-divider-squiggle" },
        { type: "divider", class: "ac-divider ac-divider-dash" },
        { type: "divider", class: "ac-divider ac-divider-wave" },
        { type: "divider", class: "ac-divider ac-divider-hairline" },
        { type: "divider", class: "ac-divider ac-divider-purple" },
        { type: "quote", title: "引用", class: "ac-card", text: "海风把声音放轻了。" },
        { type: "card", title: "小提示", class: "ac-card ac-card-dash", text: "回来前把沙子拍掉。" },
        { type: "card", title: "浅纸", class: "ac-card ac-card-soft ac-peach ac-red", text: "午后的桃子最甜。" },
        { type: "card", title: "第二张", class: "ac-card ac-card-soft ac-yellow", text: "这张不该再上色。" },
        { type: "card", title: "带现金", class: "ac-callout ac-callout-warn ac-purple", text: "记得带现金。" },
        { type: "card", title: "防晒", class: "ac-callout ac-callout-tip", text: "中午记得防晒。" },
        { type: "card", title: "成功", class: "ac-callout ac-callout-ok", text: "船票已经买好。" },
      ],
    },
    summary: {},
  };
}

function fetchReturning(body, seen) {
  return async (_url, init) => {
    seen.push(JSON.parse(init.body));
    return {
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: JSON.stringify(body) } }] }),
    };
  };
}

const source = [
  "海岛上的十分钟",
  "",
  "出门前先看天。记得海风，也记得慢走。坐五分钟就够。",
  "",
  "## 沿着木栈道",
  "",
  "### 长椅旁边",
  "",
  "听海就好。",
  "",
  "> 海风把声音放轻了。",
  "",
  "回来前把沙子拍掉。",
].join("\n");

const islandSeen = [];
const islandResult = await normalizeWithDeepSeek(source, "test-key", "deepseek-flash", { mode: "fixed", theme: "island" }, {
  fetchImpl: fetchReturning(resultBody(), islandSeen),
});
const islandSystem = islandSeen[0].messages[0].content;
const islandUser = islandSeen[0].messages[1].content;
if (!islandUser.includes("本次主题已指定为 island")) fail("请求里要带上 island");
if (!islandSystem.includes("ac-title ac-title-ribbon") || !islandSystem.includes("ac-tag") || !islandSystem.includes("ac-divider-wave") || !islandSystem.includes("ac-card")) fail("指定动森时要输出这套标签");
if (!islandSystem.includes("全文最多 1 个非绿色标题") || !islandSystem.includes("全文最多 4 个")) fail("动森配方要限制装饰密度");
if (!islandSystem.includes("ac-tag-soft") || !islandSystem.includes("ac-tag-dashed") || !islandSystem.includes("默认 soft")) fail("动森配方要补浅底和虚线标签");
if (!islandSystem.includes("ac-divider-hairline") || !islandSystem.includes("黄浪和薄荷浪全文最多 2 条")) fail("动森配方要补更淡虚线，并守住花线");
if (!islandSystem.includes("ac-card-dash") || !islandSystem.includes("ac-card-soft") || !islandSystem.includes("一篇最多 1 张")) fail("动森配方要补虚线纸和浅色纸上限");
if (!islandSystem.includes("ac-callout-tip") || !islandSystem.includes("ac-callout-warn") || !islandSystem.includes("ac-callout-ok") || !islandSystem.includes("全文最多 2 条")) fail("动森配方要补静态提醒条");
if (islandSystem.includes("<style")) fail("动森配方不能夹带样式表");
if (islandResult.template.params.theme !== "island") fail("指定动森时主题仍是 island");
if (islandResult.document.decor !== "ac-title ac-title-ribbon ac-green") fail("大标题要收成绿色飘带");
const headings = islandResult.document.blocks.filter((block) => block.type === "heading");
if (!headings[0].className.includes("ac-title-layer") || !headings[0].className.includes("ac-yellow")) fail("中标题要收成双层纸，并留下一个强调色");
if (!headings[1].className.includes("ac-title-tab") || !headings[1].className.includes("ac-green")) fail("小节要收成折角便签，多出来的颜色改回绿");
if (!headings[2].className.includes("ac-green")) fail("第二个小节不能再换色");
const tags = islandResult.document.blocks.find((block) => block.type === "paragraph").tags || [];
if (tags.length > 4) fail("标签最多 4 个");
if (tags.some((tag) => tag.text === "不存在")) fail("原文没有的词不能当标签");
if (!tags.some((tag) => tag.text === "海风" && tag.face === "solid")) fail("关键词标签要留下");
if (!tags.some((tag) => tag.text === "慢走" && tag.face === "soft" && tag.color === "brown")) fail("浅底标签要留下");
if (!tags.some((tag) => tag.text === "出门" && tag.face === "dashed" && tag.color === "green")) fail("虚线标签要留下，非四色改回绿");
if (!tags.some((tag) => tag.text === "先看天" && tag.face === "soft" && tag.color === "green")) fail("没写明的标签脸默认浅底，非四色丢掉");
if (tags.some((tag) => tag.text === "坐五分钟")) fail("第 5 个标签要丢掉");
if (tags.some((tag) => !["green", "yellow", "peach", "brown"].includes(tag.color))) fail("标签颜色只能是四种");
if (tags.some((tag) => !["solid", "outline", "soft", "dashed"].includes(tag.face))) fail("标签脸只能是四种");
const dividers = islandResult.document.blocks.filter((block) => block.type === "divider").map((block) => block.className);
if (dividers[0] !== "ac-divider ac-divider-wave" || dividers[1] !== "ac-divider ac-divider-squiggle" || dividers[2] !== "ac-divider ac-divider-dash") fail("虚线不是花线，要留下");
if (dividers[3] !== "ac-divider ac-divider-thin" || dividers[4] !== "ac-divider ac-divider-hairline" || dividers[5] !== "ac-divider ac-divider-thin") fail("花线最多两条，更淡虚线留下，不认识的线改成细线");
const cards = islandResult.document.blocks.filter((block) => block.type === "card" || block.type === "quote");
if (!cards.some((block) => block.type === "quote" && block.className === "ac-card")) fail("引用要收成浅色纸块");
if (!cards.some((block) => block.className === "ac-card ac-card-dash")) fail("虚线纸要留下");
if (!cards.some((block) => block.className === "ac-card ac-card-soft ac-peach")) fail("第一张浅色纸要留下，非四色丢掉");
if (cards.filter((block) => /ac-card-soft/.test(block.className || "")).length !== 1) fail("带色浅卡最多 1 张");
if (!cards.some((block) => block.className === "ac-callout ac-callout-warn")) fail("黄边提醒要留下，非四色丢掉");
if (!cards.some((block) => block.className === "ac-callout ac-callout-tip")) fail("薄荷提醒要留下");
if (cards.filter((block) => /ac-callout/.test(block.className || "")).length !== 2) fail("提醒条最多 2 条");
if (cards.some((block) => /ac-red|ac-purple|ac-blue|ac-pink/.test(block.className || ""))) fail("四色以外的 class 要丢掉");
if (!JSON.stringify(islandResult.document).includes("坐五分钟")) fail("动森重点标签要留下");

const freshSeen = [];
const freshResult = await normalizeWithDeepSeek(source, "test-key", "deepseek-flash", { mode: "fixed", theme: "fresh" }, {
  fetchImpl: fetchReturning(resultBody(), freshSeen),
});
if (freshSeen[0].messages[0].content.includes("ac-title-ribbon")) fail("其它主题不能带上动森标签配方");
if (freshResult.document.decor) fail("其它主题不要留下动森标题标签");
if (freshResult.document.blocks.some((block) => block.className || block.tags)) fail("其它主题不要留下动森标签");

console.log("island theme and changelog checks passed");
