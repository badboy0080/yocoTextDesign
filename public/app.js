const TEMPLATE_DEFAULTS = {
  textColor: "#3f3f3f", accentColor: "#6e8e23", highlightColor: "#d7fa5c", highlightTextColor: "#20231f",
  cardColor: "#f0f4e5", quoteColor: "#f7f8f1", cardTitleColor: "#6e8e23", pageColor: "#ffffff",
  linkColor: "#3f6f9f", codeBackground: "#edf0e5", codeColor: "#2c4030", dividerColor: "#6e8e23",
  bodyFont: "system", headingFont: "system", textAlign: "left", textIndent: 0,
  fontSize: 16, lineHeight: 1.75, letterSpacing: 0.3, paragraphSpacing: 18, contentWidth: 620,
  readingDensity: "standard", titleSize: 26, headingSize: 27, subheadingSize: 23, minorHeadingSize: 20,
  headingWeight: 800, headingLineHeight: 1.35, headingSpacingBefore: 32, headingSpacingAfter: 12,
  highlightStyle: "background", highlightRadius: 3, highlightPadding: 2,
  listIndent: 1.5, listItemSpacing: 6, linkUnderline: true,
  quoteTitleSize: 11, cardTitleSize: 11, cardBorderWidth: 1,
  dividerThickness: 1, dividerMargin: 28, codeFontSize: 13, codeLineHeight: 1.6, captionSize: 11,
  cardRadius: 12, cardPadding: 20, imageRadius: 12,
  showQuote: true, showDivider: true, showImage: true,
};

const PRESETS = {
  "clean-tech": {
    textColor: "#3f3f3f", accentColor: "#6e8e23", cardColor: "#f0f4e5", pageColor: "#ffffff",
    fontSize: 16, lineHeight: 1.75, letterSpacing: 0.3, paragraphSpacing: 18, contentWidth: 620,
    headingSize: 27, cardRadius: 12, cardPadding: 20, imageRadius: 12, showQuote: true, showDivider: true, showImage: true,
    styleVariant: "standard", mutedColor: "#8e9389", titleColor: "#20231f", borderColor: "#dedfd8", highlightColor: "#d7fa5c",
  },
  editorial: {
    textColor: "#262321", accentColor: "#e25736", cardColor: "#f8e7dc", pageColor: "#fffdf8",
    fontSize: 17, lineHeight: 1.68, letterSpacing: 0.1, paragraphSpacing: 22, contentWidth: 600,
    headingSize: 30, cardRadius: 2, cardPadding: 22, imageRadius: 2, showQuote: true, showDivider: true, showImage: true,
    styleVariant: "standard", mutedColor: "#8e9389", titleColor: "#262321", borderColor: "#dedfd8", highlightColor: "#f0c9a8",
  },
  "soft-magazine": {
    textColor: "#514e4a", accentColor: "#b0776f", cardColor: "#f6ece9", pageColor: "#fffdfb",
    fontSize: 16, lineHeight: 1.9, letterSpacing: 0.5, paragraphSpacing: 24, contentWidth: 580,
    headingSize: 28, cardRadius: 18, cardPadding: 22, imageRadius: 18, showQuote: true, showDivider: false, showImage: true,
    styleVariant: "standard", mutedColor: "#8e9389", titleColor: "#514e4a", borderColor: "#dedfd8", highlightColor: "#ead4cc",
  },
  minimal: {
    textColor: "#343638", accentColor: "#4c6b79", cardColor: "#eef2f3", pageColor: "#ffffff",
    fontSize: 15, lineHeight: 1.7, letterSpacing: 0, paragraphSpacing: 14, contentWidth: 640,
    headingSize: 25, cardRadius: 0, cardPadding: 16, imageRadius: 0, showQuote: false, showDivider: true, showImage: false,
    styleVariant: "standard", mutedColor: "#8e9389", titleColor: "#343638", borderColor: "#dedfd8", highlightColor: "#dbe7eb",
  },
  "deep-night": {
    textColor: "#91a6cc", accentColor: "#00a878", cardColor: "#202727", pageColor: "#171717",
    fontSize: 17, lineHeight: 1.9, letterSpacing: 0.2, paragraphSpacing: 22, contentWidth: 620,
    headingSize: 30, cardRadius: 18, cardPadding: 20, imageRadius: 20, showQuote: false, showDivider: false, showImage: true,
    styleVariant: "deep-night", mutedColor: "#7184a5", titleColor: "#d7e0f2", borderColor: "#858585", highlightColor: "#d8c878",
  },
};

