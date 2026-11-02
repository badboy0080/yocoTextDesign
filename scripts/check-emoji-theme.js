import { normalizeWithDeepSeek } from "../lib/deepseek-normalizer.js";
import { applyEmojiTheme, emojiPrefixKinds, isEmojiRuleLine, EMOJI_BRIEF, leadingEmojiIcon } from "../public/emoji-theme.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const sample = {
  title: "少年好学，如日出之阳",
  blocks: [
    { type: "paragraph", text: "✨ 山里的早晨很安静。少年把书摊在石上，第一句就记住了。" },
    { type: "heading", level: 2, text: "【知识点】晨读为什么记得住" },
    { type: "paragraph", text: "清晨记东西更快。先读短句，再合上书复述一遍，记得更牢。" },
    { type: "heading", level: 2, text: "🚗 【秋天】银杏道上的十分钟" },
    { type: "list", ordered: false, items: ["带一本薄书", "走完银杏道再折返", "泉水边坐五分钟"] },
    { type: "heading", level: 2, text: "【总结】今天只要记住一句" },
    { type: "paragraph", text: "少年好学，如日出之阳。" },
    { type: "code", language: "text", text: "✨ 这里是代码，不要加图标" },
    { type: "list", ordered: true, items: ["第一步看题目", "第二步合上书"] },
    { type: "divider" },
    { type: "paragraph", text: "你读到哪一句，可以留言告诉我。" },
  ],
};

function headingText(document, needle) {
  return document.blocks.find((block) => block.type === "heading" && String(block.text).includes(needle));
}

function oneIcon(text, label) {
  const icon = leadingEmojiIcon(text);
  assert(icon, `${label} 要有图标：${text}`);
  assert(text.startsWith(`${icon} `), `${label} 图标和文字之间要有一个空格：${text}`);
  assert(!text.startsWith(`${icon}  `), `${label} 不能空两格：${text}`);
  assert(!leadingEmojiIcon(text.slice(icon.length).trim()), `${label} 不能叠两个图标：${text}`);
  return icon;
}

const decorated = applyEmojiTheme(sample);
assert(decorated.title === sample.title, "大标题不加图标");
const knowledge = headingText(decorated, "知识点");
const autumn = headingText(decorated, "秋天");
const summary = headingText(decorated, "总结");
assert(oneIcon(knowledge.text, "知识点") === "💡", `知识点要用灯泡：${knowledge.text}`);
assert(knowledge.text.startsWith("💡 【知识点】"), `图标要放在【前面：${knowledge.text}`);
assert(oneIcon(autumn.text, "秋天") === "🍂", `秋天要用落叶：${autumn.text}`);
assert(autumn.text.startsWith("🍂 【秋天】"), `秋天图标要在【前面：${autumn.text}`);
assert(oneIcon(summary.text, "总结") === "✅", `总结要用对勾：${summary.text}`);
const list = decorated.blocks.find((block) => block.type === "list" && !block.ordered);
assert(list.items.every((item) => item.startsWith("❖ ")), `银杏清单要用菱形：${list.items.join(" | ")}`);
const ordered = decorated.blocks.find((block) => block.type === "list" && block.ordered);
assert(ordered.items[0] === "第一步看题目", "有序列表不加项目符号");
const closing = decorated.blocks.at(-1);
assert(closing.text === "💬 你读到哪一句，可以留言告诉我。", `短结尾要用留言：${closing.text}`);
const rule = decorated.blocks.find((block) => block.type === "divider");
assert(isEmojiRuleLine(rule.text), `分隔线要是整行符号：${rule.text}`);
assert(rule.text === "❖ ———— ❖", `有菱形时分隔线跟着用菱形：${rule.text}`);
const body = decorated.blocks.find((block) => block.type === "paragraph" && String(block.text).includes("山里"));
assert(body.text === "山里的早晨很安静。少年把书摊在石上，第一句就记住了。", "正文开头多出来的图标要拿掉，句子还在");
const proverb = decorated.blocks.find((block) => block.text === "少年好学，如日出之阳。");
assert(proverb, "不是结尾互动的短句不要加图标");
const code = decorated.blocks.find((block) => block.type === "code");
assert(code.text === "✨ 这里是代码，不要加图标", "代码原样留下");
const kinds = emojiPrefixKinds(decorated);
assert(kinds.length >= 3 && kinds.length <= 5, `一篇要 3 到 5 种图标，实际 ${kinds.length}：${kinds.join(" ")}`);

