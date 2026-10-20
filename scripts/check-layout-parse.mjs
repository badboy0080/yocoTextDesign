import { findSourceSlice, normalizeLayoutResult } from "../lib/layout-parse.js";
import {
  COMPOSITIONS,
  COMPOSITION_IDS,
  GRID_COLUMNS,
  GRID_ROWS,
  parseCopyLocally,
} from "../public/layout-templates.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const labels = ["居中式", "对角线", "散点式", "三角", "九宫格", "包围式", "曲线式", "分割式", "四角式", "三分焦点"];
assert(COMPOSITIONS.length === 10, "要有十种构图");
assert(new Set(COMPOSITION_IDS).size === 10, "构图编号不能重复");
assert(labels.every((label) => COMPOSITIONS.some((item) => item.label === label)), "构图中文名要齐");
assert(COMPOSITION_IDS.includes("thirds-focus"), "要有三分焦点");

for (const item of COMPOSITIONS) {
  assert(item.slots.length >= 3, `${item.id} 槽位太少`);
  for (const slot of item.slots) {
    assert(slot.col >= 1 && slot.row >= 1, `${item.id} ${slot.id} 槽位从 1 开始`);
    assert(slot.col + slot.colSpan - 1 <= GRID_COLUMNS, `${item.id} ${slot.id} 超出 12 列`);
    assert(slot.row + slot.rowSpan - 1 <= GRID_ROWS, `${item.id} ${slot.id} 超出 12 行`);
  }
}

const source = "少说一句\n\n把想说的话，放在画面中间。\n\n文 / Yooco";
const local = parseCopyLocally(source);
assert(local.roles.find((item) => item.role === "title")?.text === "少说一句", "第一行是主标题");
assert(local.roles.find((item) => item.role === "body")?.text === "把想说的话，放在画面中间。", "中间行是辅助字");
assert(local.roles.find((item) => item.role === "source")?.text === "文 / Yooco", "署名行要认出来");
assert(local.roles.every((item) => source.includes(item.text)), "本地拆分不能写出原文没有的字");
assert(local.suggestedComposition === "scatter", "三行短句建议散点式");
assert(parseCopyLocally("少说一句").suggestedComposition === "center", "只有一句时用居中式");

const invented = normalizeLayoutResult({
  roles: [
    { role: "title", text: "少说一句" },
    { role: "subtitle", text: "这是编造的副标题" },
    { role: "body", text: "把想说的话，放在画面中间。" },
    { role: "source", text: "文 / Yooco" },
    { role: "title", text: "另一句" },
  ],
  suggestedComposition: "not-real",
}, source);
assert(!invented.roles.some((item) => item.text.includes("编造")), "编造的句子要丢掉");
assert(invented.roles.filter((item) => item.role === "title").length === 1, "同一个角色只留一句");
assert(COMPOSITION_IDS.includes(invented.suggestedComposition), "不认识的构图要退回合法编号");
assert(invented.dropped >= 1, "丢掉的句子要记一笔");

const punctuated = normalizeLayoutResult({
  roles: [{ role: "title", text: "少说一句！" }],
  suggestedComposition: "center",
}, "少说一句");
assert(punctuated.roles[0]?.text === "少说一句", "模型多加的标点不能留下来");

const commaSource = "少说，一句";
const recovered = findSourceSlice(commaSource, "少说一句");
assert(recovered?.text === "少说，一句", "对回原文时保留原来的标点");

const once = normalizeLayoutResult({
  roles: [
    { role: "title", text: "只有一句" },
    { role: "body", text: "只有一句" },
  ],
  suggestedComposition: "center",
}, "只有一句");
assert(once.roles.length === 1 && once.roles[0].role === "title", "同一句不能占两个角色");

const longBody = "封面\n" + "把这段说明写得比标题长很多，用来确认会建议左右分开。".repeat(2);
const split = parseCopyLocally(longBody);
assert(split.suggestedComposition === "split", "标题短、正文长时建议分割式");
assert(longBody.replace(/\n/g, "\n").includes(split.roles.find((item) => item.role === "body").text), "长正文仍是原文切片");

console.log("layout parse checks ok");