Object.values(PRESETS).forEach((preset) => Object.assign(preset, { ...TEMPLATE_DEFAULTS, ...preset }));

const DEFAULT_PRESET = "clean-tech";
const state = { ...PRESETS[DEFAULT_PRESET] };
const controls = [...document.querySelectorAll("[data-key]")];
const articlePage = document.querySelector("#articlePage");
const articleBody = document.querySelector("#articleBody");
const tokenPreview = document.querySelector("#tokenPreview");
const previewSummary = document.querySelector("#previewSummary");
const copyFeedback = document.querySelector("#copyFeedback");
const presetSelect = document.querySelector("#presetSelect");
const articleInput = document.querySelector("#articleInput");
const aiNormalizeButton = document.querySelector("#aiNormalizeButton");
const clearArticleButton = document.querySelector("#clearArticleButton");
const autoSegmentButton = document.querySelector("#autoSegmentButton");
const articleStatus = document.querySelector("#articleStatus");
const articleTitle = document.querySelector("#articleTitle");
const articleSubtitle = document.querySelector("#articleSubtitle");
const titleInput = document.querySelector("#titleInput");
const structureList = document.querySelector("#structureList");
const blockCount = document.querySelector("#blockCount");
const inferTitleToggle = document.querySelector("#inferTitleToggle");
const stylePane = document.querySelector("#stylePane");
const styleMount = document.querySelector("#styleMount");
let articleSource = localStorage.getItem("yooco-article-source") || "";
let articleTitleOverride = localStorage.getItem("yooco-article-title") || "";
let inferFirstLineTitle = localStorage.getItem("yooco-infer-first-line-title") !== "false";
let blockTypeOverrides = {};
let lastAiResult = null;

try {
  blockTypeOverrides = JSON.parse(localStorage.getItem("yooco-block-type-overrides") || "{}");
} catch {
  blockTypeOverrides = {};
}

// 参数仍在右栏，内容编辑和结构调整固定留在左栏，方便左右对比。
if (stylePane && styleMount) {
  stylePane.hidden = false;
  styleMount.append(stylePane);
}

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

