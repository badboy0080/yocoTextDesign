import fs from "node:fs";
import { normalizeWithDeepSeek, validateRequest } from "../lib/deepseek-normalizer.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const themes = fs.readFileSync(new URL("../public/themes.js", import.meta.url), "utf8");
const app = fs.readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../public/styles.css", import.meta.url), "utf8");
const normalizer = fs.readFileSync(new URL("../lib/deepseek-normalizer.js", import.meta.url), "utf8");

assert(themes.includes('label: "质感"'), "主题表要有质感");
assert(themes.includes("texture:"), "主题标识是 texture");
assert(!themes.includes('label: "质感"') || themes.indexOf('label: "质感"') === themes.lastIndexOf('label: "质感"'), "质感不能重名");
for (const token of ["#184731", "#F5F8F6", "#E0EAE2", "#CAAD71", "#F3E0B0", "#111827", "#3F3F46"]) {
  assert(themes.includes(token), `主题参数缺少 ${token}`);
}
assert(themes.includes("fontSize: 16") && themes.includes("lineHeight: 1.9") && themes.includes("paragraphSpacing: 22"), "正文节奏要对上 16 / 1.9 / 22");
assert(themes.includes("headingSize: 23"), "二级标题字号是 23");

for (const token of ["texture-num", "texture-kicker", "texture-quote", "texture-divider", "renderTextureHeading"]) {
  assert(app.includes(token), `预览渲染缺少 ${token}`);
}
assert(app.includes("font-size:92px"), "复制稿大编号是 92px");
assert(app.includes("linear-gradient(90deg,#184731,#CAAD71)"), "复制稿短线是绿到金");
assert(app.includes("background-color:#F3E0B0"), "加粗要有淡金底，渐变被吃掉时还在");
assert(app.includes("background-color:#184731;color:#FFFFFF"), "重点是深绿底白字");
assert(app.includes("padding:2px 6px;border-radius:3px;background-color:#184731"), "整段重点也走行内小芯片");
assert(!app.includes("padding:12px 16px;border-radius:12px;background-color:#184731"), "复制稿不能再把整段重点画成铺满的深绿圆角条");
assert(!css.includes("mark.inline-highlight:only-child"), "预览不能再把整段重点拉成大横条");
assert(/\.article-page\[data-theme="texture"\] \.inline-highlight \{[^}]*padding: 2px 6px;/.test(css), "预览重点仍是 2px 6px 的小芯片");
assert(app.includes('parts.push(source ? `> **${source}**：${text}` : `> ${text}`)'), "没有出处的金句不能写回「引用」");
assert(!app.slice(app.indexOf("function buildCopyHtml()"), app.indexOf("function darkCopyHint()")).includes("preview-outline"), "复制稿不能带大纲");
assert(app.includes("if (isTheme() && !isTextureTheme())"), "质感预览不叠本文脉络");
assert(app.includes('state.theme !== "texture" && tocHeadings.length'), "质感复制稿不叠本文脉络");

for (const token of ["font-size: 92px", "#E0EAE2", "linear-gradient(90deg, #184731, #CAAD71)", "#F3E0B0", "#E2D6BA", "width: 70px"]) {
  assert(css.includes(token), `预览样式缺少 ${token}`);
}

assert(normalizer.includes("const TEXTURE_BRIEF"), "质感配方要单独成段");
assert(normalizer.includes("texture"), "校验名单要收下 texture");
const briefAt = normalizer.indexOf("const TEXTURE_BRIEF");
const recipeAt = normalizer.indexOf("const THEME_RECIPE_TEXT");
assert(briefAt >= 0 && recipeAt > briefAt, "质感说明不要写进总配方字符串里");
assert(!normalizer.slice(recipeAt, normalizer.indexOf("function normalizeAssignment")).includes("浅色斜体编号"), "总配方不要混进质感的视觉映射");

