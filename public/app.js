const TEMPLATE_DEFAULTS = {
  textColor: "#3f3f3f", accentColor: "#6e8e23", highlightColor: "#d7fa5c", highlightTextColor: "#20231f",
  cardColor: "#f0f4e5", quoteColor: "#f7f8f1", cardTitleColor: "#6e8e23", pageColor: "#ffffff",
  linkColor: "#3f6f9f", codeBackground: "#edf0e5", codeColor: "#2c4030", dividerColor: "#6e8e23",
  bodyFont: "system", headingFont: "system", textAlign: "left", textIndent: 0,
  fontSize: 16, lineHeight: 1.75, letterSpacing: 0.3, paragraphSpacing: 18, contentWidth: 620,
  readingDensity: "standard", titleSize: 26, headingSize: 27, subheadingSize: 23, minorHeadingSize: 20,
  headingWeight: 800, headingLineHeight: 1.35, headingSpacingBefore: 32, headingSpacingAfter: 12,
  headingStyle: "bar", cardStyle: "border", listStyle: "dot",
  highlightStyle: "background", highlightRadius: 3, highlightPadding: 2,
  listIndent: 1.5, listItemSpacing: 6, linkUnderline: true,
  quoteTitleSize: 11, cardTitleSize: 11, cardBorderWidth: 1,
  dividerThickness: 1, dividerMargin: 28, codeFontSize: 13, codeLineHeight: 1.6, captionSize: 11,
  cardRadius: 12, cardPadding: 20, imageRadius: 12,
  showQuote: true, showDivider: true, showImage: true,
  theme: "classic", articleType: "auto", showSignature: false,
};

// 4 个气质方向：决定招牌造型（标题/卡片/列表），每个方向下挂 2~3 套具体配色皮肤。
const MOODS = {
  minimal: {
    label: "克制高级", hint: "冷静 · 留白", headingStyle: "line", cardStyle: "outline", listStyle: "dot",
    skins: ["ink-cream", "mist-blue", "warm-paper"],
  },
  editorial: {
    label: "杂志编辑部", hint: "编号 · 层次", headingStyle: "index", cardStyle: "band", listStyle: "circle",
    skins: ["retro-green", "brick-red", "navy-ink"],
  },
  lively: {
    label: "活泼小红书", hint: "明快 · 圆润", headingStyle: "block", cardStyle: "soft", listStyle: "check",
    skins: ["orange-pop", "lemon-fresh", "berry-soda"],
  },
  deep: {
    label: "暗黑科技", hint: "深色 · 荧光", headingStyle: "bar", cardStyle: "soft", listStyle: "ghost", dark: true,
    skins: ["deep-matrix", "cyber-blue"],
  },
};

// 每套皮肤是一组完整配色（可附带少量数值偏好），字段缺失时回落到 TEMPLATE_DEFAULTS。
const SKINS = {
  "ink-cream": { label: "墨黑米白", styleVariant: "standard", mutedColor: "#8c8a84", titleColor: "#2b2a28", borderColor: "#e3e0d8",
    textColor: "#2b2a28", accentColor: "#2b2a28", highlightColor: "#e8e5dd", highlightTextColor: "#2b2a28",
    cardColor: "#f3f1ea", quoteColor: "#f7f5ef", cardTitleColor: "#2b2a28", pageColor: "#fbfaf7",
    linkColor: "#4c6b79", codeBackground: "#f1f0ea", codeColor: "#33312c", dividerColor: "#2b2a28",
    cardRadius: 2, imageRadius: 2, showDivider: true },
  "mist-blue": { label: "雾灰蓝", styleVariant: "standard", mutedColor: "#8a98a0", titleColor: "#2f3b42", borderColor: "#dde4e8",
    textColor: "#33414a", accentColor: "#5b7a8c", highlightColor: "#dfe9ee", highlightTextColor: "#26323a",
    cardColor: "#eef3f5", quoteColor: "#f4f7f9", cardTitleColor: "#5b7a8c", pageColor: "#ffffff",
    linkColor: "#3f6f9f", codeBackground: "#eaf0f3", codeColor: "#2a3942", dividerColor: "#5b7a8c",
    cardRadius: 4, imageRadius: 4 },
  "warm-paper": { label: "暖咖纸", styleVariant: "standard", mutedColor: "#9a8c79", titleColor: "#43392f", borderColor: "#e8dfd1",
    textColor: "#43392f", accentColor: "#8a6a4a", highlightColor: "#efe4d2", highlightTextColor: "#43392f",
    cardColor: "#f5ecdf", quoteColor: "#f8f2e8", cardTitleColor: "#8a6a4a", pageColor: "#fdfbf6",
    linkColor: "#7a5a3a", codeBackground: "#f3ebdd", codeColor: "#4a3d30", dividerColor: "#8a6a4a",
    cardRadius: 6, imageRadius: 6 },
  "retro-green": { label: "复古墨绿", styleVariant: "standard", mutedColor: "#7e8f84", titleColor: "#20302a", borderColor: "#d8e2d6",
    textColor: "#20302a", accentColor: "#2f5d4f", highlightColor: "#d8e6d4", highlightTextColor: "#20302a",
    cardColor: "#edf2e8", quoteColor: "#f3f6ee", cardTitleColor: "#2f5d4f", pageColor: "#fffef9",
    linkColor: "#35604e", codeBackground: "#eaf0e8", codeColor: "#25352c", dividerColor: "#2f5d4f",
    cardRadius: 2, imageRadius: 2, headingWeight: 850 },
  "brick-red": { label: "砖红杂志", styleVariant: "standard", mutedColor: "#97837a", titleColor: "#2e2622", borderColor: "#ecdccf",
    textColor: "#2e2622", accentColor: "#b5462f", highlightColor: "#f3d9cc", highlightTextColor: "#3a211a",
    cardColor: "#f9eae1", quoteColor: "#fbf1ea", cardTitleColor: "#b5462f", pageColor: "#fffdf8",
    linkColor: "#9a3b28", codeBackground: "#f4e7de", codeColor: "#5c2e22", dividerColor: "#b5462f",
    cardRadius: 2, imageRadius: 2, headingWeight: 850 },
  "navy-ink": { label: "藏蓝油墨", styleVariant: "standard", mutedColor: "#7c8699", titleColor: "#20283a", borderColor: "#dce3ee",
    textColor: "#20283a", accentColor: "#27406b", highlightColor: "#d8e0ee", highlightTextColor: "#20283a",
    cardColor: "#eaf0f8", quoteColor: "#f2f5fa", cardTitleColor: "#27406b", pageColor: "#ffffff",
    linkColor: "#27406b", codeBackground: "#e8edf5", codeColor: "#20283a", dividerColor: "#27406b",
    cardRadius: 2, imageRadius: 2, headingWeight: 850 },
  "orange-pop": { label: "橙粉活力", styleVariant: "standard", mutedColor: "#a08a82", titleColor: "#3a2a22", borderColor: "#f6e0d4",
    textColor: "#3a3230", accentColor: "#ff6a3d", highlightColor: "#ffd9c7", highlightTextColor: "#3a2a22",
    cardColor: "#fff0e8", quoteColor: "#fff6f0", cardTitleColor: "#ff6a3d", pageColor: "#fffdfb",
    linkColor: "#d94f2b", codeBackground: "#fdeee5", codeColor: "#5c3326", dividerColor: "#ff6a3d",
    cardRadius: 16, imageRadius: 16, headingWeight: 800, lineHeight: 1.8, paragraphSpacing: 20 },
  "lemon-fresh": { label: "柠檬青绿", styleVariant: "standard", mutedColor: "#849788", titleColor: "#22301c", borderColor: "#dcefd8",
    textColor: "#28332a", accentColor: "#3ea868", highlightColor: "#e4f8a8", highlightTextColor: "#22301c",
    cardColor: "#eef8e6", quoteColor: "#f5fbf0", cardTitleColor: "#35925b", pageColor: "#fcfff9",
    linkColor: "#2f8f54", codeBackground: "#eaf5e3", codeColor: "#26372a", dividerColor: "#3ea868",
    cardRadius: 18, imageRadius: 18, headingWeight: 800, lineHeight: 1.8, paragraphSpacing: 20 },
  "berry-soda": { label: "莓果汽水", styleVariant: "standard", mutedColor: "#a1859a", titleColor: "#3d2235", borderColor: "#f2d9e8",
    textColor: "#382b36", accentColor: "#d6488f", highlightColor: "#fbd7ea", highlightTextColor: "#3d2235",
    cardColor: "#fceaf4", quoteColor: "#fef3f9", cardTitleColor: "#d6488f", pageColor: "#fffafc",
    linkColor: "#b03575", codeBackground: "#fae8f2", codeColor: "#4a2740", dividerColor: "#d6488f",
    cardRadius: 18, imageRadius: 18, headingWeight: 800, lineHeight: 1.8, paragraphSpacing: 20 },
  "deep-matrix": { label: "深空荧光", styleVariant: "deep-night", mutedColor: "#6f8a74", titleColor: "#eafff0", borderColor: "#2c3d30",
    textColor: "#c7d6c2", accentColor: "#34f07a", highlightColor: "#34f07a", highlightTextColor: "#06140b",
    cardColor: "#1a241d", quoteColor: "#172019", cardTitleColor: "#34f07a", pageColor: "#121512",
    linkColor: "#5fd9a0", codeBackground: "#16201a", codeColor: "#bfe8c8", dividerColor: "#34f07a",
    cardRadius: 14, imageRadius: 14, headingWeight: 800, lineHeight: 1.9, paragraphSpacing: 22, showDivider: false },
  "cyber-blue": { label: "赛博深蓝", styleVariant: "deep-night", mutedColor: "#6c7ea0", titleColor: "#e6efff", borderColor: "#28354f",
    textColor: "#a7b8d8", accentColor: "#4da3ff", highlightColor: "#8fc4ff", highlightTextColor: "#081426",
    cardColor: "#172033", quoteColor: "#141c2c", cardTitleColor: "#6fb4ff", pageColor: "#0e1320",
    linkColor: "#6fb4ff", codeBackground: "#151d2e", codeColor: "#cfe0f7", dividerColor: "#4da3ff",
    cardRadius: 14, imageRadius: 14, headingWeight: 800, lineHeight: 1.9, paragraphSpacing: 22, showDivider: false },
};

function skinMood(skinId) {
  return Object.keys(MOODS).find((moodId) => MOODS[moodId].skins.includes(skinId)) || "minimal";
}

const DEFAULT_MOOD = "minimal";
const DEFAULT_SKIN = "ink-cream";

function buildSkinState(skinId) {
  const moodId = skinMood(skinId);
  const mood = MOODS[moodId];
  return {
    ...TEMPLATE_DEFAULTS,
    ...SKINS[skinId],
    headingStyle: mood.headingStyle,
    cardStyle: mood.cardStyle,
    listStyle: mood.listStyle,
  };
}

const state = { ...buildSkinState(DEFAULT_SKIN) };
let currentMood = DEFAULT_MOOD;
let currentSkin = DEFAULT_SKIN;
// 用户是否已手动调过样式（选方向/选皮肤/拖滑杆）；调过后 AI 只重排文字、不再覆盖样式，直到点「恢复默认」。
let styleTouched = false;
const controls = [...document.querySelectorAll("[data-key]")];
const articlePage = document.querySelector("#articlePage");
const articleBody = document.querySelector("#articleBody");
const tokenPreview = document.querySelector("#tokenPreview");
const previewSummary = document.querySelector("#previewSummary");
const previewStage = document.querySelector("#previewStage");
const compliancePanel = document.querySelector("#compliancePanel");
const complianceLevel = document.querySelector("#complianceLevel");
const complianceList = document.querySelector("#complianceList");
const darkPreviewToggle = document.querySelector("#darkPreviewToggle");
const lockBrandColor = document.querySelector("#lockBrandColor");
const copyFeedback = document.querySelector("#copyFeedback");
const moodGrid = document.querySelector("#moodGrid");
const skinRow = document.querySelector("#skinRow");
const moodPicker = document.querySelector("#moodPicker");
const moodPickerGroup = document.querySelector("#moodPickerGroup");
const skinCurrent = document.querySelector("#skinCurrent");
const themeGrid = document.querySelector("#themeGrid");
const articleInput = document.querySelector("#articleInput");
const aiNormalizeButton = document.querySelector("#aiNormalizeButton");
const articleStatus = document.querySelector("#articleStatus");
const articleTitle = document.querySelector("#articleTitle");
const articleSubtitle = document.querySelector("#articleSubtitle");
const stylePane = document.querySelector("#stylePane");
const styleMount = document.querySelector("#styleMount");
let articleSource = localStorage.getItem("yooco-article-source") || "";
let articleTitleOverride = localStorage.getItem("yooco-article-title") || "";
let inferFirstLineTitle = localStorage.getItem("yooco-infer-first-line-title") !== "false";
let blockTypeOverrides = {};
let lastAiResult = null;
let previewSyncTimer = 0;

function setStatus(message) {
  if (articleStatus) articleStatus.textContent = message;
}

function setFeedback(message) {
  if (copyFeedback) copyFeedback.textContent = message;
}

try {
  blockTypeOverrides = JSON.parse(localStorage.getItem("yooco-block-type-overrides") || "{}");
} catch {
  blockTypeOverrides = {};
}

// 参数面板放在右栏，跟随右栏独立滚动。
if (stylePane && styleMount) styleMount.appendChild(stylePane);
if (stylePane) stylePane.hidden = false;

