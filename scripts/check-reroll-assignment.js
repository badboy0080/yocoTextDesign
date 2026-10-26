import { readFileSync } from "node:fs";
import { fingerprintBlocks, validateRequest } from "../lib/deepseek-normalizer.js";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const base = validateRequest({
  source: "标题\n\n第一段。",
  assignment: { mode: "fixed", theme: "fresh" },
});
assert(base.assignment.mode === "fixed", "fixed 主题要保留");
assert(base.assignment.theme === "fresh", "theme=fresh");
assert((base.assignment.intent || "optimize") === "optimize", "缺省 intent 当 optimize");

const reroll = validateRequest({
  source: "标题\n\n第一段。",
  assignment: {
    mode: "fixed",
    theme: "mono",
    intent: "reroll",
    variantSeed: 42,
    previousFingerprint: "heading:2>paragraph>card",
  },
});
assert(reroll.assignment.intent === "reroll", "intent=reroll 要透传");
assert(reroll.assignment.variantSeed === 42, "variantSeed 要透传");
assert(reroll.assignment.previousFingerprint === "heading:2>paragraph>card", "fingerprint 要透传");
assert(reroll.assignment.mode === "fixed", "换一版必须是 fixed");
assert(reroll.assignment.theme === "mono", "换一版不改主题");

const junk = validateRequest({
  source: "x",
  assignment: { mode: "fixed", theme: "fresh", intent: "hack", variantSeed: -1, previousFingerprint: "y".repeat(500) },
});
assert(junk.assignment.intent === "optimize", "非法 intent 回落到 optimize");
assert(junk.assignment.variantSeed === undefined || Number.isInteger(junk.assignment.variantSeed) && junk.assignment.variantSeed >= 0, "非法 seed 丢掉或夹紧");
assert((junk.assignment.previousFingerprint || "").length <= 200, "fingerprint 最长 200");
assert(junk.assignment.previousFingerprint.length === 200, "超长 fingerprint 截到 200");

const choose = validateRequest({
  source: "x",
  assignment: { mode: "choose", intent: "reroll", variantSeed: 7, previousFingerprint: "paragraph" },
});
assert(choose.assignment.mode === "choose", "非 fixed 不走换一版");
assert(choose.assignment.intent === undefined, "choose 不带 intent");

assert(fingerprintBlocks([
  { type: "heading", level: 2 },
  { type: "paragraph" },
  { type: "card" },
  { type: "list" },
  { type: "quote" },
]) === "heading:2>paragraph>card>list>quote", "fingerprint 块序列");
assert(fingerprintBlocks(null) === "", "空输入 fingerprint 为空");
assert(fingerprintBlocks([{ type: "heading", level: 2.4 }, {}]) === "heading:2>?", "heading 取整，缺 type 用问号");

const src = readFileSync(new URL("../lib/deepseek-normalizer.js", import.meta.url), "utf8");
assert(/intent === ["']reroll["'] \? 0\.7 : 0\.1/.test(src), "换一版温度 0.7，其它 0.1");
assert(src.includes("本次是「换一版」"), "提示词写明换一版");
assert(src.includes("不得编造原文没有的步骤"), "换一版仍禁止编造");
assert(src.includes("不要改 theme，不要输出颜色"), "换一版不改主题和颜色");

const app = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../public/studio.html", import.meta.url), "utf8");
assert(html.includes('id="rerollLayoutButton"'), "工作台有换一版按钮");
assert(html.includes(">换一版</button>"), "按钮文案是换一版");
assert(html.includes('id="undoLayoutButton"'), "工作台有回退按钮");
assert(html.includes(">回退上一版</button>"), "按钮文案是回退上一版");
assert(app.includes("const LAYOUT_SNAPSHOT_MAX = 5"), "回退栈最多 5 层");
const rerollFn = app.slice(app.indexOf("async function rerollLayout"), app.indexOf("// 点「用示例文章试一下」"));
assert(rerollFn.includes('mode: "fixed"'), "rerollLayout 写明 fixed");
assert(rerollFn.includes('intent: "reroll"'), "rerollLayout 写明 reroll");
assert(!rerollFn.includes("nextNormalizeAssignment"), "换一版不走随机抽主题");
const normFn = app.slice(app.indexOf("async function normalizeWithDeepSeek"), app.indexOf("function wechatTextAlign"));
assert(normFn.includes("coerceRerollAssignment(overrideAssignment)"), "换一版强制整理成 fixed");
const pushAt = normFn.indexOf("pushLayoutSnapshot()");
const applyAt = normFn.indexOf("applyAiNormalization(");
assert(pushAt > 0 && applyAt > pushAt, "拿到结果后、应用前才压栈");
assert(!app.slice(app.indexOf("function undoLayoutVariant"), app.indexOf("function coerceRerollAssignment")).includes("fetch("), "回退不请求接口");

console.log("check-reroll-assignment: ok");
