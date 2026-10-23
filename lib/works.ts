export type WorkBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] };

export type WorkPiece = {
  id: string;
  title: string;
  /** 工作台主题列表上的标识。前四项是气质 id，后六项是 themes.js 的主题 id。 */
  themeId: string;
  /** mood：气质，存盘时 theme 仍是 classic，并带上默认皮肤。theme：精选主题。 */
  bind: "mood" | "theme";
  /** 预览卡片样式，避免「杂志编辑部」和「手札橙」都叫 editorial 时撞样式。 */
  sheet: string;
  themeLabel: string;
  fit: string;
  deck: string;
  primary: string;
  pageColor: string;
  titleColor: string;
  textColor: string;
  accentColor: string;
  sheetNo: string;
  source: string;
  /** 排版前的纯文本。只有配了原文的模板才写，没有就留空，弹窗左栏会显示占位说明。 */
  plain?: string;
  blocks: WorkBlock[];
  params: Record<string, string | number | boolean>;
};

const MOOD_SKIN: Record<string, string> = {
  minimal: "ink-cream",
  editorial: "retro-green",
  lively: "orange-pop",
  deep: "deep-matrix",
};

const minimalParams = {
  textColor: "#2b2a28",
  accentColor: "#2b2a28",
  highlightColor: "#e8e5dd",
  highlightTextColor: "#2b2a28",
  cardColor: "#f3f1ea",
  quoteColor: "#f7f5ef",
  cardTitleColor: "#2b2a28",
  pageColor: "#fbfaf7",
  linkColor: "#4c6b79",
  dividerColor: "#2b2a28",
  headingStyle: "line",
  cardStyle: "outline",
  listStyle: "dot",
  cardRadius: 2,
  imageRadius: 2,
  showDivider: true,
};

const magazineParams = {
  textColor: "#20302a",
  accentColor: "#2f5d4f",
  highlightColor: "#d8e6d4",
  highlightTextColor: "#20302a",
  cardColor: "#edf2e8",
  quoteColor: "#f3f6ee",
  cardTitleColor: "#2f5d4f",
  pageColor: "#fffef9",
  linkColor: "#35604e",
  dividerColor: "#2f5d4f",
  headingStyle: "index",
  cardStyle: "band",
  listStyle: "circle",
  cardRadius: 2,
  imageRadius: 2,
  showDivider: true,
};

const livelyParams = {
  textColor: "#3a3230",
  accentColor: "#ff6a3d",
  highlightColor: "#ffd9c7",
  highlightTextColor: "#3a2a22",
  cardColor: "#fff0e8",
  quoteColor: "#fff6f0",
  cardTitleColor: "#ff6a3d",
  pageColor: "#fffdfb",
  linkColor: "#d94f2b",
  dividerColor: "#ff6a3d",
  headingStyle: "block",
  cardStyle: "soft",
  listStyle: "check",
  cardRadius: 16,
  imageRadius: 16,
  lineHeight: 1.8,
  paragraphSpacing: 20,
  showDivider: true,
};

const deepParams = {
  textColor: "#c7d6c2",
  accentColor: "#34f07a",
  highlightColor: "#34f07a",
  highlightTextColor: "#06140b",
  cardColor: "#1a241d",
  quoteColor: "#172019",
  cardTitleColor: "#34f07a",
  pageColor: "#121512",
  linkColor: "#5fd9a0",
  dividerColor: "#34f07a",
  headingStyle: "bar",
  cardStyle: "soft",
  listStyle: "ghost",
  cardRadius: 14,
  imageRadius: 14,
  lineHeight: 1.9,
  paragraphSpacing: 22,
  showDivider: false,
};

const freshParams = {
  textColor: "#374151",
  accentColor: "#0a9d75",
  highlightColor: "#d6f5ea",
  highlightTextColor: "#0b5f49",
  cardColor: "#effbf6",
  quoteColor: "#f4fdf9",
  cardTitleColor: "#0a9d75",
  pageColor: "#ffffff",
  linkColor: "#0a9d75",
  dividerColor: "#d1d5db",
  headingStyle: "index",
  cardStyle: "soft",
  listStyle: "circle",
  cardRadius: 20,
  showDivider: true,
};

