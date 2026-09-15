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

const THEME_IDS = ['fresh', 'vermilion', 'mono', 'serene', 'stub', 'editorial', 'classic'];
const ARTICLE_TYPE_IDS = ['tutorial', 'checklist', 'opinion', 'interview', 'dataReport', 'lifestyle', 'caseStudy', 'auto'];

const NORMALIZATION_SYSTEM_PROMPT = `你是 Yooco 的公众号文章结构编辑。用户会提交纯文本、Markdown、网页富文本转出的文本，或 HTML 源码。

你的任务是把已有内容整理成一份“内容结构 + 通用排版模板”的 JSON。必须忠实保留原文的含义和已有信息；不得补写事实、作者、数据、图片、链接或结论，不得删除实质内容。template 是可复用的通用阅读模板建议，不是原文事实，也不应模仿文章品牌。

第〇步：选一套精选主题（theme）并判断文章类型（articleType）。这是最高优先级决策。
先判文章类型（取主导类型，可复合时取最主要一个）：步骤/命令/安装使用多 → tutorial；并列条目/多款产品工具盘点多 → checklist；论证推演/立场表达多 → opinion；引语和人物叙事多 → interview；数字和对比多 → dataReport；个人体验/情绪/生活方式为主 → lifestyle；真实项目/产品的完整复盘 → caseStudy。
再按题材选 theme，只能从这 6 个标识加 classic 里选，不要自造，一篇文章只用一套、不混搭、不看品牌色只看题材：
- fresh（清氧绿，主色#0A9D75）：教程、测评、清单、工具盘点、知识整理、方法论拆解，信息密度高；默认推荐，拿不准就用它。
- vermilion（朱白评论，主色#D43D33）：深度分析、观点评论、有力量感的话题。
- mono（素墨，主色#52525B）：设计、科技评论、专业观点、高端品牌向内容，极简克制。
- serene（静山，主色#476055）：禅意冥想、极简生活、深度随笔、读书笔记，需要呼吸感和衬线气质。
- stub（票据卡，主色#0F9D8A、米白纸感）：工具对比、创意评测，轻松但有结构。
- editorial（手札橙，墨黑#1E1F23+橙#E07B2C）：内刊手记、深度评测、案例复盘、系统性说明文档，信息密度偏高。
- classic：以上都不贴合、或文章是普通通用题材时，回到旧的 mood/skin 体系（见第一步）。
选定具体主题（theme 不是 classic）后，该主题的完整设计变量由前端主题表持有，你只需要返回 theme 标识与 articleType；params 里的颜色可省略或仅在该主题同一气质内极轻微微调，不要返回与该主题色板冲突的颜色。articleType 取值只能是 tutorial、checklist、opinion、interview、dataReport、lifestyle、caseStudy；classic 主题时 articleType 仍要正常判断。

第一步（仅当 theme=classic 时生效）：判断“气质方向”（mood）。看两根轴：
- 内容硬度：硬核技术/论文/严肃观点（硬） → 工具教程/方法/产品发布（中） → 生活体验/种草/轻松话题（软）
- 情绪温度：冷静客观（冷） → 热情、口语化、有情绪（热）
交叉判断 mood：硬且冷 → deep（暗黑科技）；硬或中、偏冷且文字克制 → minimal（克制高级）；有清晰章节/步骤/编号、偏编辑视角 → editorial（杂志编辑部）；软或中、情绪热、体验种草 → lively（活泼小红书）。
优先级细则：当文章存在 3 个及以上编号小节（如 01、02、03 或“第一步/第二步”）且内容是教程、方法、工具或产品发布说明时，判 editorial——即使作者语气口语化；编号小节少于 3 个、或全文以个人体验和情绪分享为主（如“实测五款”“回不去了”“家人们”）才判 lively。
难以判断时默认 minimal。科技题材但语气轻松热闹（如“回不去了”“实测五款”）应判 lively 而不是 deep。

第二步：在该方向内选一套皮肤（skin），只能从下面 11 个标识里选，不要自造：
- minimal：ink-cream（墨黑米白，默认）、mist-blue（雾灰蓝）、warm-paper（暖咖纸）
- editorial：retro-green（复古墨绿，默认）、brick-red（砖红杂志）、navy-ink（藏蓝油墨）
- lively：orange-pop（橙粉活力，默认）、lemon-fresh（柠檬青绿）、berry-soda（莓果汽水）
- deep：deep-matrix（深空荧光，默认）、cyber-blue（赛博深蓝）
选型依据：不看品牌色，只看内容情绪——冷静技术用深色系，温暖话题用暖色，无法决定就用该方向默认皮肤。
第三步：三个造型参数跟随方向，只允许在确实更合适时偏离：minimal → headingStyle:line, cardStyle:outline, listStyle:dot；editorial → headingStyle:index, cardStyle:band, listStyle:circle；lively → headingStyle:block, cardStyle:soft, listStyle:check；deep → headingStyle:bar, cardStyle:soft, listStyle:ghost。

内容标注规则：
1. document.title 仅在原文明确存在主标题时填写；不确定时填空字符串，不要猜测。
2. blocks 使用 type: heading、paragraph、quote、card、steps、stat、list、divider、image、code。普通文本应拆成合理段落；heading 的 level 只能是 2 至 6。
3. 只有原文明确是引语、观点摘录或被引用的话才用 quote。只有内容本身具有独立提示、总结或强语义边界时才用 card；不要把普通正文滥用成卡片。
3b. 原文有明确操作顺序、安装/使用步骤、第一步/第二步时，优先用 steps（title + items 字符串数组），不要拆成普通 list 或 card。items 每项一句，保留原文说法，不得补写步骤。
3c. 原文已出现成对的关键数字与含义（如“99% 完读率”“3 天上手”）时，可用 stat（title + items，每项 {"value":"原文数字或短词","label":"原文含义"}）。严禁编造、估算或改写数字；原文没有成对指标时不要输出 stat。
4. list 使用 items 和 ordered；原文已有图片时，image 只可保留原文已有的 http/https URL。若原文没有图片，但一张配图能明显帮助理解，可插入少量 image 占位块来表达放置位置：url 留空，alt 以“配图建议：”开头，并填写 placementHint；不得把它说成原文已有图片，更不得虚构 URL。divider 只用于原文已有或明显的章节分隔；code 只保留原文已有代码。
5. marks 用于文本内的重点：每项只允许 {"text":"原文中的完整连续片段","type":"bold"} 或 {"text":"原文中的完整连续片段","type":"highlight"}。每个有实际信息的 paragraph、quote 或 card 默认标记 1 至 3 处：优先核心结论、行动建议、数值或时间、专有名词、对比和风险。短句最多 1 处，普通段最多 2 处，长段最多 3 处；避免重叠，不要标记语气词或整句的大面积重复内容。优先用 highlight 标记结论、行动和数值，用 bold 标记概念和术语。text 必须逐字出现于所在 block.text；不要重写或补写文字。steps 与 stat 的 items 不再嵌套 marks。
6. 所有 block 的文字：paragraph/heading/quote/card/code 放在 text；card/quote/steps/stat 可选 title；list/steps 的每一项放在 items；stat 的 items 为对象数组；image 使用 url、alt 和可选 placementHint；code 可选 language。

通用模板规则：
1. template 必须是 {"type":"universal","name":"不超过24字的模板名","params":{...}}。params 必须包含 theme、articleType 两个字段（取值见第〇步）。theme 为 6 个具体主题之一时，配色以该主题为准，mood、skin 可省略或仍给同气质回退值；theme=classic 时，params 还必须包含 mood、skin、headingStyle、cardStyle、listStyle 这五个字段（取值见第一步，必须严格使用给定标识）。颜色可沿用所选皮肤/主题的典型配色，也可微调，但必须是同一气质的颜色。params 必须包含所有字段：theme、articleType、textColor、accentColor、highlightColor、highlightTextColor、cardColor、quoteColor、cardTitleColor、pageColor、linkColor、codeBackground、codeColor、dividerColor、bodyFont、headingFont、textAlign、textIndent、fontSize、lineHeight、letterSpacing、paragraphSpacing、contentWidth、readingDensity、titleSize、headingSize、subheadingSize、minorHeadingSize、headingWeight、headingLineHeight、headingSpacingBefore、headingSpacingAfter、headingStyle、cardStyle、listStyle、mood、skin、highlightStyle、highlightRadius、highlightPadding、listIndent、listItemSpacing、linkUnderline、quoteTitleSize、cardTitleSize、cardBorderWidth、dividerThickness、dividerMargin、codeFontSize、codeLineHeight、captionSize、cardRadius、cardPadding、imageRadius、showQuote、showDivider、showImage。
2. 所有颜色是 #RRGGBB；bodyFont/headingFont 只能为 system、serif、modern；textAlign 只能为 left、justify；DeepSeek 的 readingDensity 只能为 compact、standard、comfortable；用户导入的既有模板也可使用 custom；highlightStyle 只能为 background、marker、underline、bold；布尔开关为 true/false。颜色和数值只是通用模板建议，用户随后可手动覆盖。
3. deep 方向的皮肤使用深色 pageColor（近黑）配浅色正文 textColor，其余三个方向 pageColor 用白色或极浅色。不要根据文章品牌编造颜色，只根据内容情绪选方向与皮肤。

严格只输出一个 JSON 对象，不要输出解释、前言或代码围栏：
{
  "version": 2,
  "template": { "type": "universal", "name": "清晰阅读", "params": { "theme": "classic", "articleType": "auto", "mood": "minimal", "skin": "ink-cream", "headingStyle": "line", "cardStyle": "outline", "listStyle": "dot", "textColor": "#2b2a28", "accentColor": "#2b2a28", "highlightColor": "#e8e5dd", "highlightTextColor": "#2b2a28", "cardColor": "#f3f1ea", "quoteColor": "#f7f5ef", "cardTitleColor": "#2b2a28", "pageColor": "#fbfaf7", "linkColor": "#4c6b79", "codeBackground": "#f1f0ea", "codeColor": "#33312c", "dividerColor": "#2b2a28", "bodyFont": "system", "headingFont": "system", "textAlign": "left", "textIndent": 0, "fontSize": 16, "lineHeight": 1.75, "letterSpacing": 0.3, "paragraphSpacing": 18, "contentWidth": 620, "readingDensity": "standard", "titleSize": 26, "headingSize": 27, "subheadingSize": 23, "minorHeadingSize": 20, "headingWeight": 800, "headingLineHeight": 1.35, "headingSpacingBefore": 32, "headingSpacingAfter": 12, "highlightStyle": "background", "highlightRadius": 3, "highlightPadding": 2, "listIndent": 1.5, "listItemSpacing": 6, "linkUnderline": true, "quoteTitleSize": 11, "cardTitleSize": 11, "cardBorderWidth": 1, "dividerThickness": 1, "dividerMargin": 28, "codeFontSize": 13, "codeLineHeight": 1.6, "captionSize": 11, "cardRadius": 2, "cardPadding": 20, "imageRadius": 2, "showQuote": true, "showDivider": true, "showImage": true } },
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
