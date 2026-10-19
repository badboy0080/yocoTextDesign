import { AppError } from "./deepseek-normalizer.js";
import { compactForGrounding } from "../public/ground-title.js";
import {
  COMPOSITION_IDS,
  parseCopyLocally,
  ROLE_IDS,
} from "../public/layout-templates.js";

const MAX_SOURCE_CHARS = 8_000;
const LAYOUT_TIMEOUT_MS = 45_000;
const MAX_ROLE_CHARS = 2_000;

const LAYOUT_PROMPT = `你是 Yooco「版式设计」的文案标注员。用户会贴一段短文案，用来做一张固定画幅海报。

只做两件事：
1. 把原文里已经出现的文字，原样切成角色。
2. 从九种构图里建议一种。

绝对不要：
- 改写、润色、翻译、总结、扩写
- 补充原文没有的事实、作者、日期、数字
- 把字画进图片，或描述画面

角色 role 只能是：
- title 主标题：最适合当大标题的那一句，必须是原文里的连续片段
- subtitle 副标题：次级一句。原文没有就不要输出这个角色
- body 辅助字：其余要上海报的短段。原文没有就不要输出
- caption 说明：很短的补充。原文没有就不要输出
- source 来源署名：作者、出处。原文没有就不要输出

规则：
- text 必须能在原文里逐字找到。可以去掉首尾空白，不能增删字，不能改标点。
- 同一段文字不要放到两个角色。
- 不要把整段长文都塞进 title。
- 原文没有的角色不要编。
- suggestedComposition 只能是：center、diagonal、scatter、triangle、grid、enclose、curve、split、corners。
  center 居中式：一句金句、对称。
  diagonal 对角线：从左上到右下。
  scatter 散点式：多句长短不一。
  triangle 三角：一句总起，下面分两边。
  grid 九宫格：多条短句并列。
  enclose 包围式：中间主句，四周还有字。
  curve 曲线式：句子有先后。
  split 分割式：标题和正文明显分成两块。
  corners 四角式：四句各自独立。

严格只输出一个 JSON 对象，不要解释，不要代码围栏：
{"roles":[{"role":"title","text":""}],"suggestedComposition":"center"}`;

function charLength(value) {
  return Array.from(String(value || "")).length;
}

function capChars(value, limit = MAX_ROLE_CHARS) {
  const chars = Array.from(String(value || ""));
  return chars.length <= limit ? String(value || "") : chars.slice(0, limit).join("");
}

function overlaps(a, b) {
  return a.start < b.end && b.start < a.end;
}

/**
 * 把模型给的句子对回原文。对不上就丢掉。
 * 标点、空格可以不同，但返回的一定是原文切片，不是模型改过的句子。
 */
export function findSourceSlice(source, text, used = []) {
  const raw = String(text || "").trim();
  if (!raw || !source) return null;
  let from = 0;
  while (from <= source.length) {
    const exact = source.indexOf(raw, from);
    if (exact < 0) break;
    const slice = { start: exact, end: exact + raw.length, text: source.slice(exact, exact + raw.length) };
    if (!used.some((item) => overlaps(item, slice))) return slice;
    from = exact + 1;
  }

  const want = compactForGrounding(raw);
  if (!want) return null;
  let compact = "";
  const map = [];
  for (let index = 0; index < source.length;) {
    const char = String.fromCodePoint(source.codePointAt(index));
    const piece = compactForGrounding(char);
    for (let i = 0; i < piece.length; i += 1) map.push(index);
    compact += piece;
    index += char.length;
  }

  let at = compact.indexOf(want);
  while (at >= 0) {
    const start = map[at];
    const last = map[at + want.length - 1];
    const lastChar = String.fromCodePoint(source.codePointAt(last));
    const end = last + lastChar.length;
    const slice = { start, end, text: source.slice(start, end) };
    if (!used.some((item) => overlaps(item, slice)) && compactForGrounding(slice.text) === want) return slice;
    at = compact.indexOf(want, at + 1);
  }
  return null;
}

