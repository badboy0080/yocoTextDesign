/**
 * 版式设计的构图和排版规矩。
 * 12 列 × 12 行网格。槽位都落在格子上。
 * 服务端 lib/layout-parse.js 和页面 public/layout.js 共用这一份。
 */

export const FONT_STACK = '"PingFang SC", "Hiragino Sans GB", "Noto Sans SC", "Microsoft YaHei", sans-serif';

export const GRID_COLUMNS = 12;
export const GRID_ROWS = 12;
export const SAFE_MARGIN_FLOOR = 48;
export const MIN_TITLE_BODY_RATIO = 2.5;
export const MIN_CONTRAST = 3;

export const ROLES = [
  { id: "title", label: "主标题", weight: 700, lineHeight: 1.12, letterSpacing: 2, color: "#1c1c1c", sizeRange: [32, 180] },
  { id: "subtitle", label: "副标题", weight: 500, lineHeight: 1.3, letterSpacing: 0, color: "#3a3a3a", sizeRange: [16, 96] },
  { id: "body", label: "辅助字", weight: 400, lineHeight: 1.5, letterSpacing: 0, color: "#2c2c2c", sizeRange: [14, 72] },
  { id: "caption", label: "说明", weight: 400, lineHeight: 1.4, letterSpacing: 0, color: "#5c5c5c", sizeRange: [12, 48] },
  { id: "source", label: "来源署名", weight: 500, lineHeight: 1.35, letterSpacing: 1, color: "#6a6a6a", sizeRange: [12, 48] },
];

export const ROLE_IDS = ROLES.map((role) => role.id);

export const ALIGN_GROUPS = {
  headline: ["title", "subtitle"],
  note: ["caption", "source"],
};

export const MARGIN_PRESETS = [
  { id: "tight", label: "紧", percent: 4 },
  { id: "standard", label: "标准", percent: 6 },
  { id: "wide", label: "宽", percent: 8 },
];

export const PRESETS = {
  portrait: { id: "portrait", label: "1080×1440 竖版", width: 1080, height: 1440 },
  square: { id: "square", label: "1080×1080 方版", width: 1080, height: 1080 },
  cover: { id: "cover", label: "900×500 公众号封面", width: 900, height: 500 },
};

export const ORGANIC_SHAPES = [
  { cx: 22, cy: 20, rx: 26, ry: 18, rotate: -16, fill: "#e7e4dc" },
  { cx: 78, cy: 16, rx: 20, ry: 14, rotate: 18, fill: "#dedad2" },
  { cx: 70, cy: 74, rx: 32, ry: 22, rotate: -10, fill: "#eceae4" },
  { cx: 18, cy: 76, rx: 24, ry: 18, rotate: 22, fill: "#e3e0d8" },
  { cx: 48, cy: 46, rx: 16, ry: 12, rotate: 6, fill: "#f3f1eb" },
];

export const POSTER_BG = "#f7f6f2";
export const LIGHT_TEXT = "#f4f4f1";
export const DARK_TEXT = "#1c1c1c";

function slot(id, role, col, row, colSpan, rowSpan, align, group) {
  return { id, role, col, row, colSpan, rowSpan, align, group };
}

/**
 * take 是这套构图从信息池里最多取几条。
 * 简单的少取，格子多的多取。
 */
export const COMPOSITION_TAKE = {
  center: { title: 1, subtitle: 1, body: 1, caption: 0, source: 1 },
  diagonal: { title: 1, subtitle: 1, body: 1, caption: 0, source: 1 },
  "thirds-focus": { title: 1, subtitle: 1, body: 1, caption: 0, source: 1 },
  curve: { title: 1, subtitle: 1, body: 1, caption: 1, source: 1 },
  enclose: { title: 1, subtitle: 1, body: 1, caption: 1, source: 1 },
  split: { title: 1, subtitle: 1, body: 2, caption: 1, source: 1 },
  triangle: { title: 1, subtitle: 1, body: 2, caption: 0, source: 1 },
  scatter: { title: 1, subtitle: 1, body: 2, caption: 1, source: 1 },
  corners: { title: 1, subtitle: 1, body: 1, caption: 1, source: 1 },
  grid: { title: 1, subtitle: 1, body: 3, caption: 1, source: 1 },
};

