/**
 * 大标题必须能在原文里找到。标点、空格、引号可以不同；差几个字也可以。
 * 对不上的 document.title 和开头 heading 会丢掉，避免预览画出原文没有的大标题。
 * 服务端 lib/deepseek-normalizer.js 和预览里的优化结果共用这一份。
 */

const GROUNDING_SKIP = /[\s\u00a0\u3000「」『』“”"'‘’《》〈〉（）()【】\[\]{}：:，,。．.！!？?；;、·…—–\-_~～|/／\\#*`=+]+/g;

export function compactForGrounding(value) {
  return String(value || "").toLowerCase().replace(GROUNDING_SKIP, "");
}

function longestCommonSubstringLength(a, b) {
  if (!a || !b) return 0;
  const needle = a.length <= b.length ? a : b;
  const hay = a.length <= b.length ? b : a;
  let best = 0;
  for (let i = 0; i < needle.length; i += 1) {
    if (needle.length - i <= best) break;
    for (let len = needle.length - i; len > best; len -= 1) {
      if (hay.includes(needle.slice(i, i + len))) {
        best = len;
        break;
      }
    }
  }
  return best;
}

export function textGroundedInSource(candidate, source) {
  const needle = compactForGrounding(candidate);
  if (needle.length < 2) return false;
  const haystack = compactForGrounding(source);
  if (haystack.includes(needle)) return true;
  if (needle.length < 8) return false;
  const threshold = Math.ceil(needle.length * 0.8);
  const lines = String(source || "").split(/\n+/);
  for (const line of lines) {
    const compactLine = compactForGrounding(line);
    if (compactLine.length < 6) continue;
    if (longestCommonSubstringLength(compactLine, needle) >= threshold) return true;
  }
  return false;
}

export function groundAiDocument(document, source) {
  if (!document || typeof document !== "object") return document;
  const blocks = Array.isArray(document.blocks) ? document.blocks.slice() : [];
  const rawTitle = typeof document.title === "string" ? document.title.trim() : "";
  const title = textGroundedInSource(rawTitle, source) ? rawTitle : "";
  while (blocks.length && blocks[0]?.type === "heading" && !textGroundedInSource(blocks[0].text, source)) {
    blocks.shift();
  }
  return { ...document, title, blocks };
}