const piled = applyEmojiTheme({
  title: "堆图标",
  blocks: [
    { type: "heading", level: 2, text: "✨ 💡 【知识点】晨读" },
    { type: "heading", level: 2, text: "🍂 【秋天】银杏" },
    { type: "heading", level: 2, text: "✅ 【总结】记住" },
    { type: "heading", level: 2, text: "🔍 【探秘】背后" },
    { type: "heading", level: 2, text: "🚗 【出行】高铁" },
    { type: "heading", level: 2, text: "📍 【地点】打卡" },
    { type: "heading", level: 2, text: "⏳ 【历史】年代" },
    { type: "heading", level: 2, text: "⭐ 【推荐】必看" },
    { type: "list", ordered: false, items: ["不要迟到", "不要跑"] },
    { type: "paragraph", text: "留言告诉我。" },
  ],
});
piled.blocks.filter((block) => block.type === "heading").forEach((block) => oneIcon(block.text, "小标题"));
const piledKinds = emojiPrefixKinds(piled);
assert(piledKinds.length <= 5, `堆太多时要收进 5 种，实际 ${piledKinds.length}：${piledKinds.join(" ")}`);
assert(piled.blocks[0].text.startsWith("💡 【知识点】"), `叠了两个图标要收成一个：${piled.blocks[0].text}`);

const clientList = applyEmojiTheme({
  title: "",
  blocks: [
    { type: "heading", level: 2, text: "【知识点】晨读" },
    { type: "list", ordered: false, items: [{ text: "带一本薄书", depth: 0, ordered: false }] },
    { type: "paragraph", text: "留言告诉我你的看法。" },
  ],
});
const clientItem = clientList.blocks[1].items[0];
assert(clientItem.depth === 0 && clientItem.text.startsWith("• "), `预览里的列表项要带圆点和空格：${clientItem.text}`);

function resultBody(theme, blocks) {
  return {
    version: 2,
    template: { type: "universal", name: "表情样稿", params: { theme, articleType: "lifestyle" } },
    document: { title: sample.title, blocks },
    summary: {},
  };
}

function fetchReturning(body, seen) {
  return async (_url, init) => {
    seen.push(JSON.parse(init.body));
    return {
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: JSON.stringify(body) } }] }),
    };
  };
}

const plainBlocks = sample.blocks.map((block) => ({ ...block, text: block.type === "heading" ? block.text.replace(/^🚗 /, "") : block.text }));
const source = [
  sample.title,
  "山里的早晨很安静。少年把书摊在石上，第一句就记住了。",
  "【知识点】晨读为什么记得住",
  "清晨记东西更快。先读短句，再合上书复述一遍，记得更牢。",
  "【秋天】银杏道上的十分钟",
  "带一本薄书",
  "【总结】今天只要记住一句",
  "少年好学，如日出之阳。",
  "你读到哪一句，可以留言告诉我。",
].join("\n");