export function normalizeLayoutResult(result, source) {
  const rawRoles = Array.isArray(result?.roles) ? result.roles : [];
  const used = [];
  const found = new Map();
  let dropped = 0;
  for (const item of rawRoles) {
    if (!String(item?.text || "").trim()) continue;
    const role = String(item?.role || "");
    if (!ROLE_IDS.includes(role) || found.has(role)) {
      if (item && (item.role || item.text)) dropped += 1;
      continue;
    }
    const slice = findSourceSlice(source, item?.text, used);
    if (!slice || compactForGrounding(slice.text).length < 1) {
      dropped += 1;
      continue;
    }
    const text = capChars(slice.text);
    found.set(role, text);
    used.push(slice);
  }
  const roles = ROLE_IDS.filter((role) => found.has(role)).map((role) => ({ role, text: found.get(role) }));
  let suggestedComposition = String(result?.suggestedComposition || "");
  if (!COMPOSITION_IDS.includes(suggestedComposition)) {
    suggestedComposition = parseCopyLocally(source).suggestedComposition;
  }
  return { roles, suggestedComposition, dropped };
}

export function validateLayoutRequest(body) {
  if (!body || typeof body.source !== "string") {
    throw new AppError("INVALID_INPUT", "请先贴需要排进海报的文案。", 400);
  }
  const source = body.source.replace(/\r\n/g, "\n").trim();
  if (!source) throw new AppError("EMPTY_INPUT", "请先贴需要排进海报的文案。", 400);
  if (charLength(source) > MAX_SOURCE_CHARS) {
    throw new AppError("SOURCE_TOO_LARGE", "这段太长了。海报只收 8000 字以内，长文请去优化排版。", 413);
  }
  return { source };
}

function localResult(source) {
  const local = parseCopyLocally(source);
  return {
    roles: local.roles,
    suggestedComposition: local.suggestedComposition,
    parser: "fallback",
    dropped: 0,
  };
}

async function callDeepSeek(source, apiKey, model) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LAYOUT_TIMEOUT_MS);
  let response;
  try {
    response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        stream: false,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: LAYOUT_PROMPT },
          { role: "user", content: `以下是用户原文。只许切分，不许改写：\n${source}` },
        ],
      }),
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new AppError("DEEPSEEK_TIMEOUT", "DeepSeek 处理超时，请把文案缩短后再试。", 504);
    }
    throw new AppError("DEEPSEEK_UNREACHABLE", "暂时连不上 DeepSeek，请检查网络后再试。", 502);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const providerStatus = response.status;
    const code = providerStatus === 429 ? "DEEPSEEK_RATE_LIMITED" : "DEEPSEEK_REQUEST_FAILED";
    const message = providerStatus === 401
      ? "DeepSeek API 密钥无效，请检查 DEEPSEEK_API_KEY。"
      : providerStatus === 429
        ? "DeepSeek 当前请求过多，请稍后再试。"
        : "DeepSeek 暂时没能完成标注，请稍后再试。";
    throw new AppError(code, message, providerStatus === 429 ? 429 : 502);
  }

  let payload;
  try {
    payload = await response.json();
    const content = String(payload?.choices?.[0]?.message?.content || "").trim();
    try {
      return JSON.parse(content);
    } catch {
      const start = content.indexOf("{");
      const end = content.lastIndexOf("}");
      if (start >= 0 && end > start) return JSON.parse(content.slice(start, end + 1));
      throw new Error("invalid json");
    }
  } catch {
    throw new AppError("DEEPSEEK_INVALID_OUTPUT", "DeepSeek 返回格式异常，请重试。", 502);
  }
}

export async function parseLayoutCopy(source, apiKey, model = "deepseek-flash") {
  if (!apiKey) {
    throw new AppError("DEEPSEEK_API_KEY_MISSING", "尚未配置 DeepSeek API 密钥。请在启动服务前设置 DEEPSEEK_API_KEY。", 503);
  }
  let raw;
  try {
    raw = await callDeepSeek(source, apiKey, model);
  } catch (error) {
    if (error instanceof AppError && error.code === "DEEPSEEK_INVALID_OUTPUT") return localResult(source);
    throw error;
  }
  const normalized = normalizeLayoutResult(raw, source);
  if (!normalized.roles.length) return localResult(source);
  return { ...normalized, parser: "model" };
}

export { AppError, MAX_SOURCE_CHARS };
