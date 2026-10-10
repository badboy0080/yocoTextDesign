import { groundAiDocument } from '../public/ground-title.js';

const MAX_SOURCE_CHARS = 160_000;
const NORMALIZE_TIMEOUT_MS = 60_000;

const DEFAULT_AI_PARAMS = {
  textColor: '#3f3f3f', accentColor: '#6e8e23', highlightColor: '#d7fa5c', highlightTextColor: '#20231f',
  cardColor: '#f0f4e5', quoteColor: '#f7f8f1', cardTitleColor: '#6e8e23', pageColor: '#ffffff',
  linkColor: '#3f6f9f', codeBackground: '#edf0e5', codeColor: '#2c4030', dividerColor: '#6e8e23',
  bodyFont: 'system', headingFont: 'system', textAlign: 'left', textIndent: 0,
  fontSize: 16, lineHeight: 1.75, letterSpacing: 0.3, paragraphSpacing: 18, contentWidth: 620,
  readingDensity: 'standard', titleSize: 26, headingSize: 27, subheadingSize: 23, minorHeadingSize: 20,
  headingWeight: 800, headingLineHeight: 1.35, headingSpacingBefore: 32, headingSpacingAfter: 12,
  headingStyle: 'bar', cardStyle: 'border', listStyle: 'dot',
  mood: 'minimal', skin: 'ink-cream',
  highlightStyle: 'background', highlightRadius: 3, highlightPadding: 2,
  listIndent: 1.5, listItemSpacing: 6, linkUnderline: true,
  quoteTitleSize: 11, cardTitleSize: 11, cardBorderWidth: 1,
  dividerThickness: 1, dividerMargin: 28, codeFontSize: 13, codeLineHeight: 1.6, captionSize: 11,
  cardRadius: 12, cardPadding: 20, imageRadius: 12,
  showQuote: true, showDivider: true, showImage: true,
  theme: 'classic', articleType: 'auto', showSignature: false,
};

const THEME_IDS = ['fresh', 'mono', 'serene', 'stub', 'editorial', 'scout', 'classic'];
const ARTICLE_TYPE_IDS = ['tutorial', 'checklist', 'opinion', 'interview', 'dataReport', 'lifestyle', 'caseStudy', 'auto'];
const MOOD_IDS = ['minimal', 'editorial', 'lively', 'deep'];
const SKIN_IDS = [
  'ink-cream', 'mist-blue', 'warm-paper',
  'retro-green', 'brick-red', 'navy-ink',
  'orange-pop', 'lemon-fresh', 'berry-soda',
  'deep-matrix', 'cyber-blue',
];
const MOOD_SHAPES = {
  minimal: { headingStyle: 'line', cardStyle: 'outline', listStyle: 'dot' },
  editorial: { headingStyle: 'index', cardStyle: 'band', listStyle: 'circle' },
  lively: { headingStyle: 'block', cardStyle: 'soft', listStyle: 'check' },
  deep: { headingStyle: 'bar', cardStyle: 'soft', listStyle: 'ghost' },
};

