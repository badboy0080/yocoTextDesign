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

console.log(JSON.stringify({
  kinds,
  divider: rule.text,
  headings: [knowledge.text, autumn.text, summary.text],
  list: list.items,
  closing: closing.text,
  note: "没有 DEEPSEEK_API_KEY。模型返回是本地假 JSON，图标由服务端按语义补上。",
}, null, 2));
console.log("emoji theme checks ok");
