import { normalizeWithDeepSeek } from "../lib/deepseek-normalizer.js";
import { humanizeSystemPrompt } from "../lib/tool-prompts.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const THEME_IDS = ["fresh", "mono", "serene", "stub", "editorial", "nocturne", "classic", "citrus", "playful", "grunge", "flat", "newsprint", "bauhaus", "emoji"];
const THEME_LINE = `所有主题都要标 highlight：${THEME_IDS.join("、")}。`;

const LONG = "先帝创业未半而中道崩殂，今天下三分，益州疲弊，此诚危急存亡之秋也。然侍卫之臣不懈于内，忠志之士忘身于外者，盖追先帝之殊遇，欲报之于陛下也。诚宜开张圣听，以光先帝遗德，恢弘志士之气，不宜妄自菲薄，引喻失义，以塞忠谏之路也。";
const SHORT = "宫中府中，俱为一体。";
const QUOTE = "==开张圣听==，以光先帝遗德。";
const CARD = "试用每天 3 积分，用完要等第二天再继续排版。";
const KEPT = "诚宜开张圣听，以光先帝遗德，恢弘志士之气。";
const MUST = "这里必须先改标题，其它句子先放一放。";

const modelBlocks = [
  { type: "heading", level: 2, text: "出师表" },
  {
    type: "paragraph",
    text: LONG,
    marks: [
      { text: "益州疲弊", type: "bold" },
      { text: "这是编造的重点", type: "highlight" },
    ],
  },
  { type: "paragraph", text: SHORT, marks: [{ text: "宫中府中", type: "bold" }] },
  { type: "quote", title: "先帝", text: QUOTE, marks: [] },
  { type: "card", title: "试用", text: CARD, marks: [{ text: "试用", type: "bold" }] },
  { type: "paragraph", text: KEPT, marks: [{ text: "开张圣听", type: "highlight" }] },
  { type: "paragraph", text: MUST, marks: [{ text: "必须先改标题", type: "bold" }] },
  { type: "list", items: ["先看 ==开张圣听==", "再改标题"], ordered: false },
];

