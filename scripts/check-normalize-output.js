import { readFileSync } from "node:fs";
import { AppError, normalizeWithDeepSeek } from "../lib/deepseek-normalizer.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const apiKey = "sk-test-SECRET-KEY";
const source = "UNIQUE_SOURCE_SENTINEL\n雨停以后。";

function documentBody(blocks = [{ type: "paragraph", text: "雨停以后。" }]) {
  return {
    version: 2,
    template: { type: "universal", name: "测试", params: { theme: "fresh", articleType: "lifestyle" } },
    document: { title: "", blocks },
    summary: {},
  };
}

const validJson = JSON.stringify(documentBody());

function jsonResponse(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return payload;
    },
  };
}

function completion(content, extra = {}) {
  return jsonResponse({
    choices: [{
      finish_reason: extra.finish_reason ?? "stop",
      message: {
        content,
        reasoning_content: extra.reasoning_content,
      },
    }],
  });
}

async function withWarn(run) {
  const warnings = [];
  const original = console.warn;
  console.warn = (...args) => warnings.push(args.map(String).join(" "));
  try {
    return { warnings, result: await run() };
  } finally {
    console.warn = original;
  }
}

async function runScripted(responses, options = {}) {
  const calls = [];
  const queue = [...responses];
  const fetchImpl = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body), authorization: init.headers.authorization });
    const next = queue.shift();
    if (!next) throw new Error("没有更多假返回");
    if (typeof next === "function") return next(url, init);
    return next;
  };
  let result = null;
  let error = null;
  const outcome = await withWarn(async () => {
    try {
      result = await normalizeWithDeepSeek(source, apiKey, "deepseek-flash", { mode: "choose" }, {
        fetchImpl,
        ...options,
      });
    } catch (caught) {
      error = caught;
    }
  });
  return { warnings: outcome.warnings, calls, result, error };
}

function assertNoSecrets(warnings) {
  const log = warnings.join("\n");
  assert(!log.includes(apiKey), "日志不能带密钥");
  assert(!log.includes("UNIQUE_SOURCE_SENTINEL"), "日志不能带原文");
  assert(!log.includes("UNIQUE_REASONING_SENTINEL"), "日志不能带思考过程");
  assert(!log.includes("SUPERSECRET"), "日志不能带正文里的密钥样例");
  assert(!log.includes("Bearer"), "日志不能带请求头");
  assert(!log.includes(validJson), "日志不能带完整报文");
}

function assertThinkingOff(calls) {
  for (const call of calls) {
    assert(call.body.thinking?.type === "disabled", "排版请求仍要关掉思考");
    assert(call.body.response_format?.type === "json_object", "仍只要 JSON");
    assert(call.url === "https://api.deepseek.com/chat/completions", "仍请求原来的排版接口");
    assert(!JSON.stringify(call.body).includes(apiKey), "请求正文不能带密钥");
  }
}

const plain = await runScripted([completion(validJson)]);
assert(plain.result?.document?.blocks?.some((block) => String(block.text || "").includes("雨停以后")), "正常 JSON 要能排出来");
assert(plain.calls.length === 1, "解析成功时不要再请求");
assert(plain.warnings.length === 0, "解析成功时不打失败日志");
assertThinkingOff(plain.calls);

const fenced = await runScripted([completion("```json\n" + validJson + "\n```")]);
assert(fenced.result?.document?.blocks?.length > 0, "去掉代码围栏后要能解析");
assert(fenced.calls.length === 1, "围栏里是可用 JSON 时不要当成失败再请求");
assert(fenced.warnings.length === 0, "围栏剥开成功时不打失败日志");

const wrappedOk = await runScripted([completion("排版如下：\n" + validJson + "\n以上。")]);
assert(wrappedOk.result?.document?.blocks?.length > 0, "前后多了说明时，里面的 JSON 仍要能用");
assert(wrappedOk.calls.length === 1, "多了说明但能解析时不要再请求");