const monoParams = {
  textColor: "#52525b",
  accentColor: "#52525b",
  highlightColor: "#f4f4f5",
  highlightTextColor: "#27272a",
  cardColor: "#fafafa",
  quoteColor: "#fafafa",
  cardTitleColor: "#3f3f46",
  pageColor: "#ffffff",
  linkColor: "#52525b",
  dividerColor: "#e4e4e7",
  headingStyle: "line",
  cardStyle: "outline",
  listStyle: "dot",
  cardRadius: 4,
  showDivider: true,
};

const sereneParams = {
  textColor: "#4f5550",
  accentColor: "#476055",
  highlightColor: "#edf2ef",
  highlightTextColor: "#385045",
  cardColor: "#ffffff",
  quoteColor: "#ffffff",
  cardTitleColor: "#476055",
  pageColor: "#ffffff",
  linkColor: "#476055",
  dividerColor: "#e9eae6",
  headingStyle: "line",
  cardStyle: "outline",
  listStyle: "dot",
  cardRadius: 0,
  showDivider: true,
};

const stubParams = {
  textColor: "#555555",
  accentColor: "#0f9d8a",
  highlightColor: "#d6f3ee",
  highlightTextColor: "#0b5e52",
  cardColor: "#f0faf8",
  quoteColor: "#fffef9",
  cardTitleColor: "#26231f",
  pageColor: "#fffef9",
  linkColor: "#0f9d8a",
  dividerColor: "#a9e3d9",
  headingStyle: "block",
  cardStyle: "outline",
  listStyle: "circle",
  cardRadius: 10,
  showDivider: true,
};

const journalParams = {
  textColor: "#4d4f46",
  accentColor: "#e07b2c",
  highlightColor: "#e7e8e1",
  highlightTextColor: "#23251d",
  cardColor: "#eff0ea",
  quoteColor: "#fdfdf8",
  cardTitleColor: "#1e1f23",
  pageColor: "#fdfdf8",
  linkColor: "#b17816",
  dividerColor: "#bfc1b7",
  headingStyle: "bar",
  cardStyle: "border",
  listStyle: "circle",
  cardRadius: 6,
  showDivider: true,
};

const nocturneParams = {
  textColor: "#d1d5db",
  accentColor: "#3ddc97",
  highlightColor: "#f6d35a",
  highlightTextColor: "#1a1a1a",
  cardColor: "#242424",
  quoteColor: "#1f1f1f",
  cardTitleColor: "#3ddc97",
  pageColor: "#1a1a1a",
  linkColor: "#4fd1c5",
  dividerColor: "#333333",
  headingStyle: "index",
  cardStyle: "soft",
  listStyle: "circle",
  cardRadius: 12,
  showDivider: true,
};

function article(title: string, blocks: WorkBlock[]) {
  const body = blocks.map((block) => {
    if (block.type === "h2") return `## ${block.text}`;
    if (block.type === "quote") return `> ${block.text}`;
    if (block.type === "list") return block.items.map((item) => `- ${item}`).join("\n");
    return block.text;
  }).join("\n\n");
  return `# ${title}\n\n${body}\n`;
}

function piece(
  input: Omit<WorkPiece, "source"> & { blocks: WorkBlock[] },
): WorkPiece {
  return { ...input, source: article(input.title, input.blocks) };
}

const quietPlain = [
  "少说一句",
  "",
  "观点 · 留白 / 把判断留在空白里",
  "",
  "一篇评论不必把每个判断都加粗。标题放下，空一行，读者自己会停。",
  "",
  "只留一处强调",
  "",
  "标题和正文拉开",
  "正文只用一种字重",
  "引用单独成段",
  "",
  "颜色少，句子才站得住。",
].join("\n");

