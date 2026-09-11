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
  highlightStyle: 'background', highlightRadius: 3, highlightPadding: 2,
  listIndent: 1.5, listItemSpacing: 6, linkUnderline: true,
  quoteTitleSize: 11, cardTitleSize: 11, cardBorderWidth: 1,
  dividerThickness: 1, dividerMargin: 28, codeFontSize: 13, codeLineHeight: 1.6, captionSize: 11,
  cardRadius: 12, cardPadding: 20, imageRadius: 12,
  showQuote: true, showDivider: true, showImage: true,
};

const NORMALIZATION_SYSTEM_PROMPT = `你是 Yooco 的公众号文章结构编辑。用户会提交纯文本、Markdown、网页富文本转出的文本，或 HTML 源码。

你的任务是把已有内容整理成一份“内容结构 + 通用排版模板”的 JSON。必须忠实保留原文的含义和已有信息；不得补写事实、作者、数据、图片、链接或结论，不得删除实质内容。template 是可复用的通用阅读模板建议，不是原文事实，也不应模仿文章品牌。

内容标注规则：
1. document.title 仅在原文明确存在主标题时填写；不确定时填空字符串，不要猜测。
2. blocks 使用 type: heading、paragraph、quote、card、list、divider、image、code。普通文本应拆成合理段落；heading 的 level 只能是 2 至 6。
3. 只有原文明确是引语、观点摘录或被引用的话才用 quote。只有内容本身具有独立提示、总结、步骤要点或强语义边界时才用 card；不要把普通正文滥用成卡片。
4. list 使用 items 和 ordered；原文已有图片时，image 只可保留原文已有的 http/https URL。若原文没有图片，但一张配图能明显帮助理解，可插入少量 image 占位块来表达放置位置：url 留空，alt 以“配图建议：”开头，并填写 placementHint；不得把它说成原文已有图片，更不得虚构 URL。divider 只用于原文已有或明显的章节分隔；code 只保留原文已有代码。
5. marks 用于文本内的重点：每项只允许 {"text":"原文中的完整连续片段","type":"bold"} 或 {"text":"原文中的完整连续片段","type":"highlight"}。每个有实际信息的 paragraph、quote 或 card 默认标记 1 至 3 处：优先核心结论、行动建议、数值或时间、专有名词、对比和风险。短句最多 1 处，普通段最多 2 处，长段最多 3 处；避免重叠，不要标记语气词或整句的大面积重复内容。优先用 highlight 标记结论、行动和数值，用 bold 标记概念和术语。text 必须逐字出现于所在 block.text；不要重写或补写文字。
6. 所有 block 的文字只放在 text；card/quote 可选 title；list 的每一项放在 items；image 使用 url、alt 和可选 placementHint；code 可选 language。

通用模板规则：
1. template 必须是 {"type":"universal","name":"不超过24字的模板名","params":{...}}。params 必须包含所有字段：textColor、accentColor、highlightColor、highlightTextColor、cardColor、quoteColor、cardTitleColor、pageColor、linkColor、codeBackground、codeColor、dividerColor、bodyFont、headingFont、textAlign、textIndent、fontSize、lineHeight、letterSpacing、paragraphSpacing、contentWidth、readingDensity、titleSize、headingSize、subheadingSize、minorHeadingSize、headingWeight、headingLineHeight、headingSpacingBefore、headingSpacingAfter、highlightStyle、highlightRadius、highlightPadding、listIndent、listItemSpacing、linkUnderline、quoteTitleSize、cardTitleSize、cardBorderWidth、dividerThickness、dividerMargin、codeFontSize、codeLineHeight、captionSize、cardRadius、cardPadding、imageRadius、showQuote、showDivider、showImage。
2. 所有颜色是 #RRGGBB；bodyFont/headingFont 只能为 system、serif、modern；textAlign 只能为 left、justify；DeepSeek 的 readingDensity 只能为 compact、standard、comfortable；用户导入的既有模板也可使用 custom；highlightStyle 只能为 background、marker、underline、bold；布尔开关为 true/false。颜色和数值只是通用模板建议，用户随后可手动覆盖。
3. 如原文没有清楚视觉线索，使用克制、易读的浅色公众号风格；不要根据内容编造“原文使用过”的颜色。

严格只输出一个 JSON 对象，不要输出解释、前言或代码围栏：
{
  "version": 2,
  "template": { "type": "universal", "name": "清晰阅读", "params": { "textColor": "#3f3f3f", "accentColor": "#6e8e23", "highlightColor": "#d7fa5c", "highlightTextColor": "#20231f", "cardColor": "#f0f4e5", "quoteColor": "#f7f8f1", "cardTitleColor": "#6e8e23", "pageColor": "#ffffff", "linkColor": "#3f6f9f", "codeBackground": "#edf0e5", "codeColor": "#2c4030", "dividerColor": "#6e8e23", "bodyFont": "system", "headingFont": "system", "textAlign": "left", "textIndent": 0, "fontSize": 16, "lineHeight": 1.75, "letterSpacing": 0.3, "paragraphSpacing": 18, "contentWidth": 620, "readingDensity": "standard", "titleSize": 26, "headingSize": 27, "subheadingSize": 23, "minorHeadingSize": 20, "headingWeight": 800, "headingLineHeight": 1.35, "headingSpacingBefore": 32, "headingSpacingAfter": 12, "highlightStyle": "background", "highlightRadius": 3, "highlightPadding": 2, "listIndent": 1.5, "listItemSpacing": 6, "linkUnderline": true, "quoteTitleSize": 11, "cardTitleSize": 11, "cardBorderWidth": 1, "dividerThickness": 1, "dividerMargin": 28, "codeFontSize": 13, "codeLineHeight": 1.6, "captionSize": 11, "cardRadius": 12, "cardPadding": 20, "imageRadius": 12, "showQuote": true, "showDivider": true, "showImage": true } },
  "document": { "title": "", "blocks": [{ "type": "paragraph", "text": "" }] },
  "summary": { "titleCount": 0, "headingCount": 0, "paragraphCount": 0, "quoteCount": 0, "cardCount": 0, "listCount": 0, "imageCount": 0 }
}`;

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
  return source;
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
  const allowedTypes = new Set(['heading', 'paragraph', 'quote', 'card', 'list', 'divider', 'image', 'code']);
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

function normalizeAiResult(result) {
  return {
    version: 2,
    template: normalizeTemplate(result?.template, result?.params),
    document: normalizeDocument(result?.document),
    summary: normalizeSummary(result?.summary),
  };
}

async function normalizeWithDeepSeek(source, apiKey, model = 'deepseek-flash') {
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
          { role: 'system', content: NORMALIZATION_SYSTEM_PROMPT },
          { role: 'user', content: source },
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

  return normalizeAiResult(result);
}

export { AppError, normalizeWithDeepSeek, validateRequest };
