/*
 * Yooco 精选主题注册表（主题盖层的单一事实来源）。
 *
 * 每套主题是一组完整的设计变量（配色 / 字号 / 节奏 / 造型）加一份
 * 「文章类型 → 组件配方」。主题只决定参数，具体排版由本项目引擎统一渲染。
 *
 * params 的键必须与 public/app.js 的 TEMPLATE_DEFAULTS 对齐，
 * styleVariant / mutedColor / titleColor / borderColor 是前端专属字段（AI 不下发）。
 * 本文件依赖 app.js 先加载（使用其中的 TEMPLATE_DEFAULTS）。
 */

/* 七类文章类型（AI 判定 articleType，用户也可在面板手动覆盖）。 */
const ARTICLE_TYPES = {
  tutorial: { label: "教程 / 操作指南" },
  checklist: { label: "盘点 / 工具清单" },
  opinion: { label: "观点 / 深度分析" },
  interview: { label: "访谈 / 人物特稿" },
  dataReport: { label: "数据复盘 / 报告" },
  lifestyle: { label: "生活 / 情感随笔" },
  caseStudy: { label: "案例实战 / 复盘" },
};

/* 六套精选主题。classic 不在这里，沿用旧的 4 方向 11 皮肤体系。 */
const THEMES = {
  // 清氧绿：教程测评，明亮高效，信息密度高
  fresh: {
    label: "清氧绿",
    en: "FRESH",
    primary: "#0a9d75",
    fit: "教程 · 测评 · 清单 · 工具盘点",
    params: {
      styleVariant: "standard",
      textColor: "#374151", accentColor: "#0a9d75",
      highlightColor: "#d6f5ea", highlightTextColor: "#0b5f49",
      cardColor: "#effbf6", quoteColor: "#f4fdf9", cardTitleColor: "#0a9d75",
      pageColor: "#ffffff", linkColor: "#0a9d75",
      codeBackground: "#f3f4f6", codeColor: "#1f2937", dividerColor: "#d1d5db",
      mutedColor: "#9ca3af", titleColor: "#111827", borderColor: "#e5e7eb",
      bodyFont: "system", headingFont: "system", textAlign: "justify",
      fontSize: 14, lineHeight: 1.9, letterSpacing: 0.5, paragraphSpacing: 20,
      headingSize: 26, headingWeight: 850, headingSpacingBefore: 36, headingSpacingAfter: 14,
      headingStyle: "index", cardStyle: "soft", listStyle: "circle",
      highlightStyle: "marker", cardRadius: 20, imageRadius: 12, cardPadding: 20,
      showDivider: true,
    },
    recipe: {
      tutorial: { core: ["steps", "code", "card"], accent: ["quote", "list"] },
      checklist: { core: ["list", "card"], accent: ["stat", "quote"] },
      opinion: { core: ["paragraph", "quote", "card"], accent: ["divider"] },
      interview: { core: ["paragraph", "quote"], accent: ["card", "divider"] },
      dataReport: { core: ["stat", "list"], accent: ["card", "highlight"] },
      lifestyle: { core: ["paragraph", "card"], accent: ["quote"] },
      caseStudy: { core: ["steps", "list"], accent: ["code", "quote"] },
    },
  },

  // 朱白评论：观点力量感，朱红克制点睛，编号章节
  vermilion: {
    label: "朱白评论",
    en: "VERMILION",
    primary: "#d43d33",
    fit: "深度分析 · 观点 · 力量感",
    params: {
      styleVariant: "standard",
      textColor: "#3a3a3a", accentColor: "#d43d33",
      highlightColor: "#fdeaea", highlightTextColor: "#9a241c",
      cardColor: "#fdf3f2", quoteColor: "#fef9f8", cardTitleColor: "#d43d33",
      pageColor: "#fffdfc", linkColor: "#d43d33",
      codeBackground: "#f3f4f6", codeColor: "#1f2937", dividerColor: "#e7e5e4",
      mutedColor: "#9c9a97", titleColor: "#211d1a", borderColor: "#e7e5e4",
      bodyFont: "system", headingFont: "system", textAlign: "left",
      fontSize: 15, lineHeight: 1.8, letterSpacing: 0.5, paragraphSpacing: 20,
      headingSize: 27, headingWeight: 900, headingSpacingBefore: 38, headingSpacingAfter: 14,
      headingStyle: "index", cardStyle: "band", listStyle: "circle",
      highlightStyle: "background", cardRadius: 12, imageRadius: 8, cardPadding: 22,
      showDivider: true,
    },
    recipe: {
      opinion: { core: ["paragraph", "quote"], accent: ["card"] },
      tutorial: { core: ["steps", "code", "list"], accent: ["card"] },
      checklist: { core: ["list", "card"], accent: ["stat"] },
      interview: { core: ["paragraph", "quote"], accent: ["card"] },
      dataReport: { core: ["stat", "list"], accent: ["card"] },
      lifestyle: { core: ["paragraph", "quote"], accent: ["card"] },
      caseStudy: { core: ["steps", "list"], accent: ["quote", "card"] },
    },
  },

  // 素墨：极简专业，全灰阶，大留白，点睛暖橙走强调色变量
  mono: {
    label: "素墨",
    en: "MONO",
    primary: "#52525b",
    fit: "设计 · 科技评论 · 专业观点",
    params: {
      styleVariant: "standard",
      textColor: "#52525b", accentColor: "#52525b",
      highlightColor: "#f4f4f5", highlightTextColor: "#27272a",
      cardColor: "#fafafa", quoteColor: "#fafafa", cardTitleColor: "#3f3f46",
      pageColor: "#ffffff", linkColor: "#52525b",
      codeBackground: "#f4f4f5", codeColor: "#27272a", dividerColor: "#e4e4e7",
      mutedColor: "#a1a1aa", titleColor: "#27272a", borderColor: "#e4e4e7",
      bodyFont: "system", headingFont: "system", textAlign: "left",
      fontSize: 15, lineHeight: 1.8, letterSpacing: 0.3, paragraphSpacing: 22,
      headingSize: 27, headingWeight: 800, headingSpacingBefore: 56, headingSpacingAfter: 16,
      headingStyle: "line", cardStyle: "outline", listStyle: "dot",
      highlightStyle: "underline", cardRadius: 4, imageRadius: 4, cardPadding: 22,
      showDivider: true,
    },
    recipe: {
      opinion: { core: ["paragraph", "quote"], accent: ["card"] },
      tutorial: { core: ["steps", "code", "list"], accent: ["card"] },
      checklist: { core: ["list", "card"], accent: ["stat"] },
      interview: { core: ["paragraph", "quote"], accent: ["card"] },
      dataReport: { core: ["stat", "list"], accent: ["card"] },
      lifestyle: { core: ["paragraph", "quote"], accent: ["card"] },
      caseStudy: { core: ["steps", "list"], accent: ["quote"] },
    },
  },

  // 静山：东方留白，衬线大字，细线分层，几乎无色块
  serene: {
    label: "静山",
    en: "SERENE",
    primary: "#476055",
    fit: "深度随笔 · 极简生活 · 读书笔记",
    params: {
      styleVariant: "standard",
      textColor: "#4f5550", accentColor: "#476055",
      highlightColor: "#edf2ef", highlightTextColor: "#385045",
      cardColor: "#ffffff", quoteColor: "#ffffff", cardTitleColor: "#476055",
      pageColor: "#ffffff", linkColor: "#476055",
      codeBackground: "#f3f5f3", codeColor: "#3d5046", dividerColor: "#e9eae6",
      mutedColor: "#a3a3a3", titleColor: "#2b2b2b", borderColor: "#e9eae6",
      bodyFont: "system", headingFont: "serif", textAlign: "justify",
      fontSize: 15, lineHeight: 1.92, letterSpacing: 0.3, paragraphSpacing: 26,
      headingSize: 26, headingWeight: 700, headingSpacingBefore: 64, headingSpacingAfter: 32,
      headingStyle: "line", cardStyle: "outline", listStyle: "dot",
      highlightStyle: "underline", cardRadius: 0, imageRadius: 0, cardPadding: 24,
      showDivider: true,
    },
    recipe: {
      opinion: { core: ["paragraph", "quote"], accent: ["card"] },
      lifestyle: { core: ["paragraph"], accent: ["quote"] },
      interview: { core: ["paragraph", "quote"], accent: ["card"] },
      checklist: { core: ["paragraph", "list"], accent: ["card"] },
      dataReport: { core: ["paragraph", "stat"], accent: ["card"] },
      tutorial: { core: ["paragraph", "list", "card"], accent: ["steps"] },
      caseStudy: { core: ["paragraph", "list"], accent: ["quote"] },
    },
  },

  // 票据卡：米白纸张、深色描边、实心投影、虚线装订
  stub: {
    label: "票据卡",
    en: "STUB",
    primary: "#0f9d8a",
    fit: "测评 · 工具对比 · 创意评测",
    params: {
      styleVariant: "standard",
      textColor: "#555555", accentColor: "#0f9d8a",
      highlightColor: "#d6f3ee", highlightTextColor: "#0b5e52",
      cardColor: "#f0faf8", quoteColor: "#fffef9", cardTitleColor: "#26231f",
      pageColor: "#fffef9", linkColor: "#0f9d8a",
      codeBackground: "#f3f4f6", codeColor: "#1f2937", dividerColor: "#a9e3d9",
      mutedColor: "#999999", titleColor: "#26231f", borderColor: "#26231f",
      bodyFont: "system", headingFont: "system", textAlign: "left",
      fontSize: 14, lineHeight: 1.9, letterSpacing: 0.5, paragraphSpacing: 20,
      headingSize: 26, headingWeight: 900, headingSpacingBefore: 36, headingSpacingAfter: 16,
      headingStyle: "block", cardStyle: "outline", listStyle: "circle",
      highlightStyle: "marker", cardRadius: 10, imageRadius: 10, cardPadding: 20,
      showDivider: true,
    },
    recipe: {
      tutorial: { core: ["list", "steps", "card"], accent: ["code", "image"] },
      checklist: { core: ["list", "card"], accent: ["image"] },
      opinion: { core: ["paragraph", "card"], accent: ["list"] },
      interview: { core: ["paragraph", "steps", "card"], accent: ["quote"] },
      dataReport: { core: ["card", "list"], accent: ["code"] },
      lifestyle: { core: ["paragraph", "card"], accent: ["list"] },
      caseStudy: { core: ["steps", "image", "card", "list"], accent: ["quote"] },
    },
  },

  // 手札橙：编辑部内刊，墨黑+橙，统一小圆角，细边框分层
  editorial: {
    label: "手札橙",
    en: "JOURNAL",
    primary: "#1e1f23",
    fit: "内刊手记 · 深度评测 · 案例复盘",
    params: {
      styleVariant: "standard",
      textColor: "#4d4f46", accentColor: "#e07b2c",
      highlightColor: "#e7e8e1", highlightTextColor: "#23251d",
      cardColor: "#eff0ea", quoteColor: "#fdfdf8", cardTitleColor: "#1e1f23",
      pageColor: "#fdfdf8", linkColor: "#b17816",
      codeBackground: "#eeefe9", codeColor: "#23251d", dividerColor: "#bfc1b7",
      mutedColor: "#9ea096", titleColor: "#23251d", borderColor: "#bfc1b7",
      bodyFont: "system", headingFont: "system", textAlign: "left",
      fontSize: 14, lineHeight: 1.9, letterSpacing: 0.3, paragraphSpacing: 20,
      headingSize: 26, headingWeight: 800, headingSpacingBefore: 24, headingSpacingAfter: 14,
      headingStyle: "bar", cardStyle: "border", listStyle: "circle",
      highlightStyle: "underline", cardRadius: 6, imageRadius: 6, cardPadding: 20,
      showDivider: true,
    },
    recipe: {
      tutorial: { core: ["steps", "code", "paragraph", "list"], accent: ["card", "image"] },
      checklist: { core: ["list", "card"], accent: ["image", "stat"] },
      opinion: { core: ["paragraph", "card", "quote"], accent: ["list"] },
      dataReport: { core: ["stat", "card", "list"], accent: ["code"] },
      interview: { core: ["paragraph", "quote", "list"], accent: ["card"] },
      lifestyle: { core: ["paragraph", "card"], accent: ["divider"] },
      caseStudy: { core: ["list", "card"], accent: ["stat", "quote"] },
    },
  },
};

const THEME_ORDER = ["fresh", "vermilion", "mono", "serene", "stub", "editorial"];
const THEME_IDS = THEME_ORDER.concat(["classic"]);
const ARTICLE_TYPE_IDS = Object.keys(ARTICLE_TYPES);

/* 主题态：在通用默认值上铺整套主题参数；theme 字段记录当前盖层。 */
function buildThemeState(themeId) {
  const theme = THEMES[themeId];
  if (!theme) return null;
  return { ...TEMPLATE_DEFAULTS, ...theme.params, theme: themeId, articleType: "auto" };
}