function initParameterAccordion() {
  if (!stylePane) return;
  const groups = Array.from(stylePane.querySelectorAll("[data-accordion]"));
  groups.forEach((group) => {
    const body = group.querySelector(".group-body");
    if (body && !body.querySelector(":scope > .group-body-inner")) {
      const inner = document.createElement("div");
      inner.className = "group-body-inner";
      while (body.firstChild) inner.appendChild(body.firstChild);
      body.appendChild(inner);
    }
    const toggle = group.querySelector(".group-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", () => {
      const willOpen = !group.classList.contains("is-open");
      groups.forEach((other) => {
        const open = other === group && willOpen;
        other.classList.toggle("is-open", open);
        const btn = other.querySelector(".group-toggle");
        if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  });
}
initParameterAccordion();

const sampleContent = [
  { type: "lead", text: "公众号排版不是把颜色堆在一起，而是把阅读节奏安排清楚：读者先看到什么、在哪里停一下、下一步愿意继续读什么。" },
  { type: "highlight", text: "高亮关键词 · 证据标签 · 可复用组件" },
  { type: "heading", text: "先确定一套能复用的骨架" },
  { type: "paragraph", text: "开源提取器的思路很实用：把文章里的样式还原到元素上，再观察颜色、字号、行高和间距的高频组合。这样得到的不是一句“这篇文章很好看”，而是一组可以调整、比较和保存的参数。" },
  { type: "quote", title: "设计提醒", text: "预设描述的是排版语言，不是对原文内容、图片或品牌素材的复制。" },
  { type: "divider" },
  { type: "image", text: "IMAGE / 文章配图占位" },
  { type: "heading", text: "把识别结果交给人工判断" },
  { type: "paragraph", text: "自动统计适合找到起点，最后仍要回到阅读体验：手机上是否舒服，标题是否能被扫到，卡片是否抢走正文注意力。你提供的优秀文章，下一步就会在这里沉淀成真正的模板预设。" },
];

function applySkin(skinId, { fromUser = true } = {}) {
  if (!SKINS[skinId]) return;
  currentSkin = skinId;
  currentMood = skinMood(skinId);
  Object.assign(state, buildSkinState(skinId));
  state.theme = "classic";
  if (fromUser) styleTouched = true;
  syncMoodUI();
  syncControls();
  render();
}

function isTheme() {
  return Boolean(state.theme && state.theme !== "classic" && THEMES[state.theme]);
}

// 切换精选主题（6 套之一）或回到 classic（旧的 4 方向 11 皮肤）。
function applyTheme(themeId, { fromUser = true, articleType } = {}) {
  if (themeId !== "classic" && !THEMES[themeId]) return;
  const previousArticleType = state.articleType;
  if (themeId === "classic") {
    Object.assign(state, buildSkinState(currentSkin));
  } else {
    Object.assign(state, buildThemeState(themeId));
  }
  // 用户此前手动指定过文章类型时，换主题不重置它（类型是对文章的判断，与主题无关）。
  if (previousArticleType && previousArticleType !== "auto") state.articleType = previousArticleType;
  if (articleType) state.articleType = articleType;
  if (fromUser) styleTouched = true;
  syncMoodUI();
  syncControls();
  render();
}

function syncMoodUI() {
  moodGrid?.querySelectorAll("[data-mood]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mood === currentMood);
  });
  skinRow?.querySelectorAll("[data-skin]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.skin === currentSkin);
    const skin = SKINS[button.dataset.skin];
    button.style.setProperty("--swatch-accent", skin.accentColor);
    button.style.setProperty("--swatch-bg", skin.pageColor);
  });
  themeGrid?.querySelectorAll("[data-theme]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.theme === state.theme);
  });
  // 精选主题激活时收起旧的气质/皮肤分组，避免两套选择器并存造成困惑。
  if (moodPicker) moodPicker.hidden = isTheme();
  if (moodPickerGroup) {
    moodPickerGroup.hidden = isTheme();
    if (isTheme() && moodPickerGroup.classList.contains("is-open")) {
      moodPickerGroup.classList.remove("is-open");
      const btn = moodPickerGroup.querySelector(".group-toggle");
      if (btn) btn.setAttribute("aria-expanded", "false");
    }
  }
  if (skinCurrent) {
    skinCurrent.textContent = isTheme()
      ? `精选主题 · ${THEMES[state.theme].label}`
      : `${MOODS[currentMood].label} · ${SKINS[currentSkin].label}`;
  }
}

function renderMoodUI() {
  if (themeGrid) {
    const classicButton = `<button type="button" class="theme-chip is-classic" data-theme="classic" title="4 方向 × 11 皮肤的通用体系"><b>经典</b></button>`;
    const themeButtons = THEME_ORDER.map((id) => {
      const theme = THEMES[id];
      return `<button type="button" class="theme-chip" data-theme="${id}" style="--theme-primary:${theme.primary}" title="${theme.fit}"><b>${theme.label}</b></button>`;
    }).join("");
    themeGrid.innerHTML = classicButton + themeButtons;
    themeGrid.querySelectorAll("[data-theme]").forEach((button) => {
      button.addEventListener("click", () => applyTheme(button.dataset.theme));
    });
  }
  if (moodGrid) {
    moodGrid.innerHTML = Object.entries(MOODS).map(([id, mood]) =>
      `<button type="button" class="mood-card" data-mood="${id}"><b>${mood.label}</b><span>${mood.hint}</span></button>`).join("");
    moodGrid.querySelectorAll("[data-mood]").forEach((button) => {
      button.addEventListener("click", () => applySkin(MOODS[button.dataset.mood].skins[0]));
    });
  }
  if (skinRow) {
    const chips = Object.entries(MOODS).map(([moodId, mood]) => mood.skins.map((skinId) =>
      `<button type="button" class="skin-chip" data-skin="${skinId}" data-mood="${moodId}" title="${SKINS[skinId].label}">${SKINS[skinId].label}</button>`).join("")).join("");
    skinRow.querySelector(".skin-chips").innerHTML = chips;
    skinRow.querySelectorAll("[data-skin]").forEach((button) => {
      button.addEventListener("click", () => applySkin(button.dataset.skin));
    });
  }
  syncMoodUI();
}

function syncControls() {
  controls.forEach((control) => {
    const key = control.dataset.key;
    if (control.type === "checkbox") control.checked = Boolean(state[key]);
    else control.value = state[key];
  });
}

function formatValue(key, value) {
  if (["fontSize", "paragraphSpacing", "contentWidth", "titleSize", "headingSize", "subheadingSize", "minorHeadingSize", "headingSpacingBefore", "headingSpacingAfter", "quoteTitleSize", "cardTitleSize", "dividerMargin", "codeFontSize", "captionSize", "cardRadius", "cardPadding", "imageRadius"].includes(key)) return `${value}px`;
  if (["textIndent", "listIndent"].includes(key)) return `${Number(value).toFixed(2)}em`;
  if (["highlightPadding", "listItemSpacing", "cardBorderWidth", "dividerThickness", "highlightRadius"].includes(key)) return `${value}px`;
  if (["lineHeight", "headingLineHeight", "codeLineHeight"].includes(key)) return Number(value).toFixed(2);
  if (key === "headingWeight") return `${value}`;
  if (key === "letterSpacing") return `${Number(value).toFixed(1)}px`;
  return value;
}

function updateOutputs() {
  document.querySelectorAll("[data-output]").forEach((output) => {
    output.textContent = formatValue(output.dataset.output, state[output.dataset.output]);
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[character]));
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_\n]+)__/g, "<strong>$1</strong>")
    .replace(/==([^=\n]+)==/g, '<mark class="inline-highlight">$1</mark>')
    .replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/gi, '<a class="inline-link" href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br />");
}

