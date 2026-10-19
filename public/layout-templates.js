/**
 * 版式设计的九种构图。
 * 每个角色一个区，坐标是画布宽高的百分比。
 * 服务端 lib/layout-parse.js 和页面 public/layout.js 共用这一份。
 */

export const FONT_STACK = '"PingFang SC", "Hiragino Sans GB", "Noto Sans SC", "Microsoft YaHei", sans-serif';

export const ROLES = [
  { id: "title", label: "主标题", weight: 700, lineHeight: 1.08, letterSpacing: 4, color: "#1c1c1c", size: { portrait: 88, square: 76, cover: 48 }, sizeRange: [28, 160] },
  { id: "subtitle", label: "副标题", weight: 500, lineHeight: 1.3, letterSpacing: 2, color: "#3a3a3a", size: { portrait: 36, square: 32, cover: 22 }, sizeRange: [16, 96] },
  { id: "body", label: "辅助字", weight: 400, lineHeight: 1.55, letterSpacing: 1, color: "#2c2c2c", size: { portrait: 28, square: 26, cover: 18 }, sizeRange: [14, 72] },
  { id: "caption", label: "说明", weight: 400, lineHeight: 1.4, letterSpacing: 1, color: "#5c5c5c", size: { portrait: 22, square: 20, cover: 15 }, sizeRange: [12, 48] },
  { id: "source", label: "来源署名", weight: 500, lineHeight: 1.3, letterSpacing: 3, color: "#6a6a6a", size: { portrait: 20, square: 18, cover: 14 }, sizeRange: [12, 48] },
];

export const ROLE_IDS = ROLES.map((role) => role.id);

export const PRESETS = {
  portrait: { id: "portrait", label: "1080×1440 竖版", width: 1080, height: 1440 },
  square: { id: "square", label: "1080×1080 方版", width: 1080, height: 1080 },
  cover: { id: "cover", label: "900×500 公众号封面", width: 900, height: 500 },
};

/** 没上传背景图时，画布上的浅灰团块。数字仍是百分比。 */
export const ORGANIC_SHAPES = [
  { cx: 22, cy: 20, rx: 26, ry: 18, rotate: -16, fill: "#e7e4dc" },
  { cx: 78, cy: 16, rx: 20, ry: 14, rotate: 18, fill: "#dedad2" },
  { cx: 70, cy: 74, rx: 32, ry: 22, rotate: -10, fill: "#eceae4" },
  { cx: 18, cy: 76, rx: 24, ry: 18, rotate: 22, fill: "#e3e0d8" },
  { cx: 48, cy: 46, rx: 16, ry: 12, rotate: 6, fill: "#f3f1eb" },
];

export const POSTER_BG = "#f7f6f2";

function zone(x, y, w, h, align) {
  return { x, y, w, h, align };
}

