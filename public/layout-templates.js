/** 智能排版瑞士模板 A–E。栏、行从 1 起，两端都算。百分比贴 12 栏和该比例行线，不用旧 t1 的随意百分比。 */

export const RATIOS = {
  "3:4": { w: 3, h: 4, label: "3:4" },
  "9:16": { w: 9, h: 16, label: "9:16" },
  "1:1": { w: 1, h: 1, label: "1:1" },
  "16:9": { w: 16, h: 9, label: "16:9" },
};

export const RATIO_IDS = Object.keys(RATIOS);
export const TEMPLATE_IDS = ["a", "b", "c", "d", "e"];

const COLS = 12;
const ROWS = { "3:4": 16, "9:16": 21, "1:1": 12, "16:9": 7 };

function cell(id, type, colStart, colEnd, rowStart, rowEnd, rows) {
  return {
    id,
    type,
    x: ((colStart - 1) / COLS) * 100,
    y: ((rowStart - 1) / rows) * 100,
    w: ((colEnd - colStart + 1) / COLS) * 100,
    h: ((rowEnd - rowStart + 1) / rows) * 100,
  };
}

function slots(rows, specs) {
  return specs.map(([id, type, c1, c2, r1, r2]) => cell(id, type, c1, c2, r1, r2, rows));
}

const TEXT = {
  title: "H1",
  subtitle: "H2",
  date: "body",
  venue: "body",
  body: "body",
  credit: "body",
};