function applyPreset(name) {
  if (!PRESETS[name]) return;
  Object.assign(state, PRESETS[name]);
  syncControls();
  render();
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
  };
  Object.entries(enums).forEach(([key, allowed]) => { if (input?.[key] !== undefined && allowed.includes(input[key])) next[key] = input[key]; });
  const ranges = {
    textIndent: [0, 2, .25], fontSize: [14, 22, 1], lineHeight: [1.35, 2.2, .05], letterSpacing: [-.5, 2, .1], paragraphSpacing: [4, 40, 2], contentWidth: [280, 680, 10],
    titleSize: [22, 36, 1], headingSize: [20, 34, 1], subheadingSize: [18, 30, 1], minorHeadingSize: [16, 26, 1], headingWeight: [500, 900, 100], headingLineHeight: [1.1, 1.7, .05], headingSpacingBefore: [8, 48, 2], headingSpacingAfter: [4, 32, 2],
    highlightRadius: [0, 12, 1], highlightPadding: [0, 8, 1], listIndent: [1, 3, .25], listItemSpacing: [0, 20, 1], quoteTitleSize: [10, 18, 1], cardTitleSize: [10, 18, 1], cardBorderWidth: [0, 4, 1], dividerThickness: [1, 4, 1], dividerMargin: [8, 48, 2], codeFontSize: [11, 18, 1], codeLineHeight: [1.2, 2, .1], captionSize: [9, 16, 1], cardRadius: [0, 24, 1], cardPadding: [12, 32, 2], imageRadius: [0, 24, 1],
  };
  Object.entries(ranges).forEach(([key, [min, max, step]]) => { if (input?.[key] !== undefined) next[key] = clampClientNumber(input[key], min, max, step, next[key]); });
  ["linkUnderline", "showQuote", "showDivider", "showImage"].forEach((key) => { if (typeof input?.[key] === "boolean") next[key] = input[key]; });
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
  let cardLines = [];
  let cardTitle = "";
  let inCard = false;

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
  const flushCard = () => {
    const text = cardLines.join("\n").trim();
    if (text) blocks.push({ type: "card", title: cardTitle || "重点提示", text });
    cardLines = [];
    cardTitle = "";
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
    if (inCard) {
      if (trimmed === ":::") {
        flushCard();
        inCard = false;
      } else {
        cardLines.push(line);
      }
      return;
    }
    const card = trimmed.match(/^:::card(?:\s+(.+))?$/i);
    if (card) {
      flushParagraph();
      flushList();
      inCard = true;
      cardTitle = card[1] || "重点提示";
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
  if (inCard) flushCard();
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
    const requestedType = blockTypeOverrides[index];
    if (!requestedType || requestedType === block.type) return block;
    if (!STRUCTURE_TYPE_OPTIONS.some(([type]) => type === requestedType)) return block;
    if (requestedType === "divider") return { type: "divider" };
    if (!["paragraph", "lead", "heading", "quote", "card"].includes(block.type)) return block;
    if (requestedType === "heading") return { ...block, type: "heading", level: 2 };
    if (requestedType === "quote") return { ...block, type: "quote", title: "重点提示" };
    if (requestedType === "card") return { ...block, type: "card", title: "重点提示" };
    return { ...block, type: requestedType };
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
  if (block.type === "list") return block.items.join("；");
  if (block.type === "image") return block.alt || "文章配图";
  if (block.type === "code") return block.text;
  return block.text || "内容分隔线";
}

function renderStructureEditor() {
  if (!articleSource.trim()) {
    blockCount.textContent = "示例文章";
    structureList.innerHTML = '<p class="structure-empty">粘贴文章后，可以在这里逐段改成正文、标题、引用或分隔线。</p>';
    return;
  }

  const parsed = parseArticle(articleSource);
  const editableTypes = new Set(["paragraph", "lead", "heading", "quote", "card"]);
  blockCount.textContent = `${parsed.blocks.length} 个内容块`;
  structureList.innerHTML = parsed.blocks.map((block, index) => {
    const currentType = blockTypeOverrides[index] || block.type;
    const text = escapeHtml(getBlockText(block).replace(/\s+/g, " ").slice(0, 42));
    if (!editableTypes.has(block.type) && block.type !== "divider") {
      return `<div class="structure-row is-fixed"><span class="structure-index">${String(index + 1).padStart(2, "0")}</span><span class="structure-copy"><b>${escapeHtml(STRUCTURE_TYPE_OPTIONS.find(([type]) => type === block.type)?.[1] || block.type)}</b><small>${text || "无文字内容"}</small></span></div>`;
    }
    const options = STRUCTURE_TYPE_OPTIONS.map(([type, label]) => `<option value="${type}"${type === currentType ? " selected" : ""}>${label}</option>`).join("");
    return `<label class="structure-row"><span class="structure-index">${String(index + 1).padStart(2, "0")}</span><span class="structure-copy"><small>${text || "无文字内容"}</small></span><select data-block-index="${index}" aria-label="第 ${index + 1} 段的类型">${options}</select></label>`;
  }).join("");
}

function getArticleModel() {
  if (!articleSource.trim()) {
    return { title: "把一篇好文章，排成读者愿意读完的样子", subtitle: "参数可调、结构可解释、复制可继续编辑", blocks: sampleContent, isSample: true };
  }
  const parsed = applyStructureOverrides(parseArticle(articleSource));
  const inferred = articleTitleOverride.trim()
    ? { title: "", blocks: parsed.blocks, inferred: false }
    : inferTitleFromFirstBlock(parsed);
  const selectedLabel = presetSelect.options[presetSelect.selectedIndex]?.text || "当前风格";
  return {
    ...parsed,
    title: articleTitleOverride.trim() || parsed.title || inferred.title || "你的文章预览",
    subtitle: `Yooco · ${selectedLabel}${inferred.inferred ? " · 已识别首行标题" : ""}`,
    blocks: inferred.blocks,
    isSample: false,
  };
}

function renderBody() {
  const model = getArticleModel();
  articleBody.innerHTML = model.blocks.map((item) => {
    if (item.type === "lead") return `<p class="lead">${inlineMarkdown(item.text)}</p>`;
    if (item.type === "highlight" && state.styleVariant === "deep-night") return `<p class="highlight-line"><mark>${item.text}</mark></p>`;
    if (item.type === "heading") return `<h3 class="section-title level-${Math.min(6, Math.max(2, Number(item.level) || 2))}">${inlineMarkdown(item.text)}</h3>`;
    if (item.type === "quote") {
      if (state.showQuote) return `<aside class="quote-card"><strong>${escapeHtml(item.title || "引用")}</strong>${inlineMarkdown(item.text)}</aside>`;
      return `<p class="plain-quote">${inlineMarkdown(item.text)}</p>`;
    }
    if (item.type === "card") return `<aside class="content-card"><strong>${escapeHtml(item.title || "重点提示")}</strong>${inlineMarkdown(item.text)}</aside>`;
    if (item.type === "divider" && state.showDivider) return `<hr class="article-divider" />`;
    if (item.type === "image") {
      if (item.url) return `<figure class="article-image"><img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.alt)}" loading="lazy" /><figcaption>${escapeHtml(item.alt || "文章配图")}</figcaption></figure>`;
      if (state.showImage) return `<div class="fake-image" role="img" aria-label="文章配图占位">${escapeHtml(item.alt || "文章配图占位")}</div>`;
      return `<p class="image-note">[图片：${escapeHtml(item.alt || "文章配图")}]</p>`;
    }
    if (item.type === "list") {
      const listTag = item.ordered ? "ol" : "ul";
      return `<${listTag} class="article-list">${item.items.map((entry) => `<li>${inlineMarkdown(entry)}</li>`).join("")}</${listTag}>`;
    }
    if (item.type === "code") return `<pre class="article-code" data-language="${escapeHtml(item.language || "code")}"><code>${escapeHtml(item.text)}</code></pre>`;
    if (item.type === "paragraph") return `<p>${inlineMarkdown(item.text)}</p>`;
    return "";
  }).join("");
  articleTitle.textContent = model.title;
  articleSubtitle.textContent = model.subtitle;
}

function render() {
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
  articlePage.style.backgroundColor = state.pageColor;
  articleBody.style.maxWidth = `${state.contentWidth}px`;
  renderBody();
  renderStructureEditor();
  updateOutputs();
  previewSummary.textContent = `正文 ${state.fontSize}px · 行高 ${Number(state.lineHeight).toFixed(2)} · 段距 ${state.paragraphSpacing}px`;
  const currentTemplate = { type: "universal", name: presetSelect.value ? presetSelect.options[presetSelect.selectedIndex]?.text || "当前预设" : "自定义模板", params: getTemplateParams() };
  tokenPreview.textContent = JSON.stringify(lastAiResult ? { ...lastAiResult, template: { ...lastAiResult.template, ...currentTemplate } } : { version: 2, template: currentTemplate }, null, 2);
  localStorage.setItem("wechat-style-lab-config", JSON.stringify(state));
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
  AI_PARAMETER_KEYS.forEach((key) => {
    if (aiParams[key] !== undefined) state[key] = aiParams[key];
  });
  state.styleVariant = "standard";
  state.mutedColor = "#8e9389";
  state.titleColor = state.textColor;
  state.borderColor = "#dedfd8";
  presetSelect.value = "";
  articleTitleOverride = "";
  titleInput.value = "";
  blockTypeOverrides = {};
  lastAiResult = data;
  articleInput.value = markdown;
  syncControls();
  applyArticleSource(false);
  const blockCountFromAi = data.document.blocks.length;
  articleStatus.textContent = `DeepSeek 已生成通用模板：${blockCountFromAi} 个内容块，参数已同步到右栏。`;
  copyFeedback.textContent = "已生成结构化 JSON、可编辑 Markdown 和实时预览。";
}

async function normalizeWithDeepSeek() {
  const source = articleInput.value.trim();
  if (!source) {
    copyFeedback.textContent = "请先在左侧粘贴文章，再交给 DeepSeek 整理。";
    return;
  }
  const originalLabel = aiNormalizeButton.textContent;
  aiNormalizeButton.disabled = true;
  aiNormalizeButton.textContent = "DeepSeek 正在整理…";
  articleStatus.textContent = "正在请求 DeepSeek：只在这次点击时上传文章内容。";
  try {
    const response = await fetch("/api/normalize", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ source }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.ok) throw new Error(payload?.error?.message || "DeepSeek 暂时无法完成整理，请稍后重试。");
    applyAiNormalization(payload.data);
  } catch (error) {
    articleStatus.textContent = "DeepSeek 未完成整理，原文没有被改动。";
    copyFeedback.textContent = error instanceof Error ? error.message : "DeepSeek 暂时无法完成整理，请稍后重试。";
  } finally {
    aiNormalizeButton.disabled = false;
    aiNormalizeButton.textContent = originalLabel;
  }
}

