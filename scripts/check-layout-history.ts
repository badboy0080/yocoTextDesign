import {
  HISTORY_EXCERPT_MAX,
  HISTORY_KEEP,
  HISTORY_SOURCE_MAX,
  appendHistoryItem,
  listLayoutHistory,
  prepareHistoryRecord,
  readLayoutHistory,
  resetLayoutHistoryMemory,
  sanitizeHistoryParams,
  saveLayoutHistory,
} from "../lib/layout-history.ts";

process.env.YOOCO_HISTORY_MEMORY = "1";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const longSentence = "这是一句很长的原文摘要，用来确认列表里只留一句，并且不会把整篇文章露在列表上。后面还有很多字不应该出现。";
const prepared = prepareHistoryRecord({
  source: "# 雨停以后\n\n去散步。",
  excerpt: longSentence,
  theme: "Fresh",
  themeLabel: "清氧绿",
  params: { theme: "fresh", fontSize: 16, showSignature: false, nested: { no: true }, note: "x".repeat(80) },
});
assert(prepared, "有正文就要能整理成一条记录");
if (!prepared) throw new Error("unreachable");
assert(prepared.title === "雨停以后", "标题取正文里的一级标题");
assert(prepared.excerpt.length <= HISTORY_EXCERPT_MAX, "摘要不能超过一句的长度上限");
assert(!prepared.excerpt.includes("后面还有很多字"), "摘要在句号前截断");
assert(prepared.theme === "fresh", "主题标识用小写");
assert(prepared.themeLabel === "清氧绿", "主题名保留中文");
assert(prepared.params.theme === "fresh", "样式字段要留下");
assert(prepared.params.fontSize === 16, "数字样式要留下");
assert(prepared.params.showSignature === false, "开关要留下");
assert(!("nested" in prepared.params), "嵌套对象不能入库");
assert(String(prepared.params.note).length <= 48, "过长的样式文字要截断");
assert(prepareHistoryRecord({ source: "   " }) === null, "空正文不能存");

const huge = prepareHistoryRecord({ source: "字".repeat(HISTORY_SOURCE_MAX + 50), theme: "classic" });
assert(huge && huge.source.length === HISTORY_SOURCE_MAX, "超长正文要截断后再存");

const params = sanitizeHistoryParams({ mood: "minimal", skin: "ink-cream", "<script>": "no" });
assert(params.mood === "minimal" && params.skin === "ink-cream", "气质和皮肤要能存");
assert(!("<script>" in params), "不合法的字段名丢掉");

let doc = { version: 1 as const, items: [] };
for (let i = 0; i < HISTORY_KEEP + 5; i += 1) {
  const item = prepareHistoryRecord({ source: `# 第${i}篇\n\n正文`, theme: "mono", themeLabel: "素墨" });
  assert(item, "样例要能生成");
  if (!item) throw new Error("unreachable");
  item.id = `a`.repeat(15) + (i % 10).toString(16);
  const appended = appendHistoryItem(doc, item);
  assert(appended.created, "不同正文要新记一条");
  doc = appended.doc;
}
assert(doc.items.length === HISTORY_KEEP, "每人只留最近 30 条");
assert(doc.items[0]?.title === `第${HISTORY_KEEP + 4}篇`, "最新的一条排在最前");

const duplicate = prepareHistoryRecord({ source: doc.items[0]?.source || "", theme: "mono", themeLabel: "素墨" });
assert(duplicate, "重复样例要能生成");
if (!duplicate) throw new Error("unreachable");
const again = appendHistoryItem(doc, duplicate);
assert(!again.created && again.doc.items.length === HISTORY_KEEP, "和最新一条一样就不要再记");

resetLayoutHistoryMemory();
const first = await saveLayoutHistory(7, {
  source: "# 少说一句\n\n颜色少，句子才站得住。",
  excerpt: "一篇评论不必把每个判断都加粗。",
  theme: "classic",
  themeLabel: "克制高级",
  params: { theme: "classic", mood: "minimal", skin: "ink-cream" },
});
assert(first.ok && first.created, "登录用户第一次成功排版要记下来");
if (!first.ok) throw new Error("unreachable");
const second = await saveLayoutHistory(7, {
  source: "# 少说一句\n\n颜色少，句子才站得住。",
  theme: "classic",
  themeLabel: "克制高级",
});
assert(second.ok && !second.created, "同一篇再存一次不重复");
const other = await saveLayoutHistory(8, {
  source: "# 别人的稿\n\n不该被看到。",
  theme: "nocturne",
  themeLabel: "深空青",
});
assert(other.ok, "另一个账号也能记自己的");

const mine = await listLayoutHistory(7);
assert(mine?.length === 1 && mine[0]?.title === "少说一句", "列表只返回摘要");
assert(mine?.[0] && !("source" in mine[0]), "列表不带正文");
const theirs = await listLayoutHistory(8);
assert(theirs?.length === 1 && theirs[0]?.title === "别人的稿", "账号之间的列表分开");
const hidden = await readLayoutHistory(7, theirs?.[0]?.id || "");
assert(hidden === undefined, "不能读到别人的那一条");
const loaded = await readLayoutHistory(7, first.item.id);
assert(loaded?.source.includes("颜色少") && loaded.params.skin === "ink-cream", "本人可以取回正文和样式");
assert(await readLayoutHistory(7, "not-an-id") === undefined, "坏的编号直接当没有");

console.log("layout history checks ok");