const longBad = `HEADPIECE_AAAAAA ${"m".repeat(40)} sk-SUPERSECRET ${"n".repeat(40)} TAILPIECE_ZZZZZZ`;
const recovered = await runScripted([
  completion(longBad, {
    finish_reason: "length",
    reasoning_content: "UNIQUE_REASONING_SENTINEL",
  }),
  completion(validJson),
]);
assert(recovered.result?.document?.blocks?.length > 0, "第一次解析失败后，第二次的结果要返回");
assert(recovered.calls.length === 2, "格式失败要在同一次优化里再请求一次");
assert(JSON.stringify(recovered.calls[0].body) === JSON.stringify(recovered.calls[1].body), "第二次请求和第一次一样，不改写改写那套开关");
assert(recovered.warnings.length === 1, "第一次解析失败记一条日志");
assert(recovered.warnings[0].includes("attempt=1"), "日志要标第一次");
assert(recovered.warnings[0].includes("len="), "日志要记长度");
assert(recovered.warnings[0].includes("finish=length"), "日志要记 finish_reason");
assert(recovered.warnings[0].includes("kind=truncated"), "截断要单独分类");
assert(recovered.warnings[0].includes("HEADPIECE_AAAAAA"), "日志要留内容开头一小段");
assert(recovered.warnings[0].includes("TAILPIECE_ZZZZZZ"), "日志要留内容结尾一小段");
assert(recovered.warnings[0].includes("reasoning=yes"), "日志要记下有思考内容");
assert(recovered.warnings[0].includes("retry=yes"), "日志要记下会再请求");
assertNoSecrets(recovered.warnings);
assertThinkingOff(recovered.calls);

const emptyThenOk = await runScripted([
  completion("  \n"),
  completion(validJson),
]);
assert(emptyThenOk.result?.document?.blocks?.length > 0, "第一次内容是空的，要用第二次");
assert(emptyThenOk.calls.length === 2, "空内容要再请求一次");
assert(emptyThenOk.warnings[0].includes("kind=empty"), "空内容要单独分类");
assert(emptyThenOk.warnings[0].includes("reasoning=no"), "没有思考内容时要标明");
assert(emptyThenOk.warnings[0].includes('head=""'), "空内容的开头片段是空的");

const nullThenOk = await runScripted([
  completion(null),
  completion(validJson),
]);
assert(nullThenOk.calls.length === 2, "正文是 null 也算空内容，要再请求一次");
assert(nullThenOk.warnings[0].includes("kind=empty"), "null 要算空内容");
assert(nullThenOk.warnings[0].includes("len=0"), "没有正文字符串时长度是 0");

const bothEmpty = await runScripted([completion(""), completion("   ")]);
assert(bothEmpty.error instanceof AppError, "两次都空要是已知错误");
assert(bothEmpty.error?.code === "DEEPSEEK_EMPTY_OUTPUT", "两次都空要报空内容");
assert(bothEmpty.error?.message === "网络异常，请再试一次！", "两次都空的提示要说没有返回内容");
assert(bothEmpty.error?.status === 502, "空内容仍是 502");
assert(bothEmpty.calls.length === 2, "两次都空也只再请求一次");
assert(bothEmpty.warnings.length === 2, "两次空内容各记一条");
assert(bothEmpty.warnings[1].includes("attempt=2"), "第二次失败要标成 attempt=2");
assert(bothEmpty.warnings[1].includes("retry=no"), "第二次不再往下试");
assertNoSecrets(bothEmpty.warnings);

const bothCut = await runScripted([
  completion("{", { finish_reason: "length" }),
  completion("还是没写完", { finish_reason: "length", reasoning_content: "UNIQUE_REASONING_SENTINEL" }),
]);
assert(bothCut.error?.code === "DEEPSEEK_OUTPUT_TRUNCATED", "截断要单独报");
assert(bothCut.error?.message === "您的文章可能过长了，缩短一点再试一次吧！", "截断提示要让人知道是写到一半");
assert(bothCut.calls.length === 2, "截断也可以再请求一次");
assert(bothCut.warnings[0].includes("kind=truncated"), "即使正文很短，finish_reason=length 也算截断");
assert(bothCut.warnings[1].includes("reasoning=yes"), "第二次也要记有没有思考内容");
assertNoSecrets(bothCut.warnings);

const bothWrapped = await runScripted([
  completion("```json\n{坏掉了\n```"),
  completion("说明在前 {还是坏的"),
]);
assert(bothWrapped.error?.code === "DEEPSEEK_OUTPUT_WRAPPED", "围栏或多余文字要单独报");
assert(bothWrapped.error?.message === "网络异常，请再试一次！", "围栏提示要说没能读出排版");
assert(bothWrapped.calls.length === 2, "围栏解析失败要再请求一次");
assert(bothWrapped.warnings[0].includes("kind=wrapped"), "代码围栏解析失败要记成 wrapped");
assert(bothWrapped.warnings[1].includes("kind=wrapped"), "前后有说明却解析不了也记成 wrapped");

