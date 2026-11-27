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
const fnEnd = app.indexOf("function rainVector");
const fn = app.slice(fnStart, fnEnd);
if (!fn.includes("charIndex / RAIN_BATCH_CHARS") || !fn.includes("RAIN_BATCH_GAP_MS")) fail("延迟要按批次和 1 秒间隔算");
if (/Math\.min/.test(fn)) fail("不要给总时长加上限");

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
if (!changelog.includes("优化排版时，纸面先显示等待提示；排好后，文字和图案从四周落入位置。本次尚未上线。")) {
  fail("日志要写这次等待和入场，并标明尚未上线");
}
if (!changelog.includes("新增「动森」文章主题与更新日志。本次尚未上线。")) fail("11 月 23 日那句不能改");
if (!changelog.includes("优化排版失败时，会提示「网络异常，请再试一次！」「您的文章可能过长了，缩短一点再试一次吧！」或「网站处理业务过多，请再试一次！」。本次尚未上线。")) {
  fail("11 月 26 日那句不能改");
}

const motionSlice = app.slice(start, app.indexOf("async function normalizeWithDeepSeek"));
if (/from ["']react["']|motion\/react|tailwind/.test(motionSlice)) fail("不要把 React 组件引进工作台");

console.log("normalize motion checks ok");
