import { readFileSync } from "node:fs";
import vm from "node:vm";
import {
  SOURCE_CHAR_LIMIT,
  SOURCE_LIMIT_MESSAGE,
  countSourceChars,
  sourceOverLimit,
} from "../lib/source-limit.js";
import { AppError, validateRequest } from "../lib/deepseek-normalizer.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sameError(error, code) {
  assert(error instanceof AppError, `应该是已知错误，实际是 ${error?.name || typeof error}`);
  assert(error.code === code, `错误码应是 ${code}，实际是 ${error.code}`);
}

const appSource = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const snippet = appSource.match(/\/\* source-limit:start \*\/([\s\S]*?)\/\* source-limit:end \*\//);
assert(snippet, "工作台里要有和后端同一段字数逻辑");
const browser = vm.runInNewContext(
  `${snippet[1]}\n({ SOURCE_CHAR_LIMIT, SOURCE_LIMIT_MESSAGE, countSourceChars, sourceOverLimit })`,
  { Intl },
);

assert(browser.SOURCE_CHAR_LIMIT === 10000, "工作台上限要是 10000");
assert(browser.SOURCE_LIMIT_MESSAGE === "您上传的文本超过上限！", "工作台提示原文要逐字一致");
assert(SOURCE_CHAR_LIMIT === 10000, "后端上限要是 10000");
assert(SOURCE_LIMIT_MESSAGE === "您上传的文本超过上限！", "后端提示原文要逐字一致");
assert(browser.countSourceChars.toString() === countSourceChars.toString(), "前后端数字数法必须是同一段函数");
assert(browser.sourceOverLimit.toString() === sourceOverLimit.toString(), "前后端超限判断必须是同一段函数");

const samples = [
  "",
  "你",
  "，",
  " ",
  "\n",
  "\u3000",
  "😀",
  "❤️",
  "👨‍👩‍👧‍👦",
  "👍🏻",
  "🇨🇳",
  "a",
  `你${" "}，\n😀`,
];
for (const sample of samples) {
  assert(browser.countSourceChars(sample) === countSourceChars(sample), `前后端计数不一致：${JSON.stringify(sample)}`);
}

assert(countSourceChars("") === 0, "空文本是 0");
assert(countSourceChars("你") === 1, "一个汉字是 1");
assert(countSourceChars("，") === 1, "标点是 1");
assert(countSourceChars(" ") === 1, "空格是 1");
assert(countSourceChars("\n") === 1, "换行是 1");
assert(countSourceChars("😀") === 1, "单个表情是 1，不能按字符串长度算成 2");
assert("😀".length === 2, "这个表情的字符串长度仍是 2，用来确认我们没退回旧算法");
assert(countSourceChars("❤️") === 1, "带变体选择符的红心是 1 个字");
assert(countSourceChars("👨‍👩‍👧‍👦") === 1, "组合表情是 1 个字");
assert(countSourceChars("👍🏻") === 1, "带肤色的表情是 1 个字");
assert(countSourceChars("🇨🇳") === 1, "国旗表情是 1 个字");

function expectLimit(source) {
  let caught = null;
  try {
    validateRequest({ source, assignment: { mode: "keep" } });
  } catch (error) {
    caught = error;
  }
  sameError(caught, "SOURCE_TOO_LARGE");
  assert(caught.status === 413, "超限是 413");
  assert(caught.message === "您上传的文本超过上限！", `提示必须逐字是「您上传的文本超过上限！」，实际是 ${caught.message}`);
  assert(sourceOverLimit(source), "前后端都要判超限");
}

function expectOk(source) {
  const result = validateRequest({ source });
  assert(result.source === source.trim(), "未超限时仍把首尾空白交给原来的整理，中间一个字不删");
  assert(result.source.includes("文") || result.source.includes("😀"), "未超限的正文要原样留下");
  assert(countSourceChars(source) <= 10000, "允许的原文不能超过 10000");
  assert(!sourceOverLimit(source), "前端也不能把允许的原文判超限");
}

let emptyError = null;
try { validateRequest({ source: "" }); } catch (error) { emptyError = error; }
sameError(emptyError, "EMPTY_INPUT");
assert(!emptyError.message.includes("超过上限"), "空文仍是原来的空文提示");

let blankError = null;
try { validateRequest({ source: "  \n\t" }); } catch (error) { blankError = error; }
sameError(blankError, "EMPTY_INPUT");

expectOk("文".repeat(9999));
expectOk("文".repeat(10000));
expectOk(`${"文".repeat(9999)} `);
expectOk(`${"文".repeat(9999)}😀`);
const padded = `  ${"文".repeat(10)}  `;
const paddedResult = validateRequest({ source: padded });
assert(paddedResult.source === "文".repeat(10), "没超限时，交给模型的仍是去掉首尾空白的原文");
assert(countSourceChars(padded) === 14, "首尾空格也要计入显示和上限");

const justOver = "文".repeat(10001);
const justOverSnapshot = justOver;
expectLimit(justOver);
assert(justOver === justOverSnapshot && justOver.length === 10001, "超限不能改掉或截断调用方的原文");
expectLimit(`${"文".repeat(10000)} `);
expectLimit(`${"文".repeat(10000)}😀`);
expectLimit(`${"文".repeat(9999)}😀 `);
expectLimit(`  ${"文".repeat(10000)}  `);
expectLimit(" ".repeat(10001));

let notString = null;
try { validateRequest({ source: 10001 }); } catch (error) { notString = error; }
sameError(notString, "INVALID_INPUT");

const routeText = readFileSync(new URL("../app/api/normalize/route.ts", import.meta.url), "utf8");
const validateAt = routeText.indexOf("validateRequest(body)");
const prepareAt = routeText.indexOf("await prepareCreditSpend");
const modelAt = routeText.indexOf("await normalizeWithDeepSeek");
const spendAt = routeText.indexOf("await spendCredits");
assert(validateAt > 0 && prepareAt > validateAt && modelAt > prepareAt && spendAt > modelAt, "超限检查必须在扣积分和调用模型之前");

delete process.env.DEEPSEEK_API_KEY;
delete process.env.DEEPSEEK_TOOLS_API_KEY;
const { POST } = await import("../app/api/normalize/route.ts");
const originalFetch = globalThis.fetch;
const calls = [];
globalThis.fetch = async (url, init) => {
  const target = String(url);
  calls.push(target);
  if (target.includes("deepseek")) throw new Error("测试拦住了模型请求");
  return originalFetch(url, init);
};

async function postSource(source, extraHeaders) {
  calls.length = 0;
  const response = await POST(new Request("http://127.0.0.1/api/normalize", {
    method: "POST",
    headers: { "content-type": "application/json", ...(extraHeaders || {}) },
    body: JSON.stringify({ source }),
  }));
  const payload = await response.json();
  return { response, payload, calls: calls.slice() };
}

try {
  const over = await postSource("文".repeat(10001));
  assert(over.response.status === 413, `超限应是 413，实际 ${over.response.status}`);
  assert(over.payload.ok === false, "超限不能返回成功");
  assert(over.payload.error?.code === "SOURCE_TOO_LARGE", "超限错误码不变，方便认");
  assert(over.payload.error?.message === "您上传的文本超过上限！", "接口提示必须逐字一致");
  assert(!over.payload.trial, "超限不能带扣积分结果");
  assert(over.calls.length === 0, `超限不能发出请求，实际 ${over.calls.join(",")}`);

  const empty = await postSource("");
  assert(empty.response.status === 400, "空文仍是 400");
  assert(empty.payload.error?.code === "EMPTY_INPUT", "空文错误码不能被字数上限换掉");
  assert(empty.calls.length === 0, "空文不能去调模型");

  const blank = await postSource(" \n ");
  assert(blank.payload.error?.code === "EMPTY_INPUT", "只有几个空白时仍是空文");
  assert(blank.calls.length === 0, "空白空文不能去调模型");

  const atLimit = await postSource("文".repeat(10000));
  assert(atLimit.payload.error?.code !== "SOURCE_TOO_LARGE", "10000 字不能被上限拒绝");
  assert(atLimit.response.status !== 413, "10000 字不能回 413");
} finally {
  globalThis.fetch = originalFetch;
}

console.log("source limit checks ok");
