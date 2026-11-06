import fs from "node:fs";
import vm from "node:vm";

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(new URL("../public/block-style.js", import.meta.url), "utf8"), sandbox);
const api = sandbox.YoocoBlockStyle;
if (!api) {
  console.error("block style helper missing");
  process.exit(1);
}

const css = api.blockStyleCss({
  fontSize: 99,
  padding: 12,
  background: "#F4E7D4",
  radius: 8,
  borderWidth: 2,
}, "#111111");
if (css !== "font-size:48px;padding:12px;background-color:#F4E7D4;border-radius:8px;border:2px solid #111111;") {
  console.error("css mismatch", css);
  process.exit(1);
}

if (api.blockStyleCss({ background: "red;background:url(x)" }, "#111111") !== "") {
  console.error("unsafe color was kept");
  process.exit(1);
}

if (api.blockStyleCss({ borderWidth: 0, padding: 0 }, "#111111") !== "padding:0px;border:0;") {
  console.error("zero spacing/border mismatch", api.blockStyleCss({ borderWidth: 0, padding: 0 }, "#111111"));
  process.exit(1);
}

const painted = api.paintBlockStyleHtml(
  '<p style="font-size:16px;color:#333;">正文还在</p>',
  "font-size:22px;background-color:#E5F2C9;",
);
if (painted !== '<p style="font-size:16px;color:#333;font-size:22px;background-color:#E5F2C9;">正文还在</p>') {
  console.error("paint mismatch", painted);
  process.exit(1);
}

const bare = api.paintBlockStyleHtml("<h3>小标题</h3>", "font-size:32px;");
if (bare !== '<h3 style="font-size:32px;">小标题</h3>') {
  console.error("bare paint mismatch", bare);
  process.exit(1);
}

if (api.paintBlockStyleHtml("<p>原文</p>", "") !== "<p>原文</p>") {
  console.error("empty extra changed html");
  process.exit(1);
}

if (api.BLOCK_STYLE_KINDS.heading !== "标题" || api.BLOCK_STYLE_KINDS.card !== "重点" || api.BLOCK_STYLE_KINDS.paragraph !== "段落") {
  console.error("kind labels changed");
  process.exit(1);
}

const colored = api.blockStyleCss({ fontSize: 18, color: "#1040C0" }, "#111111");
if (colored !== "font-size:18px;color:#1040C0;") {
  console.error("font color mismatch", colored);
  process.exit(1);
}

if (api.blockStyleCss({ color: "red" }, "#111111") !== "") {
  console.error("unsafe font color was kept");
  process.exit(1);
}

if (api.blockStyleDeclarations({ color: "#abc" }, "#111111").color !== "#abc") {
  console.error("short hex color dropped");
  process.exit(1);
}

const red = api.parseRunSpec("#C23B3B");
if (!red || red.color !== "#C23B3B" || red.fontSize) {
  console.error("color spec mismatch", red);
  process.exit(1);
}
if (api.formatRunSpec({ color: "#C23B3B", fontSize: 28 }) !== "#C23B3B|28") {
  console.error("format spec mismatch", api.formatRunSpec({ color: "#C23B3B", fontSize: 28 }));
  process.exit(1);
}
if (api.runStyleCss("#C23B3B|28") !== "color:#C23B3B;font-size:28px;") {
  console.error("run css mismatch", api.runStyleCss("#C23B3B|28"));
  process.exit(1);
}
if (api.parseRunSpec("|99") || api.parseRunSpec("red") || api.parseRunSpec("#zzzzzz")) {
  console.error("unsafe run spec kept");
  process.exit(1);
}

function renderRuns(text) {
  return api.expandRunMarkers(text, (spec, inner, css) => (
    `<span class="inline-run" data-run="${spec}" style="${css}">${renderRuns(inner)}</span>`
  ));
}

const partial = renderRuns("你看{{#C23B3B}}一套 AI 团队{{/}}管理系统");
if (partial !== '你看<span class="inline-run" data-run="#C23B3B" style="color:#C23B3B;">一套 AI 团队</span>管理系统') {
  console.error("partial run mismatch", partial);
  process.exit(1);
}
const nested = renderRuns("{{#C23B3B}}一套{{|28}}AI{{/}}团队{{/}}");
if (nested !== '<span class="inline-run" data-run="#C23B3B" style="color:#C23B3B;">一套<span class="inline-run" data-run="|28" style="font-size:28px;">AI</span>团队</span>') {
  console.error("nested run mismatch", nested);
  process.exit(1);
}
const copied = api.copyRunSpans(partial);
if (copied !== '你看<span style="color:#C23B3B;">一套 AI 团队</span>管理系统') {
  console.error("copy run mismatch", copied);
  process.exit(1);
}
const kept = api.stripRunMarkers("前=={{#C23B3B}}一套 AI 团队{{/}}==后");
if (kept !== "前==一套 AI 团队==后") {
  console.error("strip should keep highlight", kept);
  process.exit(1);
}
if (api.stripRunMarkers("没有记号").length !== "没有记号".length) {
  console.error("plain length changed");
  process.exit(1);
}
const snippet = `头{{#C23B3B|18}}中{{/}}尾`;
const cut = api.snapRunCut(snippet, snippet.indexOf("中"));
if (snippet.slice(0, cut) !== "头{{#C23B3B|18}}中{{/}}") {
  console.error("cut landed inside a run", snippet.slice(0, cut));
  process.exit(1);
}
if (api.snapRunCut("普通句子，继续写。", 8) !== 8) {
  console.error("plain cut moved");
  process.exit(1);
}
if (api.expandRunMarkers("签名 {{作者名}} 还在", () => "BAD") !== "签名 {{作者名}} 还在") {
  console.error("author placeholder was treated as a run");
  process.exit(1);
}

console.log("block style checks ok");