const magazinePlain = [
  "本期目录",
  "",
  "栏目 · 编号 / 先给编号，再给解释",
  "",
  "这一期只做三栏。目录先把顺序排好，读者才知道从哪一栏读起。",
  "",
  "封面故事",
  "",
  "封面只留一句",
  "目录用编号",
  "栏目标题对齐",
  "",
  "编号是给眼睛的路标。",
].join("\n");

const livelyPlain = [
  "周末去哪儿",
  "",
  "种草 · 清单 / 三句就能照着出门",
  "",
  "不用长攻略。把三张图的位置，换成三句朋友能照着做的话。",
  "",
  "先记这三件",
  "",
  "早上的店不用排队",
  "下午找有窗的座位",
  "晚上早点回",
  "",
  "写短一点，朋友才愿意存。",
].join("\n");

const deepPlain = [
  "夜间构建",
  "",
  "工具 · 深色 / 亮的只有该看的那一行",
  "",
  "日志刷过之后，只留下失败的那一行。深色页面里，绿色是唯一要看的信号。",
  "",
  "先看这一行",
  "",
  "构建编号",
  "失败步骤",
  "下次重试前先看错误",
  "",
  "亮的只有该被看见的字。",
].join("\n");

const freshPlain = [
  "十分钟装好",
  "",
  "教程 · 清单 / 先跑起来，再谈设置",
  "",
  "先做能跑起来的一步。绿字标出你现在该点哪里，其余设置先放下。",
  "",
  "按这个顺序",
  "",
  "打开项目",
  "只填一项配置",
  "看到成功提示再往下",
  "",
  "教程写给正在动手的人。",
].join("\n");