const THEME_RECIPE_TEXT = `五套主题的内容块配方。core 是优先使用的块，accent 是原文确实有时才加。没有原文依据的步骤、代码、数字不要为了凑配方去编。
- fresh 清氧绿：教程 core=steps,code,card accent=quote,list；盘点 core=list,card accent=stat,quote；观点 core=paragraph,quote,card accent=divider；访谈 core=paragraph,quote accent=card,divider；数据 core=stat,list accent=card；生活 core=paragraph,card accent=quote；案例 core=steps,list accent=code,quote。
- mono 素墨：观点 core=paragraph,quote accent=card；教程 core=steps,code,list accent=card；盘点 core=list,card accent=stat；访谈 core=paragraph,quote accent=card；数据 core=stat,list accent=card；生活 core=paragraph,quote accent=card；案例 core=steps,list accent=quote。
- serene 静山：观点 core=paragraph,quote accent=card；生活 core=paragraph accent=quote；访谈 core=paragraph,quote accent=card；盘点 core=paragraph,list accent=card；数据 core=paragraph,stat accent=card；教程 core=paragraph,list,card accent=steps；案例 core=paragraph,list accent=quote。少用大色块。
- stub 票据卡：教程 core=list,steps,card accent=code,image；盘点 core=list,card accent=image；观点 core=paragraph,card accent=list；访谈 core=paragraph,steps,card accent=quote；数据 core=card,list accent=code；生活 core=paragraph,card accent=list；案例 core=steps,image,card,list accent=quote。
- editorial 手札橙：教程 core=steps,code,paragraph,list accent=card,image；盘点 core=list,card accent=image,stat；观点 core=paragraph,card,quote accent=list；数据 core=stat,card,list accent=code；访谈 core=paragraph,quote,list accent=card；生活 core=paragraph,card accent=divider；案例 core=list,card accent=stat,quote。
- scout 星探绿：教程 core=steps,code,list accent=paragraph,card；盘点 core=list,paragraph accent=card；观点 core=paragraph,list accent=quote,card；访谈 core=paragraph,quote accent=list；数据 core=list,stat accent=paragraph,card；生活 core=paragraph accent=quote；案例 core=paragraph,list,code accent=steps,card。`;

function normalizeAssignment(body) {
  const raw = body?.assignment;
  if (!raw || raw.mode !== 'fixed') return { mode: 'choose' };
  const theme = THEME_IDS.includes(raw.theme) ? raw.theme : '';
  if (!theme) return { mode: 'choose' };
  const assignment = { mode: 'fixed', theme };
  if (theme === 'classic') {
    if (MOOD_IDS.includes(raw.mood)) assignment.mood = raw.mood;
    if (SKIN_IDS.includes(raw.skin)) assignment.skin = raw.skin;
  }
  return assignment;
}

function assignmentBrief(assignment) {
  if (!assignment || assignment.mode !== 'fixed') {
    return '本次没有指定主题。请按文章从 fresh、mono、serene、stub、editorial、scout、classic 里选最贴的一套。拿不准用 fresh。只有这些新主题都不贴时才选 classic。';
  }
  if (assignment.theme !== 'classic') {
    return `本次主题已指定为 ${assignment.theme}。不要改主题，不要输出颜色。按这套主题对应文章类型的配方重拆。`;
  }
  if (assignment.mood && assignment.skin) {
    return `本次已指定 classic，气质 ${assignment.mood}，皮肤 ${assignment.skin}。不要改这三项，不要输出颜色。只重拆文字。造型必须用该气质的招牌。`;
  }
  return '本次主题已指定为 classic。不要改成五套新主题，不要输出颜色。请按文章选 mood 和 skin，造型必须用该气质的招牌。';
}

