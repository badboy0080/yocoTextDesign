/** 智能排版版式。瑞士 A–E 之外还有照片网格、字中图、杂志、中文排。栏、行从 1 起，两端都算。百分比贴 12 栏和该比例行线。图槽带自己的 imageIndex，多图不共用一张。中文排是横排，不用竖排。 */

export const RATIOS = {
  "3:4": { w: 3, h: 4, label: "3:4" },
  "9:16": { w: 9, h: 16, label: "9:16" },
  "1:1": { w: 1, h: 1, label: "1:1" },
  "4:3": { w: 4, h: 3, label: "4:3" },
  "16:9": { w: 16, h: 9, label: "16:9" },
  "2:1": { w: 2, h: 1, label: "2:1" },
};

export const RATIO_IDS = Object.keys(RATIOS);

export const FAMILIES = [
  { id: "swiss", label: "瑞士" },
  { id: "photo", label: "照片网格" },
  { id: "type", label: "字中图" },
  { id: "magazine", label: "杂志" },
  { id: "zh", label: "中文排" },
];

const COLS = 12;
const ROWS = { "3:4": 16, "9:16": 21, "1:1": 12, "4:3": 9, "16:9": 7, "2:1": 6 };

function cell(id, type, colStart, colEnd, rowStart, rowEnd, rows, imageIndex) {
  const slot = {
    id,
    type,
    x: ((colStart - 1) / COLS) * 100,
    y: ((rowStart - 1) / rows) * 100,
    w: ((colEnd - colStart + 1) / COLS) * 100,
    h: ((rowEnd - rowStart + 1) / rows) * 100,
  };
  if (type === "image") slot.imageIndex = Number.isInteger(imageIndex) ? imageIndex : 0;
  return slot;
}