export const COMPOSITIONS = [
  {
    id: "center",
    label: "居中式",
    blurb: "一句主标题居中，少放几条",
    slots: [
      slot("title", "title", 2, 4, 10, 2, "center", "headline"),
      slot("subtitle", "subtitle", 3, 6, 8, 1, "center", "headline"),
      slot("body", "body", 3, 8, 8, 2, "center", "body"),
      slot("source", "source", 4, 11, 6, 1, "center", "note"),
    ],
  },
  {
    id: "diagonal",
    label: "对角线",
    blurb: "从左上走到右下",
    slots: [
      slot("title", "title", 1, 1, 6, 2, "left", "headline"),
      slot("subtitle", "subtitle", 3, 3, 6, 1, "left", "headline"),
      slot("body", "body", 5, 5, 6, 3, "left", "body"),
      slot("source", "source", 7, 11, 5, 1, "right", "note"),
    ],
  },
  {
    id: "scatter",
    label: "散点式",
    blurb: "左右各有一条对齐轴",
    slots: [
      slot("title", "title", 2, 2, 5, 2, "left", "headline"),
      slot("subtitle", "subtitle", 2, 4, 5, 1, "left", "headline"),
      slot("body", "body", 2, 7, 5, 2, "left", "body"),
      slot("body-2", "body", 8, 5, 5, 2, "right", "body"),
      slot("caption", "caption", 8, 8, 5, 1, "right", "note"),
      slot("source", "source", 8, 9, 5, 1, "right", "note"),
    ],
  },
  {
    id: "triangle",
    label: "三角",
    blurb: "上面一句，下面分两边",
    slots: [
      slot("title", "title", 3, 2, 8, 2, "center", "headline"),
      slot("subtitle", "subtitle", 2, 4, 5, 2, "left", "headline"),
      slot("body", "body", 7, 4, 5, 2, "left", "body"),
      slot("body-2", "body", 2, 8, 5, 2, "left", "body"),
      slot("source", "source", 7, 10, 5, 1, "center", "note"),
    ],
  },
  {
    id: "grid",
    label: "九宫格",
    blurb: "多条短句分格，多取几条",
    slots: [
      slot("title", "title", 5, 1, 4, 2, "center", "headline"),
      slot("subtitle", "subtitle", 5, 3, 4, 2, "center", "headline"),
      slot("body", "body", 1, 6, 4, 3, "left", "body"),
      slot("body-2", "body", 5, 6, 4, 3, "center", "body"),
      slot("body-3", "body", 9, 6, 4, 3, "right", "body"),
      slot("caption", "caption", 5, 10, 4, 1, "center", "note"),
      slot("source", "source", 5, 11, 4, 1, "center", "note"),
    ],
  },
  {
    id: "enclose",
    label: "包围式",
    blurb: "主标题在中间，其他字围一圈",
    slots: [
      slot("subtitle", "subtitle", 3, 1, 8, 1, "center", "headline"),
      slot("title", "title", 4, 2, 6, 3, "center", "headline"),
      slot("caption", "caption", 1, 6, 3, 3, "left", "note"),
      slot("body", "body", 10, 2, 3, 4, "left", "body"),
      slot("source", "source", 1, 9, 3, 2, "left", "note"),
    ],
  },
  {
    id: "curve",
    label: "曲线式",
    blurb: "句子顺着一条弧往下走",
    slots: [
      slot("title", "title", 1, 2, 5, 2, "left", "headline"),
      slot("subtitle", "subtitle", 3, 4, 5, 1, "left", "headline"),
      slot("body", "body", 5, 6, 6, 2, "left", "body"),
      slot("caption", "caption", 4, 9, 5, 1, "left", "note"),
      slot("source", "source", 4, 10, 5, 1, "left", "note"),
    ],
  },
  {
    id: "split",
    label: "分割式",
    blurb: "左边标题，右边正文",
    slots: [
      slot("title", "title", 1, 2, 5, 3, "left", "headline"),
      slot("subtitle", "subtitle", 1, 5, 5, 2, "left", "headline"),
      slot("body", "body", 7, 2, 6, 3, "left", "body"),
      slot("body-2", "body", 7, 5, 6, 2, "left", "body"),
      slot("caption", "caption", 1, 10, 5, 1, "left", "note"),
      slot("source", "source", 1, 11, 5, 1, "left", "note"),
    ],
  },
  {
    id: "corners",
    label: "四角式",
    blurb: "左轴一组，右轴一组",
    slots: [
      slot("title", "title", 1, 1, 5, 2, "left", "headline"),
      slot("subtitle", "subtitle", 1, 3, 5, 1, "left", "headline"),
      slot("body", "body", 1, 9, 5, 2, "left", "body"),
      slot("caption", "caption", 8, 1, 5, 2, "right", "note"),
      slot("source", "source", 8, 3, 5, 1, "right", "note"),
    ],
  },
  {
    id: "thirds-focus",
    label: "三分焦点",
    blurb: "主标题落在三分线交点上",
    slots: [
      slot("title", "title", 4, 4, 6, 2, "left", "headline"),
      slot("subtitle", "subtitle", 4, 6, 6, 1, "left", "headline"),
      slot("body", "body", 4, 8, 5, 2, "left", "body"),
      slot("source", "source", 4, 11, 4, 1, "left", "note"),
    ],
  },
];