export const WORKS: WorkPiece[] = [
  piece({
    id: "minimal-quiet",
    title: "少说一句",
    themeId: "minimal",
    bind: "mood",
    sheet: "minimal",
    themeLabel: "克制高级",
    fit: "观点 · 留白",
    deck: "把判断留在空白里",
    primary: "#2b2a28",
    pageColor: "#fbfaf7",
    titleColor: "#2b2a28",
    textColor: "#2b2a28",
    accentColor: "#2b2a28",
    sheetNo: "01",
    plain: quietPlain,
    blocks: [
      { type: "p", text: "一篇评论不必把每个判断都加粗。标题放下，空一行，读者自己会停。" },
      { type: "h2", text: "只留一处强调" },
      { type: "list", items: ["标题和正文拉开", "正文只用一种字重", "引用单独成段"] },
      { type: "quote", text: "颜色少，句子才站得住。" },
    ],
    params: minimalParams,
  }),
  piece({
    id: "magazine-contents",
    title: "本期目录",
    themeId: "editorial",
    bind: "mood",
    sheet: "magazine",
    themeLabel: "杂志编辑部",
    fit: "栏目 · 编号",
    deck: "先给编号，再给解释",
    primary: "#2f5d4f",
    pageColor: "#fffef9",
    titleColor: "#20302a",
    textColor: "#20302a",
    accentColor: "#2f5d4f",
    sheetNo: "02",
    plain: magazinePlain,
    blocks: [
      { type: "p", text: "这一期只做三栏。目录先把顺序排好，读者才知道从哪一栏读起。" },
      { type: "h2", text: "封面故事" },
      { type: "list", items: ["封面只留一句", "目录用编号", "栏目标题对齐"] },
      { type: "quote", text: "编号是给眼睛的路标。" },
    ],
    params: magazineParams,
  }),
  piece({
    id: "lively-weekend",
    title: "周末去哪儿",
    themeId: "lively",
    bind: "mood",
    sheet: "lively",
    themeLabel: "活泼小红书",
    fit: "种草 · 清单",
    deck: "三句就能照着出门",
    primary: "#ff6a3d",
    pageColor: "#fffdfb",
    titleColor: "#3a2a22",
    textColor: "#3a3230",
    accentColor: "#ff6a3d",
    sheetNo: "03",
    plain: livelyPlain,
    blocks: [
      { type: "p", text: "不用长攻略。把三张图的位置，换成三句朋友能照着做的话。" },
      { type: "h2", text: "先记这三件" },
      { type: "list", items: ["早上的店不用排队", "下午找有窗的座位", "晚上早点回"] },
      { type: "quote", text: "写短一点，朋友才愿意存。" },
    ],
    params: livelyParams,
  }),
  piece({
    id: "deep-build",
    title: "夜间构建",
    themeId: "deep",
    bind: "mood",
    sheet: "deep",
    themeLabel: "暗黑科技",
    fit: "工具 · 深色",
    deck: "亮的只有该看的那一行",
    primary: "#34f07a",
    pageColor: "#121512",
    titleColor: "#eafff0",
    textColor: "#c7d6c2",
    accentColor: "#34f07a",
    sheetNo: "04",
    plain: deepPlain,
    blocks: [
      { type: "p", text: "日志刷过之后，只留下失败的那一行。深色页面里，绿色是唯一要看的信号。" },
      { type: "h2", text: "先看这一行" },
      { type: "list", items: ["构建编号", "失败步骤", "下次重试前先看错误"] },
      { type: "quote", text: "亮的只有该被看见的字。" },
    ],
    params: deepParams,
  }),
  piece({
    id: "fresh-setup",
    title: "十分钟装好",
    themeId: "fresh",
    bind: "theme",
    sheet: "fresh",
    themeLabel: "清氧绿",
    fit: "教程 · 清单",
    deck: "先跑起来，再谈设置",
    primary: "#0a9d75",
    pageColor: "#ffffff",
    titleColor: "#111827",
    textColor: "#374151",
    accentColor: "#0a9d75",
    sheetNo: "05",
    plain: freshPlain,
    blocks: [
      { type: "p", text: "先做能跑起来的一步。绿字标出你现在该点哪里，其余设置先放下。" },
      { type: "h2", text: "按这个顺序" },
      { type: "list", items: ["打开项目", "只填一项配置", "看到成功提示再往下"] },
      { type: "quote", text: "教程写给正在动手的人。" },
    ],
    params: freshParams,
  }),
  piece({
    id: "mono-structure",
    title: "只留结构",
    themeId: "mono",
    bind: "theme",
    sheet: "mono",
    themeLabel: "素墨",
    fit: "设计 · 评论",
    deck: "灰阶里靠距离分开",
    primary: "#52525b",
    pageColor: "#ffffff",
    titleColor: "#27272a",
    textColor: "#52525b",
    accentColor: "#52525b",
    sheetNo: "06",
    blocks: [
      { type: "p", text: "灰阶里没有第二种强调。标题、正文、引用，靠距离分开。" },
      { type: "h2", text: "三处距离" },
      { type: "list", items: ["标题下面空开", "引用离开正文", "段与段之间不挤"] },
      { type: "quote", text: "少一块颜色，多一口气。" },
    ],
    params: monoParams,
  }),
  piece({
    id: "serene-hill",
    title: "半山没有钟",
    themeId: "serene",
    bind: "theme",
    sheet: "serene",
    themeLabel: "静山",
    fit: "随笔 · 读书",
    deck: "走到能听见呼吸的地方",
    primary: "#476055",
    pageColor: "#ffffff",
    titleColor: "#2b2b2b",
    textColor: "#4f5550",
    accentColor: "#476055",
    sheetNo: "07",
    blocks: [
      { type: "p", text: "石阶不陡。云从山脊上移开的时候，谁也没有催。" },
      { type: "h2", text: "坐下的地方" },
      { type: "list", items: ["风从左边来", "城市在脚底下", "橘子分给同行的人"] },
      { type: "quote", text: "走到能听见呼吸的地方就够了。" },
    ],
    params: sereneParams,
  }),
  piece({
    id: "stub-checklist",
    title: "出门核对单",
    themeId: "stub",
    bind: "theme",
    sheet: "stub",
    themeLabel: "票据卡",
    fit: "测评 · 清单",
    deck: "只核三样，多了不会看",
    primary: "#0f9d8a",
    pageColor: "#fffef9",
    titleColor: "#26231f",
    textColor: "#555555",
    accentColor: "#0f9d8a",
    sheetNo: "08",
    blocks: [
      { type: "p", text: "门口停一下。这张单子只核三样，写长了出门时就不会看。" },
      { type: "h2", text: "核对" },
      { type: "list", items: ["水还剩回程的一半", "外套在包的最上层", "纸上有回程的车次"] },
      { type: "quote", text: "单子写短，才用得上。" },
    ],
    params: stubParams,
  }),
  piece({
    id: "journal-line",
    title: "改过的那一句",
    themeId: "editorial",
    bind: "theme",
    sheet: "editorial",
    themeLabel: "手札橙",
    fit: "手记 · 复盘",
    deck: "标题从空话改成动作",
    primary: "#e07b2c",
    pageColor: "#fdfdf8",
    titleColor: "#23251d",
    textColor: "#4d4f46",
    accentColor: "#e07b2c",
    sheetNo: "09",
    blocks: [
      { type: "p", text: "内刊这一页不讲口号。只记标题怎么从一句空话，改成一个动作。" },
      { type: "h2", text: "留下的" },
      { type: "list", items: ["删掉空泛的形容词", "改成读者能做的事", "第一屏只留一个按钮"] },
      { type: "quote", text: "手记写给下次改稿的自己。" },
    ],
    params: journalParams,
  }),
  piece({
    id: "nocturne-model",
    title: "模型怎么选",
    themeId: "nocturne",
    bind: "theme",
    sheet: "nocturne",
    themeLabel: "深空青",
    fit: "AI 评测 · 科技",
    deck: "青绿标关键词，黄条留结论",
    primary: "#3ddc97",
    pageColor: "#1a1a1a",
    titleColor: "#f3f4f6",
    textColor: "#d1d5db",
    accentColor: "#3ddc97",
    sheetNo: "10",
    blocks: [
      { type: "p", text: "夜间页上，青绿标出关键词，黄条只留给一句结论。其余留在炭黑里。" },
      { type: "h2", text: "先看结论" },
      { type: "list", items: ["任务对得上再用", "上下文写清楚", "失败时记下错误码"] },
      { type: "quote", text: "亮的是结论，不是装饰。" },
    ],
    params: nocturneParams,
  }),
];

