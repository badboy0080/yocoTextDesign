export type WorkBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] };

export type WorkPiece = {
  id: string;
  title: string;
  themeId: string;
  themeLabel: string;
  fit: string;
  deck?: string;
  primary: string;
  pageColor: string;
  titleColor: string;
  textColor: string;
  accentColor: string;
  source: string;
  blocks: WorkBlock[];
  params: Record<string, string | number | boolean>;
};

const freshParams = {
  theme: "fresh",
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
  titleColor: "#111827",
  fontSize: 14,
  lineHeight: 1.9,
  headingSize: 26,
  headingStyle: "index",
  cardStyle: "soft",
  listStyle: "circle",
  showDivider: true,
};

const vermilionParams = {
  theme: "vermilion",
  textColor: "#3a3a3a",
  accentColor: "#d43d33",
  cardColor: "#fdf3f2",
  quoteColor: "#fef9f8",
  pageColor: "#fffdfc",
  titleColor: "#211d1a",
  fontSize: 15,
  lineHeight: 1.8,
  headingSize: 27,
  headingStyle: "index",
  cardStyle: "band",
  listStyle: "circle",
  showDivider: true,
};

const monoParams = {
  theme: "mono",
  textColor: "#52525b",
  accentColor: "#52525b",
  cardColor: "#fafafa",
  quoteColor: "#fafafa",
  pageColor: "#ffffff",
  titleColor: "#27272a",
  fontSize: 15,
  lineHeight: 1.8,
  headingSize: 27,
  headingStyle: "line",
  cardStyle: "outline",
  listStyle: "dot",
  showDivider: true,
};

const sereneParams = {
  theme: "serene",
  textColor: "#4f5550",
  accentColor: "#476055",
  cardColor: "#ffffff",
  quoteColor: "#ffffff",
  pageColor: "#ffffff",
  titleColor: "#2b2b2b",
  fontSize: 15,
  lineHeight: 1.92,
  headingSize: 26,
  headingStyle: "line",
  cardStyle: "outline",
  listStyle: "dot",
  showDivider: true,
};

const stubParams = {
  theme: "stub",
  textColor: "#555555",
  accentColor: "#0f9d8a",
  cardColor: "#f0faf8",
  quoteColor: "#fffef9",
  pageColor: "#fffef9",
  titleColor: "#26231f",
  fontSize: 15,
  lineHeight: 1.75,
  headingSize: 24,
  headingStyle: "block",
  cardStyle: "outline",
  listStyle: "circle",
  showDivider: true,
};

const editorialParams = {
  theme: "editorial",
  textColor: "#4d4f46",
  accentColor: "#e07b2c",
  cardColor: "#eff0ea",
  quoteColor: "#fdfdf8",
  pageColor: "#fdfdf8",
  titleColor: "#23251d",
  fontSize: 15,
  lineHeight: 1.8,
  headingSize: 26,
  headingStyle: "line",
  cardStyle: "outline",
  listStyle: "dot",
  showDivider: true,
};

function article(title: string, body: string) {
  return `# ${title}\n\n${body.trim()}\n`;
}