export const TEMPLATES = [
  {
    id: "a",
    group: "text",
    label: "A 四栏冲击",
    blurb: "上半大标题，下半四块信息",
    slotsByRatio: {
      "3:4": slots(ROWS["3:4"], [
        ["title", TEXT.title, 2, 11, 2, 7],
        ["subtitle", TEXT.subtitle, 2, 8, 8, 9],
        ["date", TEXT.date, 2, 6, 11, 13],
        ["venue", TEXT.venue, 7, 11, 11, 13],
        ["body", TEXT.body, 2, 6, 14, 16],
        ["credit", TEXT.credit, 7, 11, 14, 16],
      ]),
      "1:1": slots(ROWS["1:1"], [
        ["title", TEXT.title, 2, 11, 2, 4],
        ["subtitle", TEXT.subtitle, 2, 8, 5, 6],
        ["date", TEXT.date, 2, 6, 8, 9],
        ["venue", TEXT.venue, 7, 11, 8, 9],
        ["body", TEXT.body, 2, 6, 11, 12],
        ["credit", TEXT.credit, 7, 11, 11, 12],
      ]),
      "9:16": slots(ROWS["9:16"], [
        ["title", TEXT.title, 2, 11, 2, 7],
        ["subtitle", TEXT.subtitle, 2, 8, 8, 9],
        ["date", TEXT.date, 2, 6, 11, 13],
        ["venue", TEXT.venue, 7, 11, 11, 13],
        ["body", TEXT.body, 2, 6, 15, 18],
        ["credit", TEXT.credit, 7, 11, 15, 18],
      ]),
      "16:9": slots(ROWS["16:9"], [
        ["title", TEXT.title, 1, 6, 1, 3],
        ["subtitle", TEXT.subtitle, 1, 6, 4, 5],
        ["date", TEXT.date, 8, 9, 1, 3],
        ["venue", TEXT.venue, 10, 12, 1, 3],
        ["body", TEXT.body, 8, 9, 5, 7],
        ["credit", TEXT.credit, 10, 12, 5, 7],
      ]),
    },
  },
  {
    id: "b",
    group: "text",
    label: "B 边线密排",
    blurb: "左宽正文，右上标题，中间空一栏",
    slotsByRatio: {
      "3:4": slots(ROWS["3:4"], [
        ["title", TEXT.title, 8, 12, 2, 6],
        ["subtitle", TEXT.subtitle, 8, 12, 7, 8],
        ["body", TEXT.body, 2, 6, 3, 13],
        ["date", TEXT.date, 8, 12, 11, 13],
        ["venue", TEXT.venue, 8, 12, 14, 15],
        ["credit", TEXT.credit, 2, 6, 14, 16],
      ]),
      "1:1": slots(ROWS["1:1"], [
        ["title", TEXT.title, 8, 12, 2, 4],
        ["subtitle", TEXT.subtitle, 8, 12, 5, 6],
        ["body", TEXT.body, 2, 6, 2, 9],
        ["credit", TEXT.credit, 2, 6, 11, 12],
        ["date", TEXT.date, 8, 12, 8, 9],
        ["venue", TEXT.venue, 8, 12, 10, 11],
      ]),
      "9:16": slots(ROWS["9:16"], [
        ["title", TEXT.title, 8, 12, 2, 6],
        ["subtitle", TEXT.subtitle, 8, 12, 7, 8],
        ["body", TEXT.body, 2, 6, 3, 14],
        ["date", TEXT.date, 8, 12, 12, 15],
        ["venue", TEXT.venue, 8, 12, 17, 19],
        ["credit", TEXT.credit, 2, 6, 16, 19],
      ]),
      "16:9": slots(ROWS["16:9"], [
        ["body", TEXT.body, 2, 6, 2, 5],
        ["credit", TEXT.credit, 2, 6, 6, 7],
        ["title", TEXT.title, 8, 12, 1, 3],
        ["subtitle", TEXT.subtitle, 8, 12, 4, 4],
        ["date", TEXT.date, 8, 10, 6, 7],
        ["venue", TEXT.venue, 11, 12, 6, 7],
      ]),
    },
  },
  {
    id: "c",
    group: "image",
    label: "C 竖题半幅图",
    blurb: "大图加右侧标题条",
    slotsByRatio: {
      "3:4": slots(ROWS["3:4"], [
        ["image", "image", 1, 9, 1, 9],
        ["title", TEXT.title, 10, 12, 2, 7],
        ["subtitle", TEXT.subtitle, 10, 12, 8, 10],
        ["date", TEXT.date, 2, 4, 12, 14],
        ["venue", TEXT.venue, 2, 4, 15, 16],
        ["body", TEXT.body, 5, 9, 12, 16],
        ["credit", TEXT.credit, 10, 12, 12, 16],
      ]),
      "1:1": slots(ROWS["1:1"], [
        ["image", "image", 1, 7, 1, 7],
        ["title", TEXT.title, 9, 12, 1, 5],
        ["subtitle", TEXT.subtitle, 9, 12, 6, 7],
        ["date", TEXT.date, 1, 4, 9, 10],
        ["venue", TEXT.venue, 1, 4, 11, 12],
        ["body", TEXT.body, 5, 8, 9, 12],
        ["credit", TEXT.credit, 9, 12, 9, 12],
      ]),
      "9:16": slots(ROWS["9:16"], [
        ["image", "image", 1, 9, 1, 12],
        ["title", TEXT.title, 10, 12, 2, 8],
        ["subtitle", TEXT.subtitle, 10, 12, 9, 11],
        ["date", TEXT.date, 2, 4, 14, 16],
        ["venue", TEXT.venue, 2, 4, 17, 19],
        ["body", TEXT.body, 5, 9, 14, 19],
        ["credit", TEXT.credit, 10, 12, 14, 19],
      ]),
      "16:9": slots(ROWS["16:9"], [
        ["image", "image", 1, 6, 1, 7],
        ["title", TEXT.title, 8, 12, 1, 2],
        ["subtitle", TEXT.subtitle, 8, 12, 3, 4],
        ["date", TEXT.date, 8, 12, 5, 5],
        ["venue", TEXT.venue, 8, 12, 6, 6],
        ["body", TEXT.body, 8, 10, 7, 7],
        ["credit", TEXT.credit, 11, 12, 7, 7],
      ]),
    },
  },
  {
    id: "d",
    group: "image",
    label: "D 顶题偏左图",
    blurb: "顶上横标题，中部偏左图",
    slotsByRatio: {
      "3:4": slots(ROWS["3:4"], [
        ["title", TEXT.title, 2, 10, 2, 4],
        ["subtitle", TEXT.subtitle, 2, 7, 5, 6],
        ["image", "image", 2, 7, 8, 14],
        ["date", TEXT.date, 9, 12, 8, 10],
        ["venue", TEXT.venue, 9, 12, 11, 12],
        ["body", TEXT.body, 9, 12, 13, 15],
        ["credit", TEXT.credit, 2, 7, 15, 16],
      ]),
      "1:1": slots(ROWS["1:1"], [
        ["title", TEXT.title, 2, 10, 1, 2],
        ["subtitle", TEXT.subtitle, 2, 7, 3, 3],
        ["image", "image", 2, 6, 5, 11],
        ["date", TEXT.date, 8, 12, 5, 6],
        ["venue", TEXT.venue, 8, 12, 7, 8],
        ["body", TEXT.body, 8, 12, 9, 10],
        ["credit", TEXT.credit, 8, 12, 11, 12],
      ]),
      "9:16": slots(ROWS["9:16"], [
        ["title", TEXT.title, 2, 10, 2, 4],
        ["subtitle", TEXT.subtitle, 2, 7, 5, 6],
        ["image", "image", 2, 7, 8, 16],
        ["date", TEXT.date, 9, 12, 8, 11],
        ["venue", TEXT.venue, 9, 12, 12, 14],
        ["body", TEXT.body, 9, 12, 15, 17],
        ["credit", TEXT.credit, 2, 7, 17, 19],
      ]),
      "16:9": slots(ROWS["16:9"], [
        ["title", TEXT.title, 1, 7, 1, 2],
        ["subtitle", TEXT.subtitle, 1, 5, 3, 3],
        ["image", "image", 1, 5, 4, 7],
        ["date", TEXT.date, 7, 12, 3, 4],
        ["venue", TEXT.venue, 7, 9, 5, 6],
        ["body", TEXT.body, 10, 12, 5, 6],
        ["credit", TEXT.credit, 7, 12, 7, 7],
      ]),
    },
  },
  {
    id: "e",
    group: "image",
    label: "E 黄金竖轴",
    blurb: "左窄字，右宽图，中间空一栏",
    slotsByRatio: {
      "3:4": slots(ROWS["3:4"], [
        ["title", TEXT.title, 1, 4, 2, 7],
        ["subtitle", TEXT.subtitle, 1, 4, 8, 9],
        ["body", TEXT.body, 1, 4, 11, 12],
        ["date", TEXT.date, 1, 4, 13, 14],
        ["venue", TEXT.venue, 1, 4, 15, 15],
        ["credit", TEXT.credit, 1, 4, 16, 16],
        ["image", "image", 6, 12, 2, 15],
      ]),
      "1:1": slots(ROWS["1:1"], [
        ["title", TEXT.title, 1, 4, 1, 4],
        ["subtitle", TEXT.subtitle, 1, 4, 5, 5],
        ["body", TEXT.body, 1, 4, 6, 7],
        ["date", TEXT.date, 1, 4, 8, 8],
        ["venue", TEXT.venue, 1, 4, 9, 9],
        ["credit", TEXT.credit, 1, 4, 10, 11],
        ["image", "image", 6, 12, 1, 10],
      ]),
      "9:16": slots(ROWS["9:16"], [
        ["title", TEXT.title, 1, 4, 2, 7],
        ["subtitle", TEXT.subtitle, 1, 4, 8, 9],
        ["body", TEXT.body, 1, 4, 11, 13],
        ["date", TEXT.date, 1, 4, 15, 16],
        ["venue", TEXT.venue, 1, 4, 17, 17],
        ["credit", TEXT.credit, 1, 4, 18, 19],
        ["image", "image", 6, 12, 2, 18],
      ]),
      "16:9": slots(ROWS["16:9"], [
        ["title", TEXT.title, 1, 4, 1, 2],
        ["subtitle", TEXT.subtitle, 1, 4, 3, 3],
        ["body", TEXT.body, 1, 4, 4, 4],
        ["date", TEXT.date, 1, 4, 5, 5],
        ["venue", TEXT.venue, 1, 4, 6, 6],
        ["credit", TEXT.credit, 1, 4, 7, 7],
        ["image", "image", 6, 12, 1, 7],
      ]),
    },
  },
];