function safeImageUrl(value) {
  try {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const url = new URL(raw, window.location.href);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function safeColor(value, fallback) {
  const color = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color : fallback;
}

/** 用淡色代替 opacity，避免公众号校验/暗色模式问题 */
function colorWithAlpha(value, alpha, fallback = "#888888") {
  const hex = safeColor(value, fallback).slice(1);
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const a = Math.min(1, Math.max(0, Number(alpha) || 0));
  return `rgba(${r},${g},${b},${a})`;
}

function hexToRgb(value) {
  const hex = safeColor(value, "#000000").slice(1);
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  ];
}

function relativeLuminance(rgb) {
  const channel = (value) => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = rgb.map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(foreground, background) {
  const light = Math.max(relativeLuminance(hexToRgb(foreground)), relativeLuminance(hexToRgb(background)));
  const dark = Math.min(relativeLuminance(hexToRgb(foreground)), relativeLuminance(hexToRgb(background)));
  return (light + 0.05) / (dark + 0.05);
}

function getComplianceReport() {
  const model = getArticleModel();
  const items = [];
  const page = safeColor(state.pageColor, "#ffffff");
  const text = safeColor(state.textColor, "#333333");
  const highlight = safeColor(state.highlightColor, safeColor(state.accentColor, "#d7fa5c"));
  const highlightText = safeColor(state.highlightTextColor, text);
  const textRatio = contrastRatio(text, page);
  if (textRatio < 3.5) {
    items.push({
      severity: "risk",
      title: `正文与底色对比偏弱（约 ${textRatio.toFixed(1)}:1）`,
      tip: "调深文字或调浅页面底色",
      rule: "#4.1.1",
    });
  }
  if (["background", "marker"].includes(state.highlightStyle || "background")) {
    const highlightRatio = contrastRatio(highlightText, highlight);
    if (highlightRatio < 3) {
      items.push({
        severity: "warn",
        title: `重点字与重点底对比偏弱（约 ${highlightRatio.toFixed(1)}:1）`,
        tip: "调整重点文字色或重点底色",
        rule: "#4.1.1",
      });
    }
  }
  if (relativeLuminance(hexToRgb(page)) < 0.18 || currentMood === "deep") {
    items.push({
      severity: "warn",
      title: "当前偏深色皮肤",
      tip: "可点「暗色预览」看读者夜间观感；平台仍可能自动改色",
      rule: "#4 Dark Mode",
    });
  }
  if (model.blocks.some((block) => block.type === "code")) {
    items.push({
      severity: "warn",
      title: "文中含代码块",
      tip: "粘贴后请核对换行；过长建议改用截图",
      rule: "P1 代码",
    });
  }
  if (model.blocks.some((block) => block.type === "image" && block.url && !isWechatHostedImage(block.url))) {
    items.push({
      severity: "risk",
      title: "含非素材库外链图",
      tip: "先上传公众号素材库，再替换链接",
      rule: "图片域名",
    });
  }
  if (model.blocks.some((block) => block.type === "image" && !block.url)) {
    items.push({
      severity: "warn",
      title: "含配图占位",
      tip: "发布前请在后台换成真实图片",
      rule: "配图",
    });
  }
  const hasRisk = items.some((item) => item.severity === "risk");
  const hasWarn = items.some((item) => item.severity === "warn");
  const level = hasRisk ? "risk" : hasWarn ? "warn" : "ok";
  if (level === "ok") {
    items.push({
      severity: "ok",
      title: "基础硬伤已规避",
      tip: "无自定义字体、固定宽、半透明序号、列表 ul/ol；仍建议本机贴公众号确认",
      rule: "P0/P1",
    });
  }
  const label = level === "ok"
    ? "可贴：基础项已对齐规范"
    : level === "warn"
      ? "可复制，有提醒项"
      : "建议先调整再复制";
  return { level, label, items };
}

function updateCompliancePanel() {
  if (!compliancePanel || !complianceLevel || !complianceList) return;
  const report = getComplianceReport();
  compliancePanel.hidden = false;
  complianceLevel.dataset.level = report.level;
  complianceLevel.textContent = report.label;
  complianceList.innerHTML = report.items.map((item) =>
    `<li><strong>${escapeHtml(item.title)}</strong> — ${escapeHtml(item.tip)} <span class="rule">${escapeHtml(item.rule)}</span></li>`).join("");
}

/** 给带样式的节点加上 data-no-dark，减轻夜间模式改色（仅当前节点生效） */
function applyDataNoDark(html) {
  return String(html || "").replace(/<([a-zA-Z][\w:-]*)(\s[^>]*?)?(\/?)>/g, (full, tag, attrs = "", selfClose = "") => {
    if (/^(br|img|hr)$/i.test(tag)) {
      if (/^img$/i.test(tag) && !/\bdata-no-dark\b/i.test(attrs)) return `<${tag}${attrs} data-no-dark${selfClose}>`;
      return full;
    }
    if (/\bdata-no-dark\b/i.test(attrs)) return full;
    return `<${tag}${attrs} data-no-dark${selfClose}>`;
  });
}

/** 代码块：微信常吞 white-space，改成显式换行与空格 */
function formatCodeForWechat(text) {
  return escapeHtml(String(text || ""))
    .replace(/\t/g, "    ")
    .replace(/ /g, "&nbsp;")
    .replace(/\n/g, "<br>");
}

function isWechatHostedImage(url) {
  try {
    const host = new URL(String(url || "")).hostname;
    return /(^|\.)mmbiz\.qpic\.cn$/i.test(host) || /(^|\.)qlogo\.cn$/i.test(host);
  } catch {
    return false;
  }
}

/** 从预览 DOM 读取已加载图片的原始宽高，供 data-w / data-ratio */
function getCopyImageMeta(url) {
  const target = String(url || "").trim();
  if (!target || !articleBody) return null;
  const images = [...articleBody.querySelectorAll("img")];
  const match = images.find((img) => {
    const src = img.getAttribute("src") || "";
    return src === target || img.currentSrc === target || img.src === target;
  });
  const width = Number(match?.naturalWidth || match?.getAttribute("data-w") || 0);
  const height = Number(match?.naturalHeight || 0);
  if (!width) return null;
  const ratio = height > 0 ? (height / width).toFixed(4) : "";
  return { width: Math.round(width), ratio };
}

function getFontStack(value) {
  const stacks = {
    system: "-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif",
    serif: "'Songti SC','STSong','SimSun',serif",
    modern: "'PingFang SC','Microsoft YaHei',Arial,sans-serif",
  };
  return stacks[value] || stacks.system;
}

function getHeadingSize(level) {
  if (level <= 2) return state.headingSize;
  if (level === 3) return state.subheadingSize;
  return state.minorHeadingSize;
}

function getTemplateParams() {
  return Object.keys(TEMPLATE_DEFAULTS).reduce((params, key) => {
    params[key] = state[key];
    return params;
  }, {});
}

function clampClientNumber(value, min, max, step, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  const clamped = Math.min(max, Math.max(min, numeric));
  return Number((min + Math.round((clamped - min) / step) * step).toFixed(4));
}

function normalizeTemplateParams(input, fallback = getTemplateParams()) {
  const next = { ...fallback };
  const colors = ["textColor", "accentColor", "highlightColor", "highlightTextColor", "cardColor", "quoteColor", "cardTitleColor", "pageColor", "linkColor", "codeBackground", "codeColor", "dividerColor"];
  colors.forEach((key) => { if (input?.[key] !== undefined) next[key] = safeColor(input[key], next[key]); });
  const enums = {
    bodyFont: ["system", "serif", "modern"], headingFont: ["system", "serif", "modern"],
    textAlign: ["left", "justify"], readingDensity: ["compact", "standard", "comfortable", "custom"],
    highlightStyle: ["background", "marker", "underline", "bold"],
    headingStyle: ["bar", "line", "index", "block", "poster", "panel", "oval"],
    cardStyle: ["border", "outline", "soft", "band"],
    listStyle: ["dot", "circle", "ghost", "check"],
    theme: THEME_IDS,
    articleType: ARTICLE_TYPE_IDS.concat(["auto"]),
  };
  Object.entries(enums).forEach(([key, allowed]) => { if (input?.[key] !== undefined && allowed.includes(input[key])) next[key] = input[key]; });
  const ranges = {
    textIndent: [0, 2, .25], fontSize: [14, 22, 1], lineHeight: [1.35, 2.2, .05], letterSpacing: [-.5, 2, .1], paragraphSpacing: [4, 40, 2], contentWidth: [280, 680, 10],
    titleSize: [22, 36, 1], headingSize: [20, 34, 1], subheadingSize: [18, 30, 1], minorHeadingSize: [16, 26, 1], headingWeight: [500, 900, 100], headingLineHeight: [1.1, 1.7, .05], headingSpacingBefore: [8, 48, 2], headingSpacingAfter: [4, 32, 2],
    highlightRadius: [0, 12, 1], highlightPadding: [0, 8, 1], listIndent: [1, 3, .25], listItemSpacing: [0, 20, 1], quoteTitleSize: [10, 18, 1], cardTitleSize: [10, 18, 1], cardBorderWidth: [0, 4, 1], dividerThickness: [1, 4, 1], dividerMargin: [8, 48, 2], codeFontSize: [11, 18, 1], codeLineHeight: [1.2, 2, .1], captionSize: [9, 16, 1], cardRadius: [0, 24, 1], cardPadding: [12, 32, 2], imageRadius: [0, 24, 1],
  };
  Object.entries(ranges).forEach(([key, [min, max, step]]) => { if (input?.[key] !== undefined) next[key] = clampClientNumber(input[key], min, max, step, next[key]); });
  ["linkUnderline", "showQuote", "showDivider", "showImage", "showSignature"].forEach((key) => { if (typeof input?.[key] === "boolean") next[key] = input[key]; });
  ["headingStyle", "cardStyle", "listStyle"].forEach((key) => { if (typeof input?.[key] === "string") next[key] = input[key]; });
  if (typeof input?.mood === "string") next.mood = input.mood;
  if (typeof input?.skin === "string") next.skin = input.skin;
  return next;
}

function applyReadingDensity(density) {
  const densities = {
    compact: { fontSize: 15, lineHeight: 1.58, paragraphSpacing: 12 },
    standard: { fontSize: 16, lineHeight: 1.75, paragraphSpacing: 18 },
    comfortable: { fontSize: 17, lineHeight: 1.92, paragraphSpacing: 24 },
  };
  Object.assign(state, densities[density] || densities.standard, { readingDensity: densities[density] ? density : "standard" });
}

function cleanMarkdown(value) {
  return String(value)
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function htmlToMarkdown(html) {
  const documentFromPaste = new DOMParser().parseFromString(String(html), "text/html");
  documentFromPaste.querySelectorAll("script,style,link,meta,iframe,object,embed,form,input,button,textarea,select,svg,canvas,video,audio").forEach((node) => node.remove());

  const childrenToMarkdown = (node) => Array.from(node.childNodes).map((child) => nodeToMarkdown(child)).join("");
  const nodeText = (node) => cleanMarkdown(node.textContent || "").replace(/\n+/g, " ").trim();
  const listToMarkdown = (node, ordered) => Array.from(node.children)
    .filter((child) => child.tagName?.toLowerCase() === "li")
    .map((item, index) => {
      const copy = item.cloneNode(true);
      Array.from(copy.children).filter((child) => ["ul", "ol"].includes(child.tagName?.toLowerCase())).forEach((child) => child.remove());
      const prefix = ordered ? `${index + 1}. ` : "- ";
      return `${prefix}${nodeText(copy)}`;
    })
    .filter(Boolean)
    .join("\n");

  function nodeToMarkdown(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.nodeValue || "";
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const tag = node.tagName.toLowerCase();
    const content = childrenToMarkdown(node).trim();
    if (/^h[1-6]$/.test(tag)) return `\n\n${"#".repeat(Number(tag.slice(1)))} ${nodeText(node)}\n\n`;
    if (tag === "p") return content ? `\n\n${content}\n\n` : "";
    if (tag === "br") return "\n";
    if (tag === "blockquote") {
      const quote = nodeText(node).split(/\n+/).filter(Boolean).map((line) => `> ${line}`).join("\n");
      return quote ? `\n\n${quote}\n\n` : "";
    }
    if (tag === "ul") return `\n\n${listToMarkdown(node, false)}\n\n`;
    if (tag === "ol") return `\n\n${listToMarkdown(node, true)}\n\n`;
    if (tag === "hr") return "\n\n---\n\n";
    if (tag === "img") {
      const url = safeImageUrl(node.getAttribute("data-src") || node.getAttribute("data-original") || node.getAttribute("src") || "");
      const alt = cleanMarkdown(node.getAttribute("alt") || "文章配图");
      return url ? `\n\n![${alt}](${url})\n\n` : "";
    }
    if (tag === "pre") return `\n\n\`\`\`\n${node.textContent || ""}\n\`\`\`\n\n`;
    if (["section", "article", "main", "figure", "figcaption", "div", "header", "footer"].includes(tag)) return content ? `\n\n${content}\n\n` : "";
    return content;
  }

  return cleanMarkdown(childrenToMarkdown(documentFromPaste.body));
}

function insertMarkdownAtCursor(markdown) {
  if (!articleInput) {
    articleSource = articleSource ? `${articleSource.trim()}\n\n${markdown}` : markdown;
    persistArticleSource();
    render();
    return;
  }
  const start = articleInput.selectionStart;
  const end = articleInput.selectionEnd;
  articleInput.setRangeText(markdown, start, end, "end");
  articleInput.dispatchEvent(new Event("input", { bubbles: true }));
}

function parseArticle(source) {
  const lines = String(source).replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let title = "";
  let paragraphLines = [];
  let listItems = [];
  let listOrdered = false;
  let codeLines = [];
  let codeLanguage = "";
  let inCode = false;
  let fenceKind = "";
  let fenceTitle = "";
  let fenceLines = [];

  const flushParagraph = () => {
    if (paragraphLines.length) {
      const text = paragraphLines.join("\n");
      const paragraphs = paragraphLines.length === 1 && text.length >= 96
        ? splitLongTextLine(text).split(/\n{2,}/).filter(Boolean)
        : [text];
      paragraphs.forEach((paragraph) => blocks.push({ type: "paragraph", text: paragraph }));
      paragraphLines = [];
    }
  };
  const flushList = () => {
    if (listItems.length) {
      blocks.push({ type: "list", items: listItems, ordered: listOrdered });
      listItems = [];
      listOrdered = false;
    }
  };
  const flushCode = () => {
    blocks.push({ type: "code", language: codeLanguage, text: codeLines.join("\n") });
    codeLines = [];
    codeLanguage = "";
  };
  const flushFence = () => {
    if (fenceKind === "card") {
      const text = fenceLines.join("\n").trim();
      if (text) blocks.push({ type: "card", title: fenceTitle || "重点提示", text });
    } else if (fenceKind === "steps") {
      const items = fenceLines.map(parseStepLine).filter(Boolean).slice(0, 40);
      if (items.length) blocks.push({ type: "steps", title: fenceTitle || "操作步骤", items });
    } else if (fenceKind === "stat") {
      const items = fenceLines.map(parseStatLine).filter(Boolean).slice(0, 12);
      if (items.length) blocks.push({ type: "stat", title: fenceTitle || "关键数据", items });
    }
    fenceKind = "";
    fenceTitle = "";
    fenceLines = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      if (inCode) flushCode();
      else {
        flushParagraph();
        flushList();
        codeLanguage = trimmed.slice(3).trim();
      }
      inCode = !inCode;
      return;
    }
    if (inCode) {
      codeLines.push(line);
      return;
    }
    if (fenceKind) {
      if (trimmed === ":::") flushFence();
      else fenceLines.push(line);
      return;
    }
    const fence = trimmed.match(/^:::(card|steps|stat|stats)(?:\s+(.+))?$/i);
    if (fence) {
      flushParagraph();
      flushList();
      const kind = fence[1].toLowerCase();
      fenceKind = kind === "stats" ? "stat" : kind;
      fenceTitle = (fence[2] || "").trim()
        || (fenceKind === "card" ? "重点提示" : fenceKind === "steps" ? "操作步骤" : "关键数据");
      return;
    }
    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      if (level === 1 && !title) title = heading[2];
      else blocks.push({ type: "heading", level, text: heading[2] });
      return;
    }
    const image = trimmed.match(/^!\[([^\]]*)\]\(([^)\s]*)(?:\s+"[^"]*")?\)$/);
    if (image) {
      flushParagraph();
      flushList();
      blocks.push({ type: "image", alt: image[1] || "文章配图", url: safeImageUrl(image[2]) });
      return;
    }
    if (/^(---+|\*\*\*+)$/.test(trimmed)) {
      flushParagraph();
      flushList();
      blocks.push({ type: "divider" });
      return;
    }
    const list = trimmed.match(/^([-*+]|\d+[.)])\s+(.+)$/);
    if (list) {
      flushParagraph();
      const ordered = /^\d/.test(list[1]);
      if (listItems.length && ordered !== listOrdered) flushList();
      listOrdered = ordered;
      listItems.push(list[2]);
      return;
    }
    if (/^>\s?/.test(trimmed)) {
      flushParagraph();
      flushList();
      const quoteText = trimmed.replace(/^>\s?/, "");
      const labeledQuote = quoteText.match(/^\*\*([^*\n]+)\*\*[：:]\s*(.+)$/);
      blocks.push({ type: "quote", title: labeledQuote?.[1] || "引用", text: labeledQuote?.[2] || quoteText });
      return;
    }
    flushList();
    paragraphLines.push(line);
  });

  if (inCode) flushCode();
  if (fenceKind) flushFence();
  flushParagraph();
  flushList();
  return { title, hasExplicitTitle: Boolean(title), blocks };
}

const STRUCTURE_TYPE_OPTIONS = [
  ["paragraph", "正文"],
  ["lead", "开场引言"],
  ["heading", "章节标题"],
  ["quote", "重点引用"],
  ["card", "内容卡片"],
  ["divider", "内容分隔"],
];

function applyStructureOverrides(parsed) {
  const blocks = parsed.blocks.map((block, index) => {
    const requestedType = blockTypeOverrides[index] ?? blockTypeOverrides[String(index)];
    let next = block;
    if (requestedType && requestedType !== block.type) {
      if (STRUCTURE_TYPE_OPTIONS.some(([type]) => type === requestedType)) {
        if (requestedType === "divider") {
          next = { type: "divider" };
        } else if (["paragraph", "lead", "heading", "quote", "card"].includes(block.type)) {
          if (requestedType === "heading") next = { ...block, type: "heading", level: 2 };
          else if (requestedType === "quote") next = { ...block, type: "quote", title: block.title || "重点提示" };
          else if (requestedType === "card") next = { ...block, type: "card", title: block.title || "重点提示" };
          else next = { ...block, type: requestedType };
        }
      }
    }
    return { ...next, sourceIndex: index };
  });
  return { ...parsed, blocks };
}