function buildNormalizationPrompt(assignment) {
  return `你是 Yooco 的公众号文章结构编辑。用户会提交纯文本、Markdown、网页富文本转出的文本，或 HTML 源码。

你的任务只做两件事：选定主题与文章类型，并把已有内容拆成内容块。必须忠实保留原文的含义和已有信息；不得补写事实、作者、数据、图片、链接或结论，不得删除实质内容。颜色、字号、圆角由前端主题表决定，你不要输出这些字段。

${assignmentBrief(assignment)}

文章类型 articleType 只能是 tutorial、checklist、opinion、interview、dataReport、lifestyle、caseStudy。取主导类型。

主题标识：fresh 清氧绿（教程、测评、清单、工具盘点，拿不准用它）；mono 素墨（设计、科技评论、克制专业）；serene 静山（随笔、冥想、读书笔记）；stub 票据卡（工具对比、轻松测评）；editorial 手札橙（内刊、案例复盘、说明文档）；scout 星探绿（开源项目导读、拆解、上手步骤）；classic 旧体系。

${THEME_RECIPE_TEXT}

只有 theme=classic 时才选气质和皮肤，不要自造标识。
气质 mood：硬且冷 → deep；硬或中、偏冷且克制 → minimal；有 3 个及以上编号小节的教程、方法、工具或产品说明 → editorial，即使语气口语化；编号少于 3 个且以个人体验、情绪、种草为主 → lively。拿不准用 minimal。轻松热闹的科技体验文判 lively，不判 deep。
皮肤 skin 只能从该气质里选：minimal=ink-cream（默认）、mist-blue、warm-paper；editorial=retro-green（默认）、brick-red、navy-ink；lively=orange-pop（默认）、lemon-fresh、berry-soda；deep=deep-matrix（默认）、cyber-blue。不看品牌色。造型必须是：minimal → headingStyle line、cardStyle outline、listStyle dot；editorial → index、band、circle；lively → block、soft、check；deep → bar、soft、ghost。

内容标注规则：
1. document.title 只能照抄原文里已经写明的主标题。去掉空格和标点后，必须能在原文中找到。原文没有单独标题时填空字符串。禁止编造标题，禁止把正文改写成新闻标题。
2. blocks 使用 type: heading、paragraph、quote、card、steps、stat、list、divider、image、code。heading 的 level 只能是 2 至 6。不要新增原文里没有的 heading，尤其不要把编造的大标题放在第一块。
3. 只有原文明确是引语才用 quote。只有内容本身有独立提示、总结或强边界时才用 card。
4. 原文有明确操作顺序时才用 steps（title + items 字符串数组）。items 每项一句，不得补写步骤。
5. 原文已有成对的数字和含义时才用 stat（title + items，每项 {"value":"原文数字或短词","label":"原文含义"}）。严禁编造数字。
6. list 使用 items 和 ordered。原文已有图片时，image 只保留已有的 http/https URL。没有图片但配图能帮助理解时，可插入少量 image 占位：url 留空，alt 以“配图建议：”开头，并填写 placementHint。不得虚构 URL。
7. marks 只用于 paragraph、quote、card 的 text 内：{"text":"原文连续片段","type":"bold"} 或 highlight。每块 1 至 3 处。highlight 标结论、行动、数值；bold 标概念。text 必须逐字出现在所在 block.text。steps 和 stat 不再嵌套 marks。
8. paragraph、heading、quote、card、code 的文字放 text。card、quote、steps、stat 可选 title。code 可选 language。

严格只输出一个 JSON 对象，不要解释或代码围栏。非 classic 时 params 只有 theme 和 articleType。classic 时再加 mood、skin、headingStyle、cardStyle、listStyle：
{
  "version": 2,
  "template": { "type": "universal", "name": "不超过24字", "params": { "theme": "fresh", "articleType": "tutorial" } },
  "document": { "title": "", "blocks": [{ "type": "paragraph", "text": "" }] },
  "summary": { "titleCount": 0, "headingCount": 0, "paragraphCount": 0, "quoteCount": 0, "cardCount": 0, "listCount": 0, "imageCount": 0 }
}`;
}

