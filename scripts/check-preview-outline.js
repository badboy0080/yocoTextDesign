import fs from "node:fs";
import vm from "node:vm";

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(new URL("../public/preview-outline.js", import.meta.url), "utf8"), sandbox);
const api = sandbox.YoocoPreviewOutline;
if (!api) {
  console.error("preview outline helper missing");
  process.exit(1);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (api.normalizeOutlineText("  夜市 \n  摊位  ") !== "夜市 摊位") fail("text was not flattened");
if (api.clampOutlineLevel(0) !== 1 || api.clampOutlineLevel(9) !== 6 || api.clampOutlineLevel(3) !== 3) {
  fail("level clamp mismatch");
}

const duplicates = api.outlineItemsFromRecords([
  { key: "a", level: 1, text: "城南夜市" },
  { key: "b", level: 2, text: "先看摊位" },
  { key: "c", level: 3, text: "重复的小标题" },
  { key: "d", level: 3, text: "重复的小标题" },
  { key: "c", level: 3, text: "重复的小标题" },
  { key: "e", level: 4, text: "   " },
]);
if (duplicates.length !== 4) fail(`duplicate headings were merged or kept stale: ${duplicates.length}`);
if (duplicates[2].text !== "重复的小标题" || duplicates[3].text !== "重复的小标题") fail("same title was dropped");
if (duplicates[2].key === duplicates[3].key) fail("two visible headings share one key");
if (duplicates[0].indent !== 0 || duplicates[1].indent !== 12 || duplicates[2].indent !== 24) {
  fail(`indent mismatch ${duplicates.map((item) => item.indent).join(",")}`);
}

const removed = api.outlineItemsFromRecords(duplicates.filter((item) => item.key !== "b").map((item) => ({
  key: item.key, level: item.level, text: item.key === "a" ? "城北夜市" : item.text,
})));
if (removed.some((item) => item.text === "先看摊位")) fail("deleted heading stayed in the next list");
if (!removed.some((item) => item.text === "城北夜市")) fail("renamed heading did not replace the old one");
if (removed.filter((item) => item.text === "重复的小标题").length !== 2) fail("rename rebuilt the wrong rows");

if (api.outlineMode(true, 3) !== "empty") fail("empty draft still listed headings");
if (api.outlineMode(false, 0) !== "none") fail("article without headings had no empty state");
if (api.outlineMode(false, 2) !== "list") fail("headings did not make a list");
if (api.STATUS.empty !== "这篇还是空的" || api.STATUS.none !== "这篇没有标题") fail("status copy changed");

if (api.activeOutlineIndex([120, 480, 960], 500) !== 1) fail("current section was not the one above the line");
if (api.activeOutlineIndex([120, 480, 960], 980) !== 2) fail("later section did not become current");
if (api.activeOutlineIndex([400, 800], 20) !== 0) fail("top of the article lost the first heading");
if (api.activeOutlineIndex([80, 200], 96, true) !== 1) fail("bottom of the preview did not keep the last heading");
if (api.activeOutlineIndex([], 20) !== -1) fail("empty list still picked a section");

const html = fs.readFileSync(new URL("../public/studio.html", import.meta.url), "utf8");
const outlineAt = html.indexOf('id="previewOutline"');
const pageAt = html.indexOf('id="articlePage"');
const frameEnd = html.indexOf('id="previewFrame"');
if (outlineAt < 0 || pageAt < 0 || frameEnd < 0 || outlineAt > pageAt) fail("outline is not beside the preview");
if (html.slice(html.indexOf('id="articlePage"'), html.indexOf("</article>")).includes("preview-outline")) {
  fail("outline markup was placed inside the article");
}
if (!html.includes("preview-outline.js")) fail("outline script is not loaded");

const app = fs.readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const copyStart = app.indexOf("function buildCopyHtml()");
const copyEnd = app.indexOf("function darkCopyHint()");
const copyFn = app.slice(copyStart, copyEnd);
if (copyFn.includes("preview-outline") || copyFn.includes("previewOutline") || copyFn.includes("大纲")) {
  fail("copy html learned about the outline");
}
const plainStart = app.indexOf("function buildCopyPlain(");
const plainFn = app.slice(plainStart, app.indexOf("function copyHtmlWithExecCommand"));
if (plainFn.includes("preview-outline") || plainFn.includes("大纲")) fail("plain copy learned about the outline");

const css = fs.readFileSync(new URL("../public/studio-ui.css", import.meta.url), "utf8");
if (!css.includes(".preview-outline.is-collapsed") || !css.includes("max-width:823px") && !css.includes("max-width: 823px")) {
  fail("collapsed or narrow outline style missing");
}
const narrowAt = css.indexOf("@media(max-width:823px)");
const narrowBlock = css.slice(narrowAt, css.indexOf("@media", narrowAt + 10));
if (!narrowBlock.includes(".preview-outline") || !narrowBlock.includes("position:absolute")) {
  fail("narrow outline still takes a column");
}

console.log("preview outline checks ok");