export function findWork(id: string) {
  return WORKS.find((work) => work.id === id);
}

export function studioConfig(work: WorkPiece) {
  if (work.bind === "mood") {
    return {
      ...work.params,
      theme: "classic",
      mood: work.themeId,
      skin: MOOD_SKIN[work.themeId],
    };
  }
  return { ...work.params, theme: work.themeId };
}

export function applyWork(work: WorkPiece) {
  const title = work.source.match(/^#\s+(.+)$/m)?.[1] || work.title;
  const config = studioConfig(work);
  localStorage.setItem("yooco-article-source", work.source.trim());
  localStorage.setItem("yooco-article-title", title);
  localStorage.setItem("wechat-style-lab-config", JSON.stringify(config));
  if (work.bind === "mood") {
    const skin = MOOD_SKIN[work.themeId];
    if (skin) localStorage.setItem("yooco-style-mood", JSON.stringify({ mood: work.themeId, skin }));
  }
  window.location.assign("/studio.html");
}

export function downloadWorkConfig(work: WorkPiece) {
  const config = studioConfig(work);
  const payload = {
    version: 2,
    updatedAt: new Date().toISOString(),
    template: {
      type: "universal",
      name: work.bind === "theme" ? `精选主题 · ${work.themeLabel}` : work.themeLabel,
      params: config,
    },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${work.themeLabel}-排版配置.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