function slots(rows, specs) {
  return specs.map(([id, type, c1, c2, r1, r2, imageIndex]) => cell(id, type, c1, c2, r1, r2, rows, imageIndex));
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
    family: "swiss",
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
      "4:3": slots(ROWS["4:3"], [
        ["title", TEXT.title, 2, 11, 1, 4],
        ["subtitle", TEXT.subtitle, 2, 8, 5, 5],
        ["date", TEXT.date, 2, 6, 7, 8],
        ["venue", TEXT.venue, 7, 11, 7, 8],
        ["body", TEXT.body, 2, 6, 9, 9],
        ["credit", TEXT.credit, 7, 11, 9, 9],
      ]),
      "2:1": slots(ROWS["2:1"], [
        ["title", TEXT.title, 1, 6, 1, 3],
        ["subtitle", TEXT.subtitle, 1, 6, 4, 4],
        ["date", TEXT.date, 8, 9, 1, 2],
        ["venue", TEXT.venue, 10, 12, 1, 2],
        ["body", TEXT.body, 8, 9, 4, 6],
        ["credit", TEXT.credit, 10, 12, 4, 6],
      ]),
    },
  },
  {
    id: "b",
    family: "swiss",
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
      "4:3": slots(ROWS["4:3"], [
        ["title", TEXT.title, 8, 12, 1, 3],
        ["subtitle", TEXT.subtitle, 8, 12, 4, 4],
        ["body", TEXT.body, 2, 6, 1, 6],
        ["date", TEXT.date, 8, 12, 6, 7],
        ["venue", TEXT.venue, 8, 12, 8, 8],
        ["credit", TEXT.credit, 2, 6, 8, 9],
      ]),
      "2:1": slots(ROWS["2:1"], [
        ["body", TEXT.body, 2, 6, 1, 4],
        ["credit", TEXT.credit, 2, 6, 5, 6],
        ["title", TEXT.title, 8, 12, 1, 2],
        ["subtitle", TEXT.subtitle, 8, 12, 3, 3],
        ["date", TEXT.date, 8, 10, 5, 6],
        ["venue", TEXT.venue, 11, 12, 5, 6],
      ]),
    },
  },
  {
    id: "c",
    family: "swiss",
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
      "4:3": slots(ROWS["4:3"], [
        ["image", "image", 1, 8, 1, 6],
        ["title", TEXT.title, 9, 12, 1, 4],
        ["subtitle", TEXT.subtitle, 9, 12, 5, 6],
        ["date", TEXT.date, 1, 3, 7, 8],
        ["venue", TEXT.venue, 1, 3, 9, 9],
        ["body", TEXT.body, 4, 8, 7, 9],
        ["credit", TEXT.credit, 9, 12, 7, 9],
      ]),
      "2:1": slots(ROWS["2:1"], [
        ["image", "image", 1, 6, 1, 6],
        ["title", TEXT.title, 8, 12, 1, 2],
        ["subtitle", TEXT.subtitle, 8, 12, 3, 3],
        ["date", TEXT.date, 8, 9, 4, 4],
        ["venue", TEXT.venue, 10, 12, 4, 4],
        ["body", TEXT.body, 8, 10, 5, 6],
        ["credit", TEXT.credit, 11, 12, 5, 6],
      ]),
    },
  },
  {
    id: "d",
    family: "swiss",
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
      "4:3": slots(ROWS["4:3"], [
        ["title", TEXT.title, 2, 10, 1, 2],
        ["subtitle", TEXT.subtitle, 2, 7, 3, 3],
        ["image", "image", 2, 7, 4, 8],
        ["date", TEXT.date, 9, 12, 4, 5],
        ["venue", TEXT.venue, 9, 12, 6, 6],
        ["body", TEXT.body, 9, 12, 7, 8],
        ["credit", TEXT.credit, 2, 7, 9, 9],
      ]),
      "2:1": slots(ROWS["2:1"], [
        ["title", TEXT.title, 1, 7, 1, 1],
        ["subtitle", TEXT.subtitle, 1, 5, 2, 2],
        ["image", "image", 1, 5, 3, 6],
        ["date", TEXT.date, 7, 12, 2, 3],
        ["venue", TEXT.venue, 7, 9, 4, 5],
        ["body", TEXT.body, 10, 12, 4, 5],
        ["credit", TEXT.credit, 7, 12, 6, 6],
      ]),
    },
  },
  {
    id: "e",
    family: "swiss",
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
      "4:3": slots(ROWS["4:3"], [
        ["title", TEXT.title, 1, 4, 1, 3],
        ["subtitle", TEXT.subtitle, 1, 4, 4, 4],
        ["body", TEXT.body, 1, 4, 5, 6],
        ["date", TEXT.date, 1, 4, 7, 7],
        ["venue", TEXT.venue, 1, 4, 8, 8],
        ["credit", TEXT.credit, 1, 4, 9, 9],
        ["image", "image", 6, 12, 1, 8],
      ]),
      "2:1": slots(ROWS["2:1"], [
        ["title", TEXT.title, 1, 4, 1, 2],
        ["subtitle", TEXT.subtitle, 1, 4, 3, 3],
        ["body", TEXT.body, 1, 4, 4, 4],
        ["date", TEXT.date, 1, 4, 5, 5],
        ["venue", TEXT.venue, 1, 2, 6, 6],
        ["credit", TEXT.credit, 3, 4, 6, 6],
        ["image", "image", 6, 12, 1, 6],
      ]),
    },
  },
  {
    id: "p1",
    family: "photo",
    group: "image",
    label: "三图叠放",
    blurb: "两张并排，下面一张宽图，各用各的图",
    slotsByRatio: {
      "3:4": slots(ROWS["3:4"], [
        ["title", TEXT.title, 2, 11, 1, 2],
        ["subtitle", TEXT.subtitle, 2, 11, 3, 3],
        ["image", "image", 1, 6, 4, 9, 0],
        ["image2", "image", 7, 12, 4, 9, 1],
        ["image3", "image", 1, 12, 10, 15, 2],
        ["credit", TEXT.credit, 2, 11, 16, 16],
      ]),
      "9:16": slots(ROWS["9:16"], [
        ["title", TEXT.title, 2, 11, 1, 2],
        ["subtitle", TEXT.subtitle, 2, 11, 3, 3],
        ["image", "image", 1, 6, 4, 11, 0],
        ["image2", "image", 7, 12, 4, 11, 1],
        ["image3", "image", 1, 12, 12, 20, 2],
        ["credit", TEXT.credit, 2, 11, 21, 21],
      ]),
      "1:1": slots(ROWS["1:1"], [
        ["title", TEXT.title, 2, 11, 1, 2],
        ["subtitle", TEXT.subtitle, 2, 8, 3, 3],
        ["image", "image", 1, 6, 4, 7, 0],
        ["image2", "image", 7, 12, 4, 7, 1],
        ["image3", "image", 1, 12, 8, 11, 2],
        ["credit", TEXT.credit, 2, 11, 12, 12],
      ]),
      "16:9": slots(ROWS["16:9"], [
        ["title", TEXT.title, 1, 4, 1, 2],
        ["subtitle", TEXT.subtitle, 1, 4, 3, 3],
        ["image", "image", 5, 7, 1, 6, 0],
        ["image2", "image", 8, 10, 1, 6, 1],
        ["image3", "image", 11, 12, 1, 6, 2],
        ["credit", TEXT.credit, 1, 4, 5, 7],
      ]),
      "4:3": slots(ROWS["4:3"], [
        ["title", TEXT.title, 1, 7, 1, 2],
        ["subtitle", TEXT.subtitle, 8, 12, 1, 2],
        ["image", "image", 1, 4, 3, 8, 0],
        ["image2", "image", 5, 8, 3, 8, 1],
        ["image3", "image", 9, 12, 3, 8, 2],
        ["credit", TEXT.credit, 1, 12, 9, 9],
      ]),
      "2:1": slots(ROWS["2:1"], [
        ["title", TEXT.title, 1, 3, 1, 2],
        ["subtitle", TEXT.subtitle, 1, 3, 3, 3],
        ["image", "image", 4, 6, 1, 5, 0],
        ["image2", "image", 7, 9, 1, 5, 1],
        ["image3", "image", 10, 12, 1, 5, 2],
        ["credit", TEXT.credit, 1, 3, 5, 6],
      ]),
    },
  },
  {
    id: "p2",
    family: "photo",
    group: "image",
    label: "四图田字",
    blurb: "四格各一张，短标题在上",
    slotsByRatio: {
      "3:4": slots(ROWS["3:4"], [
        ["title", TEXT.title, 2, 11, 1, 2],
        ["subtitle", TEXT.subtitle, 2, 11, 3, 3],
        ["image", "image", 1, 6, 4, 9, 0],
        ["image2", "image", 7, 12, 4, 9, 1],
        ["image3", "image", 1, 6, 10, 15, 2],
        ["image4", "image", 7, 12, 10, 15, 3],
        ["credit", TEXT.credit, 2, 11, 16, 16],
      ]),
      "9:16": slots(ROWS["9:16"], [
        ["title", TEXT.title, 2, 11, 1, 2],
        ["subtitle", TEXT.subtitle, 2, 11, 3, 3],
        ["image", "image", 1, 6, 4, 11, 0],
        ["image2", "image", 7, 12, 4, 11, 1],
        ["image3", "image", 1, 6, 12, 19, 2],
        ["image4", "image", 7, 12, 12, 19, 3],
        ["credit", TEXT.credit, 2, 11, 20, 21],
      ]),
      "1:1": slots(ROWS["1:1"], [
        ["title", TEXT.title, 2, 8, 1, 1],
        ["subtitle", TEXT.subtitle, 9, 12, 1, 1],
        ["image", "image", 1, 6, 2, 6, 0],
        ["image2", "image", 7, 12, 2, 6, 1],
        ["image3", "image", 1, 6, 7, 11, 2],
        ["image4", "image", 7, 12, 7, 11, 3],
        ["credit", TEXT.credit, 2, 11, 12, 12],
      ]),
      "16:9": slots(ROWS["16:9"], [
        ["title", TEXT.title, 1, 12, 1, 1],
        ["image", "image", 1, 3, 2, 6, 0],
        ["image2", "image", 4, 6, 2, 6, 1],
        ["image3", "image", 7, 9, 2, 6, 2],
        ["image4", "image", 10, 12, 2, 6, 3],
        ["subtitle", TEXT.subtitle, 1, 12, 7, 7],
      ]),
      "4:3": slots(ROWS["4:3"], [
        ["title", TEXT.title, 1, 6, 1, 1],
        ["subtitle", TEXT.subtitle, 7, 12, 1, 1],
        ["image", "image", 1, 3, 2, 8, 0],
        ["image2", "image", 4, 6, 2, 8, 1],
        ["image3", "image", 7, 9, 2, 8, 2],
        ["image4", "image", 10, 12, 2, 8, 3],
        ["credit", TEXT.credit, 1, 12, 9, 9],
      ]),
      "2:1": slots(ROWS["2:1"], [
        ["title", TEXT.title, 1, 12, 1, 1],
        ["image", "image", 1, 3, 2, 5, 0],
        ["image2", "image", 4, 6, 2, 5, 1],
        ["image3", "image", 7, 9, 2, 5, 2],
        ["image4", "image", 10, 12, 2, 5, 3],
        ["subtitle", TEXT.subtitle, 1, 12, 6, 6],
      ]),
    },
  },
  {
    id: "y1",
    family: "type",
    group: "image",
    label: "题中嵌图",
    blurb: "大标题中间嵌一张图",
    slotsByRatio: {
      "3:4": slots(ROWS["3:4"], [
        ["title", TEXT.title, 1, 12, 2, 11],
        ["image", "image", 3, 10, 5, 9, 0],
        ["subtitle", TEXT.subtitle, 2, 11, 12, 13],
        ["body", TEXT.body, 2, 11, 14, 16],
      ]),
      "9:16": slots(ROWS["9:16"], [
        ["title", TEXT.title, 1, 12, 2, 13],
        ["image", "image", 2, 11, 6, 11, 0],
        ["subtitle", TEXT.subtitle, 2, 11, 14, 15],
        ["body", TEXT.body, 2, 11, 16, 20],
      ]),
      "1:1": slots(ROWS["1:1"], [
        ["title", TEXT.title, 1, 12, 1, 8],
        ["image", "image", 3, 10, 3, 6, 0],
        ["subtitle", TEXT.subtitle, 2, 11, 9, 9],
        ["body", TEXT.body, 2, 11, 10, 12],
      ]),
      "16:9": slots(ROWS["16:9"], [
        ["title", TEXT.title, 1, 12, 1, 5],
        ["image", "image", 5, 8, 2, 4, 0],
        ["subtitle", TEXT.subtitle, 1, 4, 6, 7],
        ["body", TEXT.body, 9, 12, 6, 7],
      ]),
      "4:3": slots(ROWS["4:3"], [
        ["title", TEXT.title, 1, 12, 1, 6],
        ["image", "image", 4, 9, 2, 4, 0],
        ["subtitle", TEXT.subtitle, 2, 6, 7, 7],
        ["body", TEXT.body, 7, 12, 7, 9],
      ]),
      "2:1": slots(ROWS["2:1"], [
        ["title", TEXT.title, 1, 12, 1, 4],
        ["image", "image", 5, 8, 1, 3, 0],
        ["subtitle", TEXT.subtitle, 1, 4, 5, 6],
        ["body", TEXT.body, 9, 12, 5, 6],
      ]),
    },
  },
  {
    id: "y2",
    family: "type",
    group: "image",
    label: "文中嵌图",
    blurb: "正文块里嵌一张图",
    slotsByRatio: {
      "3:4": slots(ROWS["3:4"], [
        ["title", TEXT.title, 2, 11, 1, 4],
        ["subtitle", TEXT.subtitle, 2, 6, 5, 6],
        ["body", TEXT.body, 2, 11, 5, 16],
        ["image", "image", 7, 12, 8, 14, 0],
      ]),
      "9:16": slots(ROWS["9:16"], [
        ["title", TEXT.title, 2, 11, 1, 4],
        ["subtitle", TEXT.subtitle, 2, 11, 5, 6],
        ["body", TEXT.body, 2, 11, 7, 20],
        ["image", "image", 3, 10, 10, 16, 0],
      ]),
      "1:1": slots(ROWS["1:1"], [
        ["title", TEXT.title, 2, 11, 1, 2],
        ["subtitle", TEXT.subtitle, 2, 6, 3, 4],
        ["body", TEXT.body, 2, 11, 3, 12],
        ["image", "image", 7, 12, 5, 9, 0],
      ]),
      "16:9": slots(ROWS["16:9"], [
        ["title", TEXT.title, 1, 7, 1, 2],
        ["body", TEXT.body, 1, 7, 3, 7],
        ["image", "image", 8, 12, 1, 5, 0],
        ["subtitle", TEXT.subtitle, 8, 12, 6, 7],
      ]),
      "4:3": slots(ROWS["4:3"], [
        ["title", TEXT.title, 1, 8, 1, 2],
        ["subtitle", TEXT.subtitle, 9, 12, 1, 2],
        ["body", TEXT.body, 1, 12, 3, 9],
        ["image", "image", 8, 12, 4, 7, 0],
      ]),
      "2:1": slots(ROWS["2:1"], [
        ["title", TEXT.title, 1, 7, 1, 2],
        ["image", "image", 8, 12, 1, 4, 0],
        ["body", TEXT.body, 1, 7, 3, 5],
        ["subtitle", TEXT.subtitle, 1, 7, 6, 6],
      ]),
    },
  },
  {
    id: "m1",
    family: "magazine",
    group: "image",
    label: "封面大题",
    blurb: "大标题、副题、几条短目，配一张图",
    slotsByRatio: {
      "3:4": slots(ROWS["3:4"], [
        ["title", TEXT.title, 1, 12, 1, 3],
        ["subtitle", TEXT.subtitle, 2, 11, 4, 4],
        ["image", "image", 2, 11, 5, 11, 0],
        ["date", TEXT.date, 2, 6, 12, 13],
        ["venue", TEXT.venue, 7, 11, 12, 13],
        ["body", TEXT.body, 2, 6, 14, 16],
        ["credit", TEXT.credit, 7, 11, 14, 16],
      ]),
      "9:16": slots(ROWS["9:16"], [
        ["title", TEXT.title, 2, 11, 1, 3],
        ["subtitle", TEXT.subtitle, 2, 11, 4, 5],
        ["image", "image", 2, 11, 6, 14, 0],
        ["date", TEXT.date, 2, 11, 15, 16],
        ["venue", TEXT.venue, 2, 11, 17, 17],
        ["body", TEXT.body, 2, 11, 18, 19],
        ["credit", TEXT.credit, 2, 11, 20, 21],
      ]),
      "1:1": slots(ROWS["1:1"], [
        ["title", TEXT.title, 1, 12, 1, 2],
        ["subtitle", TEXT.subtitle, 1, 12, 3, 3],
        ["image", "image", 1, 7, 4, 11, 0],
        ["date", TEXT.date, 8, 12, 4, 5],
        ["venue", TEXT.venue, 8, 12, 6, 7],
        ["body", TEXT.body, 8, 12, 8, 10],
        ["credit", TEXT.credit, 8, 12, 11, 12],
      ]),
      "16:9": slots(ROWS["16:9"], [
        ["title", TEXT.title, 1, 6, 1, 2],
        ["subtitle", TEXT.subtitle, 1, 6, 3, 3],
        ["image", "image", 7, 12, 1, 5, 0],
        ["date", TEXT.date, 1, 3, 4, 5],
        ["venue", TEXT.venue, 4, 6, 4, 5],
        ["body", TEXT.body, 1, 3, 6, 7],
        ["credit", TEXT.credit, 4, 6, 6, 7],
      ]),
      "4:3": slots(ROWS["4:3"], [
        ["title", TEXT.title, 1, 7, 1, 2],
        ["subtitle", TEXT.subtitle, 1, 7, 3, 3],
        ["image", "image", 1, 7, 4, 8, 0],
        ["date", TEXT.date, 8, 12, 1, 2],
        ["venue", TEXT.venue, 8, 12, 3, 4],
        ["body", TEXT.body, 8, 12, 5, 7],
        ["credit", TEXT.credit, 8, 12, 8, 9],
      ]),
      "2:1": slots(ROWS["2:1"], [
        ["title", TEXT.title, 1, 5, 1, 2],
        ["subtitle", TEXT.subtitle, 1, 5, 3, 3],
        ["image", "image", 6, 12, 1, 5, 0],
        ["date", TEXT.date, 1, 3, 4, 5],
        ["venue", TEXT.venue, 4, 5, 4, 5],
        ["body", TEXT.body, 1, 3, 6, 6],
        ["credit", TEXT.credit, 4, 5, 6, 6],
      ]),
    },
  },
  {
    id: "m2",
    family: "magazine",
    group: "image",
    label: "右图左目",
    blurb: "右边一张图，左边标题和条目",
    slotsByRatio: {
      "3:4": slots(ROWS["3:4"], [
        ["image", "image", 8, 12, 1, 12, 0],
        ["title", TEXT.title, 1, 7, 1, 4],
        ["subtitle", TEXT.subtitle, 1, 7, 5, 6],
        ["date", TEXT.date, 1, 7, 8, 9],
        ["venue", TEXT.venue, 1, 7, 10, 11],
        ["body", TEXT.body, 1, 7, 12, 14],
        ["credit", TEXT.credit, 1, 12, 15, 16],
      ]),
      "9:16": slots(ROWS["9:16"], [
        ["image", "image", 8, 12, 2, 14, 0],
        ["title", TEXT.title, 1, 7, 2, 5],
        ["subtitle", TEXT.subtitle, 1, 7, 6, 7],
        ["date", TEXT.date, 1, 7, 9, 11],
        ["venue", TEXT.venue, 1, 7, 12, 13],
        ["body", TEXT.body, 1, 7, 15, 18],
        ["credit", TEXT.credit, 1, 7, 19, 20],
      ]),
      "1:1": slots(ROWS["1:1"], [
        ["image", "image", 7, 12, 1, 9, 0],
        ["title", TEXT.title, 1, 6, 1, 3],
        ["subtitle", TEXT.subtitle, 1, 6, 4, 4],
        ["date", TEXT.date, 1, 6, 6, 7],
        ["venue", TEXT.venue, 1, 6, 8, 8],
        ["body", TEXT.body, 1, 6, 9, 10],
        ["credit", TEXT.credit, 1, 12, 11, 12],
      ]),
      "16:9": slots(ROWS["16:9"], [
        ["image", "image", 8, 12, 1, 7, 0],
        ["title", TEXT.title, 1, 7, 1, 2],
        ["subtitle", TEXT.subtitle, 1, 7, 3, 3],
        ["date", TEXT.date, 1, 3, 4, 5],
        ["venue", TEXT.venue, 4, 7, 4, 5],
        ["body", TEXT.body, 1, 4, 6, 7],
        ["credit", TEXT.credit, 5, 7, 6, 7],
      ]),
      "4:3": slots(ROWS["4:3"], [
        ["image", "image", 8, 12, 1, 7, 0],
        ["title", TEXT.title, 1, 7, 1, 2],
        ["subtitle", TEXT.subtitle, 1, 7, 3, 3],
        ["date", TEXT.date, 1, 4, 5, 6],
        ["venue", TEXT.venue, 5, 7, 5, 6],
        ["body", TEXT.body, 1, 7, 7, 8],
        ["credit", TEXT.credit, 1, 12, 9, 9],
      ]),
      "2:1": slots(ROWS["2:1"], [
        ["image", "image", 8, 12, 1, 6, 0],
        ["title", TEXT.title, 1, 7, 1, 2],
        ["subtitle", TEXT.subtitle, 1, 7, 3, 3],
        ["date", TEXT.date, 1, 3, 4, 5],
        ["venue", TEXT.venue, 4, 7, 4, 5],
        ["body", TEXT.body, 1, 4, 6, 6],
        ["credit", TEXT.credit, 5, 7, 6, 6],
      ]),
    },
  },
  {
    id: "z1",
    family: "zh",
    group: "text",
    label: "横题双签",
    blurb: "大标题横排，下面日期和署名两个短槽",
    slotsByRatio: {
      "3:4": slots(ROWS["3:4"], [
        ["title", TEXT.title, 1, 12, 2, 8],
        ["subtitle", TEXT.subtitle, 2, 11, 9, 10],
        ["date", TEXT.date, 2, 6, 12, 13],
        ["credit", TEXT.credit, 7, 11, 12, 13],
        ["body", TEXT.body, 2, 11, 14, 16],
      ]),
      "9:16": slots(ROWS["9:16"], [
        ["title", TEXT.title, 1, 12, 3, 8],
        ["subtitle", TEXT.subtitle, 2, 11, 10, 11],
        ["date", TEXT.date, 2, 6, 13, 14],
        ["credit", TEXT.credit, 7, 11, 13, 14],
        ["body", TEXT.body, 2, 11, 16, 20],
      ]),
      "1:1": slots(ROWS["1:1"], [
        ["title", TEXT.title, 1, 12, 2, 6],
        ["subtitle", TEXT.subtitle, 2, 11, 7, 8],
        ["date", TEXT.date, 2, 6, 9, 10],
        ["credit", TEXT.credit, 7, 11, 9, 10],
        ["body", TEXT.body, 2, 11, 11, 12],
      ]),
      "16:9": slots(ROWS["16:9"], [
        ["title", TEXT.title, 1, 8, 1, 4],
        ["subtitle", TEXT.subtitle, 1, 8, 5, 5],
        ["date", TEXT.date, 9, 10, 2, 3],
        ["credit", TEXT.credit, 11, 12, 2, 3],
        ["body", TEXT.body, 9, 12, 5, 7],
      ]),
      "4:3": slots(ROWS["4:3"], [
        ["title", TEXT.title, 1, 12, 1, 4],
        ["subtitle", TEXT.subtitle, 2, 8, 5, 5],
        ["date", TEXT.date, 2, 5, 7, 8],
        ["credit", TEXT.credit, 7, 10, 7, 8],
        ["body", TEXT.body, 2, 11, 9, 9],
      ]),
      "2:1": slots(ROWS["2:1"], [
        ["title", TEXT.title, 1, 8, 1, 3],
        ["date", TEXT.date, 9, 10, 1, 2],
        ["credit", TEXT.credit, 11, 12, 1, 2],
        ["subtitle", TEXT.subtitle, 1, 8, 4, 4],
        ["body", TEXT.body, 1, 12, 5, 6],
      ]),
    },
  },
  {
    id: "z2",
    family: "zh",
    group: "text",
    label: "横题底签",
    blurb: "大标题横排，日期和署名贴在底部",
    slotsByRatio: {
      "3:4": slots(ROWS["3:4"], [
        ["title", TEXT.title, 1, 12, 3, 10],
        ["date", TEXT.date, 2, 5, 13, 14],
        ["credit", TEXT.credit, 8, 11, 13, 14],
        ["subtitle", TEXT.subtitle, 2, 11, 15, 16],
      ]),
      "9:16": slots(ROWS["9:16"], [
        ["title", TEXT.title, 1, 12, 4, 12],
        ["date", TEXT.date, 2, 5, 16, 17],
        ["credit", TEXT.credit, 8, 11, 16, 17],
        ["subtitle", TEXT.subtitle, 2, 11, 19, 21],
      ]),
      "1:1": slots(ROWS["1:1"], [
        ["title", TEXT.title, 1, 12, 2, 7],
        ["date", TEXT.date, 2, 5, 9, 10],
        ["credit", TEXT.credit, 8, 11, 9, 10],
        ["subtitle", TEXT.subtitle, 2, 11, 11, 12],
      ]),
      "16:9": slots(ROWS["16:9"], [
        ["title", TEXT.title, 1, 9, 1, 5],
        ["date", TEXT.date, 10, 12, 1, 2],
        ["credit", TEXT.credit, 10, 12, 3, 4],
        ["subtitle", TEXT.subtitle, 1, 12, 6, 7],
      ]),
      "4:3": slots(ROWS["4:3"], [
        ["title", TEXT.title, 1, 12, 1, 5],
        ["date", TEXT.date, 2, 4, 7, 8],
        ["credit", TEXT.credit, 9, 11, 7, 8],
        ["subtitle", TEXT.subtitle, 2, 11, 9, 9],
      ]),
      "2:1": slots(ROWS["2:1"], [
        ["title", TEXT.title, 1, 8, 1, 4],
        ["date", TEXT.date, 9, 12, 1, 2],
        ["credit", TEXT.credit, 9, 12, 3, 4],
        ["subtitle", TEXT.subtitle, 1, 12, 5, 6],
      ]),
    },
  },
];