const BASE_WORKS: WorkPiece[] = [
  {
    id: "fresh-walk",
    title: "周末去爬山",
    themeId: "fresh",
    themeLabel: "清氧绿",
    fit: "教程 · 清单",
    primary: "#0a9d75",
    pageColor: "#ffffff",
    titleColor: "#111827",
    textColor: "#374151",
    accentColor: "#0a9d75",
    source: article(
      "周末去爬山",
      `早上出门，风很轻。走到半山，城市就安静了。\n\n## 出发前\n\n- 带水\n- 看路\n- 慢一点\n\n> 先把路走完，再谈风景。`,
    ),
    blocks: [
      { type: "p", text: "早上出门，风很轻。走到半山，城市就安静了。" },
      { type: "h2", text: "出发前" },
      { type: "list", items: ["带水", "看路", "慢一点"] },
      { type: "quote", text: "先把路走完，再谈风景。" },
    ],
    params: freshParams,
  },
  {
    id: "vermilion-note",
    title: "把观点写短",
    themeId: "vermilion",
    themeLabel: "朱白评论",
    fit: "观点 · 评论",
    primary: "#d43d33",
    pageColor: "#fffdfc",
    titleColor: "#211d1a",
    textColor: "#3a3a3a",
    accentColor: "#d43d33",
    source: article(
      "把观点写短",
      `长文不是堆句子。读者要的是一句能站住的判断。\n\n## 怎么收\n\n- 先写结论\n- 再给一个例子\n- 最后停笔\n\n> 说完就停，比再补一段更有力。`,
    ),
    blocks: [
      { type: "p", text: "长文不是堆句子。读者要的是一句能站住的判断。" },
      { type: "h2", text: "怎么收" },
      { type: "list", items: ["先写结论", "再给一个例子", "最后停笔"] },
      { type: "quote", text: "说完就停，比再补一段更有力。" },
    ],
    params: vermilionParams,
  },
  {
    id: "mono-grid",
    title: "留白也是结构",
    themeId: "mono",
    themeLabel: "素墨",
    fit: "设计 · 评论",
    primary: "#52525b",
    pageColor: "#ffffff",
    titleColor: "#27272a",
    textColor: "#52525b",
    accentColor: "#52525b",
    source: article(
      "留白也是结构",
      `版面挤满的时候，句子会互相抢。空一行，读者才知道哪里该停。\n\n## 三处留白\n\n- 标题下面\n- 引用两边\n- 段落之间\n\n> 少一块颜色，多一口气。`,
    ),
    blocks: [
      { type: "p", text: "版面挤满的时候，句子会互相抢。空一行，读者才知道哪里该停。" },
      { type: "h2", text: "三处留白" },
      { type: "list", items: ["标题下面", "引用两边", "段落之间"] },
      { type: "quote", text: "少一块颜色，多一口气。" },
    ],
    params: monoParams,
  },
  {
    id: "serene-hill",
    title: "半山的风",
    themeId: "serene",
    themeLabel: "静山",
    fit: "随笔 · 读书",
    primary: "#476055",
    pageColor: "#ffffff",
    titleColor: "#2b2b2b",
    textColor: "#4f5550",
    accentColor: "#476055",
    source: article(
      "半山的风",
      `路不陡。树荫一块一块移过来，脚步就慢了。\n\n## 记住的\n\n- 风从左边来\n- 城市在脚底下\n- 没有人催\n\n> 走到能听见自己呼吸的地方就够了。`,
    ),
    blocks: [
      { type: "p", text: "路不陡。树荫一块一块移过来，脚步就慢了。" },
      { type: "h2", text: "记住的" },
      { type: "list", items: ["风从左边来", "城市在脚底下", "没有人催"] },
      { type: "quote", text: "走到能听见自己呼吸的地方就够了。" },
    ],
    params: sereneParams,
  },
  {
    id: "stub-list",
    title: "三件要带的",
    themeId: "stub",
    themeLabel: "票据卡",
    fit: "测评 · 清单",
    primary: "#0f9d8a",
    pageColor: "#fffef9",
    titleColor: "#26231f",
    textColor: "#555555",
    accentColor: "#0f9d8a",
    source: article(
      "三件要带的",
      `出门前对一下口袋。少带一件，路上就会想。\n\n## 清单\n\n- 水\n- 薄外套\n- 一张纸\n\n> 清单写短，才用得上。`,
    ),
    blocks: [
      { type: "p", text: "出门前对一下口袋。少带一件，路上就会想。" },
      { type: "h2", text: "清单" },
      { type: "list", items: ["水", "薄外套", "一张纸"] },
      { type: "quote", text: "清单写短，才用得上。" },
    ],
    params: stubParams,
  },
  {
    id: "editorial-journal",
    title: "内刊里的一页",
    themeId: "editorial",
    themeLabel: "手札橙",
    fit: "手记 · 复盘",
    primary: "#e07b2c",
    pageColor: "#fdfdf8",
    titleColor: "#23251d",
    textColor: "#4d4f46",
    accentColor: "#e07b2c",
    source: article(
      "内刊里的一页",
      `这一页不讲大词。只记一件做成的小事，和一次改口。\n\n## 记下\n\n- 原来的说法\n- 改过的一句\n- 为什么改\n\n> 手记写给下次的自己。`,
    ),
    blocks: [
      { type: "p", text: "这一页不讲大词。只记一件做成的小事，和一次改口。" },
      { type: "h2", text: "记下" },
      { type: "list", items: ["原来的说法", "改过的一句", "为什么改"] },
      { type: "quote", text: "手记写给下次的自己。" },
    ],
    params: editorialParams,
  },
];

