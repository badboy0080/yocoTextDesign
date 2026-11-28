import { readFileSync } from "node:fs";

function fail(message) {
  console.error(message);
  process.exit(1);
}

const app = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../public/studio-ui.css", import.meta.url), "utf8");
const html = readFileSync(new URL("../public/studio.html", import.meta.url), "utf8");
const changelog = readFileSync(new URL("../lib/changelog.ts", import.meta.url), "utf8");

const phrases = [
  "加载文字中...",
  "正在查看精彩段落....",
  "正在标注重点文字...",
];
const start = app.indexOf("const NORMALIZE_LOADING_PHRASES = [");
const end = app.indexOf("];", start);
if (start < 0 || end < 0) fail("缺等待文案");
const block = app.slice(start, end);
const quoted = [...block.matchAll(/"([^"]*)"/g)].map((match) => match[1]);
if (quoted.length !== phrases.length || quoted.some((item, index) => item !== phrases[index])) {
  fail(`等待文案要按顺序一字不差，现在是：${quoted.join(" / ")}`);
}

function num(name) {
  const match = app.match(new RegExp(`const ${name} = (\\d+)`));
  if (!match) fail(`缺 ${name}`);
  return Number(match[1]);
}

const chars = num("RAIN_BATCH_CHARS");
const gap = num("RAIN_BATCH_GAP_MS");
const stagger = num("RAIN_CHAR_STAGGER_MS");
const fly = num("RAIN_FLY_MS");
if (chars !== 100 || gap !== 1000) fail("一批 100 字，下一批隔 1 秒");
if (stagger <= 0 || fly <= 0) fail("错开和飞行时长要是正数");

function rainDelay(index) {
  const batch = Math.floor(index / chars);
  const slot = index - batch * chars;
  return batch * gap + slot * stagger;
}

const fnStart = app.indexOf("function rainDelayMs");
const fnEnd = app.indexOf("function sprayOrigin");
const fn = app.slice(fnStart, fnEnd);
if (!fn.includes("charIndex / RAIN_BATCH_CHARS") || !fn.includes("RAIN_BATCH_GAP_MS")) fail("延迟要按批次和 1 秒间隔算");
if (/Math\.min/.test(fn)) fail("不要给总时长加上限");

if (app.includes("function rainVector") || app.includes("cursor % 8")) fail("不要再从四周飞入");
const sprayStart = app.indexOf("function sprayOrigin");
const sprayEnd = app.indexOf("function rainScroller");
const spray = app.slice(sprayStart, sprayEnd);
if (!spray.includes("clientWidth") || !spray.includes("scrollTop") || !spray.includes("height - 28")) {
  fail("喷发点要是结果区下方的同一个点");
}
if ((spray.match(/return/g) || []).length !== 1) fail("喷发点只能有一个");
if (!app.includes('el.style.setProperty("--rain-x"') || !app.includes('el.style.setProperty("--rain-y"')) {
  fail("每个字都要从喷发点算偏移");
}
if (!app.includes("origin.x - point.x") || !app.includes("origin.y - point.y")) fail("偏移要指向那一个喷发点");
const followStart = app.indexOf("function followNormalizeStack");
const followEnd = app.indexOf("function clearRainPaint");
const follow = app.slice(followStart, followEnd);
if (!follow.includes("scroller.scrollTop = next")) fail("堆砌到哪里，结果区就要滚到哪里");
if (!follow.includes("releaseRainFollow()")) fail("堆完要把滚动交给用户");
if (follow.includes("preventDefault")) fail("不要拦住用户自己滚动");
if (!app.includes('addEventListener("wheel", onWheel')) fail("用户滚轮滚动后不要再自动跟随");
if (!app.includes("function releaseRainFollow")) fail("用户拖了滚动条要停掉自动跟随");
const bindStart = app.indexOf("function bindRainScroll");
const bindEnd = app.indexOf("function followNormalizeStack");
const bind = app.slice(bindStart, bindEnd);
if (!bind.includes("releaseRainFollow()")) fail("滚动条被拖动时要停掉跟随");
if (!bind.includes('addEventListener("pointerdown"')) fail("拖滚动条要能被认出来");
const settleFn = app.slice(app.indexOf("function settleNormalizeRain"), app.indexOf("function armNormalizeRain"));
if (!settleFn.includes("stopRainMotion()")) fail("入场结束或被打断时要交回滚动");
const arm = app.slice(app.indexOf("function armNormalizeRain"), app.indexOf("async function normalizeWithDeepSeek"));
const reduceAt = arm.indexOf("if (prefersReducedMotion()) return");
const rainAt = arm.indexOf('classList.add("is-raining"');
if (reduceAt < 0 || rainAt < 0 || reduceAt > rainAt) fail("减少动效时不要喷出，也不要逐字弹");
if (!arm.includes("is-rain-measuring")) fail("量落点时不要先把字挪走");
if (!arm.includes("RAIN_DECOR_SELECTOR") || !app.includes("dataset.rainIndex")) fail("图案要跟所在批次一起入场");
if (!app.includes("tagRain(node, charIndex")) fail("图案要使用身边文字的批次序号");