const bothInvalid = await runScripted([
  completion("{不是json"),
  completion("[1,2,"),
]);
assert(bothInvalid.error?.code === "DEEPSEEK_INVALID_OUTPUT", "其余解析失败仍用原来的错误码");
assert(bothInvalid.error?.message === "网络异常，请再试一次！", "其余解析失败仍是原来的那句");
assert(bothInvalid.calls.length === 2, "其余格式失败也再请求一次");
assert(bothInvalid.warnings[0].includes("kind=invalid"), "不像围栏、也不像截断时记成 invalid");

const envelope = await runScripted([
  {
    ok: true,
    status: 200,
    async json() {
      throw new Error("not json");
    },
  },
  completion(validJson),
]);
assert(envelope.result?.document?.blocks?.length > 0, "整包读不出来时，再请求一次可以用第二次");
assert(envelope.calls.length === 2, "HTTP 200 但包本身不是 JSON，也要再请求一次");
assert(envelope.warnings[0].includes("kind=invalid"), "整包不是 JSON 算其余格式失败");
assert(envelope.warnings[0].includes("len=0"), "读不出正文时不要编一段内容");

const skipped = await runScripted(
  [completion("")],
  { minRetryMs: Number.MAX_SAFE_INTEGER },
);
assert(skipped.error?.code === "DEEPSEEK_EMPTY_OUTPUT", "来不及再试时仍报空内容");
assert(skipped.error?.message === "网络异常，请再试一次！", "来不及再试时不要改成别的提示");
assert(skipped.calls.length === 1, "来不及再试时不要打第二次");
assert(skipped.warnings[0].includes("retry=skipped-budget"), "跳过重试要写进日志");

const skippedLogged = await withWarn(async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls += 1;
    return completion(" \n ");
  };
  try {
    await normalizeWithDeepSeek(source, apiKey, "deepseek-flash", { mode: "choose" }, {
      fetchImpl,
      minRetryMs: Number.MAX_SAFE_INTEGER,
    });
    throw new Error("时间不够时不该成功");
  } catch (error) {
    assert(error.code === "DEEPSEEK_EMPTY_OUTPUT", "时间不够时仍是空内容");
  }
  assert(calls === 1, "剩下的时间不够一轮时，不要再打第二次");
});
assert(skippedLogged.warnings[0].includes("retry=skipped-budget"), "跳过重试要写进日志");
assertNoSecrets(skippedLogged.warnings);

const lengthButValid = await runScripted([
  completion(validJson, { finish_reason: "length" }),
]);
assert(lengthButValid.result?.document?.blocks?.length > 0, "虽然标了 length，JSON 能解析就要用");
assert(lengthButValid.calls.length === 1, "能解析时不要因为 length 再请求");
assert(lengthButValid.warnings.length === 0, "能解析时不要打截断日志");

async function expectOnce(response, code, message, options = {}) {
  let calls = 0;
  const fetchImpl = async (url, init) => {
    calls += 1;
    if (typeof response === "function") return response(url, init);
    return response;
  };
  let caught = null;
  try {
    await normalizeWithDeepSeek(source, apiKey, "deepseek-flash", { mode: "choose" }, { fetchImpl, ...options });
  } catch (error) {
    caught = error;
  }
  const status = code === "DEEPSEEK_RATE_LIMITED" ? 429 : code === "DEEPSEEK_TIMEOUT" ? 503 : 502;
  assert(calls === 1, `${code} 不能因为失败再打一次`);
  assert(caught?.code === code, `${code} 的错误码要保持`);
  assert(caught?.message === message, `${code} 的提示要保持：${message}`);
  assert(caught?.status === status, `${code} 的状态码要保持`);
}

await expectOnce(
  jsonResponse({}, 401),
  "DEEPSEEK_REQUEST_FAILED",
  "网络异常，请再试一次！",
);
await expectOnce(
  jsonResponse({}, 429),
  "DEEPSEEK_RATE_LIMITED",
  "网站处理业务过多，请再试一次！",
);
await expectOnce(
  jsonResponse({}, 500),
  "DEEPSEEK_REQUEST_FAILED",
  "网络异常，请再试一次！",
);
await expectOnce(
  () => {
    throw new Error("offline");
  },
  "DEEPSEEK_UNREACHABLE",
  "网络异常，请再试一次！",
);
await expectOnce(
  (_url, init) => new Promise((_resolve, reject) => {
    init.signal.addEventListener("abort", () => {
      const error = new Error("aborted");
      error.name = "AbortError";
      reject(error);
    });
  }),
  "DEEPSEEK_TIMEOUT",
  "您的文章可能过长了，缩短一点再试一次吧！",
  { timeoutMs: 40 },
);