const emojiSeen = [];
const emojiResult = await normalizeWithDeepSeek(source, "test-key", "deepseek-flash", { mode: "fixed", theme: "emoji" }, {
  fetchImpl: fetchReturning(resultBody("fresh", plainBlocks), emojiSeen),
});
assert(emojiResult.template.params.theme === "emoji", "指定表情时不能被模型改走");
const emojiHeading = headingText(emojiResult.document, "知识点");
assert(emojiHeading.text.startsWith("💡 【知识点】"), `整理结果要把图标写进小标题：${emojiHeading.text}`);
const emojiKinds = emojiPrefixKinds(emojiResult.document);
assert(emojiKinds.length >= 3 && emojiKinds.length <= 5, `整理后仍是 3 到 5 种，实际 ${emojiKinds.length}：${emojiKinds.join(" ")}`);
const emojiSystem = emojiSeen[0].messages[0].content;
const emojiUser = emojiSeen[0].messages[1].content;
assert(emojiSystem.includes(EMOJI_BRIEF), "系统提示要带表情图标规则");
assert(emojiSystem.includes("仅当 theme=emoji"), "系统提示要写明只有表情主题加图标");
assert(emojiSystem.includes("3 到 5 种"), "系统提示要限制种类");
assert(emojiUser.includes("💡 【知识点】晨读为什么记得住"), "指定表情时，发给模型的话也要带图标例子");
assert(emojiUser.includes("小节标题必须用 heading"), "指定表情时，要要求小节标题用 heading");
assert(emojiUser.includes("无序列表"), "指定表情时，说明性分点要优先无序列表");
assert(emojiUser.includes("第一步"), "指定表情时，有序只留给真步骤");
assert(emojiUser.includes("看不见图标") && emojiUser.includes("失败"), "指定表情时，看不见小标题图标要算失败");
assert(emojiSystem.includes("表情主题例外"), "表情主题要写明小节标题可以收成 heading");
assert(emojiResult.document.blocks.some((block) => block.type === "paragraph" && (block.marks || []).some((mark) => mark.type === "highlight")), "表情主题的长段仍要有重点");

const freshSeen = [];
const freshResult = await normalizeWithDeepSeek(source, "test-key", "deepseek-flash", { mode: "fixed", theme: "citrus" }, {
  fetchImpl: fetchReturning(resultBody("citrus", plainBlocks), freshSeen),
});
assert(freshResult.template.params.theme === "citrus", "柠边不能被改成表情");
assert(!headingText(freshResult.document, "知识点").text.startsWith("💡 "), "柠边小标题不要自动加图标");
const citrusUser = freshSeen[0].messages[1].content;
assert(citrusUser.includes("不要加表情主题的小图标"), "其它主题要明确不要加图标");
assert(citrusUser.includes("配方没写 highlight 也要标"), "六套主题的重点要求还在");
assert(freshSeen[0].messages[0].content.includes("bauhaus 包豪"), "包豪配方不能丢");
assert(!freshSeen[0].messages[1].content.includes("看不见图标"), "其它主题不要要求小标题前的表情图标");

const orderedOnly = applyEmojiTheme({
  title: "表情主题为什么看不见图标",
  blocks: [
    { type: "paragraph", text: "下面按编号说明 emoji-theme.js、HEADING_RULES 和 applyEmojiTheme。模型常把这种说明收成有序列表。" },
    { type: "list", ordered: true, items: [
      "知识点：emoji-theme.js 的 applyEmojiTheme",
      "要点：HEADING_RULES 决定小标题用哪枚图标",
      "总结：有序列表被跳过，预览里没有图标",
    ] },
    { type: "paragraph", text: "主控：只给 heading 和无序列表加图标" },
    { type: "paragraph", text: "要改映射：短小标题也要能看见前缀" },
    { type: "paragraph", text: "------" },
    { type: "paragraph", text: "欢迎留言" },
  ],
});
const orderedItems = orderedOnly.blocks.find((block) => block.type === "list" && block.ordered).items;
assert(oneIcon(orderedItems[0], "有序知识点") === "💡", `有序知识点要用灯泡：${orderedItems[0]}`);
assert(oneIcon(orderedItems[1], "有序要点") === "📌", `有序要点要用图钉：${orderedItems[1]}`);
assert(oneIcon(orderedItems[2], "有序总结") === "✅", `有序总结要用对勾：${orderedItems[2]}`);
const lead = orderedOnly.blocks.find((block) => block.type === "paragraph" && String(block.text).includes("下面按编号"));
assert(lead.text.startsWith("下面按编号"), "普通长段不要加图标");
const control = orderedOnly.blocks.find((block) => String(block.text).includes("主控"));
const mapping = orderedOnly.blocks.find((block) => String(block.text).includes("要改映射"));
assert(oneIcon(control.text, "主控短段") === "✨", `短的冒号段要有图标：${control.text}`);
assert(oneIcon(mapping.text, "映射短段"), `短的冒号段要有图标：${mapping.text}`);
const orderedClosing = orderedOnly.blocks.find((block) => String(block.text).includes("欢迎留言"));
assert(orderedClosing.text === "💬 欢迎留言", `含留言的结尾一定要有对话图标：${orderedClosing.text}`);
const orderedRule = orderedOnly.blocks.find((block) => block.type === "divider");
assert(isEmojiRuleLine(orderedRule.text), `虚线要换成整行符号：${orderedRule.text}`);
const orderedVisible = [
  ...orderedItems.map((item) => leadingEmojiIcon(item)),
  leadingEmojiIcon(control.text),
  leadingEmojiIcon(mapping.text),
  leadingEmojiIcon(orderedClosing.text),
].filter(Boolean);
assert(orderedVisible.length >= 3, `只有有序列表时至少 3 处图标，实际 ${orderedVisible.length}`);
assert(emojiPrefixKinds(orderedOnly).length <= 5, `有序兜底也不能超过 5 种：${emojiPrefixKinds(orderedOnly).join(" ")}`);
const orderedTwice = applyEmojiTheme(orderedOnly);
orderedTwice.blocks.find((block) => block.type === "list").items.forEach((item) => oneIcon(item, "再跑一次"));