// Gallery articles are real, editable Markdown so "做同款" opens the same full story.
const STORIES: Record<string, WorkBlock[]> = {
  "fresh-walk": [
    { type: "p", text: "上周六早上七点，我把手机调成静音，带着一瓶水从城北出发。地铁口还有人赶着上班，山脚下却已经能闻到湿泥和松针。原本只是想走一小段路，最后在山里待了整整四个小时。" },
    { type: "h2", text: "出发之前，少带一点" },
    { type: "p", text: "第一次爬这条路线时，我装满了背包，后来发现真正会用到的东西很少。水、薄外套和一小包食物足够应付半天的行程。鞋比相机重要，天气预报比路线照片重要。把这些确认好，早晨就能轻松出门。" },
    { type: "list", items: ["水要够，返程时也留一半", "查清路线和最后一班车", "穿已经走习惯的鞋，不穿新鞋"] },
    { type: "h2", text: "半山的十分钟" },
    { type: "p", text: "走到第二个岔路口，树变密了。路边一位老人正慢慢整理登山杖，我也停下来喝水。风从树叶背后过来，山下的车声只剩一层很轻的嗡鸣。那十分钟没有拍照，也没有记录步数，却是这趟路上记得最清楚的部分。" },
    { type: "quote", text: "爬山不一定要走到最高处。找到自己愿意停下来的地方，也算到了。" },
    { type: "h2", text: "下山之后" },
    { type: "p", text: "回到地铁站时，城市的声音又一下子涌了回来。腿有点酸，但脑子比出门前清楚。我把这条路线存在地图里，没有给它打分；下次有空，再沿着另一条小路走上去。" },
  ],
  "vermilion-note": [
    { type: "p", text: "写观点文章时，我们常把“说得完整”误当成“说得有力”。一段判断之后接三段解释，再接五个例子，读者反而找不到作者真正想说的话。短不是字数要求，而是每句话都承担任务。" },
    { type: "h2", text: "先亮出判断" },
    { type: "p", text: "我最近删掉一篇稿子的前四百字，直接用第五段开头：“好的排版先决定读者在哪里停下。”删完以后，后面的证据有了明确方向。读者可以不同意这个判断，但至少知道自己在和什么讨论。" },
    { type: "quote", text: "一句能被反驳的话，通常比一段谁也不会反对的空话更有价值。" },
    { type: "h2", text: "证据只留最有效的" },
    { type: "p", text: "一个具体的例子，常常胜过五个相似的形容词。比如说“标题旁边留出一行空白，手机上第一屏就能看到正文”，比说“整体更高级、更舒服”更容易让人判断。证据越具体，观点越不必大声。" },
    { type: "list", items: ["开头给出明确判断", "中段只保留一个关键例子", "结尾指出适用范围，不重复开头"] },
    { type: "h2", text: "在该停的地方停" },
    { type: "p", text: "写完最后一个证据，试着把收尾段整段删除。如果文章仍然成立，就让它在那里结束。短文的力量往往来自收束：留下足够的信息，也留下读者自己思考的位置。" },
  ],
  "mono-grid": [
    { type: "p", text: "打开一张塞满颜色、注释和边框的页面，眼睛会先寻找出口，而不是寻找内容。留白不是把设计做少；它给标题、图片与正文划出各自的边界，让阅读有顺序。" },
    { type: "h2", text: "空白决定先后" },
    { type: "p", text: "同样的十行文字，如果标题紧贴正文、正文又紧贴引用，读者很难看出哪一部分最重要。把标题下方空开一行，再让引用离开正文，层级就出现了。空间本身没有说话，却让内容的声音变清楚。" },
    { type: "quote", text: "页面的呼吸感，来自信息之间有经过考虑的距离。" },
    { type: "h2", text: "只用一种强调" },
    { type: "p", text: "一篇文章里同时出现粗体、荧光色、底纹和描边，强调就会互相抵消。我更愿意先选择一种：比如只把关键句加粗，其余地方交给字号和间距。需要第二种强调时，先检查第一种是否真的不够。" },
    { type: "list", items: ["标题与正文之间，留出完整的视觉停顿", "段落以内容转折为界，不按固定字数切开", "引用只出现一次，并给它宽一点的上下边距"] },
    { type: "h2", text: "删掉最后一个装饰" },
    { type: "p", text: "完成排版后，我常常再删掉一条线、一个色块或一个图标。如果删掉以后读起来更顺，那它本来就没有帮助。留白并非风格标签，而是反复判断之后留下来的结构。" },
  ],
  "serene-hill": [
    { type: "p", text: "去山上的那天没有安排目的地。早晨的云很低，山脊像被一层很薄的纸盖住。我们沿着石阶往上走，谁都没有催谁。走到半山时，一阵风把云往旁边推开，远处的楼才慢慢显出来。" },
    { type: "h2", text: "听见脚步" },
    { type: "p", text: "刚出门时，我还在想没有回完的消息。走过一段平路以后，手机收进了包里，耳边只剩鞋底碰到石头的声音。树叶在左边响，偶尔有鸟从路的另一头飞过去。原来安静不是没有声音，而是终于听得见身边的东西。" },
    { type: "quote", text: "走到能听见自己呼吸的地方，就已经走得很远了。" },
    { type: "h2", text: "在长椅上坐一会儿" },
    { type: "p", text: "半山有一张旧木椅，漆被雨水磨掉了大半。我们在那里分了一只橘子，看云影从对面的坡上过去。没有发生值得发朋友圈的事，但那段时间很完整：阳光有一点暖，手指上留着橘皮的味道。" },
    { type: "h2", text: "把路留给下次" },
    { type: "p", text: "下山时经过一个岔口，路牌指向另一座山。我们没有临时加一段行程，只把路牌拍下来。不是每次出门都要把地图走完。留一段没走过的路，下一次出发就有了理由。" },
  ],
  "stub-list": [
    { type: "p", text: "周末出门前，我总会在门口停一下，摸一遍口袋。带多了肩膀累，带少了路上麻烦。后来我把常用物品写成一张三项清单，贴在玄关的墙上，准备时间反而缩短了。" },
    { type: "h2", text: "01 / 一瓶水" },
    { type: "p", text: "不要等渴了才找便利店。出门前装满一只轻一点的水瓶，路上可以少做一次临时决定。天气热时再多带一小瓶；回程前留一点水，不用硬撑到地铁站。" },
    { type: "h2", text: "02 / 一件薄外套" },
    { type: "p", text: "天气预报告诉你温度，却不会告诉你坐在树荫里会不会冷。能折小的外套比厚衣服实用，早晚、山顶和车厢里都用得上。放在背包最上层，需要时不用把包翻到底。" },
    { type: "h2", text: "03 / 一张纸" },
    { type: "p", text: "纸不一定是地图。它可以写路线、记停车位置，也可以随手记下想回家再查的一件事。我试过完全依赖手机，结果电量和信号成了新的负担。一张折起来的纸，反而让人安心。" },
    { type: "quote", text: "清单写短，才有机会真的被用上。" },
    { type: "p", text: "这三样东西并不适合所有行程。雨天要加伞，长途要看补给点，带孩子时又有另一套安排。但对普通半日出行，它们足够让我放心地关门出发。" },
  ],
  "editorial-journal": [
    { type: "p", text: "这周我们把一篇产品介绍改了三次。最大的变化不在字数，而在第一屏：原先整段都在讲“为什么我们重视内容”，最后改成直接展示读者能完成什么。标题也从一句口号，改成了一个具体动作。" },
    { type: "h2", text: "第一次：说得太满" },
    { type: "p", text: "初稿几乎每段都在解释理念。“专业”“高效”“有质感”出现了很多次，却没有一处告诉读者点开之后会看到什么。我们请同事只看第一屏，再问他记住了哪一句。答案是：一句也没记住。" },
    { type: "h2", text: "第二次：换成动作" },
    { type: "p", text: "改稿时，先写下产品里最直接的三个动作：贴入文章、挑选排版、复制结果。页面只留其中最重要的一步，其他两步放到下面的解释里。这样一来，视觉层级也容易决定：一句大标题、一个输入框、一个清楚的按钮。" },
    { type: "quote", text: "当一句话能说明下一步该做什么，设计就不必替它大声解释。" },
    { type: "h2", text: "第三次：让页面停下来" },
    { type: "p", text: "最后一次修改只动了间距。我们把第一屏与作品区之间的距离拉开，删掉两处重复的说明。读者在完成输入之前，不会被更多选项打断；想看案例时，往下一滚就能看到。" },
    { type: "list", items: ["把空泛形容词换成可见的动作", "先决定读者第一眼看什么", "删掉重复说明，留出行动后的空间"] },
    { type: "p", text: "这次改动很小，却提醒我们一个常见问题：页面想讲的越多，读者越难做决定。下次写新页面，我们会先用一句话说清楚动作，再讨论装饰和动画。" },
  ],
};