export function templateById(id) {
  return TEMPLATES.find((item) => item.id === id) || TEMPLATES[0];
}

export function slotsFor(templateId, ratio) {
  const template = templateById(templateId);
  const list = template.slotsByRatio[ratio] || template.slotsByRatio["3:4"];
  return list.map((item) => ({ ...item }));
}

/** 画布宽高比 = 宽 / 高。平局时更竖的优先：9:16，然后 3:4，然后 1:1，然后 16:9。 */
const RATIO_PREFERENCE = ["9:16", "3:4", "1:1", "16:9"];

function canvasRatioOf(ratioId) {
  const item = RATIOS[ratioId];
  return item.w / item.h;
}

export function closestCanvasRatio(width, height) {
  const imgRatio = Number(width) / Number(height);
  if (!Number.isFinite(imgRatio) || imgRatio <= 0) return "3:4";
  let bestId = RATIO_PREFERENCE[0];
  let bestErr = Infinity;
  for (const id of RATIO_PREFERENCE) {
    const canvasRatio = canvasRatioOf(id);
    const err = Math.abs(imgRatio - canvasRatio) / canvasRatio;
    if (err < bestErr - 1e-12) {
      bestId = id;
      bestErr = err;
    }
  }
  return bestId;
}

function imageSlotOf(template, ratioId) {
  const list = template.slotsByRatio[ratioId] || template.slotsByRatio["3:4"];
  return list.find((slot) => slot.type === "image");
}

function slotPixelRatio(slot, ratioId) {
  return (slot.w / slot.h) * canvasRatioOf(ratioId);
}

/** 在已选好的画布比例上，挑图槽宽高比最接近图片的图文模板。平局取更竖的图槽，再按 c、d、e。 */
export function closestImageTemplate(width, height, ratioId) {
  const imgRatio = Number(width) / Number(height);
  const candidates = TEMPLATES.filter((item) => item.group === "image");
  let best = candidates[0];
  let bestErr = Infinity;
  let bestSlotRatio = Infinity;
  if (!Number.isFinite(imgRatio) || imgRatio <= 0) return best.id;
  for (const template of candidates) {
    const slot = imageSlotOf(template, ratioId);
    if (!slot?.h) continue;
    const slotRatio = slotPixelRatio(slot, ratioId);
    const err = Math.abs(imgRatio - slotRatio) / slotRatio;
    const tighter = err < bestErr - 1e-12;
    const tied = Math.abs(err - bestErr) <= 1e-12;
    const morePortrait = slotRatio < bestSlotRatio - 1e-12;
    if (tighter || (tied && morePortrait)) {
      best = template;
      bestErr = err;
      bestSlotRatio = slotRatio;
    }
  }
  return best.id;
}