class AppError extends Error {
  constructor(code, message, status = 500) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function validateRequest(body) {
  if (!body || typeof body.source !== 'string') {
    throw new AppError('INVALID_INPUT', '请先粘贴需要整理的文章内容。', 400);
  }
  const source = body.source.trim();
  if (!source) throw new AppError('EMPTY_INPUT', '请先粘贴需要整理的文章内容。', 400);
  if (source.length > MAX_SOURCE_CHARS) {
    throw new AppError('SOURCE_TOO_LARGE', '文章过长，请分段整理或控制在 160,000 个字符以内。', 413);
  }
  return { source, assignment: normalizeAssignment(body) };
}

function normalizeSummary(summary) {
  const fields = ['titleCount', 'headingCount', 'paragraphCount', 'quoteCount', 'cardCount', 'listCount', 'imageCount'];
  return fields.reduce((result, field) => {
    result[field] = Number.isFinite(summary?.[field]) ? Math.max(0, Number(summary[field])) : 0;
    return result;
  }, {});
}

function clampNumber(value, min, max, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.min(max, Math.max(min, numeric)) : fallback;
}

function clampStepped(value, min, max, step, fallback) {
  const clamped = clampNumber(value, min, max, fallback);
  return Number((min + Math.round((clamped - min) / step) * step).toFixed(4));
}

function normalizeColor(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(String(value || '').trim()) ? String(value).trim().toLowerCase() : fallback;
}

function normalizeEnum(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function normalizeParams(params) {
  return {
    textColor: normalizeColor(params?.textColor, DEFAULT_AI_PARAMS.textColor),
    accentColor: normalizeColor(params?.accentColor, DEFAULT_AI_PARAMS.accentColor),
    highlightColor: normalizeColor(params?.highlightColor, DEFAULT_AI_PARAMS.highlightColor),
    highlightTextColor: normalizeColor(params?.highlightTextColor, DEFAULT_AI_PARAMS.highlightTextColor),
    cardColor: normalizeColor(params?.cardColor, DEFAULT_AI_PARAMS.cardColor),
    quoteColor: normalizeColor(params?.quoteColor, DEFAULT_AI_PARAMS.quoteColor),
    cardTitleColor: normalizeColor(params?.cardTitleColor, DEFAULT_AI_PARAMS.cardTitleColor),
    pageColor: normalizeColor(params?.pageColor, DEFAULT_AI_PARAMS.pageColor),
    linkColor: normalizeColor(params?.linkColor, DEFAULT_AI_PARAMS.linkColor),
    codeBackground: normalizeColor(params?.codeBackground, DEFAULT_AI_PARAMS.codeBackground),
    codeColor: normalizeColor(params?.codeColor, DEFAULT_AI_PARAMS.codeColor),
    dividerColor: normalizeColor(params?.dividerColor, DEFAULT_AI_PARAMS.dividerColor),
    bodyFont: normalizeEnum(params?.bodyFont, ['system', 'serif', 'modern'], DEFAULT_AI_PARAMS.bodyFont),
    headingFont: normalizeEnum(params?.headingFont, ['system', 'serif', 'modern'], DEFAULT_AI_PARAMS.headingFont),
    textAlign: normalizeEnum(params?.textAlign, ['left', 'justify'], DEFAULT_AI_PARAMS.textAlign),
    textIndent: Number(clampNumber(params?.textIndent, 0, 2, DEFAULT_AI_PARAMS.textIndent).toFixed(2)),
    fontSize: Math.round(clampNumber(params?.fontSize, 14, 22, DEFAULT_AI_PARAMS.fontSize)),
    lineHeight: clampStepped(params?.lineHeight, 1.35, 2.2, 0.05, DEFAULT_AI_PARAMS.lineHeight),
    letterSpacing: Number(clampNumber(params?.letterSpacing, -0.5, 2, DEFAULT_AI_PARAMS.letterSpacing).toFixed(1)),
    paragraphSpacing: clampStepped(params?.paragraphSpacing, 4, 40, 2, DEFAULT_AI_PARAMS.paragraphSpacing),
    contentWidth: clampStepped(params?.contentWidth, 280, 680, 10, DEFAULT_AI_PARAMS.contentWidth),
    readingDensity: normalizeEnum(params?.readingDensity, ['compact', 'standard', 'comfortable', 'custom'], DEFAULT_AI_PARAMS.readingDensity),
    titleSize: Math.round(clampNumber(params?.titleSize, 22, 36, DEFAULT_AI_PARAMS.titleSize)),
    headingSize: Math.round(clampNumber(params?.headingSize, 20, 34, DEFAULT_AI_PARAMS.headingSize)),
    subheadingSize: Math.round(clampNumber(params?.subheadingSize, 18, 30, DEFAULT_AI_PARAMS.subheadingSize)),
    minorHeadingSize: Math.round(clampNumber(params?.minorHeadingSize, 16, 26, DEFAULT_AI_PARAMS.minorHeadingSize)),
    headingWeight: Math.round(clampNumber(params?.headingWeight, 500, 900, DEFAULT_AI_PARAMS.headingWeight) / 100) * 100,
    headingLineHeight: clampStepped(params?.headingLineHeight, 1.1, 1.7, 0.05, DEFAULT_AI_PARAMS.headingLineHeight),
    headingSpacingBefore: clampStepped(params?.headingSpacingBefore, 8, 48, 2, DEFAULT_AI_PARAMS.headingSpacingBefore),
    headingSpacingAfter: clampStepped(params?.headingSpacingAfter, 4, 32, 2, DEFAULT_AI_PARAMS.headingSpacingAfter),
    headingStyle: normalizeEnum(params?.headingStyle, ['bar', 'line', 'index', 'block'], DEFAULT_AI_PARAMS.headingStyle),
    cardStyle: normalizeEnum(params?.cardStyle, ['border', 'outline', 'soft', 'band'], DEFAULT_AI_PARAMS.cardStyle),
    listStyle: normalizeEnum(params?.listStyle, ['dot', 'circle', 'ghost', 'check'], DEFAULT_AI_PARAMS.listStyle),
    mood: normalizeEnum(params?.mood, ['minimal', 'editorial', 'lively', 'deep'], DEFAULT_AI_PARAMS.mood),
    skin: normalizeEnum(params?.skin, [
      'ink-cream', 'mist-blue', 'warm-paper',
      'retro-green', 'brick-red', 'navy-ink',
      'orange-pop', 'lemon-fresh', 'berry-soda',
      'deep-matrix', 'cyber-blue',
    ], DEFAULT_AI_PARAMS.skin),
    highlightStyle: normalizeEnum(params?.highlightStyle, ['background', 'marker', 'underline', 'bold'], DEFAULT_AI_PARAMS.highlightStyle),
    highlightRadius: Math.round(clampNumber(params?.highlightRadius, 0, 12, DEFAULT_AI_PARAMS.highlightRadius)),
    highlightPadding: Math.round(clampNumber(params?.highlightPadding, 0, 8, DEFAULT_AI_PARAMS.highlightPadding)),
    listIndent: clampStepped(params?.listIndent, 1, 3, 0.25, DEFAULT_AI_PARAMS.listIndent),
    listItemSpacing: Math.round(clampNumber(params?.listItemSpacing, 0, 20, DEFAULT_AI_PARAMS.listItemSpacing)),
    linkUnderline: typeof params?.linkUnderline === 'boolean' ? params.linkUnderline : DEFAULT_AI_PARAMS.linkUnderline,
    quoteTitleSize: Math.round(clampNumber(params?.quoteTitleSize, 10, 18, DEFAULT_AI_PARAMS.quoteTitleSize)),
    cardTitleSize: Math.round(clampNumber(params?.cardTitleSize, 10, 18, DEFAULT_AI_PARAMS.cardTitleSize)),
    cardBorderWidth: Math.round(clampNumber(params?.cardBorderWidth, 0, 4, DEFAULT_AI_PARAMS.cardBorderWidth)),
    dividerThickness: Math.round(clampNumber(params?.dividerThickness, 1, 4, DEFAULT_AI_PARAMS.dividerThickness)),
    dividerMargin: clampStepped(params?.dividerMargin, 8, 48, 2, DEFAULT_AI_PARAMS.dividerMargin),
    codeFontSize: Math.round(clampNumber(params?.codeFontSize, 11, 18, DEFAULT_AI_PARAMS.codeFontSize)),
    codeLineHeight: Number(clampNumber(params?.codeLineHeight, 1.2, 2, DEFAULT_AI_PARAMS.codeLineHeight).toFixed(1)),
    captionSize: Math.round(clampNumber(params?.captionSize, 9, 16, DEFAULT_AI_PARAMS.captionSize)),
    cardRadius: Math.round(clampNumber(params?.cardRadius, 0, 24, DEFAULT_AI_PARAMS.cardRadius)),
    cardPadding: clampStepped(params?.cardPadding, 12, 32, 2, DEFAULT_AI_PARAMS.cardPadding),
    imageRadius: Math.round(clampNumber(params?.imageRadius, 0, 24, DEFAULT_AI_PARAMS.imageRadius)),
    showQuote: typeof params?.showQuote === 'boolean' ? params.showQuote : DEFAULT_AI_PARAMS.showQuote,
    showDivider: typeof params?.showDivider === 'boolean' ? params.showDivider : DEFAULT_AI_PARAMS.showDivider,
    showImage: typeof params?.showImage === 'boolean' ? params.showImage : DEFAULT_AI_PARAMS.showImage,
    showSignature: typeof params?.showSignature === 'boolean' ? params.showSignature : DEFAULT_AI_PARAMS.showSignature,
    theme: normalizeEnum(params?.theme, THEME_IDS, DEFAULT_AI_PARAMS.theme),
    articleType: normalizeEnum(params?.articleType, ARTICLE_TYPE_IDS, DEFAULT_AI_PARAMS.articleType),
  };
}

function trimText(value, limit = 20_000) {
  return typeof value === 'string' ? value.trim().slice(0, limit) : '';
}

function normalizeLabel(value, limit) {
  return trimText(value, limit).replace(/\s+/g, ' ').trim();
}

function safeRemoteImageUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function normalizeMarks(marks, text) {
  if (!Array.isArray(marks) || !text) return [];
  return marks.slice(0, 20).flatMap((mark) => {
    const markedText = trimText(mark?.text, 220);
    return markedText && text.includes(markedText) && ['bold', 'highlight'].includes(mark?.type)
      ? [{ text: markedText, type: mark.type }]
      : [];
  });
}

function normalizeDocument(document) {
  const allowedTypes = new Set(['heading', 'paragraph', 'quote', 'card', 'steps', 'stat', 'list', 'divider', 'image', 'code']);
  if (!Array.isArray(document?.blocks) || !document.blocks.length) {
    throw new AppError('DEEPSEEK_INVALID_DOCUMENT', 'DeepSeek 未返回可用的文章结构，请重试。', 502);
  }
  const blocks = document.blocks.slice(0, 260).flatMap((block) => {
    const type = allowedTypes.has(block?.type) ? block.type : 'paragraph';
    if (type === 'divider') return [{ type }];
    if (type === 'list') {
      const items = Array.isArray(block?.items) ? block.items.map((item) => trimText(item, 3_000)).filter(Boolean).slice(0, 80) : [];
      return items.length ? [{ type, items, ordered: Boolean(block?.ordered) }] : [];
    }
    if (type === 'steps') {
      const fromItems = Array.isArray(block?.items)
        ? block.items.map((item) => trimText(item, 3_000)).filter(Boolean)
        : [];
      const fromText = !fromItems.length && block?.text
        ? String(block.text).split(/\n+/).map((line) => trimText(line.replace(/^[-*+]|\d+[.)]\s*/g, ''), 3_000)).filter(Boolean)
        : [];
      const items = (fromItems.length ? fromItems : fromText).slice(0, 40);
      return items.length
        ? [{ type, title: normalizeLabel(block?.title, 80) || '操作步骤', items }]
        : [];
    }
    if (type === 'stat') {
      const rawItems = Array.isArray(block?.items) ? block.items : [];
      const items = rawItems.slice(0, 12).map((item) => {
        if (item && typeof item === 'object') {
          const value = trimText(item.value, 80);
          const label = trimText(item.label, 120);
          return value ? { value, label } : null;
        }
        const text = trimText(item, 200);
        if (!text) return null;
        const parts = text.split(/\s*[|｜／/—–-]\s+/);
        if (parts.length >= 2) return { value: parts[0], label: parts.slice(1).join(' ') };
        const spaced = text.match(/^(\S+)\s+(.+)$/);
        return spaced ? { value: spaced[1], label: spaced[2] } : { value: text, label: '' };
      }).filter(Boolean);
      return items.length
        ? [{ type, title: normalizeLabel(block?.title, 80) || '关键数据', items }]
        : [];
    }
    if (type === 'image') {
      const url = safeRemoteImageUrl(block?.url);
      const alt = normalizeLabel(block?.alt, 240) || '文章配图';
      const placementHint = normalizeLabel(block?.placementHint, 240);
      return url || placementHint ? [{ type, url, alt, placementHint }] : [];
    }
    const text = trimText(block?.text);
    if (!text) return [];
    const normalized = { type, text };
    if (type === 'heading') normalized.level = Math.round(clampNumber(block?.level, 2, 6, 2));
    if (type === 'quote' || type === 'card') normalized.title = normalizeLabel(block?.title, 80) || (type === 'card' ? '重点提示' : '引用');
    if (type === 'code') normalized.language = normalizeLabel(block?.language, 32);
    if (type !== 'code') normalized.marks = normalizeMarks(block?.marks, text);
    return [normalized];
  });
  if (!blocks.length) throw new AppError('DEEPSEEK_INVALID_DOCUMENT', 'DeepSeek 未返回可用的文章内容，请重试。', 502);
  return { title: normalizeLabel(document?.title, 160), blocks };
}

function normalizeTemplate(template, legacyParams) {
  return {
    type: 'universal',
    name: normalizeLabel(template?.name, 24) || 'AI 通用阅读模板',
    params: normalizeParams(template?.params || legacyParams),
  };
}

function normalizeAiResult(result, source) {
  const document = groundAiDocument(normalizeDocument(result?.document), source);
  if (!document.blocks.length) {
    throw new AppError('DEEPSEEK_INVALID_DOCUMENT', 'DeepSeek 未返回可用的文章内容，请重试。', 502);
  }
  return {
    version: 2,
    template: normalizeTemplate(result?.template, result?.params),
    document,
    summary: normalizeSummary(result?.summary),
  };
}

function enforceAssignment(result, assignment) {
  if (!assignment || assignment.mode !== 'fixed') return result;
  const params = result.template.params;
  params.theme = assignment.theme;
  if (assignment.theme !== 'classic') return result;
  if (assignment.mood) params.mood = assignment.mood;
  if (assignment.skin) params.skin = assignment.skin;
  const shapes = MOOD_SHAPES[params.mood];
  if (shapes) Object.assign(params, shapes);
  return result;
}

async function normalizeWithDeepSeek(source, apiKey, model = 'deepseek-flash', assignment = { mode: 'choose' }) {
  if (!apiKey) {
    throw new AppError('DEEPSEEK_API_KEY_MISSING', '尚未配置 DeepSeek API 密钥。请在启动服务前设置 DEEPSEEK_API_KEY。', 503);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), NORMALIZE_TIMEOUT_MS);
  let response;
  try {
    response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        stream: false,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: buildNormalizationPrompt(assignment) },
          { role: 'user', content: `${assignmentBrief(assignment)}\n\n${source}` },
        ],
      }),
    });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new AppError('DEEPSEEK_TIMEOUT', 'DeepSeek 处理超时，请缩短文章后重试。', 504);
    }
    throw new AppError('DEEPSEEK_UNREACHABLE', '暂时无法连接 DeepSeek，请检查网络后重试。', 502);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const providerStatus = response.status;
    const code = providerStatus === 429 ? 'DEEPSEEK_RATE_LIMITED' : 'DEEPSEEK_REQUEST_FAILED';
    const message = providerStatus === 401
      ? 'DeepSeek API 密钥无效，请检查 DEEPSEEK_API_KEY。'
      : providerStatus === 429
        ? 'DeepSeek 当前请求过多，请稍后重试。'
        : 'DeepSeek 暂时无法完成整理，请稍后重试。';
    throw new AppError(code, message, providerStatus === 429 ? 429 : 502);
  }

  let payload;
  let result;
  try {
    payload = await response.json();
    result = JSON.parse(payload?.choices?.[0]?.message?.content || '');
  } catch {
    throw new AppError('DEEPSEEK_INVALID_OUTPUT', 'DeepSeek 返回格式异常，请重试。', 502);
  }

  return enforceAssignment(normalizeAiResult(result, source), assignment);
}

export { AppError, normalizeWithDeepSeek, validateRequest };
