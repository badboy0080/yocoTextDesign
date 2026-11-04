import fs from "node:fs";
import vm from "node:vm";

const root = new URL("..", import.meta.url);
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(new URL("./public/slash-cards.js", root), "utf8"), sandbox);
const api = sandbox.YoocoSlashCards;
if (!api) {
  console.error("slash card helper missing");
  process.exit(1);
}

const ids = api.SLASH_CARDS.map((card) => card.id).join(",");
if (ids !== "quote,highlight,divider,header") {
  console.error("card ids changed", ids);
  process.exit(1);
}

if (api.slashCardMarkdown("quote") !== "> **引用**：把想引用的话写在这里。") {
  console.error("quote snippet mismatch");
  process.exit(1);
}
if (api.slashCardMarkdown("highlight") !== ":::highlight 重点\n把需要强调的话写在这里。\n:::") {
  console.error("highlight snippet mismatch");
  process.exit(1);
}
if (api.slashCardMarkdown("divider") !== "---") {
  console.error("divider snippet mismatch");
  process.exit(1);
}
if (!api.slashCardMarkdown("header").startsWith(":::header\n")) {
  console.error("header snippet mismatch");
  process.exit(1);
}
if (api.slashCardMarkdown("nope") !== "") {
  console.error("unknown card returned markdown");
  process.exit(1);
}

if (api.lineSlashQuery("  /重点") !== "重点" || api.lineSlashQuery("／图") !== "图") {
  console.error("slash query mismatch");
  process.exit(1);
}
if (api.lineSlashQuery("正文 / 不是空行") !== null || api.lineSlashQuery("") !== null) {
  console.error("non-empty line opened slash");
  process.exit(1);
}

const all = api.filterSlashCards("");
if (all.length !== 4) {
  console.error("empty query should list four cards");
  process.exit(1);
}
const highlightOnly = api.filterSlashCards("重");
if (highlightOnly.length !== 1 || highlightOnly[0].id !== "highlight") {
  console.error("filter 重 failed", highlightOnly);
  process.exit(1);
}
if (api.filterSlashCards("没有这种").length !== 0) {
  console.error("unknown filter should be empty");
  process.exit(1);
}

const fenced = "```\n/bin\n```";
if (api.slashQueryAt(fenced, fenced.indexOf("/bin")) !== null) {
  console.error("slash inside code fence was kept");
  process.exit(1);
}
const block = ":::card 重点提示\n/不对\n:::";
if (api.slashQueryAt(block, block.indexOf("/不对")) !== null) {
  console.error("slash inside card fence was kept");
  process.exit(1);
}

const source = "第一段\n\n/引\n\n第二段";
const replaced = api.replaceSlashLine(source, source.indexOf("/引") + 1, "quote");
if (!replaced || replaced.source.includes("/引") || !replaced.source.includes("> **引用**：") || !replaced.source.includes("第一段") || !replaced.source.includes("第二段")) {
  console.error("replace slash line failed", replaced);
  process.exit(1);
}
if (api.replaceSlashLine("不是空行", 0, "divider") !== null) {
  console.error("replace ran on a normal line");
  process.exit(1);
}

const appended = api.appendSlashCard("甲", "divider");
if (!appended || appended.source !== "甲\n\n---") {
  console.error("append failed", appended);
  process.exit(1);
}
if (api.appendSlashCard("", "header").source !== api.slashCardMarkdown("header")) {
  console.error("append on empty source failed");
  process.exit(1);
}

const box = api.readHighlightFence("重点", ["把需要强调的话写在这里。"]);
if (box.type !== "highlightBox" || box.title !== "重点" || !box.text.includes("强调")) {
  console.error("highlight fence mismatch", box);
  process.exit(1);
}
const emptyBox = api.readHighlightFence("", ["  "]);
if (emptyBox.type !== "highlightBox" || emptyBox.title !== "重点" || emptyBox.text !== "") {
  console.error("empty highlight fence mismatch", emptyBox);
  process.exit(1);
}
const header = api.readHeaderFence("", ["在这里写标题", "副题可以留空"]);
if (header.type !== "header" || header.title !== "在这里写标题" || header.sub !== "副题可以留空") {
  console.error("header fence mismatch", header);
  process.exit(1);
}
const titled = api.readHeaderFence("封面", ["副题"]);
if (titled.title !== "封面" || titled.sub !== "副题") {
  console.error("header fence title mismatch", titled);
  process.exit(1);
}
if (api.cardDomType("highlight") !== "highlightBox" || api.cardDomType("header") !== "header") {
  console.error("dom type mismatch");
  process.exit(1);
}

const app = fs.readFileSync(new URL("./public/app.js", root), "utf8");
const html = fs.readFileSync(new URL("./public/studio.html", root), "utf8");
const css = fs.readFileSync(new URL("./public/styles.css", root), "utf8");
[
  "readHighlightFence",
  "readHeaderFence",
  "highlightBox",
  "data-slash-slot",
  "slashCardMenu",
  'item.type === "header"',
  ":::highlight",
].forEach((needle) => {
  if (!app.includes(needle)) {
    console.error("app missing", needle);
    process.exit(1);
  }
});
if (!html.includes("slash-cards.js")) {
  console.error("studio does not load slash-cards.js");
  process.exit(1);
}
["highlight-box", "article-masthead", "slash-slot"].forEach((needle) => {
  if (!css.includes(needle)) {
    console.error("css missing", needle);
    process.exit(1);
  }
});

console.log("slash card checks ok");
