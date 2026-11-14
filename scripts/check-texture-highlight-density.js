import { normalizeWithDeepSeek } from "../lib/deepseek-normalizer.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const KEEP = [
  "所以核心结论是必须先改标题",
  "试用每天 3 积分",
  "关键指标不是转发",
  "因此记住这句话",
  "封面点击率到了 12%",
];
const DROP = [
  "另外我们再把后面的安排过一遍",
  "接下来把这一段的背景补上",
  "这篇文章写于上周",
  "没有新的结论",
  "最后我们再把目录对一下",
  "不涉及任何结论",
  "读者反馈还在整理",
  "早上把例会纪要归档了",
  "插图的位置还和上次一样",
  "这段只是交代写作时间",
  "同事在旁边看了一眼",
  "目录页码还没填",
  "打开率这个词这里再出现一次",
];

const paragraphs = [
  "另外我们再把后面的安排过一遍，今天先对齐流程。",
  "所以核心结论是必须先改标题，再谈版式细节。",
  "试用每天 3 积分，连续使用 7 天后看留存。",
  "接下来把这一段的背景补上，方便后面对照阅读。",
  "关键指标不是转发，而是读者有没有读完。",
  "这篇文章写于上周，编辑部内部先看了一遍稿。",
  "编辑把段落顺序又调了一下，没有新的结论。",
  "因此记住这句话，只把真正要停的词留下。",
  "封面点击率到了 12%，比上周高出 3 倍。",
  "最后我们再把目录对一下，看看有没有漏段。",
  "这里先放一段普通说明，不涉及任何结论。",
  "读者反馈还在整理，暂时没有可以对外的说法。",
  "早上把例会纪要归档了，没有改文章里的判断。",
  "插图的位置还和上次一样，先不讨论构图。",
  "这段只是交代写作时间，方便以后回看。",
  "同事在旁边看了一眼，说排版可以再等等。",
  "目录页码还没填，这一段先跳过。",
  "打开率这个词这里再出现一次，正文没有新的数据。",
  "==松柏金== 是作者标过的词，即使不是结论也要留。",
  "术语仍然写成 **松柏纸**，链接见 https://yoooco.com/studio.html 。",
];

const source = ["质感密度", "", "## 打开率", "", ...paragraphs.flatMap((line) => [line, ""]), "![配图](https://example.com/cover.jpg)", ""].join("\n");

function bodyFor(theme) {
  return {
    version: 2,
    template: { type: "universal", name: "密度", params: { theme, articleType: "opinion" } },
    document: {
      title: "质感密度",
      blocks: [
        { type: "heading", level: 2, text: "打开率" },
        ...paragraphs.map((text) => ({
          type: "paragraph",
          text,
          marks: text.includes("松柏纸") ? [{ text: "松柏纸", type: "bold" }] : [],
        })),
        { type: "image", url: "https://example.com/cover.jpg", alt: "配图" },
      ],
    },
    summary: {},
  };
}

function fetchReturning(body, seen) {
  return async (_url, init) => {
    if (seen) seen.push(JSON.parse(init.body));
    return {
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: JSON.stringify(body) } }] }),
    };
  };
}

function highlights(document) {
  return document.blocks.flatMap((block) => (block.marks || []).filter((mark) => mark.type === "highlight").map((mark) => mark.text));
}

function bolds(document) {
  return document.blocks.flatMap((block) => (block.marks || []).filter((mark) => mark.type === "bold").map((mark) => mark.text));
}

const seen = [];
const fresh = await normalizeWithDeepSeek(source, "test-key", "deepseek-flash", { mode: "fixed", theme: "fresh" }, {
  fetchImpl: fetchReturning(bodyFor("fresh"), seen),
});
const texture = await normalizeWithDeepSeek(source, "test-key", "deepseek-flash", { mode: "fixed", theme: "texture" }, {
  fetchImpl: fetchReturning(bodyFor("fresh"), seen),
});
const emoji = await normalizeWithDeepSeek(source, "test-key", "deepseek-flash", { mode: "fixed", theme: "emoji" }, {
  fetchImpl: fetchReturning(bodyFor("emoji"), seen),
});

const freshMarks = highlights(fresh.document);
const textureMarks = highlights(texture.document);
const explicit = "松柏金";
const freshAuto = freshMarks.filter((text) => text !== explicit);
const textureAuto = textureMarks.filter((text) => text !== explicit);

assert(freshAuto.length === 18, `总规则基线应是 18 处自动底框，实际 ${freshAuto.length}：${freshAuto.join("、")}`);
assert(freshMarks.includes(explicit), "原文 ==松柏金== 在总规则里也要留下");
assert(textureMarks.includes(explicit), "质感必须留下原文 ==松柏金==");
assert(textureAuto.length === 5, `质感自动底框应留下 5 处，实际 ${textureAuto.length}：${textureAuto.join("、")}`);
for (const text of KEEP) assert(textureAuto.includes(text), `质感应留下核心短语：${text}`);
for (const text of DROP) assert(!textureAuto.includes(text), `质感不应留下过渡、普通段或标题重复：${text}`);
assert(JSON.stringify(textureAuto) !== JSON.stringify(freshAuto.slice(0, 5)), "不能按文首截前 30%");
assert(texture.template.params.theme === "texture", "指定质感时主题仍是 texture");
assert(JSON.stringify(texture.document.blocks.map((block) => block.text || block.url)) === JSON.stringify(fresh.document.blocks.map((block) => block.text || block.url)), "收重点不能改文字、丢图或改链接");
assert(bolds(texture.document).join(",") === "松柏纸", "加粗不是绿底框，不能跟着清掉");
assert(highlights(emoji.document).length === freshMarks.length, "表情主题仍走总规则，不能跟着变稀");