function resultBody(theme = "fresh") {
  return {
    version: 2,
    template: { type: "universal", name: "质感样稿", params: { theme, articleType: "opinion" } },
    document: {
      title: "排版手记",
      blocks: [
        { type: "heading", level: 2, text: "质感标题 | MY OWN TOOL" },
        { type: "heading", level: 2, text: "再看一遍" },
        { type: "heading", level: 2, text: "再看一遍" },
        { type: "heading", level: 3, text: "这一级不要大编号" },
        { type: "paragraph", text: "先把结构和留白分开看，结论是要留住原来的句子。" },
        { type: "quote", title: "", text: "金句卡：大引号压在左上角。" },
        { type: "quote", title: "林月半子", text: "出处写在原文里才出现。" },
        { type: "divider" },
        { type: "image", url: "https://example.com/cover.jpg", alt: "配图" },
        { type: "paragraph", text: "普通链接留在 https://yoooco.com 这里。" },
      ],
    },
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

const source = [
  "排版手记",
  "",
  "## 质感标题 | MY OWN TOOL",
  "",
  "先把结构和留白分开看，结论是要留住原来的句子。",
  "",
  "> 金句卡：大引号压在左上角。",
  "",
  "> **林月半子**：出处写在原文里才出现。",
  "",
  "---",
  "",
  "![配图](https://example.com/cover.jpg)",
  "",
  "普通链接留在 https://yoooco.com 这里。",
  "",
  "## 再看一遍",
  "",
  "### 这一级不要大编号",
  "",
  "## 再看一遍",
].join("\n");

const textureSeen = [];
const textureResult = await normalizeWithDeepSeek(source, "test-key", "deepseek-flash", { mode: "fixed", theme: "texture" }, {
  fetchImpl: fetchReturning(resultBody("fresh"), textureSeen),
});
const textureSystem = textureSeen[0].messages[0].content;
const textureUser = textureSeen[0].messages[1].content;
assert(textureResult.template.params.theme === "texture", "指定质感时，模型回了别的主题也要改回 texture");
assert(textureSystem.includes("浅色斜体编号"), "指定质感时，系统提示要带视觉映射");
assert(textureSystem.includes("不要写 NEW STYLES"), "指定质感时要禁止硬塞英文副标");
assert(textureSystem.includes("不要输出 HTML"), "质感配方要禁止输出 HTML");
assert(textureUser.includes("本次主题已指定为 texture"), "请求里要带上 texture");
assert(!textureSystem.includes("<style"), "系统提示不能夹带样式表");
assert(textureResult.document.blocks.some((block) => block.type === "image" && block.url === "https://example.com/cover.jpg"), "图片地址要留下");
assert(textureResult.document.blocks.some((block) => block.type === "paragraph" && String(block.text).includes("https://yoooco.com")), "普通链接要留下");
assert(!textureResult.document.blocks.some((block) => String(block.text || "").includes("NEW STYLES")), "不能给标题编 NEW STYLES");
assert(!JSON.stringify(textureResult).includes("<section style="), "整理结果不能是任意 HTML");

const emojiSeen = [];
await normalizeWithDeepSeek(source, "test-key", "deepseek-flash", { mode: "fixed", theme: "emoji" }, {
  fetchImpl: fetchReturning(resultBody("emoji"), emojiSeen),
});
const emojiSystem = emojiSeen[0].messages[0].content;
assert(emojiSystem.includes("小标题前面看不见图标"), "表情主题的原配方还在");
assert(!emojiSystem.includes("浅色斜体编号"), "表情主题不要混进质感视觉映射");
assert(!emojiSystem.includes("不要写 NEW STYLES"), "表情主题不要带质感副标禁令");

const freshSeen = [];
await normalizeWithDeepSeek(source, "test-key", "deepseek-flash", { mode: "fixed", theme: "fresh" }, {
  fetchImpl: fetchReturning(resultBody("fresh"), freshSeen),
});
assert(!freshSeen[0].messages[0].content.includes("浅色斜体编号"), "清氧绿不要混进质感视觉映射");
assert(freshSeen[0].messages[0].content.includes("texture 质感"), "主题名单要让模型知道质感这个标识");

const accepted = validateRequest({ source, assignment: { mode: "fixed", theme: "texture" } });
assert(accepted.assignment.mode === "fixed" && accepted.assignment.theme === "texture", "前端选质感要通过请求校验");
const rejected = validateRequest({ source, assignment: { mode: "fixed", theme: "neo" } });
assert(rejected.assignment.mode === "choose", "不认识的主题标识要退回自动选择");
const unknownSeen = [];
await normalizeWithDeepSeek(source, "test-key", "deepseek-flash", rejected.assignment, {
  fetchImpl: fetchReturning(resultBody("fresh"), unknownSeen),
});
assert(unknownSeen[0].messages[1].content.includes("本次没有指定主题"), "不认识的主题标识不能当成质感");
assert(!unknownSeen[0].messages[0].content.includes("浅色斜体编号"), "不认识的标识不要套质感配方");

console.log("texture theme checks passed");