function inferTitleFromFirstBlock(parsed) {
  const firstBlock = parsed.blocks[0];
  if (!inferFirstLineTitle || parsed.hasExplicitTitle || !firstBlock || !["paragraph", "lead"].includes(firstBlock.type)) {
    return { title: "", blocks: parsed.blocks, inferred: false };
  }
  const candidate = String(firstBlock.text || "").replace(/\s+/g, " ").trim();
  const looksLikeTitle = candidate.length >= 4
    && candidate.length <= 44
    && !/[。！？!?；;]$/.test(candidate)
    && parsed.blocks.length >= 2;
  if (!looksLikeTitle) return { title: "", blocks: parsed.blocks, inferred: false };
  return { title: candidate, blocks: parsed.blocks.slice(1), inferred: true };
}

function getBlockText(block) {
  if (block.type === "list" || block.type === "steps") return (block.items || []).join("；");
  if (block.type === "stat") {
    return (block.items || []).map((item) => `${item.value || ""}${item.label ? ` ${item.label}` : ""}`).join("；");
  }
  if (block.type === "image") return block.alt || "文章配图";
  if (block.type === "code") return block.text;
  return block.text || "内容分隔线";
}

function parseStatLine(line) {
  const text = String(line || "").trim()
    .replace(/^[-*+]\s+/, "")
    .replace(/^\d+[.)]\s+/, "");
  if (!text) return null;
  const parts = text.split(/\s*[|｜／/]\s+/);
  if (parts.length >= 2) {
    return { value: parts[0].trim(), label: parts.slice(1).join(" ").trim() };
  }
  const dash = text.split(/\s+[—–-]\s+/);
  if (dash.length >= 2) {
    return { value: dash[0].trim(), label: dash.slice(1).join(" ").trim() };
  }
  const spaced = text.match(/^(\S+)\s+(.+)$/);
  if (spaced) return { value: spaced[1], label: spaced[2] };
  return { value: text, label: "" };
}

function parseStepLine(line) {
  return String(line || "").trim()
    .replace(/^[-*+]\s+/, "")
    .replace(/^\d+[.)]\s+/, "")
    .trim();
}

function renderStructureEditor() {
  return;
}

function getArticleModel() {
  if (!articleSource.trim()) {
    return {
      title: "把一篇好文章，排成读者愿意读完的样子",
      subtitle: "参数可调、结构可解释、复制可继续编辑",
      blocks: applyStructureOverrides({ blocks: sampleContent }).blocks,
      isSample: true,
    };
  }
  const parsed = applyStructureOverrides(parseArticle(articleSource));
  const inferred = articleTitleOverride.trim()
    ? { title: "", blocks: parsed.blocks, inferred: false }
    : inferTitleFromFirstBlock(parsed);
  const selectedLabel = `${MOODS[currentMood].label} · ${SKINS[currentSkin].label}`;
  return {
    ...parsed,
    title: articleTitleOverride.trim() || parsed.title || inferred.title || "你的文章预览",
    subtitle: `Yooco · ${selectedLabel}${inferred.inferred ? " · 已识别首行标题" : ""}`,
    blocks: inferred.blocks,
    isSample: false,
  };
}

function blockIndexAttr(item, index) {
  const sourceIndex = item.sourceIndex ?? index;
  return `data-block-index="${sourceIndex}"`;
}