const ratio = 1 - textureAuto.length / freshAuto.length;
assert(ratio >= 0.65 && ratio <= 0.75, `长稿自动底框降幅应约 70%，实际 ${Math.round(ratio * 100)}%`);

async function runLines(theme, lines) {
  const text = lines.join("\n\n");
  const result = await normalizeWithDeepSeek(text, "test-key", "deepseek-flash", { mode: "fixed", theme }, {
    fetchImpl: fetchReturning({
      version: 2,
      template: { type: "universal", name: "短", params: { theme, articleType: "opinion" } },
      document: { title: "", blocks: lines.map((line) => ({ type: "paragraph", text: line, marks: [] })) },
      summary: {},
    }),
  });
  return highlights(result.document);
}

const shortFresh = await runLines("fresh", ["所以必须先改标题，然后再把稿子发出去。", "这段只是告诉同事会议改到了下午。"]);
const shortTexture = await runLines("texture", ["所以必须先改标题，然后再把稿子发出去。", "这段只是告诉同事会议改到了下午。"]);
assert(shortFresh.join(",") === "所以必须先改标题,这段只是告诉同事", `短稿基线不对：${shortFresh.join(",")}`);
assert(shortTexture.join(",") === "所以必须先改标题", `短稿只留核心结论，实际 ${shortTexture.join(",")}`);

const ordinary = await runLines("texture", ["这段只是告诉同事会议改到了下午。"]);
assert(ordinary.length === 0, "只有普通句的短文不要为了凑数留底框");

const headingSource = "## 必须先改标题\n\n必须先改标题，其它句子先放一放。";
const headingBody = {
  version: 2,
  template: { type: "universal", name: "标题", params: { theme: "fresh", articleType: "opinion" } },
  document: {
    title: "",
    blocks: [
      { type: "heading", level: 2, text: "必须先改标题" },
      { type: "paragraph", text: "必须先改标题，其它句子先放一放。", marks: [] },
    ],
  },
  summary: {},
};
const headingFresh = await normalizeWithDeepSeek(headingSource, "test-key", "deepseek-flash", { mode: "fixed", theme: "fresh" }, {
  fetchImpl: fetchReturning(headingBody),
});
const headingTexture = await normalizeWithDeepSeek(headingSource, "test-key", "deepseek-flash", { mode: "fixed", theme: "texture" }, {
  fetchImpl: fetchReturning(headingBody),
});
assert(highlights(headingFresh.document).join(",") === "必须先改标题", `标题重复的基线应仍是这句，实际 ${highlights(headingFresh.document).join(",")}`);
assert(highlights(headingTexture.document).length === 0, "质感不要把和标题一模一样的短语再标一遍");

const manual = await runLines("texture", ["==另外我们再看一遍==，今天没有新的结论。"]);
assert(manual.join(",") === "另外我们再看一遍", "原文写明的 ==重点== 即使是过渡句也要留");

const alreadyMarked = source.replace("另外我们再把后面的安排过一遍", "==另外我们再把后面的安排过一遍==");
const remarked = await normalizeWithDeepSeek(alreadyMarked, "test-key", "deepseek-flash", { mode: "fixed", theme: "texture" }, {
  fetchImpl: fetchReturning(bodyFor("fresh")),
});
assert(highlights(remarked.document).includes("另外我们再把后面的安排过一遍"), "已经写回原文的 ==重点== 再优化也不能偷偷删");

const texturePrompt = seen.find((request) => request.messages[1].content.includes("本次主题已指定为 texture"));
const freshPrompt = seen.find((request) => request.messages[1].content.includes("本次主题已指定为 fresh"));
const emojiPrompt = seen.find((request) => request.messages[1].content.includes("本次主题已指定为 emoji"));
assert(texturePrompt.messages[0].content.includes("普通段至少 1 处 highlight"), "总规则的最少重点句不能改");
assert(texturePrompt.messages[0].content.includes("质感成稿大约只留三成自动重点"), "质感配方要写明大约三成");
assert(!freshPrompt.messages[0].content.includes("质感成稿大约只留三成自动重点"), "清氧绿不要带质感密度例外");
assert(!emojiPrompt.messages[0].content.includes("质感成稿大约只留三成自动重点"), "表情主题不要带质感密度例外");
assert(!texturePrompt.messages[0].content.includes("padding:12px 16px"), "质感配方不能再引导大横条");

console.log(JSON.stringify({
  note: "没有 DEEPSEEK_API_KEY。模型返回是本地假 JSON，底框由确定性后处理筛选，不是真实模型实测。",
  baselineAuto: freshAuto.length,
  textureAuto: textureAuto.length,
  reduction: `${Math.round(ratio * 100)}%`,
  kept: textureAuto,
  explicit,
  bold: bolds(texture.document),
  short: { fresh: shortFresh, texture: shortTexture, ordinary },
}, null, 2));
console.log("texture highlight density checks ok");