export const TEMPLATE_IDS = TEMPLATES.map((item) => item.id);

export function templateById(id) {
  return TEMPLATES.find((item) => item.id === id) || TEMPLATES[0];
}

export function slotsFor(templateId, ratio) {
  const template = templateById(templateId);
  const list = template.slotsByRatio[ratio] || template.slotsByRatio["3:4"];
  return list.map((item) => ({ ...item }));
}

/** 画布宽高比 = 宽 / 高。平局时更竖的优先。 */
const RATIO_PREFERENCE = ["9:16", "3:4", "1:1", "4:3", "16:9", "2:1"];

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

/** 图不够时后面的槽空着，不跟前面的槽共用一张。imagePick 是第一张槽的起点。 */
export function imageIndexFor(slot, imagePick, imageCount) {
  if (slot?.type !== "image" || imageCount < 1) return -1;
  const base = Number.isInteger(slot.imageIndex) ? slot.imageIndex : 0;
  const start = Number.isInteger(imagePick) ? Math.max(0, imagePick) : 0;
  const index = start + base;
  if (index >= imageCount) return -1;
  return index;
}

export function templatesInFamily(familyId) {
  return TEMPLATES.filter((item) => item.family === familyId);
}

/** 在已选好的画布比例上，挑图槽宽高比最接近图片的瑞士图文。平局取更竖的图槽，再按 c、d、e。不跳到别的族。 */
export function closestImageTemplate(width, height, ratioId) {
  const imgRatio = Number(width) / Number(height);
  const candidates = TEMPLATES.filter((item) => item.family === "swiss" && item.group === "image");
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
