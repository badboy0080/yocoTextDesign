import { AppError } from "./deepseek-normalizer.js";

const MAX_SOURCE_CHARS = 20_000;
const FILL_TIMEOUT_MS = 60_000;
const RATIO_IDS = ["3:4", "9:16", "1:1", "16:9"];
const TEMPLATE_IDS = ["a", "b", "c", "d", "e"];
const SLOT_TYPES = ["H1", "H2", "body", "image"];

function charLength(value) {
  return Array.from(String(value || "")).length;
}

function splitParagraphs(source) {
  return String(source || "")
    .replace(/\r\n/g, "\n")
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function validateLayoutFillRequest(body) {
  if (!body || typeof body.source !== "string") {
    throw new AppError("INVALID_INPUT", "请先贴文案。", 400);
  }
  const source = body.source.replace(/\r\n/g, "\n").trim();
  if (!source) throw new AppError("EMPTY_INPUT", "请先贴文案。", 400);
  if (charLength(source) > MAX_SOURCE_CHARS) {
    throw new AppError("SOURCE_TOO_LARGE", "文案过长，请控制在 20000 字以内。", 413);
  }
  const imageCount = Number(body.imageCount);
  if (!Number.isInteger(imageCount) || imageCount < 0 || imageCount > 20) {
    throw new AppError("INVALID_INPUT", "图片张数不合法。", 400);
  }
  const ratio = String(body.ratio || "");
  if (!RATIO_IDS.includes(ratio)) throw new AppError("INVALID_INPUT", "比例只能是 3:4、9:16、1:1 或 16:9。", 400);
  const templateId = String(body.templateId || "");
  if (!TEMPLATE_IDS.includes(templateId)) throw new AppError("INVALID_INPUT", "模板不存在。", 400);
  if (!Array.isArray(body.slots) || body.slots.length < 1) {
    throw new AppError("INVALID_INPUT", "缺少槽清单。", 400);
  }
  const slots = body.slots.map((item) => {
    const id = String(item?.id || "");
    const type = String(item?.type || "");
    if (!id || !SLOT_TYPES.includes(type)) {
      throw new AppError("INVALID_INPUT", "槽定义不合法。", 400);
    }
    return { id, type };
  });
  const seed = body.seed == null ? undefined : Number(body.seed);
  if (seed != null && !Number.isInteger(seed)) {
    throw new AppError("INVALID_INPUT", "seed 必须是整数。", 400);
  }
  return { source, imageCount, ratio, templateId, slots, seed };
}

export function defaultFill(ctx) {
  const parts = splitParagraphs(ctx.source);
  const textSlots = ctx.slots.filter((slot) => slot.type !== "image");
  const imageSlots = ctx.slots.filter((slot) => slot.type === "image");
  const filled = [];
  textSlots.forEach((slot) => {
    if (slot.type === "H1") filled.push({ id: slot.id, type: slot.type, text: parts[0] || "" });
    else if (slot.type === "H2") filled.push({ id: slot.id, type: slot.type, text: parts[1] || "" });
    else {
      const bodyParts = parts.slice(textSlots[0]?.type === "H1" ? (textSlots[1]?.type === "H2" ? 2 : 1) : 0);
      // 多 body：按 body 序号取剩余段
      const bodyIndex = textSlots.filter((item) => item.type === "body").indexOf(slot);
      filled.push({ id: slot.id, type: slot.type, text: bodyParts[bodyIndex] || bodyParts.join("\n") || "" });
    }
  });
  imageSlots.forEach((slot, index) => {
    if (index < ctx.imageCount) filled.push({ id: slot.id, type: "image", imageIndex: index });
    else filled.push({ id: slot.id, type: "image" }); // 空着，无 imageIndex
  });
  return {
    templateId: ctx.templateId,
    ratio: ctx.ratio,
    seed: ctx.seed ?? null,
    slots: filled,
  };
}

function validImageIndex(value, imageCount) {
  return Number.isInteger(value) && value >= 0 && value < imageCount;
}

export function normalizeFillResult(raw, ctx) {
  const byId = new Map(ctx.slots.map((slot) => [slot.id, slot]));
  if (!raw || !Array.isArray(raw.slots)) return defaultFill(ctx);
  const out = [];
  let illegal = false;
  for (const slot of ctx.slots) {
    const hit = raw.slots.find((item) => item && item.id === slot.id);
    if (!hit || hit.type !== slot.type) {
      illegal = true;
      break;
    }
    if (slot.type === "image") {
      if (ctx.imageCount === 0) {
        out.push({ id: slot.id, type: "image" });
      } else if (hit.imageIndex == null) {
        out.push({ id: slot.id, type: "image" });
      } else if (!validImageIndex(hit.imageIndex, ctx.imageCount)) {
        illegal = true;
        break;
      } else {
        out.push({ id: slot.id, type: "image", imageIndex: hit.imageIndex });
      }
    } else {
      out.push({ id: slot.id, type: slot.type, text: String(hit.text || "") });
    }
  }
  for (const item of raw.slots || []) {
    if (item?.id && !byId.has(item.id)) illegal = true;
  }
  if (illegal) return defaultFill(ctx);
  return {
    templateId: ctx.templateId,
    ratio: ctx.ratio,
    seed: Number.isInteger(raw.seed) ? raw.seed : (ctx.seed ?? null),
    slots: out,
  };
}

function buildFillPrompt(ctx) {
  const slotList = ctx.slots.map((slot) => `- id=${slot.id} type=${slot.type}`).join("\n");
  return `你是 Yooco「智能排版」的填槽编辑。用户给原文和槽清单，你只把原文拆进槽里。

硬性规则：
- 只输出一个 JSON 对象，不要解释，不要代码围栏。
- 不要复用公众号 normalize / reroll 的块结构；不要输出主题、颜色、HTML。
- 文字必须来自原文（可截断），禁止编造事实。
- 槽 type 只有 H1、H2、body、image。
- image 槽用 imageIndex（从 0 起，对应用户上传顺序）；图不够就省略 imageIndex 让槽空着。
- 每个槽 id 必须正好来自清单，不能增删 id，不能改 type。
- 瑞士海报：标题短，槽不合并，不发明新槽，日期、地点、署名保持短。
${ctx.seed == null ? "" : `- 本次 seed=${ctx.seed}，请换一种分段取舍，但仍忠于原文。`}

当前：templateId=${ctx.templateId} ratio=${ctx.ratio} imageCount=${ctx.imageCount}

槽清单：
${slotList}

JSON 形状：
{"templateId":"${ctx.templateId}","ratio":"${ctx.ratio}","seed":${ctx.seed == null ? "null" : ctx.seed},"slots":[{"id":"title","type":"H1","text":"..."},{"id":"image","type":"image","imageIndex":0}]}`;
}

export async function fillLayoutSlots(ctx, apiKey, model = "deepseek-flash", options = {}) {
  if (!apiKey) {
    throw new AppError("DEEPSEEK_API_KEY_MISSING", "尚未配置 DeepSeek API 密钥。", 503);
  }
  const fetchImpl = options.fetchImpl || fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || FILL_TIMEOUT_MS);
  let response;
  try {
    response = await fetchImpl("https://api.deepseek.com/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: ctx.seed == null ? 0.2 : 0.7,
        stream: false,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: buildFillPrompt(ctx) },
          { role: "user", content: ctx.source },
        ],
      }),
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new AppError("DEEPSEEK_TIMEOUT", "排版失败，再试一次", 504);
    }
    throw new AppError("DEEPSEEK_UNREACHABLE", "排版失败，再试一次", 502);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new AppError("DEEPSEEK_REQUEST_FAILED", "排版失败，再试一次", response.status === 429 ? 429 : 502);
  }

  let raw;
  try {
    const payload = await response.json();
    raw = JSON.parse(payload?.choices?.[0]?.message?.content || "");
  } catch {
    throw new AppError("DEEPSEEK_INVALID_OUTPUT", "排版失败，再试一次", 502);
  }
  return normalizeFillResult(raw, ctx);
}

export { AppError };
