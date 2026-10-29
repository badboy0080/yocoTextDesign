import { AppError, normalizeWithDeepSeek } from "../lib/deepseek-normalizer.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const missing = await normalizeWithDeepSeek("雨停以后。", "", "deepseek-flash", { mode: "choose" }).then(
  () => null,
  (error) => error,
);
assert(missing instanceof AppError, "没配密钥要是已知错误");
assert(missing?.code === "DEEPSEEK_API_KEY_MISSING", "没配密钥要马上说明，不能干等");
assert(missing?.status === 503, "没配密钥是 503，不是超时");

let seen = null;
const hung = normalizeWithDeepSeek("雨停以后。", "test-key", "deepseek-flash", { mode: "choose" }, {
  timeoutMs: 40,
  fetchImpl(_url, init) {
    seen = JSON.parse(init.body);
    return new Promise((_resolve, reject) => {
      init.signal.addEventListener("abort", () => {
        const error = new Error("aborted");
        error.name = "AbortError";
        reject(error);
      });
    });
  },
});
const timedOut = await hung.then(
  () => null,
  (error) => error,
);
assert(seen?.thinking?.type === "disabled", "排版请求要关掉思考，避免把网关拖成 504");
assert(seen?.response_format?.type === "json_object", "仍只要 JSON");
assert(!seen?.messages?.[0]?.content?.includes("sk-"), "提示词里不能带密钥");
assert(timedOut instanceof AppError, "超时要是已知错误");
assert(timedOut?.code === "DEEPSEEK_TIMEOUT", "超时仍是原来的错误码");
assert(timedOut?.status === 503, "自己停下时用 503，不要再回 504");
assert(String(timedOut?.message || "").includes("缩短文章"), "超时说明仍是中文");

console.log("normalize timeout checks ok");
