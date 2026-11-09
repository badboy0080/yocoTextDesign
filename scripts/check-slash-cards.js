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
if (ids !== "quote,highlight,divider,header,media,points,reveal,swap,expand") {
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
if (api.slashCardMarkdown("media") !== ":::media\n![]()\n:::") {
  console.error("media snippet mismatch");
  process.exit(1);
}
if (api.slashCardMarkdown("points") !== ":::points\n---\n---\n:::") {
  console.error("points snippet mismatch");
  process.exit(1);
}
["reveal", "swap", "expand"].forEach((id) => {
  const snippet = api.slashCardMarkdown(id);
  if (!snippet.startsWith(`:::interact ${id}\n`) || !snippet.includes("still:") || !snippet.endsWith("\n:::")) {
    console.error("interact snippet mismatch", id, snippet);
    process.exit(1);
  }
});
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
if (all.length !== 9) {
  console.error("empty query should list nine cards");
  process.exit(1);
}
const grids = api.filterSlashCards("栅格");
if (grids.length !== 2 || grids.map((card) => card.id).join(",") !== "media,points") {
  console.error("filter 栅格 failed", grids);
  process.exit(1);
}
if (grids.some((card) => card.group !== "图文栅格")) {
  console.error("grid group missing");
  process.exit(1);
}
const interacts = api.filterSlashCards("互动");
if (interacts.length !== 3 || interacts.map((card) => card.id).join(",") !== "reveal,swap,expand") {
  console.error("filter 互动 failed", interacts);
  process.exit(1);
}
if (interacts.some((card) => card.group !== "互动展示")) {
  console.error("interact group missing");
  process.exit(1);
}
if (api.filterSlashCards("揭晓").map((card) => card.id).join(",") !== "reveal") {
  console.error("filter 揭晓 failed");
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
if (api.cardDomType("media") !== "mediaGrid" || api.cardDomType("points") !== "pointGrid") {
  console.error("grid dom type mismatch");
  process.exit(1);
}
if (["reveal", "swap", "expand"].some((id) => api.cardDomType(id) !== "interact")) {
  console.error("interact dom type mismatch");
  process.exit(1);
}

const media = api.readMediaFence("", ["![小市摊位]()", "小市不是超市的缩小版。"]);
if (media.type !== "mediaGrid" || media.alt !== "小市摊位" || media.url !== "" || !media.text.includes("超市")) {
  console.error("media fence mismatch", media);
  process.exit(1);
}
const emptyMedia = api.readMediaFence("", ["![]()"]);
if (emptyMedia.alt || emptyMedia.url || emptyMedia.text) {
  console.error("empty media fence mismatch", emptyMedia);
  process.exit(1);
}
if (api.mediaMarkdown({ alt: "小市摊位", url: "", text: "说明" }) !== ":::media\n![小市摊位]()\n说明\n:::") {
  console.error("media markdown mismatch");
  process.exit(1);
}
const roundMedia = api.readMediaFence("", api.mediaMarkdown({ alt: "配图", url: "", text: "一句说明" }).split("\n").slice(1, -1));
if (roundMedia.alt !== "配图" || roundMedia.text !== "一句说明") {
  console.error("media roundtrip mismatch", roundMedia);
  process.exit(1);
}

const points = api.readPointsFence("", [
  "先列清单",
  "出门前先写好要买的三类",
  "---",
  "货比三家",
  "走两摊再决定",
  "---",
  "当天用完",
  "按一到两顿买",
]);
if (points.type !== "pointGrid" || points.items.length !== 3 || points.items[0].title !== "先列清单" || points.items[1].text !== "走两摊再决定" || points.items[2].title !== "当天用完") {
  console.error("points fence mismatch", points);
  process.exit(1);
}
const emptyPoints = api.readPointsFence("", ["---", "---"]);
if (emptyPoints.items.length !== 3 || emptyPoints.items.some((item) => item.title || item.text)) {
  console.error("empty points fence mismatch", emptyPoints);
  process.exit(1);
}
const pointsMarkdown = api.pointsMarkdown([
  { title: "先列清单", text: "出门前先写好" },
  { title: "货比三家", text: "走两摊" },
  { title: "当天用完", text: "一到两顿" },
]);
if (!pointsMarkdown.startsWith(":::points\n") || pointsMarkdown.split("\n---\n").length !== 3) {
  console.error("points markdown mismatch", pointsMarkdown);
  process.exit(1);
}

function fenceBody(markdown) {
  return markdown.split("\n").slice(1, -1);
}

["reveal", "swap", "expand"].forEach((kind) => {
  const markdown = api.slashCardMarkdown(kind);
  const item = api.readInteractFence(kind, fenceBody(markdown));
  const again = api.interactMarkdown(item);
  const round = api.readInteractFence(kind, fenceBody(again));
  if (item.type !== "interact" || item.kind !== kind || !item.still || !item.cue) {
    console.error("interact fence mismatch", item);
    process.exit(1);
  }
  if (round.kind !== item.kind || round.still !== item.still || round.cue !== item.cue) {
    console.error("interact roundtrip mismatch", kind, round);
    process.exit(1);
  }
});

const reveal = api.readInteractFence("reveal", fenceBody(api.slashCardMarkdown("reveal")));
if (!reveal.answer.includes("标题") || !reveal.still.includes("标题")) {
  console.error("reveal still missing", reveal);
  process.exit(1);
}
const swapped = api.readInteractFence("swap", ["a: ![线稿](https://example.com/a.png)", "b: 乙版说明", "still: 甲和乙都写在这里。"]);
if (swapped.a !== "线稿" || swapped.aUrl !== "https://example.com/a.png" || !swapped.still.includes("甲和乙")) {
  console.error("swap image fence mismatch", swapped);
  process.exit(1);
}
const blockedUrl = api.readInteractFence("swap", ["aUrl: javascript:alert(1)", "a: 甲", "b: 乙", "still: 甲和乙"]);
if (blockedUrl.aUrl) {
  console.error("unsafe interact url kept", blockedUrl);
  process.exit(1);
}
const unknown = api.readInteractFence("lottery", ["still: 还在。"]);
if (unknown.kind !== "reveal" || unknown.still !== "还在。") {
  console.error("unknown interact kind leaked", unknown);
  process.exit(1);
}
const emptyStill = api.readInteractFence("expand", ["body: 展开后的三句话。"]);
if (!emptyStill.still.includes("展开后")) {
  console.error("missing still was not filled", emptyStill);
  process.exit(1);
}

const palette = { paper: "#fffef9", ink: "#272b28", accent: "#1f6b4a", onAccent: "#fffef9", muted: "#69736b", border: "#d5ddd6" };
const evil = api.buildInteractSvg(reveal, { ...palette, accent: "#ff0000\"><script>alert(1)</script>" }, "ya1");
if (/<script/i.test(evil) || evil.includes("onclick") || !evil.includes("#1f6b4a")) {
  console.error("interact svg accepted unsafe color", evil);
  process.exit(1);
}
const revealSvg = api.buildInteractSvg(reveal, palette, "ya1");
const swapSvg = api.buildInteractSvg(swapped, palette, "yb2");
const expandSvg = api.buildInteractSvg(emptyStill, palette, "yc3");
[revealSvg, swapSvg, expandSvg].forEach((svg) => {
  if (!svg.includes("<set ") || !/id="y[abc]/.test(svg) || /<script/i.test(svg) || svg.includes("梦飞") || svg.includes("蜡笔")) {
    console.error("interact svg missing set or id", svg.slice(0, 180));
    process.exit(1);
  }
});
if (!revealSvg.includes("<animate ") || !expandSvg.includes("<animate ") || !expandSvg.includes('height="72"') || !expandSvg.includes('from="72"')) {
  console.error("reveal or expand animation mismatch");
  process.exit(1);
}
if (!swapSvg.includes('visibility="hidden"') || !swapSvg.includes("https://example.com/a.png") || !swapSvg.includes("<image ")) {
  console.error("swap svg mismatch");
  process.exit(1);
}
if (revealSvg.includes("<image ") || expandSvg.includes("<image ")) {
  console.error("text interact should not embed an image");
  process.exit(1);
}
const copyOne = api.interactCopyHtml(reveal, palette, api.interactPrefix("1"));
const copyTwo = api.interactCopyHtml(reveal, palette, api.interactPrefix("2"));
const idsOf = (html) => [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const overlap = idsOf(copyOne).filter((id) => idsOf(copyTwo).includes(id));
if (!idsOf(copyOne).length || overlap.length || !copyOne.includes("<set ") || !copyOne.includes("<animate ") || !copyOne.includes(reveal.still)) {
  console.error("copy html id collision or missing still", overlap);
  process.exit(1);
}
if (!copyOne.includes('data-yooco-interact="reveal"') || /<script/i.test(copyOne)) {
  console.error("copy html shape mismatch");
  process.exit(1);
}

const packed = api.extractInteractFences(`甲\n\n${api.slashCardMarkdown("reveal")}\n\n乙`);
if (packed.source.includes(":::interact") || !packed.source.includes("甲") || !packed.source.includes("乙") || packed.fences.length !== 1) {
  console.error("extract interact failed", packed);
  process.exit(1);
}
const restored = api.restoreInteractFences("甲优化\n\n乙优化", packed.fences, packed.length);
if (!restored.includes(":::interact reveal") || !restored.includes("揭开以后") || !restored.includes("甲优化") || !restored.includes("乙优化")) {
  console.error("restore interact failed", restored);
  process.exit(1);
}
const coded = "```\n:::interact reveal\ncue: 不该抽走\nstill: 留在代码里\n:::\n```\n\n正文";
const codedPack = api.extractInteractFences(coded);
if (codedPack.fences.length !== 0 || !codedPack.source.includes(":::interact")) {
  console.error("code fence interact was extracted", codedPack);
  process.exit(1);
}
const only = api.extractInteractFences(api.slashCardMarkdown("swap"));
if (only.source || only.fences.length !== 1) {
  console.error("only-interact extract failed", only);
  process.exit(1);
}

const app = fs.readFileSync(new URL("./public/app.js", root), "utf8");
const html = fs.readFileSync(new URL("./public/studio.html", root), "utf8");
const css = fs.readFileSync(new URL("./public/styles.css", root), "utf8");
[
  "readHighlightFence",
  "readHeaderFence",
  "readMediaFence",
  "readPointsFence",
  "highlightBox",
  "mediaGrid",
  "pointGrid",
  "data-slash-slot",
  "data-media-action",
  "slashCardMenu",
  "card.group",
  'item.type === "header"',
  'fenceKind === "media"',
  'fenceKind === "points"',
  ":::highlight",
  "readInteractFence",
  'fenceKind === "interact"',
  "data-yooco-interact",
  "interactCopyHtml",
  "extractInteractFences",
  'item.type === "interact"',
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
const liftAt = app.indexOf('querySelectorAll("[data-yooco-interact]")');
const stripAt = app.indexOf('querySelectorAll("script,style,link,meta,iframe,object,embed,form,input,button,textarea,select,svg,canvas,video,audio")');
if (liftAt < 0 || stripAt < 0 || liftAt > stripAt) {
  console.error("interact paste must be lifted before svg is stripped");
  process.exit(1);
}
["highlight-box", "article-masthead", "slash-slot", "smart-grid", "smart-grid-empty", "smart-grid-point", "interact-block", "interact-still"].forEach((needle) => {
  if (!css.includes(needle)) {
    console.error("css missing", needle);
    process.exit(1);
  }
});

console.log("slash card checks ok");