/** 标题可写成「中文 | ENGLISH」，供叠号双语 / 序号黑卡使用 */
function splitHeadingCaption(text) {
  const raw = String(text || "").replace(/\s+/g, " ").trim();
  const paired = raw.match(/^(.+?)\s*[|｜/／]\s*([A-Za-z][A-Za-z0-9 ._-]{1,40})$/);
  if (paired) {
    return {
      title: paired[1].replace(/#+\s*$/, "").trim(),
      sub: paired[2].trim().toUpperCase(),
    };
  }
  return {
    title: raw.replace(/#+\s*$/, "").trim(),
    sub: "",
  };
}

function renderHeadingBlock(item, index, editable) {
  const level = Math.min(6, Math.max(2, Number(item.level) || 2));
  const idx = blockIndexAttr(item, index);
  const kind = state.headingStyle || "bar";
  const parts = splitHeadingCaption(item.text);
  const sub = parts.sub || "SECTION";
  const subAttr = ` data-sub="${escapeHtml(sub)}"`;

  if (level === 2 && kind === "poster") {
    const shown = `${parts.title}${parts.title.endsWith("#") ? "" : "#"}`;
    return `<h3 class="section-title level-2" data-type="heading" data-level="2" ${idx}${subAttr} contenteditable="${editable}">${inlineMarkdown(shown)}</h3>`;
  }
  if (level === 2 && kind === "panel") {
    return `<h3 class="section-title level-2 heading-panel" data-type="heading" data-level="2" ${idx}${subAttr} contenteditable="false"><span class="heading-panel-body"><span class="heading-panel-main" contenteditable="${editable}">${inlineMarkdown(parts.title)}</span><span class="heading-panel-sub" contenteditable="${editable}">${escapeHtml(sub)}</span></span></h3>`;
  }
  if (level === 2 && kind === "oval") {
    return `<h3 class="section-title level-2 heading-oval" data-type="heading" data-level="2" ${idx} contenteditable="false"><span class="heading-oval-badge" aria-hidden="true"><span class="heading-oval-num"></span></span><span class="heading-oval-text" contenteditable="${editable}">${inlineMarkdown(parts.title)}</span></h3>`;
  }
  return `<h3 class="section-title level-${level}" data-type="heading" data-level="${level}" ${idx} contenteditable="${editable}">${inlineMarkdown(item.text)}</h3>`;
}

function renderBody() {
  const model = getArticleModel();
  const editable = "true";
  const parts = model.blocks.map((item, index) => {
    const idx = blockIndexAttr(item, index);
    if (item.type === "lead") return `<p class="lead" data-type="lead" ${idx} contenteditable="${editable}">${inlineMarkdown(item.text)}</p>`;
    if (item.type === "highlight" && state.styleVariant === "deep-night") return `<p class="highlight-line" data-type="highlight" ${idx} contenteditable="${editable}"><mark>${item.text}</mark></p>`;
    if (item.type === "heading") return renderHeadingBlock(item, index, editable);
    if (item.type === "quote") {
      if (state.showQuote) return `<aside class="quote-card" data-type="quote" ${idx} contenteditable="${editable}"><strong>${escapeHtml(item.title || "引用")}</strong>${inlineMarkdown(item.text)}</aside>`;
      return `<p class="plain-quote" data-type="quote" ${idx} contenteditable="${editable}">${inlineMarkdown(item.text)}</p>`;
    }
    if (item.type === "card") return `<aside class="content-card" data-type="card" ${idx} contenteditable="${editable}"><strong>${escapeHtml(item.title || "重点提示")}</strong>${inlineMarkdown(item.text)}</aside>`;
    if (item.type === "steps") {
      const title = escapeHtml(item.title || "操作步骤");
      const rows = (item.items || []).map((entry, stepIndex) =>
        `<p class="steps-item" data-step="${stepIndex + 1}" contenteditable="${editable}"><span class="steps-index" contenteditable="false">${String(stepIndex + 1).padStart(2, "0")}</span><span class="steps-text">${inlineMarkdown(entry)}</span></p>`).join("");
      return `<section class="steps-block" data-type="steps" ${idx}><strong contenteditable="${editable}">${title}</strong><div class="steps-items">${rows}</div></section>`;
    }
    if (item.type === "stat") {
      const title = escapeHtml(item.title || "关键数据");
      const cells = (item.items || []).map((entry) =>
        `<div class="stat-item"><b contenteditable="${editable}">${escapeHtml(entry.value || "")}</b><span contenteditable="${editable}">${escapeHtml(entry.label || "")}</span></div>`).join("");
      return `<section class="stat-block" data-type="stat" ${idx}><strong contenteditable="${editable}">${title}</strong><div class="stat-grid">${cells}</div></section>`;
    }
    if (item.type === "divider" && state.showDivider) return `<hr class="article-divider" data-type="divider" ${idx} />`;
    if (item.type === "image") {
      if (item.url) return `<figure class="article-image" data-type="image" data-url="${escapeHtml(item.url)}" ${idx}><img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.alt)}" loading="lazy" /><figcaption contenteditable="${editable}">${escapeHtml(item.alt || "文章配图")}</figcaption></figure>`;
      if (state.showImage) return `<div class="fake-image" data-type="image" role="img" aria-label="文章配图占位" ${idx} contenteditable="${editable}">${escapeHtml(item.alt || "文章配图占位")}</div>`;
      return `<p class="image-note" data-type="image" ${idx} contenteditable="${editable}">[图片：${escapeHtml(item.alt || "文章配图")}]</p>`;
    }
    if (item.type === "list") {
      const listTag = item.ordered ? "ol" : "ul";
      return `<${listTag} class="article-list" data-type="list" data-ordered="${item.ordered ? "true" : "false"}" ${idx}>${item.items.map((entry) => `<li contenteditable="${editable}">${inlineMarkdown(entry)}</li>`).join("")}</${listTag}>`;
    }
    if (item.type === "code") return `<pre class="article-code" data-type="code" data-language="${escapeHtml(item.language || "code")}" ${idx}><code contenteditable="${editable}">${escapeHtml(item.text)}</code></pre>`;
    if (item.type === "paragraph") return `<p data-type="paragraph" ${idx} contenteditable="${editable}">${inlineMarkdown(item.text)}</p>`;
    return "";
  });
  // 精选主题：自动目录（取前 3 个二级标题，纯导航，不写回原文）。
  if (isTheme()) {
    const tocItems = model.blocks
      .filter((block) => block.type === "heading" && Number(block.level || 2) === 2)
      .slice(0, 3);
    if (tocItems.length >= 2) {
      const tocHtml = `<section class="toc-card" data-type="toc" contenteditable="false"><p class="toc-title">本文脉络</p><div class="toc-list">${tocItems.map((block, tocIndex) =>
        `<p><b>${String(tocIndex + 1).padStart(2, "0")}</b><span>${escapeHtml(block.text)}</span></p>`).join("")}</div></section>`;
      const leadIndex = parts.findIndex((html) => html.startsWith('<p class="lead"'));
      parts.splice(leadIndex >= 0 ? leadIndex + 1 : 0, 0, tocHtml);
    }
    // 可选结尾签名区（默认关；内容可编辑，但不写回原文）。
    if (state.showSignature) {
      parts.push(`<section class="signature-card" data-type="signature" contenteditable="true"><p class="signature-name">—— {{作者名}}（替换为你的署名）</p><p>如果今天这篇有收获，欢迎点赞、在看、转发，我们下篇见。</p></section>`);
    }
  }
  articleBody.innerHTML = parts.join("");
  articleTitle.contentEditable = "true";
  if (articleSubtitle) articleSubtitle.textContent = model.subtitle;
}

function serializePreviewToMarkdown() {
  const htmlToMd = (node) => {
    const clone = node.cloneNode(true);
    clone.querySelectorAll("strong").forEach((el) => { el.replaceWith(`**${el.textContent}**`); });
    clone.querySelectorAll("mark").forEach((el) => { el.replaceWith(`==${el.textContent}==`); });
    clone.querySelectorAll("a").forEach((el) => { el.replaceWith(`[${el.textContent}](${el.getAttribute("href") || ""})`); });
    clone.querySelectorAll("code").forEach((el) => { el.replaceWith(`\`${el.textContent}\``); });
    clone.querySelectorAll("em").forEach((el) => { el.replaceWith(`*${el.textContent}*`); });
    clone.querySelectorAll("br").forEach((el) => { el.replaceWith("\n"); });
    return (clone.textContent || "").replace(/\u00a0/g, " ").trim();
  };
  const parts = [];
  [...articleBody.children].forEach((el) => {
    const type = el.dataset.type || "";
    // 目录与签名是精选主题的派生装饰，不写回原文。
    if (type === "toc" || type === "signature") return;
    if (type === "heading") {
      const level = Math.min(6, Math.max(2, Number(el.dataset.level) || 2));
      const main = el.querySelector(".heading-panel-main, .heading-oval-text");
      const sub = el.querySelector(".heading-panel-sub");
      let text;
      if (main) {
        text = htmlToMd(main);
        const subText = (sub ? htmlToMd(sub) : "").trim();
        if (subText) text = `${text} | ${subText}`;
      } else {
        text = htmlToMd(el).replace(/#+\s*$/, "").trim();
        const dataSub = (el.getAttribute("data-sub") || "").trim();
        if (dataSub && dataSub !== "SECTION" && state.headingStyle === "poster") {
          text = `${text} | ${dataSub}`;
        }
      }
      parts.push(`${"#".repeat(level)} ${text}`);
      return;
    }
    if (type === "quote") {
      const title = el.querySelector("strong")?.textContent.trim() || "引用";
      const clone = el.cloneNode(true);
      clone.querySelector("strong")?.remove();
      parts.push(`> **${title}**：${htmlToMd(clone)}`);
      return;
    }
    if (type === "card") {
      const title = el.querySelector("strong")?.textContent.trim() || "重点提示";
      const clone = el.cloneNode(true);
      clone.querySelector("strong")?.remove();
      parts.push(`:::card ${title}\n${htmlToMd(clone)}\n:::`);
      return;
    }
    if (type === "steps") {
      const title = el.querySelector(":scope > strong")?.textContent.trim() || "操作步骤";
      const items = [...el.querySelectorAll(".steps-item")].map((node) => {
        const textNode = node.querySelector(".steps-text");
        return htmlToMd(textNode || node);
      }).filter(Boolean);
      if (items.length) parts.push(`:::steps ${title}\n${items.map((item, index) => `${index + 1}. ${item}`).join("\n")}\n:::`);
      return;
    }
    if (type === "stat") {
      const title = el.querySelector(":scope > strong")?.textContent.trim() || "关键数据";
      const items = [...el.querySelectorAll(".stat-item")].map((node) => {
        const value = node.querySelector("b")?.textContent.trim() || "";
        const label = node.querySelector("span")?.textContent.trim() || "";
        return label ? `${value} | ${label}` : value;
      }).filter(Boolean);
      if (items.length) parts.push(`:::stat ${title}\n${items.join("\n")}\n:::`);
      return;
    }
    if (type === "divider") {
      parts.push("---");
      return;
    }
    if (type === "image") {
      const alt = el.querySelector("figcaption")?.textContent.trim() || htmlToMd(el).replace(/^\[图片：|\]$/g, "") || "文章配图";
      const url = el.dataset.url || el.querySelector("img")?.getAttribute("src") || "";
      parts.push(url ? `![${alt}](${url})` : `![${alt}]()`);
      return;
    }
    if (type === "list") {
      const ordered = el.dataset.ordered === "true" || el.tagName === "OL";
      const items = [...el.querySelectorAll("li")].map((item, index) => `${ordered ? `${index + 1}.` : "-"} ${htmlToMd(item)}`);
      if (items.length) parts.push(items.join("\n"));
      return;
    }
    if (type === "code") {
      const language = el.dataset.language || "";
      parts.push(`\`\`\`${language}\n${el.innerText.trim()}\n\`\`\``);
      return;
    }
    const text = htmlToMd(el);
    if (text) parts.push(text);
  });
  return parts.join("\n\n").trim();
}

function syncPreviewEdits() {
  articleTitleOverride = (articleTitle?.innerText || "").trim();
  const markdown = serializePreviewToMarkdown();
  articleSource = markdown;
  if (articleInput && document.activeElement !== articleInput) articleInput.value = markdown;
  persistArticleSource();
  setStatus("已在预览中修改文字");
}

function applyStyleVars() {
  articlePage.dataset.style = state.styleVariant || "standard";
  articlePage.style.setProperty("--text-color", state.textColor);
  articlePage.style.setProperty("--accent-color", state.accentColor);
  articlePage.style.setProperty("--card-color", state.cardColor);
  articlePage.style.setProperty("--quote-color", state.quoteColor || state.cardColor);
  articlePage.style.setProperty("--card-title-color", state.cardTitleColor || state.accentColor);
  articlePage.style.setProperty("--highlight-text-color", state.highlightTextColor || state.textColor);
  articlePage.style.setProperty("--link-color", state.linkColor || state.accentColor);
  articlePage.style.setProperty("--code-background", state.codeBackground || state.cardColor);
  articlePage.style.setProperty("--code-color", state.codeColor || state.textColor);
  articlePage.style.setProperty("--divider-color", state.dividerColor || state.accentColor);
  articlePage.style.setProperty("--muted-color", state.mutedColor || "#8e9389");
  articlePage.style.setProperty("--title-color", state.titleColor || state.textColor);
  articlePage.style.setProperty("--border-color", state.borderColor || "#dedfd8");
  articlePage.style.setProperty("--highlight-color", state.highlightColor || state.accentColor);
  articlePage.style.setProperty("--body-font", getFontStack(state.bodyFont));
  articlePage.style.setProperty("--heading-font", getFontStack(state.headingFont));
  articlePage.style.setProperty("--page-color", state.pageColor);
  articlePage.style.setProperty("--font-size", `${state.fontSize}px`);
  articlePage.style.setProperty("--line-height", state.lineHeight);
  articlePage.style.setProperty("--letter-spacing", `${state.letterSpacing}px`);
  articlePage.style.setProperty("--paragraph-spacing", `${state.paragraphSpacing}px`);
  articlePage.style.setProperty("--text-align", state.textAlign || "left");
  articlePage.style.setProperty("--text-indent", `${state.textIndent}em`);
  articlePage.style.setProperty("--title-size", `${state.titleSize}px`);
  articlePage.style.setProperty("--heading-size", `${state.headingSize}px`);
  articlePage.style.setProperty("--subheading-size", `${state.subheadingSize}px`);
  articlePage.style.setProperty("--minor-heading-size", `${state.minorHeadingSize}px`);
  articlePage.style.setProperty("--heading-weight", state.headingWeight);
  articlePage.style.setProperty("--heading-line-height", state.headingLineHeight);
  articlePage.style.setProperty("--heading-before", `${state.headingSpacingBefore}px`);
  articlePage.style.setProperty("--heading-after", `${state.headingSpacingAfter}px`);
  articlePage.style.setProperty("--highlight-radius", `${state.highlightRadius}px`);
  articlePage.style.setProperty("--highlight-padding", `${state.highlightPadding}px`);
  articlePage.style.setProperty("--list-indent", `${state.listIndent}em`);
  articlePage.style.setProperty("--list-item-spacing", `${state.listItemSpacing}px`);
  articlePage.style.setProperty("--quote-title-size", `${state.quoteTitleSize}px`);
  articlePage.style.setProperty("--card-title-size", `${state.cardTitleSize}px`);
  articlePage.style.setProperty("--card-border-width", `${state.cardBorderWidth}px`);
  articlePage.style.setProperty("--divider-thickness", `${state.dividerThickness}px`);
  articlePage.style.setProperty("--divider-margin", `${state.dividerMargin}px`);
  articlePage.style.setProperty("--code-font-size", `${state.codeFontSize}px`);
  articlePage.style.setProperty("--code-line-height", state.codeLineHeight);
  articlePage.style.setProperty("--caption-size", `${state.captionSize}px`);
  articlePage.dataset.highlightStyle = state.highlightStyle || "background";
  articlePage.dataset.linkUnderline = String(Boolean(state.linkUnderline));
  articlePage.style.setProperty("--card-radius", `${state.cardRadius}px`);
  articlePage.style.setProperty("--card-padding", `${state.cardPadding}px`);
  articlePage.style.setProperty("--image-radius", `${state.imageRadius}px`);
  articlePage.style.setProperty("--content-width", `${state.contentWidth}px`);
  articlePage.dataset.headingStyle = state.headingStyle || "bar";
  articlePage.dataset.cardStyle = state.cardStyle || "border";
  articlePage.dataset.listStyle = state.listStyle || "dot";
  if (isTheme()) articlePage.dataset.theme = state.theme;
  else delete articlePage.dataset.theme;
  articlePage.style.backgroundColor = state.pageColor;
  articleBody.style.maxWidth = `${state.contentWidth}px`;
  updateOutputs();
  if (previewSummary) previewSummary.textContent = `正文 ${state.fontSize}px · 行高 ${Number(state.lineHeight).toFixed(2)} · 段距 ${state.paragraphSpacing}px`;
  updateCompliancePanel();
  const currentTemplate = { type: "universal", name: isTheme()
    ? `精选主题 · ${THEMES[state.theme].label}`
    : `${MOODS[currentMood].label} · ${SKINS[currentSkin].label}`, params: getTemplateParams() };
  if (tokenPreview) tokenPreview.textContent = JSON.stringify(lastAiResult ? { ...lastAiResult, template: { ...lastAiResult.template, ...currentTemplate } } : { version: 2, template: currentTemplate }, null, 2);
  localStorage.setItem("wechat-style-lab-config", JSON.stringify(state));
  localStorage.setItem("yooco-style-mood", JSON.stringify({ mood: currentMood, skin: currentSkin }));
}

function render(options = {}) {
  applyStyleVars();
  if (options.body !== false) {
    renderBody();
    renderStructureEditor();
  }
}

function applyMarksToMarkdown(text, marks) {
  let output = String(text || "").trim();
  if (!Array.isArray(marks)) return output;
  marks.forEach((mark) => {
    if (!mark?.text || !["bold", "highlight"].includes(mark.type)) return;
    const index = output.indexOf(mark.text);
    if (index < 0) return;
    const formatted = mark.type === "bold" ? `**${mark.text}**` : `==${mark.text}==`;
    output = `${output.slice(0, index)}${formatted}${output.slice(index + mark.text.length)}`;
  });
  return output;
}

function structuredDocumentToMarkdown(document) {
  if (!document || !Array.isArray(document.blocks)) return "";
  const lines = [];
  const title = String(document.title || "").trim();
  if (title) lines.push(`# ${title}`);
  document.blocks.forEach((block) => {
    const type = block?.type;
    if (type === "divider") {
      lines.push("---");
      return;
    }
    if (type === "image") {
      const url = safeImageUrl(block.url);
      const alt = String(block.alt || block.placementHint || "文章配图").replace(/[\[\]]/g, "");
      lines.push(`![${alt}](${url})`);
      return;
    }
    if (type === "list" && Array.isArray(block.items)) {
      const prefix = block.ordered ? (index) => `${index + 1}. ` : () => "- ";
      const list = block.items.map((item, index) => `${prefix(index)}${String(item || "").trim()}`).filter(Boolean);
      if (list.length) lines.push(list.join("\n"));
      return;
    }
    if (type === "steps" && Array.isArray(block.items)) {
      const items = block.items.map((item) => String(item || "").trim()).filter(Boolean);
      if (items.length) {
        lines.push(`:::steps ${String(block.title || "操作步骤").trim()}\n${items.map((item, index) => `${index + 1}. ${item}`).join("\n")}\n:::`);
      }
      return;
    }
    if (type === "stat" && Array.isArray(block.items)) {
      const items = block.items.map((item) => {
        if (item && typeof item === "object") {
          const value = String(item.value || "").trim();
          const label = String(item.label || "").trim();
          return label ? `${value} | ${label}` : value;
        }
        return String(item || "").trim();
      }).filter(Boolean);
      if (items.length) lines.push(`:::stat ${String(block.title || "关键数据").trim()}\n${items.join("\n")}\n:::`);
      return;
    }
    const text = applyMarksToMarkdown(block?.text, block?.marks);
    if (!text) return;
    if (type === "heading") {
      const level = Math.min(6, Math.max(2, Number(block.level) || 2));
      lines.push(`${"#".repeat(level)} ${text}`);
    } else if (type === "quote") {
      const quoteTitle = String(block.title || "引用").trim();
      lines.push(`> **${quoteTitle}**：${text}`);
    } else if (type === "card") {
      lines.push(`:::card ${String(block.title || "重点提示").trim()}\n${text}\n:::`);
    } else if (type === "code") {
      lines.push(`\`\`\`${String(block.language || "").trim()}\n${block.text}\n\`\`\``);
    } else {
      lines.push(text);
    }
  });
  return lines.join("\n\n").trim();
}

const AI_PARAMETER_KEYS = Object.keys(TEMPLATE_DEFAULTS);

function applyAiNormalization(data) {
  const markdown = structuredDocumentToMarkdown(data?.document);
  if (!markdown) throw new Error("DeepSeek 没有返回可编辑的文章内容，请重试。");
  const aiParams = normalizeTemplateParams(data?.template?.params || data?.params || {});
  // 用户手动调过样式后，AI 只重排文字结构，不再覆盖基调。
  if (!styleTouched) {
    const aiTheme = THEMES[aiParams.theme] ? aiParams.theme : "";
    if (aiTheme) {
      // 精选主题：以注册表的整套设计变量为准，AI 只决定主题与文章类型。
      Object.assign(state, buildThemeState(aiTheme));
      if (aiParams.articleType && aiParams.articleType !== "auto") state.articleType = aiParams.articleType;
    } else {
      state.theme = "classic";
      const aiMood = MOODS[aiParams.mood] ? aiParams.mood : "";
      const aiSkin = SKINS[aiParams.skin] ? aiParams.skin : (aiMood ? MOODS[aiMood].skins[0] : "");
      if (aiSkin) {
        currentSkin = aiSkin;
        currentMood = skinMood(aiSkin);
        Object.assign(state, buildSkinState(aiSkin));
      }
      AI_PARAMETER_KEYS.forEach((key) => {
        if (aiParams[key] !== undefined) state[key] = aiParams[key];
      });
      state.theme = "classic";
      // 深色皮肤需要 styleVariant 切换（深底浅字的一整套 CSS 覆盖）。
      state.styleVariant = SKINS[currentSkin]?.styleVariant || "standard";
      state.mutedColor = SKINS[currentSkin]?.mutedColor || state.mutedColor;
      state.titleColor = SKINS[currentSkin]?.titleColor || state.textColor;
      state.borderColor = SKINS[currentSkin]?.borderColor || "#dedfd8";
    }
    syncMoodUI();
  }
  articleTitleOverride = "";
  blockTypeOverrides = {};
  lastAiResult = data;
  if (articleInput) articleInput.value = markdown;
  else articleSource = markdown;
  syncControls();
  applyArticleSource(false);
  const blockCountFromAi = data.document.blocks.length;
  setStatus(styleTouched
    ? `已优化：${blockCountFromAi} 个内容块（保留你调过的样式），可在预览里直接改字`
    : isTheme()
      ? `已优化：${blockCountFromAi} 个内容块，主题为「${THEMES[state.theme].label}」，可在预览里直接改字`
      : `已优化：${blockCountFromAi} 个内容块，基调为「${MOODS[currentMood].label}」，可在预览里直接改字`);
  setFeedback(styleTouched ? "文字已重新排版，样式保持你的手动调整。" : "下方预览已更新为优化后的排版。");
}

async function normalizeWithDeepSeek() {
  const source = (articleInput ? articleInput.value : articleSource).trim();
  if (!source) {
    setFeedback("请先从首页粘贴文章，或在预览里编辑文字。");
    return;
  }
  const originalLabel = aiNormalizeButton ? aiNormalizeButton.textContent : "";
  if (aiNormalizeButton) {
    aiNormalizeButton.disabled = true;
    aiNormalizeButton.textContent = "优化中…";
  }
  setStatus("正在优化排版…");
  if (articleInput) applyArticleSource(false);
  else {
    trimInvalidOverrides();
    persistArticleSource();
    render();
  }
  try {
    const response = await fetch("/api/normalize", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ source }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.ok) {
      const message = payload?.error?.message || "暂时无法完成优化，请稍后重试。";
      if (response.status === 429) {
        setStatus("本次未调用 AI。");
        setFeedback(message);
        return;
      }
      throw new Error(message);
    }
    applyAiNormalization(payload.data);
  } catch (error) {
    setStatus("已套用本地排版。优化未完成，仍可在预览里改字。");
    setFeedback(error instanceof Error ? error.message : "暂时无法完成优化，请稍后重试。");
  } finally {
    if (aiNormalizeButton) {
      aiNormalizeButton.disabled = false;
      aiNormalizeButton.textContent = originalLabel;
    }
  }
}

function buildCopyHtml() {
  const isDeepNight = state.styleVariant === "deep-night";
  const mutedColor = state.mutedColor || "#8e9389";
  const titleColor = state.titleColor || state.textColor;
  const highlightColor = safeColor(state.highlightColor, safeColor(state.accentColor, "#d7fa5c"));
  const highlightTextColor = safeColor(state.highlightTextColor, state.textColor);
  const highlightStyle = state.highlightStyle || "background";
  const codeBackground = isDeepNight ? "#202727" : state.codeBackground;
  const codeColor = isDeepNight ? "#d7e0f2" : state.codeColor;
  const highlightCss = highlightStyle === "underline"
    ? `padding:0;background-color:transparent;color:${highlightTextColor};font-weight:700;border-bottom:3px solid ${highlightColor};`
    : highlightStyle === "bold"
      ? `padding:0;background-color:transparent;color:${highlightTextColor};font-weight:800;`
      : `padding:0 ${state.highlightPadding}px;border-radius:${state.highlightRadius}px;background-color:${highlightColor};color:${highlightTextColor};font-weight:700;`;
  const linkCss = `color:${state.linkColor};${state.linkUnderline ? "text-decoration:underline;" : "text-decoration:none;"}`;
  const inlineCodeCss = `padding:0 .28em;border-radius:4px;background-color:${codeBackground};color:${codeColor};font-size:${state.codeFontSize}px;`;
  const copyInlineMarkdown = (value) => inlineMarkdown(value).replace(
    /<mark class="inline-highlight">([\s\S]*?)<\/mark>/g,
    `<span style="${highlightCss}">$1</span>`,
  ).replace(
    /<a class="inline-link" href="([^"]+)" target="_blank" rel="noreferrer">([\s\S]*?)<\/a>/g,
    `<a href="$1" style="${linkCss}" target="_blank">$2</a>`,
  ).replace(
    /<code class="inline-code">([\s\S]*?)<\/code>/g,
    `<code style="${inlineCodeCss}">$1</code>`,
  );
  const model = getArticleModel();
  const headingKind = state.headingStyle || "bar";
  const cardKind = state.cardStyle || "border";
  const listKind = state.listStyle || "dot";
  let sectionCounter = 0;
  // 复制 HTML 按公众号规范：不写 font-family；宽度用 100%；不用 opacity / 过小行高藏分隔线
  const softAccent = colorWithAlpha(state.accentColor, 0.55);
  const ghostAccent = colorWithAlpha(state.accentColor, 0.38);
  const textStyle = `margin:0 0 ${state.paragraphSpacing}px;color:${state.textColor};font-size:${state.fontSize}px;line-height:${state.lineHeight};letter-spacing:${state.letterSpacing}px;text-align:${state.textAlign};text-indent:${state.textIndent}em;`;
  const headingStyle = (level) => {
    const size = getHeadingSize(level);
    const base = `margin:${state.headingSpacingBefore}px 0 ${state.headingSpacingAfter}px;color:${state.textColor};font-size:${size}px;line-height:${state.headingLineHeight};font-weight:${state.headingWeight};letter-spacing:-.04em;${isDeepNight ? "font-style:italic;" : ""}`;
    if (headingKind === "line") return `${base}padding-bottom:10px;border-bottom:1px solid ${state.accentColor};`;
    if (headingKind === "block" && level === 2) return `${base}display:inline-block;padding:6px 14px;border-radius:8px;background-color:${state.accentColor};color:${state.pageColor};`;
    if (headingKind === "index" && level === 2) return `${base}`;
    if (headingKind === "poster" && level === 2) return `${base}padding:0;border:0;`;
    if (headingKind === "panel" && level === 2) return `${base}padding:0;border:0;`;
    if (headingKind === "oval" && level === 2) return `${base}padding:0;border:0;text-align:center;`;
    return `${base}padding-left:12px;border-left:4px solid ${state.accentColor};`;
  };
  const headingPrefix = (level) => {
    if (level !== 2) return "";
    if (headingKind === "index" || headingKind === "poster" || headingKind === "panel" || headingKind === "oval") {
      sectionCounter += 1;
      const num = String(sectionCounter).padStart(2, "0");
      if (headingKind === "index") {
        return `<span style="display:inline-block;margin-right:12px;color:${softAccent};font-size:1.35em;font-weight:${state.headingWeight};">${num}</span>`;
      }
      if (headingKind === "poster") {
        return `<span style="display:block;margin:0 0 6px;color:${state.textColor};font-size:1.75em;font-weight:800;line-height:1;letter-spacing:0;">${num}</span>`;
      }
      if (headingKind === "panel") {
        return `<span style="display:inline-block;margin-right:14px;color:${state.textColor};font-size:2.2em;font-weight:900;line-height:1;vertical-align:middle;">${num}</span>`;
      }
      if (headingKind === "oval") {
        return `<span style="display:inline-block;margin:0 auto 10px;padding:10px 18px;border-radius:999px;background-color:#ffe566;box-shadow:3px 2px 0 ${state.textColor};color:${state.textColor};font-size:1.45em;font-weight:900;line-height:1;transform:rotate(-12deg);">${num}</span><br/>`;
      }
    }
    return "";
  };
  const cardBoxStyle = (kind, bgColor) => {
    const base = `margin:18px 0 22px;color:${state.textColor};font-size:${Math.max(12, state.fontSize - 1)}px;line-height:${state.lineHeight};`;
    if (kind === "outline") return `${base}padding:${state.cardPadding}px;border:${state.cardBorderWidth}px solid ${state.accentColor};border-radius:${state.cardRadius}px;background-color:transparent;`;
    if (kind === "soft") return `${base}padding:${state.cardPadding}px;border:0;border-radius:${state.cardRadius}px;background-color:${bgColor};`;
    if (kind === "band") return `${base}padding:0 0 ${state.cardPadding}px;border:0;border-radius:${state.cardRadius}px;overflow:hidden;background-color:${bgColor};`;
    return `${base}padding:${state.cardPadding}px;border:0;border-left:${Math.max(3, state.cardBorderWidth + 2)}px solid ${state.accentColor};border-radius:0 ${state.cardRadius}px ${state.cardRadius}px 0;background-color:${bgColor};`;
  };
  const cardTitleStyle = (kind, size) => {
    if (kind === "band") return `display:block;margin:0 0 12px;padding:10px ${state.cardPadding}px;background-color:${state.accentColor};color:${state.pageColor};font-size:${size}px;letter-spacing:.1em;`;
    return `display:block;margin:0 0 7px;color:${state.cardTitleColor};font-size:${size}px;font-weight:700;letter-spacing:.1em;`;
  };
  const quoteStyle = cardBoxStyle(cardKind, state.quoteColor);
  const cardStyle = cardBoxStyle(cardKind, state.cardColor);
  const quoteTitleStyle = cardTitleStyle(cardKind, state.quoteTitleSize);
  const contentCardTitleStyle = cardTitleStyle(cardKind, state.cardTitleSize);
  const titleStyle = `margin:0 0 18px;color:${titleColor};font-size:${state.titleSize}px;line-height:${state.headingLineHeight};font-weight:${state.headingWeight};letter-spacing:-.04em;`;
  const imageBoxStyle = isDeepNight
    ? `margin:22px 0 26px;padding:48px 12px;text-align:center;border:2px solid ${state.borderColor};border-radius:${state.imageRadius}px;background-color:${state.pageColor};color:${mutedColor};font-size:11px;font-weight:800;letter-spacing:.13em;`
    : `margin:22px 0 26px;padding:48px 12px;text-align:center;border-radius:${state.imageRadius}px;background-color:${state.accentColor};color:#ffffff;font-size:11px;font-weight:800;letter-spacing:.13em;`;
  const codeStyle = `margin:22px 0 26px;padding:${state.cardPadding}px;border-radius:${state.cardRadius}px;background-color:${codeBackground};color:${codeColor};font-size:${state.codeFontSize}px;line-height:${state.codeLineHeight};word-wrap:break-word;`;
  const listPad = `${Math.max(1, Number(state.listIndent) || 1.5)}em`;
  // 精选主题复制版：自动目录（取前 3 个二级标题，纯派生）。
  let tocInjected = false;
  const tocHeadings = model.blocks
    .filter((block) => block.type === "heading" && Number(block.level || 2) === 2)
    .slice(0, 3);
  const tocHtmlBlock = isTheme() && tocHeadings.length >= 2
    ? `<section style="margin:0 0 30px;padding:16px 18px;border:1px solid ${state.borderColor};border-radius:10px;background-color:${state.cardColor};"><p style="margin:0 0 10px;color:${mutedColor};font-size:10px;font-weight:800;letter-spacing:.25em;">本文脉络</p>${tocHeadings.map((block, index) =>
      `<p style="margin:0 0 8px;"><span style="display:inline-block;min-width:24px;color:${state.accentColor};font-size:12px;font-weight:800;">${String(index + 1).padStart(2, "0")}</span><span style="color:${titleColor};font-size:13px;font-weight:600;">${escapeHtml(block.text)}</span></p>`).join("")}</section>`
    : "";
  const signatureHtmlBlock = isTheme() && state.showSignature
    ? `<section style="margin:28px 0 0;padding:20px 0 0;border-top:1px solid ${state.dividerColor};text-align:right;"><p style="margin:0 0 8px;color:${titleColor};font-size:14px;font-weight:700;">—— {{作者名}}（替换为你的署名）</p><p style="margin:0;color:${mutedColor};font-size:12px;line-height:1.8;">如果今天这篇有收获，欢迎点赞、在看、转发，我们下篇见。</p></section>`
    : "";
  // 精选主题的引导段（引言卡）内联版，与 styles.css 的 data-theme 盖层保持一致。
  const themeLeadStyle = (baseTextStyle) => {
    const t = isTheme() ? state.theme : "classic";
    const base = `${baseTextStyle}text-indent:0;`;
    if (t === "fresh") return `${base}padding:20px 22px;margin-bottom:26px;border:1.5px solid ${colorWithAlpha(state.accentColor, 0.18)};border-radius:16px;background-color:${state.cardColor};color:${titleColor};font-weight:650;`;
    if (t === "vermilion") return `${base}padding:24px 24px 20px;margin-bottom:28px;border:1px solid ${colorWithAlpha(state.accentColor, 0.12)};border-radius:12px;background-color:${state.pageColor};box-shadow:0 4px 24px -4px ${colorWithAlpha(state.accentColor, 0.22)};color:${titleColor};font-weight:750;`;
    if (t === "mono") return `${base}padding:0 0 18px;margin-bottom:24px;border-bottom:1px solid ${state.dividerColor};color:${titleColor};font-weight:600;`;
    if (t === "serene") return `${base}padding:34px 16px;margin:8px 0 44px;border-top:1px solid ${state.dividerColor};border-bottom:1px solid ${state.dividerColor};text-align:center;color:${titleColor};font-size:${Math.round(state.headingSize * 0.72)}px;font-weight:600;line-height:1.85;`;
    if (t === "stub") return `${base}padding:20px 22px;margin-bottom:26px;border:1.5px solid ${state.accentColor};border-radius:12px;background-color:${state.pageColor};box-shadow:0 6px 18px -8px ${colorWithAlpha(state.accentColor, 0.55)};color:${titleColor};font-weight:700;`;
    if (t === "editorial") return `${base}padding:16px 18px;margin-bottom:22px;border-left:4px solid #1e1f23;border-radius:0 6px 6px 0;background-color:${state.cardColor};color:${titleColor};font-weight:650;`;
    return `${baseTextStyle}color:${state.accentColor};font-weight:750;`;
  };
  // 精选主题分隔线：票据卡用虚线装订，静山加大留白，其余沿用通用分隔线。
  const themeDividerHtml = () => {
    const t = isTheme() ? state.theme : "classic";
    if (t === "stub") return `<section style="margin:34px 0 30px;border-top:2px dashed ${state.dividerColor};"></section>`;
    if (t === "serene") return `<section style="margin:56px 0;border-top:1px solid ${state.dividerColor};"></section>`;
    return `<section style="margin:${state.dividerMargin}px 0;border-top:${state.dividerThickness}px solid ${state.dividerColor};"></section>`;
  };
  const body = model.blocks.map((item) => {
    if (item.type === "lead") {
      const toc = (!tocInjected && tocHtmlBlock) ? (tocInjected = true, tocHtmlBlock) : "";
      return `<p style="${themeLeadStyle(textStyle)}">${copyInlineMarkdown(item.text)}</p>${toc}`;
    }
    if (item.type === "highlight" && isDeepNight) return `<p style="${textStyle}"><span style="${highlightCss}">${copyInlineMarkdown(item.text)}</span></p>`;
    if (item.type === "heading") {
      const level = Number(item.level) || 2;
      const parts = splitHeadingCaption(item.text);
      const sub = parts.sub || "SECTION";
      if (level === 2 && headingKind === "poster") {
        const prefix = headingPrefix(level);
        const title = `${parts.title}${parts.title.endsWith("#") ? "" : "#"}`;
        return `<h3 style="${headingStyle(level)}">${prefix}<span style="display:block;margin:0 0 4px;">${copyInlineMarkdown(title)}</span><span style="display:block;color:${state.textColor};font-size:${Math.max(12, Math.round(getHeadingSize(2) * 0.42))}px;font-weight:700;letter-spacing:.12em;">${escapeHtml(sub)}</span></h3>`;
      }
      if (level === 2 && headingKind === "panel") {
        const prefix = headingPrefix(level);
        return `<h3 style="${headingStyle(level)}">${prefix}<span style="display:inline-block;vertical-align:middle;"><span style="display:inline-block;padding:6px 12px;background-color:${state.textColor};color:${state.pageColor};font-size:${Math.max(14, Math.round(getHeadingSize(2) * 0.72))}px;font-weight:800;line-height:1.25;">${copyInlineMarkdown(parts.title)}</span><br/><span style="display:inline-block;margin-top:6px;color:${state.textColor};font-size:${Math.max(11, Math.round(getHeadingSize(2) * 0.38))}px;font-weight:700;letter-spacing:.14em;">${escapeHtml(sub)}</span></span></h3>`;
      }
      if (level === 2 && headingKind === "oval") {
        return `<h3 style="${headingStyle(level)}">${headingPrefix(level)}<span style="display:block;">${copyInlineMarkdown(parts.title)}</span></h3>`;
      }
      return `<h3 style="${headingStyle(level)}">${headingPrefix(level)}${copyInlineMarkdown(item.text)}</h3>`;
    }
    if (item.type === "paragraph") return `<p style="${textStyle}">${copyInlineMarkdown(item.text)}</p>`;
    if (item.type === "quote") {
      if (state.showQuote) return `<section style="${quoteStyle}"><p style="margin:0 0 7px;padding:0;${cardKind === "band" ? "" : ""}${quoteTitleStyle}">${escapeHtml(item.title || "引用")}</p><p style="margin:0;padding:${cardKind === "band" ? `0 ${state.cardPadding}px` : "0"};color:${state.textColor};">${copyInlineMarkdown(item.text)}</p></section>`;
      return `<p style="${textStyle}font-style:italic;">${copyInlineMarkdown(item.text)}</p>`;
    }
    if (item.type === "card") return `<section style="${cardStyle}"><p style="margin:0 0 7px;padding:0;${contentCardTitleStyle}">${escapeHtml(item.title || "重点提示")}</p><p style="margin:0;padding:${cardKind === "band" ? `0 ${state.cardPadding}px` : "0"};color:${state.textColor};">${copyInlineMarkdown(item.text)}</p></section>`;
    if (item.type === "steps") {
      const title = escapeHtml(item.title || "操作步骤");
      const rows = (item.items || []).map((entry, index) => {
        const n = index + 1;
        const badge = `<span style="display:inline-block;min-width:28px;margin-right:10px;color:${softAccent};font-size:${Math.round(state.fontSize * 1.15)}px;font-weight:${state.headingWeight};">${String(n).padStart(2, "0")}</span>`;
        return `<p style="margin:0 0 ${state.listItemSpacing}px;padding:0;color:${state.textColor};font-size:${state.fontSize}px;line-height:${state.lineHeight};">${badge}<span>${copyInlineMarkdown(entry)}</span></p>`;
      }).join("");
      return `<section style="${cardBoxStyle("soft", state.cardColor)}"><p style="margin:0 0 12px;padding:0;${contentCardTitleStyle}">${title}</p>${rows}</section>`;
    }
    if (item.type === "stat") {
      const title = escapeHtml(item.title || "关键数据");
      const cells = (item.items || []).map((entry) => {
        const value = escapeHtml(entry.value || "");
        const label = escapeHtml(entry.label || "");
        return `<section style="display:inline-block;width:46%;margin:6px 2% 8px 0;vertical-align:top;text-align:center;"><p style="margin:0;padding:0;color:${state.accentColor};font-size:${Math.max(22, state.headingSize - 2)}px;font-weight:${state.headingWeight};line-height:1.2;">${value}</p><p style="margin:4px 0 0;padding:0;color:${mutedColor};font-size:${Math.max(11, state.captionSize)}px;line-height:1.5;">${label}</p></section>`;
      }).join("");
      return `<section style="${cardBoxStyle("outline", state.cardColor)}"><p style="margin:0 0 12px;padding:0;${contentCardTitleStyle}">${title}</p><section style="margin:0;padding:0;text-align:left;">${cells}</section></section>`;
    }
    if (item.type === "divider" && state.showDivider) return themeDividerHtml();
    if (item.type === "image") {
      if (item.url) {
        const meta = getCopyImageMeta(item.url);
        const dataAttrs = meta
          ? ` data-w="${meta.width}"${meta.ratio ? ` data-ratio="${meta.ratio}"` : ""}`
          : "";
        const tip = isWechatHostedImage(item.url)
          ? ""
          : `<p style="margin:6px 0 0;color:${mutedColor};font-size:${Math.max(10, state.captionSize - 1)}px;line-height:1.5;">提示：外链图可能被公众号拦截，建议先上传到素材库再替换链接。</p>`;
        return `<section style="margin:22px 0 26px;text-align:center;"><img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.alt)}"${dataAttrs} style="display:block;width:100%;max-width:100%;height:auto;margin:0 auto;border-radius:${state.imageRadius}px;" /><p style="margin:7px 0 0;color:${mutedColor};font-size:${state.captionSize}px;line-height:1.6;">${escapeHtml(item.alt || "文章配图")}</p>${tip}</section>`;
      }
      if (state.showImage) {
        return `<section style="${imageBoxStyle}"><p style="margin:0;color:inherit;">${escapeHtml(item.alt || "文章配图占位")}</p><p style="margin:10px 0 0;color:inherit;font-size:10px;font-weight:600;letter-spacing:.04em;">请在公众号素材库上传后替换为真实图片</p></section>`;
      }
      return `<p style="${textStyle}color:${mutedColor};">[图片：${escapeHtml(item.alt || "文章配图")} · 请在公众号里插入素材]</p>`;
    }
    if (item.type === "list") {
      const marker = (index) => {
        const n = index + 1;
        if (item.ordered) {
          if (listKind === "circle") return `<span style="display:inline-block;width:20px;height:20px;line-height:20px;text-align:center;border-radius:50%;background-color:${state.accentColor};color:${state.pageColor};font-size:${Math.max(11, state.fontSize - 4)}px;font-weight:800;margin-right:8px;">${n}</span>`;
          if (listKind === "ghost") return `<span style="display:inline-block;min-width:30px;color:${ghostAccent};font-size:${Math.round(state.fontSize * 1.4)}px;font-weight:${state.headingWeight};vertical-align:-2px;margin-right:6px;">${String(n).padStart(2, "0")}</span>`;
          if (listKind === "check") return `<span style="color:${state.accentColor};font-weight:800;margin-right:8px;">→</span>`;
          return `<span style="color:${state.accentColor};font-weight:700;margin-right:6px;">${n}.</span>`;
        }
        if (listKind === "circle") return `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:${state.accentColor};margin:0 10px 2px 2px;vertical-align:middle;"></span>`;
        if (listKind === "ghost") return `<span style="color:${ghostAccent};margin-right:8px;">—</span>`;
        if (listKind === "check") return `<span style="color:${state.accentColor};font-weight:800;margin-right:8px;">✓</span>`;
        return `<span style="color:${state.accentColor};margin-right:6px;">•</span>`;
      };
      const itemStyle = `margin:0 0 ${state.listItemSpacing}px;padding-left:${listPad};color:${state.textColor};font-size:${state.fontSize}px;line-height:${state.lineHeight};letter-spacing:${state.letterSpacing}px;text-align:left;text-indent:0;`;
      const itemsHtml = (item.items || []).map((entry, index) =>
        `<p style="${itemStyle}">${marker(index)}<span>${copyInlineMarkdown(entry)}</span></p>`).join("");
      return `<section style="margin:0 0 ${state.paragraphSpacing}px;">${itemsHtml}</section>`;
    }
    if (item.type === "code") {
      const note = `<p style="margin:0 0 8px;color:${mutedColor};font-size:${Math.max(10, state.captionSize - 1)}px;line-height:1.5;">代码块：粘贴后请核对换行；过长建议改用截图。</p>`;
      return `<section style="${codeStyle}">${note}<p style="margin:0;padding:0;color:${codeColor};font-size:${state.codeFontSize}px;line-height:${state.codeLineHeight};">${formatCodeForWechat(item.text)}</p></section>`;
    }
    return "";
  });
  if (!tocInjected && tocHtmlBlock) body.unshift(tocHtmlBlock);
  if (signatureHtmlBlock) body.push(signatureHtmlBlock);
  const bodyHtml = body.join("");
  const titleHtml = model.title ? `<h2 style="${titleStyle}">${escapeHtml(model.title)}</h2>` : "";
  const html = `<section style="width:100%;max-width:100%;margin:0;background-color:${state.pageColor};color:${state.textColor};font-size:${state.fontSize}px;line-height:${state.lineHeight};">${titleHtml}${bodyHtml}</section>`;
  return lockBrandColor?.checked ? applyDataNoDark(html) : html;
}