export const COMPOSITION_IDS = COMPOSITIONS.map((item) => item.id);

export function compositionById(id) {
  return COMPOSITIONS.find((item) => item.id === id) || COMPOSITIONS[0];
}

export function roleById(id) {
  return ROLES.find((item) => item.id === id) || null;
}

export function marginPercent(presetOrPercent) {
  const preset = MARGIN_PRESETS.find((item) => item.id === presetOrPercent);
  return preset ? preset.percent : Number(presetOrPercent) || 6;
}

/** 百分比边距，但再小也不能小于 48px。 */
export function safeMarginPx(width, height, presetOrPercent) {
  const percent = marginPercent(presetOrPercent);
  const byPercent = Math.min(width, height) * (percent / 100);
  return Math.max(SAFE_MARGIN_FLOOR, Math.round(byPercent));
}

export function contentFrame(width, height, marginPx) {
  return {
    x: marginPx,
    y: marginPx,
    w: Math.max(0, width - marginPx * 2),
    h: Math.max(0, height - marginPx * 2),
  };
}

/** 把网格槽位换成画布上的像素和百分比。 */
export function placeSlot(slotBox, width, height, marginPx) {
  const frame = contentFrame(width, height, marginPx);
  const colW = frame.w / GRID_COLUMNS;
  const rowH = frame.h / GRID_ROWS;
  const x = frame.x + (slotBox.col - 1) * colW;
  const y = frame.y + (slotBox.row - 1) * rowH;
  const w = slotBox.colSpan * colW;
  const h = slotBox.rowSpan * rowH;
  return {
    x,
    y,
    w,
    h,
    left: (x / width) * 100,
    top: (y / height) * 100,
    width: (w / width) * 100,
    height: (h / height) * 100,
    align: slotBox.align || "left",
    group: slotBox.group || "",
    role: slotBox.role,
    id: slotBox.id,
  };
}

export function slotsTouch(a, b) {
  const vertical = (a.row + a.rowSpan === b.row || b.row + b.rowSpan === a.row)
    && a.col < b.col + b.colSpan && b.col < a.col + a.colSpan;
  const horizontal = (a.col + a.colSpan === b.col || b.col + b.colSpan === a.col)
    && a.row < b.row + b.rowSpan && b.row < a.row + a.rowSpan;
  return vertical || horizontal;
}