let documentCalls = 0;
let documentError = null;
try {
  await normalizeWithDeepSeek(source, apiKey, "deepseek-flash", { mode: "choose" }, {
    fetchImpl: async () => {
      documentCalls += 1;
      return completion(JSON.stringify(documentBody([])));
    },
  });
} catch (error) {
  documentError = error;
}
assert(documentCalls === 1, "文章结构不可用时不要再请求");
assert(documentError?.code === "DEEPSEEK_INVALID_DOCUMENT", "结构不可用仍是原来的错误码");
assert(documentError?.message === "网络异常，请再试一次！", "结构不可用给用户看的是网络异常");

let missingCalls = 0;
try {
  await normalizeWithDeepSeek(source, "", "deepseek-flash", { mode: "choose" }, {
    fetchImpl: async () => {
      missingCalls += 1;
      return completion(validJson);
    },
  });
  throw new Error("没配密钥时不该成功");
} catch (error) {
  assert(error.code === "DEEPSEEK_API_KEY_MISSING", "没配密钥仍是原来的错误");
  assert(error.message === "网络异常，请再试一次！", "没配密钥时用户看到的也是网络异常");
}
assert(missingCalls === 0, "没配密钥时不要请求");

const budgetStarted = Date.now();
let budgetCalls = 0;
const budgetLogged = await withWarn(async () => {
  try {
    await normalizeWithDeepSeek(source, apiKey, "deepseek-flash", { mode: "choose" }, {
      timeoutMs: 26_000,
      totalBudgetMs: 120,
      minRetryMs: 40,
      fetchImpl: (_url, init) => {
        budgetCalls += 1;
        if (budgetCalls === 1) return completion("");
        return new Promise((_resolve, reject) => {
          init.signal.addEventListener("abort", () => {
            const error = new Error("aborted");
            error.name = "AbortError";
            reject(error);
          });
        });
      },
    });
    throw new Error("第二次超时不该成功");
  } catch (error) {
    return error;
  }
});
const budgetElapsed = Date.now() - budgetStarted;
assert(budgetCalls === 2, "预算还够时，空内容要再请求一次");
assert(budgetLogged.result?.code === "DEEPSEEK_TIMEOUT", "第二次没在剩余时间里回来，要报超时");
assert(budgetElapsed < 2_000, "重试要吃掉剩余预算，不能再放宽到一整段 26 秒");
assert(budgetLogged.warnings[0].includes("retry=yes"), "还来得及再试时，日志要写会重试");
assertNoSecrets(budgetLogged.warnings);

const route = readFileSync(new URL("../app/api/normalize/route.ts", import.meta.url), "utf8");
const normalizeAt = route.indexOf("await normalizeWithDeepSeek(");
const spendAt = route.indexOf("await spendCredits(");
assert(normalizeAt > 0 && spendAt > normalizeAt, "先整次排版成功，再扣积分");

const changelog = readFileSync(new URL("../lib/changelog.ts", import.meta.url), "utf8");
assert(changelog.includes("新增「动森」文章主题与更新日志。本次尚未上线。"), "2026-11-23 那句尚未上线不要改");
assert(changelog.includes("优化排版失败时，会提示「网络异常，请再试一次！」「您的文章可能过长了，缩短一点再试一次吧！」或「网站处理业务过多，请再试一次！」。本次尚未上线。"), "这次日志要写明这三句，并标明尚未上线");

const appJs = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const formatStart = appJs.indexOf("function formatNormalizeError");
const formatEnd = appJs.indexOf("let groundAiDocumentFn");
const formatFn = appJs.slice(formatStart, formatEnd);
assert(formatFn.includes("NORMALIZE_PLAIN_MESSAGES.has(message)"), "这三句在工作台原样显示");
assert(formatFn.includes('code.startsWith("DEEPSEEK_")'), "排版错误不再把错误码拼到句子前面");
assert(appJs.includes('throw new Error("您的文章可能过长了，缩短一点再试一次吧！")'), "网关 504 没有正文时，也用文章过长这句");
assert(appJs.includes('const NORMALIZE_ERROR_FALLBACK = "网络异常，请再试一次！"'), "没有说明时用网络异常这句");

console.log("normalize output checks ok");