function buildCopyPlain(html) {
  const model = getArticleModel();
  const blocks = model.blocks.map((item) => {
    if (item.type === "list") return (item.items || []).join("\n");
    if (item.type === "steps") return (item.items || []).join("\n");
    if (item.type === "stat") {
      return (item.items || []).map((entry) => `${entry.value || ""}${entry.label ? ` ${entry.label}` : ""}`).join("\n");
    }
    if (item.type === "divider") return "——";
    if (item.type === "image") return item.alt || item.url || "";
    return item.text || "";
  }).filter(Boolean);
  return [model.title, ...blocks].filter(Boolean).join("\n\n") || html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function copyHtmlWithExecCommand(html) {
  const holder = document.createElement("section");
  holder.contentEditable = "true";
  holder.innerHTML = html;
  holder.style.cssText = "position:fixed;left:-10000px;top:0;width:640px;height:auto;opacity:0;";
  document.body.appendChild(holder);
  holder.focus();
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(holder);
  selection.removeAllRanges();
  selection.addRange(range);
  const copied = document.execCommand("copy");
  selection.removeAllRanges();
  holder.remove();
  return copied;
}

async function copyRichText() {
  updateCompliancePanel();
  const report = getComplianceReport();
  const html = buildCopyHtml();
  const plain = buildCopyPlain(html);
  const tips = report.items
    .filter((item) => item.severity === "risk" || item.severity === "warn")
    .slice(0, 3)
    .map((item) => item.title);
  try {
    const copied = copyHtmlWithExecCommand(html);
    if (!copied) {
      if (!window.ClipboardItem || !navigator.clipboard?.write) throw new Error("copy-unsupported");
      await navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }), "text/plain": new Blob([plain], { type: "text/plain" }) })]);
    }
    const lockNote = lockBrandColor?.checked ? "已尽量锁定品牌色。" : "";
    copyFeedback.textContent = tips.length
      ? `已复制。${lockNote}${tips.join("；")}。`
      : `已复制文章。${lockNote}打开公众号后台粘贴即可。`;
    setStatus("文章已复制，可粘贴到公众号发布页。");
  } catch {
    copyFeedback.textContent = "浏览器未允许自动复制。请再点一次，或允许本页使用剪贴板。";
  }
  window.setTimeout(() => { copyFeedback.textContent = ""; }, tips.length ? 8000 : 5000);
}