export function groupIsClose(slots, group) {
  const list = slots.filter((item) => item.group === group).sort((a, b) => a.row - b.row || a.col - b.col);
  if (list.length < 2) return true;
  for (let index = 1; index < list.length; index += 1) {
    if (!slotsTouch(list[index - 1], list[index])) return false;
  }
  return true;
}

export function sharedAlignment(slots) {
  const left = new Map();
  const right = new Map();
  for (const item of slots) {
    if (item.align === "left") left.set(item.col, (left.get(item.col) || 0) + 1);
    if (item.align === "right") {
      const edge = item.col + item.colSpan;
      right.set(edge, (right.get(edge) || 0) + 1);
    }
  }
  return {
    maxLeft: Math.max(0, ...left.values()),
    maxRight: Math.max(0, ...right.values()),
  };
}

export function coversThirdsIntersection(slotBox) {
  const lines = [4, 8];
  const cols = lines.some((line) => line >= slotBox.col && line < slotBox.col + slotBox.colSpan);
  const rows = lines.some((line) => line >= slotBox.row && line < slotBox.row + slotBox.rowSpan);
  return cols && rows;
}

function separateStep(larger, smaller) {
  if (larger === smaller) return smaller;
  if (larger / smaller >= 1.2) return smaller;
  const floored = Math.floor(larger / 1.2);
  if (floored >= 12 && larger / floored >= 1.2) return floored;
  return larger;
}

export function snapLineBox(fontSize, ratio) {
  const modulus = fontSize >= 32 ? 8 : 4;
  const raw = Math.max(modulus, fontSize * ratio);
  const lineBox = Math.max(modulus, Math.round(raw / modulus) * modulus);
  return { lineBox, lineHeight: lineBox / fontSize, modulus };
}

/** 一键字阶。主标题至少是正文的 2.5 倍，相邻字号不能只差一点点。正文间距为 0。 */
export function applyTypeScale(width, height) {
  const minEdge = Math.min(width, height);
  const body = Math.max(16, Math.min(36, Math.round(minEdge * 0.03)));
  let caption = Math.max(12, Math.round(body * 0.8));
  let source = Math.max(12, Math.round(body * 0.72));
  caption = separateStep(body, caption);
  source = separateStep(caption, source);
  const subtitle = Math.round(body * 1.6);
  const title = Math.max(Math.round(body * MIN_TITLE_BODY_RATIO), Math.round(subtitle * 1.5));
  const fontSize = { title, subtitle, body, caption, source };
  const preferred = { title: 1.12, subtitle: 1.3, body: 1.5, caption: 1.4, source: 1.35 };
  const lineHeight = {};
  for (const role of ROLE_IDS) lineHeight[role] = snapLineBox(fontSize[role], preferred[role]).lineHeight;
  return {
    fontSize,
    lineHeight,
    letterSpacing: { title: 2, subtitle: 0, body: 0, caption: 0, source: 1 },
  };
}

export function typeScaleIssues(fontSize) {
  const issues = [];
  if (!fontSize.body || fontSize.title / fontSize.body < MIN_TITLE_BODY_RATIO - 0.001) issues.push("title-body");
  const order = ["source", "caption", "body", "subtitle", "title"];
  for (let index = 1; index < order.length; index += 1) {
    const previous = fontSize[order[index - 1]];
    const current = fontSize[order[index]];
    if (current < previous) issues.push(`order:${order[index - 1]}-${order[index]}`);
    if (current !== previous && current / previous < 1.2) issues.push(`weak:${order[index - 1]}-${order[index]}`);
  }
  return issues;
}

export function relativeLuminanceFromRgb(red, green, blue) {
  const linear = [red, green, blue].map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

export function relativeLuminance(hex) {
  const raw = String(hex || "").replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(raw)) return 0;
  return relativeLuminanceFromRgb(
    Number.parseInt(raw.slice(0, 2), 16),
    Number.parseInt(raw.slice(2, 4), 16),
    Number.parseInt(raw.slice(4, 6), 16),
  );
}

