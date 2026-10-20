import { parseLayoutCopy } from "../lib/layout-parse.js";
import {
  COMPOSITIONS,
  GRID_COLUMNS,
  MIN_TITLE_BODY_RATIO,
  PRESETS,
  SAFE_MARGIN_FLOOR,
  applyTypeScale,
  auditSafeBounds,
  compositionById,
  coversThirdsIntersection,
  groupIsClose,
  parseCopyLocally,
  placeSlot,
  planContrast,
  relativeLuminance,
  safeMarginPx,
  selectPoolForComposition,
  sharedAlignment,
  snapLineBox,
  typeScaleIssues,
} from "../public/layout-templates.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const item of COMPOSITIONS) {
  assert(groupIsClose(item.slots, "headline"), `${item.id} 主副标题要挨在一起`);
  assert(groupIsClose(item.slots, "note"), `${item.id} 说明和来源要挨在一起`);
  for (const slot of item.slots) {
    const placed = placeSlot(slot, 1080, 1440, 48);
    const frameW = 1080 - 96;
    const colW = frameW / GRID_COLUMNS;
    const expected = 48 + (slot.col - 1) * colW;
    assert(Math.abs(placed.x - expected) < 0.01, `${item.id} ${slot.id} 没有吸附到列`);
    assert(placed.x >= 48 - 0.01 && placed.x + placed.w <= 1080 - 48 + 0.01, `${item.id} ${slot.id} 画出安全边距`);
  }
}

assert(safeMarginPx(1080, 1440, "standard") === 65, "1080 宽的标准边距应是 65px");
assert(safeMarginPx(1080, 1440, "tight") === 48, "4% 低于 48px 时要抬到 48");
assert(safeMarginPx(900, 500, "tight") === SAFE_MARGIN_FLOOR, "封面紧边距不能小于 48px");
assert(safeMarginPx(900, 500, "wide") === SAFE_MARGIN_FLOOR, "封面 8% 仍低于 48px");

const overflow = auditSafeBounds({
  width: 1080,
  height: 1440,
  marginPx: 48,
  blocks: [{ id: "title", role: "title", x: 10, y: 80, w: 200, h: 40 }],
});
assert(overflow.length === 1 && overflow[0].role === "title", "越出安全边距要被记下来");
const inside = auditSafeBounds({
  width: 1080,
  height: 1440,
  marginPx: 48,
  blocks: [{ id: "title", role: "title", x: 48, y: 48, w: 200, h: 40, textBottom: 88 }],
});
assert(inside.length === 0, "落在安全框里不要误报");

const white = planContrast({ backgroundLuminance: 1, textColor: "#ffffff", overlay: 0 });
assert(white.changed && white.overlay >= 0.7 && white.ratio >= 3, "白字压在白底上要压暗");
const black = planContrast({ backgroundLuminance: 0, textColor: "#000000", overlay: 0 });
assert(black.changed && black.color !== "#000000" && black.ratio >= 3, "黑字压在黑底上要改字色");
assert(relativeLuminance("#ffffff") > 0.9, "白色亮度应接近 1");

for (const preset of Object.values(PRESETS)) {
  const scale = applyTypeScale(preset.width, preset.height);
  assert(typeScaleIssues(scale.fontSize).length === 0, `${preset.id} 字阶不合格 ${typeScaleIssues(scale.fontSize).join(",")}`);
  assert(scale.fontSize.title / scale.fontSize.body >= MIN_TITLE_BODY_RATIO - 0.001, `${preset.id} 主标题不够大`);
  assert(scale.letterSpacing.body === 0, `${preset.id} 正文间距应为 0`);
  for (const role of Object.keys(scale.fontSize)) {
    const snapped = snapLineBox(scale.fontSize[role], scale.lineHeight[role]);
    assert(snapped.lineBox % snapped.modulus === 0, `${preset.id} ${role} 行高没有落在 4/8 模数`);
  }
}

const big = snapLineBox(32, 1.5);
const small = snapLineBox(16, 1.37);
assert(big.modulus === 8 && big.lineBox % 8 === 0, "大字行高按 8px");
assert(small.modulus === 4 && small.lineBox % 4 === 0, "小字行高按 4px");

const pool = [
  { id: "t", role: "title", text: "甲" },
  { id: "b1", role: "body", text: "一句重点。" },
  { id: "b2", role: "body", text: "二句重点。" },
  { id: "b3", role: "body", text: "三句重点。" },
  { id: "b4", role: "body", text: "四句重点。" },
];
const center = selectPoolForComposition(pool, "center");
const grid = selectPoolForComposition(pool, "grid");
assert(center.filter((item) => item.role === "body" && item.onCanvas).length === 1, "居中只取一条辅助字");
assert(grid.filter((item) => item.role === "body" && item.onCanvas).length === 3, "九宫格多取辅助字");
assert(pool.every((item) => item.onCanvas === undefined), "取用不能改原来的池子");
assert(center.map((item) => item.text).join("|") === pool.map((item) => item.text).join("|"), "取用不能改字");

const thirds = compositionById("thirds-focus");
const titleSlot = thirds.slots.find((slot) => slot.role === "title");
assert(coversThirdsIntersection(titleSlot), "三分焦点的主标题要盖住交点");
assert(thirds.slots.every((slot) => slot.col >= 1 && slot.col + slot.colSpan - 1 <= 12), "三分焦点槽位在 12 列内");

const scatterAxes = sharedAlignment(compositionById("scatter").slots);
const cornerAxes = sharedAlignment(compositionById("corners").slots);
assert(scatterAxes.maxLeft >= 2 && scatterAxes.maxRight >= 2, "散点要有公共对齐轴");
assert(cornerAxes.maxLeft >= 2 && cornerAxes.maxRight >= 2, "四角要有公共对齐轴");

const long = `封面\n${"把这段说明写得比标题长很多，用来确认会建议左右分开。".repeat(2)}`;
const parsed = parseCopyLocally(long);
const bodies = parsed.pool.filter((item) => item.role === "body");
assert(bodies.length >= 2, "长文要拆成多条重点");
assert(bodies.every((item) => long.includes(item.text)), "信息池里的字必须是原文切片");
assert(parsed.pool.every((item) => long.includes(item.text)), "本地池不能编字");

let missingKey = false;
try {
  await parseLayoutCopy("少说一句", "");
} catch (error) {
  missingKey = error?.code === "DEEPSEEK_API_KEY_MISSING";
}
assert(missingKey, "没配密钥时接口要说明缺密钥");
const local = parseCopyLocally("少说一句\n\n把想说的话，放在画面中间。\n\n文 / Yooco");
assert(local.pool.length >= 3 && local.pool.every((item) => item.text), "没密钥时本地信息池仍能用");
assert(local.suggestedComposition === "scatter", "本地回退仍给出构图");

console.log("layout theory checks ok");
