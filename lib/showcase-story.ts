/* 首页滚动故事只用工作台那一篇示例。
 * 内容同事要换展示范围，改 SHOWCASE_INDEXES。
 * 要换三拍顺序或文案，改 SHOWCASE_BEATS。不要另写一篇稿。
 */

export const SHOWCASE_ARTICLE_ID = "yooco-wechat-layout";

export const SHOWCASE_INDEXES = [0, 1, 2, 3, 4, 5, 9, 15, 29, 36];

const SANS = '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';

type ThemeSpec = {
  label: string;
  pageColor: string;
  textColor: string;
  style: string;
  dataset: Record<string, string>;
};

function themeStyle(vars: Record<string, string | number>) {
  return Object.entries(vars).map(([key, value]) => `--${key}:${value}`).join(";");
}

/* 颜色和 data-* 从 public/themes.js 的 fresh / nocturne 抄来，不另造一套。 */
export const SHOWCASE_THEMES = {
  fresh: {
    label: "清氧绿",
    pageColor: "#ffffff",
    textColor: "#374151",
    style: themeStyle({
      "text-color": "#374151",
      "accent-color": "#0a9d75",
      "highlight-color": "#d6f5ea",
      "highlight-text-color": "#0b5f49",
      "card-color": "#effbf6",
      "quote-color": "#f4fdf9",
      "card-title-color": "#0a9d75",
      "page-color": "#ffffff",
      "link-color": "#0a9d75",
      "muted-color": "#9ca3af",
      "title-color": "#111827",
      "border-color": "#e5e7eb",
      "divider-color": "#d1d5db",
      "body-font": SANS,
      "heading-font": SANS,
      "font-size": "14px",
      "line-height": "1.9",
      "paragraph-spacing": "20px",
      "title-size": "26px",
      "heading-size": "26px",
      "heading-weight": "850",
      "card-radius": "20px",
      "card-padding": "20px",
      "highlight-radius": "3px",
      "highlight-padding": "2px",
      "text-align": "justify",
    }),
    dataset: {
      theme: "fresh",
      style: "standard",
      highlightStyle: "marker",
      headingStyle: "index",
      cardStyle: "soft",
      listStyle: "circle",
    },
  },
  nocturne: {
    label: "深空青",
    pageColor: "#1a1a1a",
    textColor: "#d1d5db",
    style: themeStyle({
      "text-color": "#d1d5db",
      "accent-color": "#3ddc97",
      "highlight-color": "#f6d35a",
      "highlight-text-color": "#1a1a1a",
      "card-color": "#242424",
      "quote-color": "#1f1f1f",
      "card-title-color": "#3ddc97",
      "page-color": "#1a1a1a",
      "link-color": "#4fd1c5",
      "muted-color": "#9ca3af",
      "title-color": "#f3f4f6",
      "border-color": "#333333",
      "divider-color": "#333333",
      "body-font": SANS,
      "heading-font": SANS,
      "font-size": "15px",
      "line-height": "1.88",
      "paragraph-spacing": "22px",
      "title-size": "26px",
      "heading-size": "24px",
      "heading-weight": "750",
      "card-radius": "12px",
      "card-padding": "20px",
      "highlight-radius": "3px",
      "highlight-padding": "2px",
      "text-align": "left",
    }),
    dataset: {
      theme: "nocturne",
      style: "deep-night",
      highlightStyle: "marker",
      headingStyle: "index",
      cardStyle: "soft",
      listStyle: "circle",
    },
  },
} satisfies Record<string, ThemeSpec>;

export type ShowcaseThemeId = keyof typeof SHOWCASE_THEMES;

export const SHOWCASE_BEATS = [
  {
    id: "manuscript",
    kicker: "01 原稿",
    title: "先看密排原文",
    kind: "manuscript",
  },
  {
    id: "fresh",
    kicker: "02 成稿",
    title: "同一篇，展开成清氧绿",
    kind: "theme",
    themeId: "fresh",
  },
  {
    id: "nocturne",
    kicker: "03 换皮肤",
    title: "同一篇，字不动，换成深空青",
    kind: "theme",
    themeId: "nocturne",
  },
] as const;

export type ShowcasePiece = {
  index: number;
  html: string;
  text: string;
};

function decodeText(value: string) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function excerptPieces(html: string): ShowcasePiece[] {
  const pieces: ShowcasePiece[] = [];
  const pattern = /<(p|div|aside|section)\b([^>]*\bdata-block-index="(\d+)"[^>]*)>([\s\S]*?)<\/\1>/g;
  for (const match of html.matchAll(pattern)) {
    const index = Number(match[3]);
    if (!SHOWCASE_INDEXES.includes(index)) continue;
    const inner = match[4].replace(/\scontenteditable="(?:true|false)"/g, "");
    const block = `<${match[1]}${match[2].replace(/\scontenteditable="(?:true|false)"/g, "")}>${inner}</${match[1]}>`;
    const text = decodeText(inner);
    if (!text) continue;
    pieces.push({ index, html: block, text });
  }
  return SHOWCASE_INDEXES.flatMap((index) => pieces.filter((piece) => piece.index === index));
}