function exportConfig() {
  const payload = {
    version: 2,
    updatedAt: new Date().toISOString(),
    template: { type: "universal", name: isTheme()
      ? `精选主题 · ${THEMES[state.theme].label}`
      : `${MOODS[currentMood].label} · ${SKINS[currentSkin].label}`, params: { ...getTemplateParams(), mood: currentMood, skin: currentSkin } },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "wechat-style-template.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

function importConfig(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(String(reader.result));
      const incoming = payload.template?.params || payload.params || payload;
      const allowed = Object.keys(TEMPLATE_DEFAULTS);
      const normalized = normalizeTemplateParams(incoming);
      const importedTheme = THEMES[normalized.theme] ? normalized.theme : "";
      if (importedTheme) {
        Object.assign(state, buildThemeState(importedTheme));
        allowed.forEach((key) => { if (incoming[key] !== undefined) state[key] = normalized[key]; });
        state.theme = importedTheme;
      } else {
        const importedSkin = SKINS[normalized.skin] ? normalized.skin
          : SKINS[incoming.skin] ? incoming.skin : "";
        if (importedSkin) {
          currentSkin = importedSkin;
          currentMood = skinMood(importedSkin);
          Object.assign(state, buildSkinState(importedSkin));
        }
        state.theme = "classic";
        allowed.forEach((key) => { if (incoming[key] !== undefined) state[key] = normalized[key]; });
      }
      styleTouched = true;
      syncMoodUI();
      syncControls();
      render();
    copyFeedback.textContent = "配置已导入。";
    } catch {
      copyFeedback.textContent = "配置文件无法读取，请检查 JSON 格式。";
    }
  };
  reader.readAsText(file);
}