function buildCopyHtml() {
  const isDeepNight = state.styleVariant === "deep-night";
  const mutedColor = state.mutedColor || "#8e9389";
  const titleColor = state.titleColor || state.textColor;
  const highlightColor = safeColor(state.highlightColor, safeColor(state.accentColor, "#d7fa5c"));
  const highlightTextColor = safeColor(state.highlightTextColor, state.textColor);
  const highlightStyle = state.highlightStyle || "background";
  const highlightCss = highlightStyle === "underline"
    ? `padding:0 .05em;background:transparent;color:${highlightTextColor};font-weight:700;box-shadow:inset 0 -.42em 0 ${highlightColor};`
    : highlightStyle === "bold"
      ? `padding:0;background:transparent;color:${highlightTextColor};font-weight:800;`
      : highlightStyle === "marker"
        ? `padding:.05em .22em;border-radius:${state.highlightRadius}px;background:linear-gradient(transparent 28%,${highlightColor} 28%,${highlightColor} 88%,transparent 88%);color:${highlightTextColor};font-weight:700;`
        : `padding:.05em ${state.highlightPadding}px;border-radius:${state.highlightRadius}px;background:${highlightColor};color:${highlightTextColor};font-weight:700;`;
  const linkCss = `color:${state.linkColor};${state.linkUnderline ? "text-decoration:underline;" : "text-decoration:none;"}`;
  const copyInlineMarkdown = (value) => inlineMarkdown(value).replace(
    /<mark class="inline-highlight">([\s\S]*?)<\/mark>/g,
    `<mark style="${highlightCss}">$1</mark>`,
  ).replace(
    /<a class="inline-link" href="([^"]+)" target="_blank" rel="noreferrer">([\s\S]*?)<\/a>/g,
    `<a href="$1" style="${linkCss}">$2</a>`,
  );
  const model = getArticleModel();
  const textStyle = `color:${state.textColor};font-family:${getFontStack(state.bodyFont)};font-size:${state.fontSize}px;line-height:${state.lineHeight};letter-spacing:${state.letterSpacing}px;text-align:${state.textAlign};text-indent:${state.textIndent}em;margin:0 0 ${state.paragraphSpacing}px;`;
  const headingStyle = (level) => `color:${state.textColor};font-family:${getFontStack(state.headingFont)};font-size:${getHeadingSize(level)}px;line-height:${state.headingLineHeight};font-weight:${state.headingWeight};letter-spacing:-.04em;margin:${state.headingSpacingBefore}px 0 ${state.headingSpacingAfter}px;${isDeepNight ? "font-style:italic;" : ""}`;
  const quoteStyle = `display:block;margin:18px 0 22px;padding:${state.cardPadding}px;border-left:${Math.max(1, state.cardBorderWidth + 2)}px solid ${state.accentColor};border-radius:${state.cardRadius}px;background:${state.quoteColor};color:${state.textColor};font-family:${getFontStack(state.bodyFont)};font-size:${Math.max(12, state.fontSize - 1)}px;line-height:${state.lineHeight};`;
  const cardStyle = `display:block;margin:18px 0 22px;padding:${state.cardPadding}px;border:${state.cardBorderWidth}px solid ${state.accentColor};border-radius:${state.cardRadius}px;background:${state.cardColor};color:${state.textColor};font-family:${getFontStack(state.bodyFont)};font-size:${Math.max(12, state.fontSize - 1)}px;line-height:${state.lineHeight};`;
  const titleStyle = `color:${titleColor};font-family:${getFontStack(state.headingFont)};font-size:${state.titleSize}px;line-height:${state.headingLineHeight};font-weight:${state.headingWeight};letter-spacing:-.04em;margin:0 0 12px;`;
  const subtitleStyle = `color:${mutedColor};font-size:12px;line-height:1.7;margin:0 0 29px;`;
  const headingMarker = isDeepNight ? "" : `<span style="display:inline-block;width:17px;height:4px;margin:0 8px 4px 0;border-radius:99px;background:${state.accentColor};"></span>`;
  const imageStyle = isDeepNight
    ? `height:145px;display:grid;place-items:center;margin:22px 0 26px;border:2px solid ${state.borderColor};border-radius:${state.imageRadius}px;background:${state.pageColor};color:${mutedColor};font-size:11px;font-weight:800;letter-spacing:.13em;`
    : `height:116px;display:grid;place-items:center;margin:22px 0 26px;border-radius:${state.imageRadius}px;background:${state.accentColor};color:#ffffff;font-size:11px;font-weight:800;letter-spacing:.13em;`;
  const listStyle = `margin:0 0 ${state.paragraphSpacing}px;padding-left:${state.listIndent}em;color:${state.textColor};font-family:${getFontStack(state.bodyFont)};font-size:${state.fontSize}px;line-height:${state.lineHeight};text-align:${state.textAlign};`;
  const codeStyle = `overflow:auto;margin:22px 0 26px;padding:${state.cardPadding}px;border-radius:${state.cardRadius}px;background:${isDeepNight ? "#202727" : state.codeBackground};color:${isDeepNight ? "#d7e0f2" : state.codeColor};font:${state.codeFontSize}px/${state.codeLineHeight} ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;`;
  const body = model.blocks.map((item) => {
    if (item.type === "lead") return `<p style="${textStyle}color:${state.accentColor};font-weight:750;">${copyInlineMarkdown(item.text)}</p>`;
    if (item.type === "highlight" && isDeepNight) return `<p style="${textStyle}"><mark style="${highlightCss}">${copyInlineMarkdown(item.text)}</mark></p>`;
    if (item.type === "heading") return `<h3 style="${headingStyle(Number(item.level) || 2)}">${headingMarker}${copyInlineMarkdown(item.text)}</h3>`;
    if (item.type === "paragraph") return `<p style="${textStyle}">${copyInlineMarkdown(item.text)}</p>`;
    if (item.type === "quote") {
      if (state.showQuote) return `<aside style="${quoteStyle}"><strong style="display:block;margin-bottom:7px;color:${state.cardTitleColor};font-size:${state.quoteTitleSize}px;letter-spacing:.1em;">${escapeHtml(item.title || "引用")}</strong>${copyInlineMarkdown(item.text)}</aside>`;
      return `<p style="${textStyle}font-style:italic;">${copyInlineMarkdown(item.text)}</p>`;
    }
    if (item.type === "card") return `<aside style="${cardStyle}"><strong style="display:block;margin-bottom:7px;color:${state.cardTitleColor};font-size:${state.cardTitleSize}px;letter-spacing:.1em;">${escapeHtml(item.title || "重点提示")}</strong>${copyInlineMarkdown(item.text)}</aside>`;
    if (item.type === "divider" && state.showDivider) return `<hr style="height:${state.dividerThickness}px;margin:${state.dividerMargin}px 0;border:0;background:${state.dividerColor};opacity:.35;" />`;
    if (item.type === "image") {
      if (item.url) return `<figure style="margin:22px 0 26px;text-align:center;"><img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.alt)}" style="display:block;max-width:100%;height:auto;margin:0 auto;border-radius:${state.imageRadius}px;" /><figcaption style="margin-top:7px;color:${mutedColor};font-size:${state.captionSize}px;line-height:1.6;">${escapeHtml(item.alt || "文章配图")}</figcaption></figure>`;
      if (state.showImage) return `<div style="${imageStyle}">${escapeHtml(item.alt || "文章配图占位")}</div>`;
      return `<p style="${textStyle}color:${mutedColor};">[图片：${escapeHtml(item.alt || "文章配图")}]</p>`;
    }
    if (item.type === "list") {
      const listTag = item.ordered ? "ol" : "ul";
      return `<${listTag} style="${listStyle}">${item.items.map((entry) => `<li style="margin:${state.listItemSpacing}px 0;">${copyInlineMarkdown(entry)}</li>`).join("")}</${listTag}>`;
    }
    if (item.type === "code") return `<pre style="${codeStyle}"><code>${escapeHtml(item.text)}</code></pre>`;
    return "";
  }).join("");
  return `<div style="background:${state.pageColor};padding:28px 23px;color:${state.textColor};font-family:${getFontStack(state.bodyFont)};"><div style="color:${mutedColor};font-size:10px;letter-spacing:.08em;margin-bottom:22px;">Yooco · 排版预览</div><h2 style="${titleStyle}">${escapeHtml(model.title)}</h2><p style="${subtitleStyle}">${escapeHtml(model.subtitle)}</p><div>${body}</div></div>`;
}

