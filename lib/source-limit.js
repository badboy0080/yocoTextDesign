/**
 * 排版原文上限。工作台 public/app.js 里「source-limit」那一段必须和这里同一套数法。
 *
 * 口径：数完整原文，不先去掉首尾空白，也不截断。
 * 汉字、标点、空格、换行各算 1。
 * 表情按读者看到的一个字算（字素簇），不用 JS 的字符串长度。
 * 字符串长度会把一个表情算成 2 或更多，前后端就会对不齐。
 * 满 10000 可以优化。从 10001 起拒绝，不调用模型，不扣积分。
 */

export const SOURCE_CHAR_LIMIT = 10000;
export const SOURCE_LIMIT_MESSAGE = "您上传的文本超过上限！";

const sourceSegmenter = typeof Intl !== "undefined" && typeof Intl.Segmenter === "function"
  ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
  : null;

export function countSourceChars(value) {
  const text = typeof value === "string" ? value : "";
  if (!text) return 0;
  if (sourceSegmenter) {
    let count = 0;
    for (const _part of sourceSegmenter.segment(text)) count += 1;
    return count;
  }
  return Array.from(text).length;
}

export function sourceOverLimit(value) {
  return countSourceChars(value) > SOURCE_CHAR_LIMIT;
}