export function contrastRatio(first, second) {
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * 背景太亮或太暗时，先加重压暗，还不够再改字色。
 * backgroundLuminance 和 overlay 都是 0 到 1。
 */
export function planContrast({ backgroundLuminance, textColor, overlay = 0 }) {
  const darkened = (amount) => backgroundLuminance * (1 - amount);
  const ratioAt = (amount, color) => contrastRatio(darkened(amount), relativeLuminance(color));
  if (ratioAt(overlay, textColor) >= MIN_CONTRAST) {
    return { overlay, color: textColor, changed: false, ratio: ratioAt(overlay, textColor) };
  }
  for (let step = Math.ceil(overlay * 100); step <= 72; step += 4) {
    const amount = step / 100;
    if (ratioAt(amount, textColor) >= MIN_CONTRAST) {
      return { overlay: amount, color: textColor, changed: true, ratio: ratioAt(amount, textColor) };
    }
  }
  const darkRatio = contrastRatio(backgroundLuminance, relativeLuminance(DARK_TEXT));
  const lightRatio = contrastRatio(backgroundLuminance, relativeLuminance(LIGHT_TEXT));
  const alt = darkRatio >= lightRatio ? DARK_TEXT : LIGHT_TEXT;
  for (let step = 0; step <= 72; step += 4) {
    const amount = step / 100;
    if (ratioAt(amount, alt) >= MIN_CONTRAST) {
      return { overlay: amount, color: alt, changed: true, ratio: ratioAt(amount, alt) };
    }
  }
  return { overlay: 0.72, color: alt, changed: true, ratio: ratioAt(0.72, alt) };
}

export function auditSafeBounds({ width, height, marginPx, blocks }) {
  const issues = [];
  for (const block of blocks || []) {
    const bottom = Number.isFinite(block.textBottom) ? block.textBottom : block.y + block.h;
    const outside = block.x < marginPx - 0.5
      || block.y < marginPx - 0.5
      || block.x + block.w > width - marginPx + 0.5
      || bottom > height - marginPx + 0.5;
    if (outside) issues.push({ id: block.id, role: block.role });
  }
  return issues;
}

export function estimateTextHeight(text, boxWidth, fontSize, lineHeight, letterSpacing) {
  const lineBox = fontSize * lineHeight;
  let lines = 0;
  for (const paragraph of String(text || "").split("\n")) {
    if (!paragraph) {
      lines += 1;
      continue;
    }
    let width = 0;
    let count = 1;
    for (const char of Array.from(paragraph)) {
      const charWidth = char.charCodeAt(0) <= 0xff ? fontSize * 0.55 : fontSize;
      const next = width === 0 ? charWidth : width + charWidth + letterSpacing;
      if (width > 0 && next > boxWidth) {
        count += 1;
        width = charWidth;
      } else {
        width = next;
      }
    }
    lines += count;
  }
  return Math.max(lineBox, lines * lineBox);
}

export function selectPoolForComposition(pool, compositionId) {
  const take = { ...(COMPOSITION_TAKE[compositionId] || COMPOSITION_TAKE.center) };
  const slots = compositionById(compositionId).slots;
  const used = {};
  return (pool || []).map((item) => {
    const role = item.role;
    const index = used[role] || 0;
    const allowed = take[role] || 0;
    const slotBox = index < allowed ? slots.filter((entry) => entry.role === role)[index] : null;
    if (slotBox) used[role] = index + 1;
    return {
      ...item,
      onCanvas: Boolean(slotBox),
      slotId: slotBox ? slotBox.id : "",
    };
  });
}

function lineSpans(source) {
  const spans = [];
  const re = /[^\n]+/g;
  let match = re.exec(source);
  while (match) {
    const raw = match[0];
    const text = raw.trim();
    if (text) {
      const start = match.index + raw.indexOf(text);
      spans.push({ text, start, end: start + text.length });
    }
    match = re.exec(source);
  }
  return spans;
}

function looksLikeSource(line) {
  return /^(来源|作者|摄影|图片|图文|文案)\b/.test(line)
    || /来源\s*[:：]/.test(line)
    || /^[文图]\s*[\/／|]/.test(line)
    || /^@\S+/.test(line);
}

function splitSentences(span, source) {
  if (Array.from(span.text).length <= 28) return [span];
  const parts = span.text.split(/(?<=[。！？!?])/).map((part) => part.trim()).filter(Boolean);
  if (parts.length <= 1) return [span];
  let from = span.start;
  return parts.map((text) => {
    const at = source.indexOf(text, from);
    const start = at >= 0 ? at : from;
    const end = start + text.length;
    from = end;
    return { text: source.slice(start, end), start, end };
  }).filter((part) => part.text);
}

export function suggestComposition(items) {
  const list = (items || []).filter((item) => item?.text && String(item.text).trim());
  const count = list.length;
  const title = list.find((item) => item.role === "title")?.text || "";
  const bodyLength = list.filter((item) => item.role === "body").reduce((sum, item) => sum + item.text.length, 0);
  if (count <= 1) return "center";
  if (count === 2 && bodyLength === 0) return "diagonal";
  if (bodyLength && title && bodyLength > Math.max(24, title.length * 2)) return "split";
  if (list.filter((item) => item.role === "body").length >= 3 || count >= 5) return "grid";
  if (count === 4) return "corners";
  if (count === 3 && list.some((item) => item.role === "subtitle")) return "triangle";
  if (count === 3) return "scatter";
  return "center";
}

function withIds(items) {
  return items.map((item, index) => ({
    id: item.id || `p${index + 1}`,
    role: item.role,
    text: item.text,
  }));
}

/**
 * 没走模型时，按空行和句号把原文放进信息池。
 * 字都来自原文。换构图只是从池子里少取或多取。
 */
export function parseCopyLocally(source) {
  const raw = String(source || "").replace(/\r\n/g, "\n");
  const spans = lineSpans(raw);
  if (!spans.length) {
    return { pool: [], roles: [], suggestedComposition: "center", parser: "local" };
  }
  const rest = spans.slice();
  const picked = [];
  if (rest.length > 1) {
    const sourceIndex = rest.findIndex((span, index) => index > 0 && looksLikeSource(span.text));
    if (sourceIndex >= 0) picked.push({ role: "source", text: rest.splice(sourceIndex, 1)[0].text });
    else if (rest.length >= 3 && rest[rest.length - 1].text.length <= 18) {
      picked.push({ role: "source", text: rest.pop().text });
    }
  }
  const title = rest.shift();
  if (title) picked.push({ role: "title", text: title.text });
  const second = rest[0];
  const shortSecond = second
    && title
    && second.text.length <= 18
    && title.text.length <= 22
    && !(second.text.length > 12 && /[。！？.!?]$/.test(second.text));
  if (shortSecond) picked.push({ role: "subtitle", text: rest.shift().text });
  if (rest.length >= 2 && rest[rest.length - 1].text.length <= 22 && !looksLikeSource(rest[rest.length - 1].text)) {
    picked.push({ role: "caption", text: rest.pop().text });
  }
  const bodies = [];
  for (const span of rest) {
    for (const part of splitSentences(span, raw)) {
      if (bodies.length >= 6) break;
      bodies.push({ role: "body", text: part.text });
    }
  }
  const pool = withIds([...picked.filter((item) => item.role !== "body"), ...bodies].sort((a, b) => ROLE_IDS.indexOf(a.role) - ROLE_IDS.indexOf(b.role)));
  const suggestedComposition = suggestComposition(pool);
  const selected = selectPoolForComposition(pool, suggestedComposition);
  return {
    pool: selected,
    roles: selected.filter((item) => item.onCanvas),
    suggestedComposition,
    parser: "local",
  };
}