async function copyRichText() {
  const html = buildCopyHtml();
  const plain = document.querySelector("#articlePage").innerText;
  try {
    if (window.ClipboardItem && navigator.clipboard?.write) {
      await navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }), "text/plain": new Blob([plain], { type: "text/plain" }) })]);
    } else {
      const holder = document.createElement("div");
      holder.contentEditable = "true";
      holder.innerHTML = html;
      holder.style.position = "fixed";
      holder.style.left = "-9999px";
      document.body.appendChild(holder);
      const range = document.createRange();
      range.selectNodeContents(holder);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand("copy");
      selection.removeAllRanges();
      holder.remove();
    }
    copyFeedback.textContent = "已复制富文本，可粘贴到公众号编辑器。";
  } catch {
    copyFeedback.textContent = "浏览器未允许自动复制，请手动选中手机预览内容。";
  }
  window.setTimeout(() => { copyFeedback.textContent = ""; }, 3500);
}

function exportConfig() {
  const payload = {
    version: 2,
    updatedAt: new Date().toISOString(),
    template: { type: "universal", name: presetSelect.value ? presetSelect.options[presetSelect.selectedIndex]?.text || "Yooco 模板" : "Yooco 自定义模板", params: getTemplateParams() },
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
      allowed.forEach((key) => { if (incoming[key] !== undefined) state[key] = normalized[key]; });
      presetSelect.value = "";
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
  articleSource = articleInput.value.trim();
  trimInvalidOverrides();
  persistArticleSource();
  if (articleSource) {
    const model = parseArticle(articleSource);
    articleStatus.textContent = `实时预览：${model.blocks.length} 个内容块`;
  } else {
    articleStatus.textContent = "当前使用示例文章";
  }
  if (showStatus) copyFeedback.textContent = articleSource ? "文章已实时更新。" : "已恢复示例文章。";
  render();
}

function clearArticleSource() {
  articleInput.value = "";
  titleInput.value = "";
  articleSource = "";
  articleTitleOverride = "";
  blockTypeOverrides = {};
  lastAiResult = null;
  persistArticleSource();
  articleStatus.textContent = "当前使用示例文章";
  copyFeedback.textContent = "已清空文章，恢复示例内容。";
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
  if (!articleInput.value.trim()) {
    copyFeedback.textContent = "请先粘贴文章，再使用智能分段。";
    return;
  }
  let inCode = false;
  const structured = articleInput.value.replace(/\r\n?/g, "\n").split("\n").map((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      inCode = !inCode;
      return line;
    }
    const isMarkdownBlock = /^(#{1,6}\s|>\s?|[-*+]\s+|!\[|---+$|\*\*\*+$)/.test(trimmed);
    if (inCode || isMarkdownBlock || line.length < 96) return line;
    return splitLongTextLine(line);
  }).join("\n");
  articleInput.value = structured;
  blockTypeOverrides = {};
  lastAiResult = null;
  applyArticleSource(false);
  copyFeedback.textContent = "已按中文句段智能分段，可继续在左侧逐段调整。";
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
    presetSelect.value = "";
    syncControls();
    render();
  };
  control.addEventListener("input", updateControl);
  if (control.tagName === "SELECT") control.addEventListener("change", updateControl);
});
presetSelect.addEventListener("change", () => {
  if (articleInput.value.trim() && articleInput.value.trim() !== articleSource) applyArticleSource(false);
  applyPreset(presetSelect.value);
});
document.querySelector("#resetButton").addEventListener("click", () => { presetSelect.value = DEFAULT_PRESET; applyPreset(DEFAULT_PRESET); });
document.querySelector("#copyButton").addEventListener("click", copyRichText);
document.querySelector("#exportButton").addEventListener("click", exportConfig);
document.querySelector("#importInput").addEventListener("change", (event) => importConfig(event.target.files?.[0]));
clearArticleButton.addEventListener("click", clearArticleSource);
autoSegmentButton.addEventListener("click", autoSegmentArticle);
aiNormalizeButton.addEventListener("click", normalizeWithDeepSeek);
articleInput.addEventListener("input", () => {
  lastAiResult = null;
  applyArticleSource(false);
});
articleInput.addEventListener("paste", handleRichTextPaste);
titleInput.addEventListener("input", () => {
  lastAiResult = null;
  articleTitleOverride = titleInput.value.trim();
  persistArticleSource();
  render();
});
inferTitleToggle.addEventListener("change", () => {
  inferFirstLineTitle = inferTitleToggle.checked;
  persistArticleSource();
  render();
});
structureList.addEventListener("change", (event) => {
  const select = event.target.closest("select[data-block-index]");
  if (!select) return;
  const index = Number(select.dataset.blockIndex);
  const originalType = parseArticle(articleSource).blocks[index]?.type;
  if (select.value === originalType) delete blockTypeOverrides[index];
  else blockTypeOverrides[index] = select.value;
  lastAiResult = null;
  persistArticleSource();
  articleStatus.textContent = "已更新段落类型，右侧预览已同步。";
  render();
});

const saved = localStorage.getItem("wechat-style-lab-config");
if (saved) {
  try {
    const stored = JSON.parse(saved);
    Object.assign(state, stored);
    Object.assign(state, normalizeTemplateParams(stored, state));
    presetSelect.value = "";
  } catch { /* ignore stale local config */ }
}
articleInput.value = articleSource;
titleInput.value = articleTitleOverride;
inferTitleToggle.checked = inferFirstLineTitle;
if (articleSource) articleStatus.textContent = `已载入上次文章：${parseArticle(articleSource).blocks.length} 个内容块`;
syncControls();
render();