function markdownFromBlocks(title: string, blocks: WorkBlock[]) {
  return article(title, blocks.map((block) => {
    if (block.type === "h2") return `## ${block.text}`;
    if (block.type === "quote") return `> ${block.text}`;
    if (block.type === "list") return block.items.map((item) => `- ${item}`).join("\n");
    return block.text;
  }).join("\n\n"));
}

export const WORKS: WorkPiece[] = BASE_WORKS.map((work) => ({
  ...work,
  deck: ({
    "fresh-walk": "把周末走成一张路书",
    "vermilion-note": "一个判断，三处证据",
    "mono-grid": "让文字之间有距离",
    "serene-hill": "一次没有终点的散步",
    "stub-list": "轻装出门的三项清单",
    "editorial-journal": "一次改稿，三次转向",
  } as Record<string, string>)[work.id],
  blocks: STORIES[work.id] ?? work.blocks,
  source: STORIES[work.id] ? markdownFromBlocks(work.title, STORIES[work.id]) : work.source,
}));

export function findWork(id: string) {
  return WORKS.find((work) => work.id === id);
}

export function applyWork(work: WorkPiece) {
  const title = work.source.match(/^#\s+(.+)$/m)?.[1] || work.title;
  localStorage.setItem("yooco-article-source", work.source.trim());
  localStorage.setItem("yooco-article-title", title);
  localStorage.setItem("wechat-style-lab-config", JSON.stringify({ theme: work.themeId, ...work.params }));
  window.location.assign("/studio");
}

export function downloadWorkConfig(work: WorkPiece) {
  const payload = {
    version: 2,
    updatedAt: new Date().toISOString(),
    template: {
      type: "universal",
      name: `精选主题 · ${work.themeLabel}`,
      params: { ...work.params, theme: work.themeId },
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
