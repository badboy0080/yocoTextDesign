import { normalizeWithDeepSeek } from "../lib/deepseek-normalizer.js";
import {
  absoluteHttpUrl,
  allowedDataImage,
  extractSourceMedia,
  isDisplayImageUrl,
  restoreSourceMedia,
} from "../public/source-media.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const jpg = "https://images.example.com/market-stand.jpg";
const page = "https://yoooco.com/notes";
const bare = "https://yoooco.com";
const qpic = "https://mmbiz.qpic.cn/mmbiz_jpg/abc/0?wx_fmt=jpeg";
const png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

assert(isDisplayImageUrl(jpg), "jpg 应算图片");
assert(isDisplayImageUrl(`${jpg}。`), "句号不应挡住图片地址");
assert(isDisplayImageUrl(qpic), "公众号图床应算图片");
assert(!isDisplayImageUrl(page), "普通网页不应算图片");
assert(!isDisplayImageUrl("blob:http://localhost/1234"), "blob 不能当图片");
assert(!absoluteHttpUrl("javascript:alert(1)"), "脚本地址要丢掉");
assert(allowedDataImage(png) === png, "小 data 图要留下");
assert(allowedDataImage(`data:image/png;base64,${"A".repeat(3 * 1024 * 1024)}`) === "", "超过 2MB 的 data 图要丢掉");
assert(allowedDataImage("data:image/svg+xml;base64,PHN2Zy8+") === "", "svg data 不留下");

const source = [
  "周末去了城南小市。",
  "",
  `![小市摊位](${jpg})`,
  "",
  "路线写在 [小市笔记](https://yoooco.com/notes)。",
  `也可以打开 ${bare} 看看。`,
  "```",
  "示例里的 https://example.com/skip.jpg 不要提出来",
  "```",
  png,
].join("\n");

const extracted = extractSourceMedia(source);
assert(extracted.images.some((item) => item.url === absoluteHttpUrl(jpg) && item.alt === "小市摊位"), "markdown 图要提出来");
assert(extracted.images.some((item) => item.url === png), "单独一行的 data 图要提出来");
assert(!extracted.images.some((item) => item.url.includes("skip.jpg")), "代码块里的图不要提出来");
assert(extracted.links.some((item) => item.url === absoluteHttpUrl(page) && item.label === "小市笔记"), "markdown 链接要提出来");
assert(extracted.links.some((item) => item.url === absoluteHttpUrl(bare)), "普通网址要提出来");
assert(!extracted.images.some((item) => item.url === absoluteHttpUrl(page)), "带文字的链接不要收成图");

const linkedImage = extractSourceMedia("[看图](https://images.example.com/look.jpg)");
assert(linkedImage.images.length === 0, "指向 jpg 的文字链接仍是链接");
assert(linkedImage.links.length === 1, "指向 jpg 的文字链接要留下");

const dropped = restoreSourceMedia({
  title: "周末小市",
  blocks: [{ type: "paragraph", text: "周末去了城南小市。路线写在 小市笔记。也可以打开 看看。", marks: [{ text: "城南小市", type: "highlight" }] }],
}, source);
assert(dropped.blocks.some((block) => block.type === "image" && block.url === absoluteHttpUrl(jpg)), "丢掉的图要补回");
assert(dropped.blocks.some((block) => block.type === "image" && block.url === png), "丢掉的 data 图要补回");
assert(JSON.stringify(dropped.blocks).includes(`[小市笔记](${absoluteHttpUrl(page)})`), "丢掉的链接文字要补回");
assert(JSON.stringify(dropped.blocks).includes(absoluteHttpUrl(bare)), "丢掉的普通网址要补回");
assert(!JSON.stringify(dropped.blocks).includes("skip.jpg"), "代码块地址不要补进正文");

const kept = restoreSourceMedia({
  title: "",
  blocks: [
    { type: "paragraph", text: `路线写在 [小市笔记](${page})。` },
    { type: "image", url: jpg, alt: "小市摊位" },
  ],
}, `![小市摊位](${jpg})\n\n路线写在 [小市笔记](${page})。`);
assert(kept.blocks.filter((block) => block.type === "image").length === 1, "已经在的图不要再补一份");
assert(kept.blocks.filter((block) => String(block.text || "").includes(page)).length === 1, "已经在的链接不要再补一份");

function resultBody(blocks) {
  return {
    version: 2,
    template: { type: "universal", name: "小市", params: { theme: "fresh", articleType: "lifestyle" } },
    document: { title: "周末小市", blocks },
    summary: {},
  };
}

const article = `周末去了城南小市，摊位不多。\n\n${jpg}\n\n路线写在 [小市笔记](${page})。`;
const seen = [];
const restored = await normalizeWithDeepSeek(article, "test-key", "deepseek-flash", { mode: "fixed", theme: "fresh" }, {
  fetchImpl: async (_url, init) => {
    seen.push(JSON.parse(init.body));
    return {
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify(resultBody([
              { type: "paragraph", text: "周末去了城南小市，摊位不多。路线写在 小市笔记。", marks: [{ text: "摊位不多", type: "highlight" }] },
            ])),
          },
        }],
      }),
    };
  },
});
assert(seen[0].messages[0].content.includes("图片和链接必须留下"), "提示词要要求留下图片和链接");
assert(restored.document.blocks.some((block) => block.type === "image" && block.url === absoluteHttpUrl(jpg)), "优化结果要把丢掉的图补回来");
assert(JSON.stringify(restored.document.blocks).includes(`[小市笔记](${absoluteHttpUrl(page)})`), "优化结果要把丢掉的链接补回来");
assert(restored.document.blocks.some((block) => (block.marks || []).some((mark) => mark.text === "摊位不多")), "补图时不要把原来的重点弄丢");

const urlSentence = "详情看 https://yoooco.com 这个地址就行，记得收藏。";
const marked = await normalizeWithDeepSeek(urlSentence, "test-key", "deepseek-flash", { mode: "fixed", theme: "fresh" }, {
  fetchImpl: async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      choices: [{
        message: {
          content: JSON.stringify(resultBody([
            { type: "paragraph", text: urlSentence, marks: [{ text: "https://yoooco.com", type: "highlight" }] },
          ])),
        },
      }],
    }),
  }),
});
const paragraph = marked.document.blocks.find((block) => block.type === "paragraph");
assert(paragraph.text.includes("https://yoooco.com"), "优化不能把正文里的网址删掉");
assert(!(paragraph.marks || []).some((mark) => /https?:|yoooco\.com/.test(mark.text)), "不要把网址当成重点");

console.log("source media checks ok");