function resultBody(blocks) {
  return {
    version: 2,
    template: { type: "universal", name: "出师表", params: { theme: "fresh", articleType: "opinion" } },
    document: { title: "出师表", blocks },
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

function countable(text) {
  return (String(text || "").match(/[\u4e00-\u9fffA-Za-z0-9]/g) || []).length;
}

function highlights(block) {
  return (block.marks || []).filter((mark) => mark.type === "highlight");
}

function oldValidHighlights(blocks) {
  return blocks.reduce((count, block) => {
    if (!["paragraph", "quote", "card"].includes(block.type)) return count;
    return count + (block.marks || []).filter((mark) => mark.type === "highlight" && String(block.text || "").includes(mark.text)).length;
  }, 0);
}

const seenPrompts = [];
for (const theme of THEME_IDS) {
  const assignment = theme === "classic"
    ? { mode: "fixed", theme, mood: "minimal", skin: "ink-cream" }
    : { mode: "fixed", theme };
  await normalizeWithDeepSeek("出师表", "test-key", "deepseek-flash", assignment, {
    fetchImpl: fetchReturning(resultBody([{ type: "paragraph", text: "短。" }]), seenPrompts),
  });
}
await normalizeWithDeepSeek("出师表", "test-key", "deepseek-flash", { mode: "choose" }, {
  fetchImpl: fetchReturning(resultBody([{ type: "paragraph", text: "短。" }]), seenPrompts),
});

for (const request of seenPrompts) {
  const system = request.messages[0].content;
  const user = request.messages[1].content;
  assert(system.includes(THEME_LINE), "系统提示要写明每一套主题都标 highlight");
  assert(system.includes("这次输出就是失败"), "系统提示要写看不见重点就是失败");
  assert(system.includes("不足 12 字"), "系统提示要写明 12 字豁免");
  assert(system.includes("80 字及以上"), "系统提示要写明长段 1 至 2 处");
  assert(system.includes("禁止只给 bold"), "系统提示要禁止只加粗、不标重点");
  assert(system.includes("==重点=="), "系统提示要保留原文里的重点记号");
  assert(!system.includes("主题若是 citrus、playful、grunge、flat、newsprint、bauhaus，highlight 是硬性要求"), "不能再只强迫六套主题标重点");
  assert(user.includes("看不见 highlight，这次输出就是失败"), "发给模型的用户消息也要带验收标准");
}

const freshRequest = seenPrompts.find((request) => request.messages[1].content.includes("本次主题已指定为 fresh"));
assert(freshRequest, "fresh 也要走指定主题");
assert(freshRequest.messages[1].content.includes("配方没写 highlight 也要标"), "清氧绿这类旧主题不能再靠配方省略重点");

const seen = [];
const normalized = await normalizeWithDeepSeek(`${LONG}\n\n${SHORT}\n\n${QUOTE}`, "test-key", "deepseek-flash", {
  mode: "fixed",
  theme: "fresh",
}, {
  fetchImpl: fetchReturning(resultBody(modelBlocks), seen),
});

const blocks = normalized.document.blocks;
const longBlock = blocks.find((block) => block.text === LONG);
const shortBlock = blocks.find((block) => block.text === SHORT);
const quoteBlock = blocks.find((block) => block.type === "quote");
const cardBlock = blocks.find((block) => block.type === "card");
const keptBlock = blocks.find((block) => block.text === KEPT);
const mustBlock = blocks.find((block) => block.text === MUST);
const listBlock = blocks.find((block) => block.type === "list");

assert(longBlock, "长段要留下来");
assert(highlights(longBlock).length === 2, `长段要有 2 处重点，实际 ${highlights(longBlock).length}`);
assert(highlights(longBlock).some((mark) => mark.text === "不宜妄自菲薄"), "长段要标到不宜妄自菲薄");
assert(highlights(longBlock).some((mark) => mark.text === "先帝创业未半而中道崩殂"), "长段要再标一处开头短句");
for (const mark of highlights(longBlock)) {
  assert(longBlock.text.includes(mark.text), "重点必须是原文里的连续片段");
  assert(mark.text !== longBlock.text, "不能整段刷黄");
  assert(countable(mark.text) >= 4 && countable(mark.text) <= 16, `重点长短不合适：${mark.text}`);
}
assert((longBlock.marks || []).some((mark) => mark.type === "bold" && mark.text === "益州疲弊"), "不重叠的加粗要留下");
assert(!(longBlock.marks || []).some((mark) => mark.text === "这是编造的重点"), "对不上原文的重点要丢掉");

assert(shortBlock && highlights(shortBlock).length === 0, "不足 12 字的短句不要硬补重点");
assert((shortBlock.marks || []).some((mark) => mark.type === "bold" && mark.text === "宫中府中"), "短句里的加粗还在");

assert(quoteBlock && !quoteBlock.text.includes("=="), "引语里的等号要换成重点标记，避免套两层");
assert(quoteBlock.text.includes("开张圣听"), "引语原文要留着");
assert(highlights(quoteBlock).length === 1 && highlights(quoteBlock)[0].text === "开张圣听", "原文 ==重点== 必须映射成 highlight");

assert(cardBlock && highlights(cardBlock).length === 1, "普通长度的卡片至少 1 处重点");
assert(highlights(cardBlock)[0].text === "试用每天 3 积分", "卡片要优先标带数字的短句");
assert(cardBlock.text.includes(highlights(cardBlock)[0].text), "卡片重点必须在原文里");

assert(keptBlock && highlights(keptBlock).length === 1 && highlights(keptBlock)[0].text === "开张圣听", "模型已经标对的重点不要再加到两处以上");

assert(mustBlock && highlights(mustBlock).some((mark) => mark.text.includes("必须")), "只有加粗时也要补出重点");
assert(!(mustBlock.marks || []).some((mark) => mark.type === "bold" && mark.text === "必须先改标题"), "和重点重叠的加粗要让位");

assert(listBlock.items[0] === "先看 ==开张圣听==", "列表里的重点记号不要改掉");

const before = oldValidHighlights(modelBlocks);
const after = blocks.reduce((count, block) => count + highlights(block).length, 0);
assert(after > before, "整理后的重点要多于模型原本交出来的有效重点");

const wallSeen = [];
const wall = await normalizeWithDeepSeek(LONG, "test-key", "deepseek-flash", { mode: "fixed", theme: "mono" }, {
  fetchImpl: fetchReturning(resultBody([{
    type: "paragraph",
    text: LONG,
    marks: [{ text: LONG, type: "highlight" }],
  }]), wallSeen),
});
const wallBlock = wall.document.blocks[0];
assert(!highlights(wallBlock).some((mark) => mark.text === LONG), "整段重点不能留下来");
assert(highlights(wallBlock).length === 2, "整段重点丢掉后仍要补上两处短重点");

const humanize = humanizeSystemPrompt();
assert(humanize.includes("==重点=="), "人味改写要明确保住 ==重点==");
assert(humanize.includes("等号也不要拿掉"), "人味改写不能把重点等号剥掉");

console.log(JSON.stringify({
  sample: "出师表短节 + 试用句",
  beforeValidHighlights: before,
  afterHighlights: after,
  long: highlights(longBlock).map((mark) => mark.text),
  quote: highlights(quoteBlock).map((mark) => mark.text),
  card: highlights(cardBlock).map((mark) => mark.text),
  short: highlights(shortBlock).length,
  kept: highlights(keptBlock).map((mark) => mark.text),
  note: "没有 DEEPSEEK_API_KEY。模型返回用本地假 JSON：长段只有加粗和一条对不上的重点。",
}, null, 2));
console.log("highlight mark checks ok");