function persistArticleSource() {
  if (articleSource) localStorage.setItem("yooco-article-source", articleSource);
  else localStorage.removeItem("yooco-article-source");
  if (articleTitleOverride) localStorage.setItem("yooco-article-title", articleTitleOverride);
  else localStorage.removeItem("yooco-article-title");
  localStorage.setItem("yooco-infer-first-line-title", String(inferFirstLineTitle));
  localStorage.setItem("yooco-block-type-overrides", JSON.stringify(blockTypeOverrides));
}

function trimInvalidOverrides() {
  const blockLength = parseArticle(articleSource).blocks.length;
  Object.keys(blockTypeOverrides).forEach((index) => {
    if (Number(index) >= blockLength) delete blockTypeOverrides[index];
  });
}

function applyArticleSource(showStatus = true) {
  if (articleInput) articleSource = articleInput.value.trim();
  trimInvalidOverrides();
  persistArticleSource();
  if (articleSource) {
    const model = parseArticle(articleSource);
    setStatus(`预览已更新：${model.blocks.length} 个内容块，可直接改字`);
  } else {
    setStatus("尚未输入文章，下方展示示例");
  }
  if (showStatus) setFeedback(articleSource ? "下方预览已更新。" : "已恢复示例文章。");
  render();
}

function clearArticleSource() {
  if (articleInput) articleInput.value = "";
  articleSource = "";
  articleTitleOverride = "";
  blockTypeOverrides = {};
  lastAiResult = null;
  persistArticleSource();
  setStatus("尚未输入文章，下方展示示例");
  setFeedback("已清空文章，恢复示例内容。");
  render();
}

function splitLongTextLine(line) {
  const sentenceCandidates = line.match(/[^。！？!?；;]+[。！？!?；;]?/g) || [line];
  const sentences = sentenceCandidates.flatMap((sentence) => {
    if (sentence.length <= 108) return [sentence];
    const pieces = [];
    let remaining = sentence;
    while (remaining.length > 108) {
      const windowText = remaining.slice(0, 96);
      const separator = Math.max(windowText.lastIndexOf("，"), windowText.lastIndexOf(","), windowText.lastIndexOf("、"), windowText.lastIndexOf("："), windowText.lastIndexOf(":"));
      const cutAt = separator >= 52 ? separator + 1 : 88;
      pieces.push(remaining.slice(0, cutAt));
      remaining = remaining.slice(cutAt);
    }
    if (remaining) pieces.push(remaining);
    return pieces;
  });
  const segments = [];
  let current = "";
  sentences.forEach((sentence) => {
    const candidate = `${current}${sentence}`;
    if (current && candidate.length > 96 && current.length >= 46) {
      segments.push(current.trim());
      current = sentence;
    } else {
      current = candidate;
    }
  });
  if (current.trim()) segments.push(current.trim());
  return segments.join("\n\n");
}

function autoSegmentArticle() {
  const raw = (articleInput ? articleInput.value : articleSource).trim();
  if (!raw) {
    copyFeedback.textContent = "请先粘贴文章，再使用智能分段。";
    return;
  }
  let inCode = false;
  const structured = raw.replace(/\r\n?/g, "\n").split("\n").map((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      inCode = !inCode;
      return line;
    }
    const isMarkdownBlock = /^(#{1,6}\s|>\s?|[-*+]\s+|!\[|---+$|\*\*\*+$)/.test(trimmed);
    if (inCode || isMarkdownBlock || line.length < 96) return line;
    return splitLongTextLine(line);
  }).join("\n");
  if (articleInput) articleInput.value = structured;
  else articleSource = structured;
  blockTypeOverrides = {};
  lastAiResult = null;
  applyArticleSource(false);
  copyFeedback.textContent = "已按中文句段智能分段，可继续在预览里调整。";
}

function handleRichTextPaste(event) {
  const html = event.clipboardData?.getData("text/html") || "";
  if (!html || !/<[a-z][\s\S]*>/i.test(html)) return;
  const markdown = htmlToMarkdown(html);
  if (!markdown) return;
  event.preventDefault();
  insertMarkdownAtCursor(markdown);
  copyFeedback.textContent = "已将富文本转换为 Markdown，可继续编辑并实时预览。";
}

controls.forEach((control) => {
  const updateControl = () => {
    const key = control.dataset.key;
    state[key] = control.type === "checkbox" ? control.checked : control.type === "range" ? Number(control.value) : control.value;
    if (key === "readingDensity" && state.readingDensity !== "custom") applyReadingDensity(state.readingDensity);
    else if (["fontSize", "lineHeight", "paragraphSpacing"].includes(key)) state.readingDensity = "custom";
    styleTouched = true;
    syncControls();
    render({ body: ["showQuote", "showDivider", "showImage", "showSignature", "highlightStyle", "headingStyle", "cardStyle", "listStyle", "bodyFont", "headingFont"].includes(key) });
  };
  control.addEventListener("input", updateControl);
  if (control.tagName === "SELECT") control.addEventListener("change", updateControl);
});
document.querySelector("#resetButton").addEventListener("click", () => {
  Object.assign(state, buildSkinState(DEFAULT_SKIN));
  state.theme = "classic";
  state.articleType = "auto";
  currentMood = DEFAULT_MOOD;
  currentSkin = DEFAULT_SKIN;
  styleTouched = false;
  syncMoodUI();
  syncControls();
  render();
  setFeedback("已恢复默认风格，下一次优化将由 AI 重新定基调。");
});
document.querySelector("#copyButton").addEventListener("click", copyRichText);
document.querySelector("#exportButton").addEventListener("click", exportConfig);
document.querySelector("#importInput").addEventListener("change", (event) => importConfig(event.target.files?.[0]));
darkPreviewToggle?.addEventListener("change", () => {
  previewStage?.classList.toggle("is-dark-preview", Boolean(darkPreviewToggle.checked));
  updateCompliancePanel();
});
lockBrandColor?.addEventListener("change", () => {
  localStorage.setItem("yooco-lock-brand-color", lockBrandColor.checked ? "1" : "0");
  updateCompliancePanel();
});
if (lockBrandColor) lockBrandColor.checked = localStorage.getItem("yooco-lock-brand-color") === "1";
aiNormalizeButton?.addEventListener("click", normalizeWithDeepSeek);
articleInput?.addEventListener("paste", handleRichTextPaste);
articleTitle.addEventListener("keydown", (event) => {
  if (event.key === "Enter") event.preventDefault();
});
articleTitle.addEventListener("input", () => {
  window.clearTimeout(previewSyncTimer);
  previewSyncTimer = window.setTimeout(syncPreviewEdits, 200);
});
articleBody.addEventListener("input", () => {
  window.clearTimeout(previewSyncTimer);
  previewSyncTimer = window.setTimeout(syncPreviewEdits, 200);
});

const STRUCTURE_MENU_TYPES = new Set(["paragraph", "lead", "heading", "quote", "card", "divider"]);
let blockTypeMenu = null;
let blockTypeMenuIndex = null;

function ensureBlockTypeMenu() {
  if (blockTypeMenu) return blockTypeMenu;
  const menu = document.createElement("div");
  menu.id = "blockTypeMenu";
  menu.className = "block-type-menu";
  menu.hidden = true;
  menu.setAttribute("role", "menu");
  menu.innerHTML = [
    `<p class="block-type-menu-label">改为</p>`,
    ...STRUCTURE_TYPE_OPTIONS.map(([type, label]) =>
      `<button type="button" class="block-type-menu-item" role="menuitem" data-type="${type}">${label}</button>`),
  ].join("");
  document.body.appendChild(menu);
  menu.addEventListener("click", (event) => {
    const button = event.target.closest("[data-type]");
    if (!button || blockTypeMenuIndex == null) return;
    applyBlockTypeFromMenu(blockTypeMenuIndex, button.dataset.type);
  });
  blockTypeMenu = menu;
  return menu;
}

function hideBlockTypeMenu() {
  if (!blockTypeMenu) return;
  blockTypeMenu.hidden = true;
  blockTypeMenuIndex = null;
  articleBody?.querySelector(".is-block-menu-target")?.classList.remove("is-block-menu-target");
}

function showBlockTypeMenu(clientX, clientY, blockEl) {
  const menu = ensureBlockTypeMenu();
  const currentType = blockEl.dataset.type || "";
  blockTypeMenuIndex = Number(blockEl.dataset.blockIndex);
  articleBody.querySelectorAll(".is-block-menu-target").forEach((el) => el.classList.remove("is-block-menu-target"));
  blockEl.classList.add("is-block-menu-target");
  menu.querySelectorAll(".block-type-menu-item").forEach((button) => {
    const active = button.dataset.type === currentType;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-current", active ? "true" : "false");
  });
  menu.hidden = false;
  const pad = 8;
  const rect = menu.getBoundingClientRect();
  const left = Math.min(clientX, window.innerWidth - rect.width - pad);
  const top = Math.min(clientY, window.innerHeight - rect.height - pad);
  menu.style.left = `${Math.max(pad, left)}px`;
  menu.style.top = `${Math.max(pad, top)}px`;
}

function applyBlockTypeFromMenu(sourceIndex, type) {
  hideBlockTypeMenu();
  if (!STRUCTURE_TYPE_OPTIONS.some(([option]) => option === type)) return;
  const label = STRUCTURE_TYPE_OPTIONS.find(([option]) => option === type)?.[1] || type;
  blockTypeOverrides[sourceIndex] = type;
  persistArticleSource();
  render();
  syncPreviewEdits();
  blockTypeOverrides = {};
  persistArticleSource();
  setStatus(`已改为「${label}」`);
}

articleBody.addEventListener("contextmenu", (event) => {
  const blockEl = event.target.closest("[data-block-index][data-type]");
  if (!blockEl || !articleBody.contains(blockEl)) return;
  if (!STRUCTURE_MENU_TYPES.has(blockEl.dataset.type)) return;
  event.preventDefault();
  showBlockTypeMenu(event.clientX, event.clientY, blockEl);
});

document.addEventListener("pointerdown", (event) => {
  if (!blockTypeMenu || blockTypeMenu.hidden) return;
  if (blockTypeMenu.contains(event.target)) return;
  hideBlockTypeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") hideBlockTypeMenu();
});

previewStage?.addEventListener("scroll", hideBlockTypeMenu, { passive: true });
window.addEventListener("resize", hideBlockTypeMenu);

const saved = localStorage.getItem("wechat-style-lab-config");
if (saved) {
  try {
    const stored = JSON.parse(saved);
    const storedTheme = THEMES[stored.theme] ? stored.theme : "";
    if (storedTheme) {
      // 精选主题：恢复整套主题参数 + 用户微调。
      Object.assign(state, buildThemeState(storedTheme));
      Object.assign(state, normalizeTemplateParams(stored, state));
      state.theme = storedTheme;
      styleTouched = true;
    } else {
      let storedSkin = "";
      try {
        const moodSaved = JSON.parse(localStorage.getItem("yooco-style-mood") || "{}");
        if (SKINS[moodSaved.skin]) storedSkin = moodSaved.skin;
      } catch { /* no mood record */ }
      if (storedSkin) {
        // 新版：皮肤 + 用户微调都恢复，并视为用户已手动定调。
        currentSkin = storedSkin;
        currentMood = skinMood(storedSkin);
        Object.assign(state, buildSkinState(storedSkin));
        Object.assign(state, normalizeTemplateParams(stored, state));
        styleTouched = true;
      } else {
        // 旧版配置（无皮肤记录）：颜色作废，只保留字号等非颜色阅读偏好。
        const legacy = normalizeTemplateParams(stored, state);
        ["fontSize", "lineHeight", "letterSpacing", "paragraphSpacing", "contentWidth",
          "titleSize", "headingSize", "subheadingSize", "minorHeadingSize", "headingWeight",
          "headingLineHeight", "headingSpacingBefore", "headingSpacingAfter",
          "bodyFont", "headingFont", "textAlign", "textIndent", "readingDensity"].forEach((key) => {
          if (stored[key] !== undefined) state[key] = legacy[key];
        });
      }
      state.theme = "classic";
    }
    syncMoodUI();
  } catch { /* ignore stale local config */ }
}
if (articleInput) articleInput.value = articleSource;
if (articleSource) setStatus(`已载入上次文章：${parseArticle(articleSource).blocks.length} 个内容块`);
renderMoodUI();
syncControls();
render();

try {
  if (localStorage.getItem("yooco-auto-optimize") === "1") {
    localStorage.removeItem("yooco-auto-optimize");
    if (articleSource.trim()) {
      queueMicrotask(() => {
        normalizeWithDeepSeek();
      });
    }
  }
} catch { /* ignore */ }
