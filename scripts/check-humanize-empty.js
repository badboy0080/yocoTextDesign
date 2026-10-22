import { readFileSync } from "node:fs";
import { cleanRewrite, humanizeText } from "../lib/deepseek-tools.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const sample = [
  "# AI都能写文章了，公众号排版还得自己熬？",
  "",
  "派友们，有件事挺有意思。",
  "",
  "AI已经能帮我们**写文章、改标题、想选题**了。",
  "",
  "结果到了发公众号这一步，还是得自己**调字号、改行距、给重点上颜色**。正文都写完了。==人还卡在一个小标题上==。",
  "",
  "大家好，我是数字派酋长。",
  "",
  "今天聊聊我自己做的公众号排版工具：**Yooco**。",
].join("\n");

assert(cleanRewrite(sample) === sample, "截图里的原文不能被清洗清掉");
assert(cleanRewrite(`\`\`\`markdown\n${sample}\n\`\`\``) === sample, "代码围栏里的正文要留下来");
assert(cleanRewrite(`正文：\n\n${sample}`) === sample, "只去掉开头的「正文：」，后面整篇要留");
assert(cleanRewrite(`「${sample}」`) === sample, "整篇外层引号去掉后，正文还在");
assert(cleanRewrite("改写文章这件事，先从一句人话开始。") === "改写文章这件事，先从一句人话开始。", "没有冒号的「改写」不是标签");
assert(cleanRewrite("改写：") === "", "只剩标签时算空");
assert(cleanRewrite("```\n\n```") === "", "只有围栏、里面没字，算空");
assert(cleanRewrite("```\n```") === "```\n```", "围栏没单独换行时不动它，避免把正文清掉");
assert(cleanRewrite("「」") === "", "空引号算空");
assert(cleanRewrite("   \n") === "", "空白算空");
assert(cleanRewrite(null) === "", "没有内容算空");

const route = readFileSync(new URL("../app/api/tools/route.ts", import.meta.url), "utf8");
const rewriteAt = route.indexOf("await humanizeText(");
const spendAt = route.indexOf("await spendCredits(");
assert(rewriteAt > 0 && spendAt > rewriteAt, "先改写成功，再扣积分");

const apiKey = "sk-test-SECRET-KEY";
const input = `UNIQUE_INPUT_SENTINEL\n${sample}`;

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
    usage: extra.usage,
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
    if (typeof next === "function") return next(init);
    return next;
  };
  const outcome = await withWarn(() => humanizeText(input, apiKey, "deepseek-flash", { fetchImpl, ...options }));
  return { ...outcome, calls };
}

function assertNoSecrets(warnings) {
  const log = warnings.join("\n");
  assert(!log.includes(apiKey), "日志不能带密钥");
  assert(!log.includes("UNIQUE_INPUT_SENTINEL"), "日志不能带原文");
  assert(!log.includes("UNIQUE_REASONING_SENTINEL"), "日志不能带思考过程");
  assert(!log.includes("Bearer"), "日志不能带请求头");
}

const kept = await runScripted([completion(sample)]);
assert(kept.result === sample, "第一次有正文就直接用");
assert(kept.calls.length === 1, "有正文时不重试");
assert(!("thinking" in kept.calls[0].body), "第一次沿用模型默认，不额外关思考");
assert(kept.warnings.length === 0, "成功时不打空结果日志");

const recovered = await runScripted([
  completion(null, {
    finish_reason: "length",
    reasoning_content: "UNIQUE_REASONING_SENTINEL",
    usage: { completion_tokens: 4096, completion_tokens_details: { reasoning_tokens: 4096 } },
  }),
  completion("改好了，像人写的。"),
]);
assert(recovered.result === "改好了，像人写的。", "第一次正文是空的，第二次的正文要返回");
assert(recovered.calls.length === 2, "空正文要在同一次请求里再试一次");
assert(recovered.calls[1].body.thinking?.type === "disabled", "思考占满字数时，第二次直接写正文");
assert(recovered.calls[0].url === "https://api.deepseek.com/chat/completions", "仍请求原来的改写接口");
assert(recovered.warnings.length === 1, "第一次空结果记一条日志");
assert(recovered.warnings[0].includes("kind=null"), "日志要标出正文是 null");
assert(recovered.warnings[0].includes("finish=length"), "日志要记下结束原因");
assert(recovered.warnings[0].includes("retry=thinking-off"), "日志要记下第二次关掉思考");
assert(recovered.warnings[0].includes("inputChars="), "日志只记字数");
assertNoSecrets(recovered.warnings);

const blankThenOk = await runScripted([
  completion("  \n"),
  completion("空白之后补上的正文。"),
]);
assert(blankThenOk.result === "空白之后补上的正文。", "只回空白也要再试一次");
assert(blankThenOk.calls.length === 2, "空白也算空结果");
assert(!("thinking" in blankThenOk.calls[1].body), "不是思考占满时，第二次请求保持原样");
assert(blankThenOk.warnings[0].includes("kind=blank"), "空白要记成 blank");
assert(blankThenOk.warnings[0].includes("retry=same"), "原样重试要写进日志");