const batchEnd = rainDelay(99) + fly;
if (batchEnd < 1000 || batchEnd > 2000) fail(`一批要在 1 到 2 秒堆完，现在是 ${batchEnd}ms`);
const tail = rainDelay(19) + fly;
if (!(tail < batchEnd)) fail("不足 100 字的尾批要按实际字数更早结束");
const thousand = rainDelay(999) + fly;
const twoThousand = rainDelay(1999) + fly;
if (thousand < 9000 || thousand > 12000) fail(`1000 字大约 10 秒，现在是 ${thousand}ms`);
if (twoThousand < 18000 || twoThousand > 23000) fail(`2000 字大约 20 秒，现在是 ${twoThousand}ms`);
if (rainDelay(100) !== 1000) fail("下一批要在上一批开始 1 秒后入场");
if (rainDelay(200) - rainDelay(100) !== 1000) fail("批次开始时间要一直隔 1 秒");

if (!app.includes('matchMedia("(prefers-reduced-motion: reduce)")')) fail("减少动效时要改走静默");
if (!app.includes("function settleNormalizeRain")) fail("要能停掉入场");
if (!app.includes("if (index !== 0) settleNormalizeRain()")) fail("切到原文要停动画");
if (!app.includes("rainAfter = false")) fail("失败不能接着播入场");
if (!app.includes("if (rainAfter) armNormalizeRain()")) fail("只有成功才入场");
if (!css.includes("html[data-site] .preview-stage.is-normalizing:not(.is-phone-preview)") || !css.includes("background: #ffffff")) {
  fail("等待时纸面要是白的");
}
if (!css.includes("@keyframes yooco-load-char-in") || !css.includes("@keyframes yooco-load-shine")) fail("等待文案要有弹入和高亮扫过");
if (!css.includes("@keyframes yooco-rain")) fail("入场动画要写在样式里");
if (!css.includes("translate: var(--rain-x")) fail("入场用 translate，免得打掉装饰的 transform");
if (!css.includes("var(--rain-y, 72px)")) fail("没量到喷发点时也要从下方来");
if (css.includes("var(--rain-y, -160px)")) fail("不要再默认从上方掉下来");
if (!css.includes("from { opacity: 0;") || !css.includes("to { opacity: 1;")) fail("入场透明度要从 0 到 1");
if (!css.includes("is-rain-measuring")) fail("测量落点时要先关掉位移动画");
if (!css.includes("prefers-reduced-motion: reduce")) fail("样式里也要照顾减少动效");
if (!html.includes('id="normalizeLoading"')) fail("页面要有等待层");

const errors = [
  "网络异常，请再试一次！",
  "您的文章可能过长了，缩短一点再试一次吧！",
  "网站处理业务过多，请再试一次！",
];
for (const sentence of errors) {
  if (!app.includes(JSON.stringify(sentence))) fail(`失败提示被改了：${sentence}`);
}
if (!changelog.includes("优化排版时，纸面先显示等待提示；排好后，文字和图案从下方一点喷出，再落到文中的位置。本次尚未上线。")) {
  fail("日志要写这次从下方喷出，并标明尚未上线");
}
if (changelog.includes("从四周落入")) fail("日志不要再写四周落入");
if (!changelog.includes("新增「动森」文章主题与更新日志。本次尚未上线。")) fail("11 月 23 日那句不能改");
if (!changelog.includes("优化排版失败时，会提示「网络异常，请再试一次！」「您的文章可能过长了，缩短一点再试一次吧！」或「网站处理业务过多，请再试一次！」。本次尚未上线。")) {
  fail("11 月 26 日那句不能改");
}

const motionSlice = app.slice(start, app.indexOf("async function normalizeWithDeepSeek"));
if (/from ["']react["']|motion\/react|tailwind/.test(motionSlice)) fail("不要把 React 组件引进工作台");

console.log("normalize motion checks ok");