const bareOrdered = applyEmojiTheme({
  title: "三个名字",
  blocks: [{ type: "list", ordered: true, items: ["emoji-theme.js", "HEADING_RULES", "applyEmojiTheme"] }],
});
const bareIcons = bareOrdered.blocks[0].items.map((item) => leadingEmojiIcon(item)).filter(Boolean);
assert(bareIcons.length >= 3, `很短的有序小标题也要看见图标：${bareOrdered.blocks[0].items.join(" | ")}`);
bareOrdered.blocks[0].items.forEach((item) => oneIcon(item, "短有序"));

const commentInList = applyEmojiTheme({
  title: "",
  blocks: [{ type: "list", ordered: true, items: ["知识点：从图标说起", "要点：看映射", "欢迎留言"] }],
});
assert(commentInList.blocks[0].items.at(-1).startsWith("💬 "), `有序条目里的留言也要有对话图标：${commentInList.blocks[0].items.at(-1)}`);

const realSteps = applyEmojiTheme({
  title: "装一下",
  blocks: [
    { type: "list", ordered: true, items: ["第一步看知识点", "然后记住要点", "接着写总结"] },
    { type: "paragraph", text: "欢迎留言" },
  ],
});
assert(realSteps.blocks[0].items.join("|") === "第一步看知识点|然后记住要点|接着写总结", `真步骤不要刷成五颜六色：${realSteps.blocks[0].items.join("|")}`);
assert(realSteps.blocks[1].text === "💬 欢迎留言", "真步骤后面的留言结尾仍要有对话图标");

const commentBeforeSteps = applyEmojiTheme({
  title: "先留言再操作",
  blocks: [
    { type: "paragraph", text: "欢迎留言" },
    { type: "list", ordered: true, items: ["第一步打开文件", "然后保存"] },
  ],
});
assert(commentBeforeSteps.blocks[0].text === "💬 欢迎留言", "留言短句不在最后一块也要有对话图标");
assert(commentBeforeSteps.blocks[1].items[0] === "第一步打开文件", "后面的真步骤仍然不加图标");

const previewOrdered = applyEmojiTheme({
  title: "",
  blocks: [{
    type: "list",
    ordered: true,
    items: [
      { text: "知识点：晨读", depth: 0, ordered: true },
      { text: "要点：复述", depth: 0, ordered: true },
      { text: "总结：记住一句", depth: 0, ordered: true },
    ],
  }],
});
assert(previewOrdered.blocks[0].items[0].text.startsWith("💡 ") && previewOrdered.blocks[0].items[0].ordered === true, "预览里的有序条目要留下图标，序号信息还在");

console.log(JSON.stringify({
  kinds,
  divider: rule.text,
  headings: [knowledge.text, autumn.text, summary.text],
  list: list.items,
  closing: closing.text,
  note: "没有 DEEPSEEK_API_KEY。模型返回是本地假 JSON，图标由服务端按语义补上。",
}, null, 2));
console.log("emoji theme checks ok");