const stripped = await runScripted([
  completion("改写："),
  completion(sample),
]);
assert(stripped.result === sample, "只剩「改写：」时再试，用第二次的正文");
assert(stripped.warnings[0].includes("kind=stripped"), "被清洗光的结果要记成 stripped");

let emptyError = null;
const bothEmpty = await withWarn(async () => {
  const calls = [];
  const fetchImpl = async (_url, init) => {
    calls.push(JSON.parse(init.body));
    return completion(null, { finish_reason: "stop" });
  };
  try {
    await humanizeText(input, apiKey, "deepseek-flash", { fetchImpl });
  } catch (error) {
    emptyError = error;
  }
  assert(calls.length === 2, "两次都空也只再试一次");
  assert(!("thinking" in calls[1]), "普通空回的第二次不改请求");
  return calls;
});
assert(emptyError?.code === "DEEPSEEK_INVALID_OUTPUT", "两次都空仍是原来的错误码");
assert(emptyError?.message === "改写结果是空的，请再试一次。", "两次都空仍是原来的那句提示");
assert(emptyError?.status === 502, "两次都空仍是 502");
assert(bothEmpty.warnings.length === 2, "两次空结果各记一条");
assert(bothEmpty.warnings[1].includes("attempt=2"), "第二次失败要标成 attempt=2");
assert(bothEmpty.warnings[1].includes("retry=none"), "第二次不再往下试");
assertNoSecrets(bothEmpty.warnings);

const skipped = await runScripted(
  [completion("")],
  { minRetryMs: Number.MAX_SAFE_INTEGER },
).catch((error) => error);
assert(skipped?.code === "DEEPSEEK_INVALID_OUTPUT", "来不及再试时仍报空结果");
assert(skipped?.message === "改写结果是空的，请再试一次。", "来不及再试时提示不变");

const skippedLogged = await withWarn(async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls += 1;
    return completion(" \n ");
  };
  try {
    await humanizeText("短句", apiKey, "deepseek-flash", {
      fetchImpl,
      minRetryMs: Number.MAX_SAFE_INTEGER,
    });
  } catch (error) {
    assert(error.message === "改写结果是空的，请再试一次。", "时间不够时不改提示");
  }
  assert(calls === 1, "剩下的时间不够一次改写时，不要再打第二次");
});
assert(skippedLogged.warnings[0].includes("retry=skipped-budget"), "跳过重试要写进日志");
assertNoSecrets(skippedLogged.warnings);

async function expectOnce(response, code, message) {
  let calls = 0;
  const fetchImpl = async () => {
    calls += 1;
    if (typeof response === "function") return response();
    return response;
  };
  let caught = null;
  try {
    await humanizeText(input, apiKey, "deepseek-flash", { fetchImpl });
  } catch (error) {
    caught = error;
  }
  assert(calls === 1, `${code} 不能因为失败再打一次`);
  assert(caught?.code === code, `${code} 的错误码要保持`);
  assert(caught?.message === message, `${code} 的提示要保持`);
}

await expectOnce(
  jsonResponse({}, 401),
  "DEEPSEEK_REQUEST_FAILED",
  "改写密钥无效，请检查 DEEPSEEK_TOOLS_API_KEY。",
);
await expectOnce(
  jsonResponse({}, 429),
  "DEEPSEEK_RATE_LIMITED",
  "改写请求太多了，请稍后再试。",
);
await expectOnce(
  () => {
    throw new Error("offline");
  },
  "DEEPSEEK_UNREACHABLE",
  "暂时连不上改写服务，请稍后再试。",
);
await expectOnce(
  {
    ok: true,
    status: 200,
    async json() {
      throw new Error("not json");
    },
  },
  "DEEPSEEK_INVALID_OUTPUT",
  "改写结果读不出来，请再试一次。",
);

let missingCalls = 0;
try {
  await humanizeText(input, "", "deepseek-flash", {
    fetchImpl: async () => {
      missingCalls += 1;
      return completion("不应该请求");
    },
  });
  throw new Error("没配密钥时不该成功");
} catch (error) {
  assert(error.code === "DEEPSEEK_API_KEY_MISSING", "没配密钥仍是原来的错误");
}
assert(missingCalls === 0, "没配密钥时不要请求");

const hung = await withWarn(async () => {
  let calls = 0;
  const fetchImpl = (_url, init) => new Promise((_resolve, reject) => {
    calls += 1;
    init.signal.addEventListener("abort", () => {
      const error = new Error("aborted");
      error.name = "AbortError";
      reject(error);
    });
  });
  let caught = null;
  try {
    await humanizeText(input, apiKey, "deepseek-flash", {
      fetchImpl,
      attemptTimeoutMs: 40,
      totalBudgetMs: 30_000,
    });
  } catch (error) {
    caught = error;
  }
  assert(calls === 1, "第一次超时不要接着再试");
  assert(caught?.code === "DEEPSEEK_TIMEOUT", "超时仍是原来的错误码");
  assert(caught?.message === "改写超过 30 秒还没回来，请少选一点再试。", "超时提示不变");
});
assert(hung.warnings.length === 0, "超时不是空结果，不记空结果日志");

console.log("humanize empty retry checks passed");