export const COMPOSITIONS = [
  {
    id: "center",
    label: "居中式",
    blurb: "字排在正中，适合一句金句",
    zones: {
      title: zone(10, 28, 80, 20, "center"),
      subtitle: zone(14, 50, 72, 8, "center"),
      body: zone(14, 60, 72, 18, "center"),
      caption: zone(16, 80, 68, 6, "center"),
      source: zone(16, 88, 68, 6, "center"),
    },
  },
  {
    id: "diagonal",
    label: "对角线",
    blurb: "从左上走到右下",
    zones: {
      title: zone(6, 8, 50, 18, "left"),
      subtitle: zone(22, 30, 48, 12, "left"),
      body: zone(34, 48, 52, 18, "left"),
      caption: zone(46, 70, 44, 10, "right"),
      source: zone(52, 84, 40, 8, "right"),
    },
  },
  {
    id: "scatter",
    label: "散点式",
    blurb: "长短句错开，不挤在一条线上",
    zones: {
      title: zone(6, 10, 46, 18, "left"),
      subtitle: zone(50, 28, 42, 12, "right"),
      body: zone(8, 50, 40, 22, "left"),
      caption: zone(54, 62, 36, 12, "left"),
      source: zone(60, 84, 32, 8, "right"),
    },
  },
  {
    id: "triangle",
    label: "三角",
    blurb: "上面一句，下面分两边",
    zones: {
      title: zone(18, 8, 64, 16, "center"),
      subtitle: zone(6, 32, 40, 18, "left"),
      body: zone(54, 32, 40, 18, "left"),
      caption: zone(10, 62, 36, 14, "center"),
      source: zone(54, 70, 36, 12, "center"),
    },
  },
  {
    id: "grid",
    label: "九宫格",
    blurb: "多条短句分格放",
    zones: {
      title: zone(34, 6, 32, 22, "center"),
      subtitle: zone(4, 38, 28, 22, "left"),
      body: zone(36, 38, 28, 22, "center"),
      caption: zone(68, 38, 28, 22, "right"),
      source: zone(34, 70, 32, 20, "center"),
    },
  },
  {
    id: "enclose",
    label: "包围式",
    blurb: "主标题在中间，其他字围一圈",
    zones: {
      subtitle: zone(16, 6, 68, 10, "center"),
      caption: zone(4, 22, 22, 52, "left"),
      title: zone(28, 36, 44, 22, "center"),
      body: zone(74, 22, 22, 52, "left"),
      source: zone(16, 84, 68, 10, "center"),
    },
  },
  {
    id: "curve",
    label: "曲线式",
    blurb: "句子顺着一条弧往下走",
    zones: {
      title: zone(6, 8, 42, 14, "left"),
      subtitle: zone(24, 24, 44, 12, "left"),
      body: zone(40, 40, 48, 16, "left"),
      caption: zone(22, 62, 46, 12, "left"),
      source: zone(8, 82, 40, 10, "left"),
    },
  },
  {
    id: "split",
    label: "分割式",
    blurb: "左边标题，右边正文",
    zones: {
      title: zone(5, 10, 42, 24, "left"),
      subtitle: zone(5, 38, 42, 14, "left"),
      body: zone(54, 10, 41, 32, "left"),
      caption: zone(54, 48, 41, 18, "left"),
      source: zone(5, 82, 90, 10, "left"),
    },
  },
  {
    id: "corners",
    label: "四角式",
    blurb: "四句各占一角",
    zones: {
      title: zone(5, 6, 42, 20, "left"),
      subtitle: zone(53, 6, 42, 18, "right"),
      source: zone(28, 42, 44, 12, "center"),
      body: zone(5, 64, 42, 26, "left"),
      caption: zone(53, 68, 42, 20, "right"),
    },
  },
];

export const COMPOSITION_IDS = COMPOSITIONS.map((item) => item.id);

export function compositionById(id) {
  return COMPOSITIONS.find((item) => item.id === id) || COMPOSITIONS[0];
}

export function roleById(id) {
  return ROLES.find((item) => item.id === id) || null;
}

/** 安全边距把整套构图往里收。marginPercent 是画布边长的百分比。 */
export function placeZone(zoneBox, marginPercent) {
  const margin = Math.min(18, Math.max(0, Number(marginPercent) || 0));
  const inner = (100 - margin * 2) / 100;
  return {
    x: margin + zoneBox.x * inner,
    y: margin + zoneBox.y * inner,
    w: zoneBox.w * inner,
    h: zoneBox.h * inner,
    align: zoneBox.align || "left",
  };
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

export function suggestComposition(roles) {
  const list = (roles || []).filter((item) => item?.text && String(item.text).trim());
  const count = list.length;
  const title = list.find((item) => item.role === "title")?.text || "";
  const body = list.find((item) => item.role === "body")?.text || "";
  if (count <= 1) return "center";
  if (count === 2 && !body) return "diagonal";
  if (body && title && body.length > Math.max(24, title.length * 2)) return "split";
  if (count >= 5) return "grid";
  if (count === 4) return "corners";
  if (count === 3 && list.some((item) => item.role === "subtitle")) return "triangle";
  if (count === 3) return "scatter";
  return "center";
}

/**
 * 没走模型时，按空行把原文拆开。
 * 字都来自原文，不新写句子。
 */
export function parseCopyLocally(source) {
  const raw = String(source || "").replace(/\r\n/g, "\n");
  const spans = lineSpans(raw);
  if (!spans.length) return { roles: [], suggestedComposition: "center", parser: "local" };
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
  if (shortSecond) {
    picked.push({ role: "subtitle", text: rest.shift().text });
  }
  if (rest.length >= 2 && rest[rest.length - 1].text.length <= 22) {
    picked.push({ role: "caption", text: rest.pop().text });
  }
  if (rest.length) {
    picked.push({ role: "body", text: raw.slice(rest[0].start, rest[rest.length - 1].end) });
  }
  const roles = ROLE_IDS.map((id) => picked.find((item) => item.role === id)).filter(Boolean);
  return { roles, suggestedComposition: suggestComposition(roles), parser: "local" };
}
