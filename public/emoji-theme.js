/**
 * 表情主题的小图标。
 * 小标题、无序列表、分隔线、很短的结尾按语义加；同一篇 3～5 种。
 * 图标在文字前，中间一个普通空格。带【】的小标题，图标放在括号前面。
 * 服务端整理和预览共用这一份。
 */

const HEADING_RULES = [
  [/重要提醒|警告|危险|严禁|切勿|千万别/, "❗"],
  [/总结|结论|小结|写在最后/, "✅"],
  [/推荐|必看|必读|安利/, "⭐"],
  [/古文|诗词|读书|文案|摘录|经文/, "📖"],
  [/重点|亮点|金句|如日出之阳/, "✨"],
  [/红叶|枫叶|秋色|枫林/, "🍁"],
  [/秋天|秋季|银杏|落叶/, "🍂"],
  [/日出|朝阳|晨光|晨曦/, "🌄"],
  [/日落|黄昏|傍晚|夕阳/, "🌇"],
  [/树林|森林|林木|树荫/, "🌳"],
  [/泉水|溪流|溪水|清泉/, "💧"],
  [/彩虹/, "🌈"],
  [/山石|岩石|巨石/, "🪨"],
  [/小鱼|鱼类|动物科普|候鸟/, "🐟"],
  [/自然|风景|治愈|山野/, "🌿"],
  [/时间|倒计时|历史|年代/, "⏳"],
  [/地点|打卡|地址/, "📍"],
  [/出行|交通|自驾|高铁|地铁|航班|路线/, "🚗"],
  [/探秘|冷知识|解读|揭秘|为什么/, "🔍"],
  [/知识|科普|小提示|小贴士|技巧|方法/, "💡"],
  [/要点|提醒|注意|事项|切记/, "📌"],
  [/笔记|摘抄|感悟|随笔|手记/, "📝"],
];

const LIST_RULES = [
  [/不要|禁止|切勿|严禁/, "▪️"],
  [/可选|或者|也可以/, "▫️"],
  [/出发|前往|自驾|高铁|地铁/, "▶"],
  [/步骤|首先|接着|然后/, "►"],
  [/花|风景|自然|治愈|银杏|红叶/, "❖"],
  [/推荐|亮点|必看|金句/, "✦"],
];

const CLOSING_RULES = [
  [/留言|评论|告诉我|回复我/, "💬"],
  [/赞叹|认同|说得好|为你鼓掌/, "👏"],
  [/思考|提问|你怎么看|想问问/, "🤔"],
  [/温柔|治愈|晚安|慢慢来|抱抱/, "💛"],
  [/惊喜|福利|喜讯|恭喜|抽奖/, "🎉"],
];

const PREFIXES = [
  "✨", "💡", "📌", "🔍", "📝", "🌿", "🍂", "⏳", "📍", "🚗", "⭐", "✅", "❗", "📖",
  "🌄", "🌇", "🍁", "🌳", "💧", "🌈", "🪨", "🐟",
  "💬", "👏", "🤔", "💛", "🎉",
  "▪️", "▫️", "✦", "❖", "►", "▶", "•",
  "★", "☆", "✿", "❧", "♦",
];

const PREFIX_SORTED = [...PREFIXES].sort((left, right) => right.length - left.length);

export const EMOJI_RULE_LINES = [
  "✦──────✦",
  "❖ ———— ❖",
  "• • • • • • •",
  "━━━━━━━━━━━",
  "〰️〰️〰️〰️〰️",
  "✿──❧──✿",
];

export const EMOJI_BRIEF = "仅当 theme=emoji（表情）时加小图标，其它主题不要加。加在小标题、无序列表项、分隔线、很短的结尾互动上。同一篇只许 3 到 5 种。图标在文字前，中间一个普通空格。例：✨ 少年好学，如日出之阳。小标题若以【】开头，图标放在括号前，例：💡 【知识点】晨读为什么记得住。不要改【】里的字。小标题：✨重点亮点金句；💡知识点科普小提示；📌要点提醒注意事项；🔍探秘冷知识解读；📝笔记摘抄感悟；🌿自然风景治愈；🍂秋天红叶银杏；⏳时间倒计时历史；📍地点打卡；🚗出行交通；⭐推荐必看；✅总结结论；❗重要提醒；📖古文读书文案。场景小标题可用：🌄日出；🌇日落黄昏；🍁红叶；🌳树林；💧泉水溪流；🌈彩虹；🪨山石；🐟小鱼或动物科普。无序列表整列只用一种：• ▪️ ▫️ ✦ ❖ ► ▶。短结尾：💬留言评论；👏赞叹认同；🤔思考提问；💛温柔治愈；🎉惊喜福利喜讯。分隔线整条只用一种：✦──────✦ ；❖ ———— ❖ ；• • • • • • • ；━━━━━━━━━━━ ；〰️〰️〰️〰️〰️ ；✿──❧──✿。★ ☆ ✦ ❖ ✿ ❧ ♦ 只放进分隔线，不要套在大标题两边。不要给大标题、长段落、有序列表、代码加图标。";

function matchRule(text, rules) {
  const hay = String(text || "");
  for (const [pattern, icon] of rules) {
    if (pattern.test(hay)) return icon;
  }
  return "";
}

export function isEmojiRuleLine(value) {
  return EMOJI_RULE_LINES.includes(String(value || "").trim());
}

function stripPrefixes(value) {
  let text = String(value || "").trim();
  if (isEmojiRuleLine(text)) return text;
  for (let i = 0; i < 4; i += 1) {
    let removed = false;
    for (const icon of PREFIX_SORTED) {
      if (!text.startsWith(icon)) continue;
      const rest = text.slice(icon.length);
      if (/^\s/u.test(rest)) {
        text = rest.trim();
        removed = true;
        break;
      }
    }
    if (!removed) break;
  }
  return text;
}

export function leadingEmojiIcon(value) {
  const text = String(value || "").trim();
  for (const icon of PREFIX_SORTED) {
    if (!text.startsWith(icon)) continue;
    if (/^\s/u.test(text.slice(icon.length))) return icon;
  }
  return "";
}

function withIcon(icon, value) {
  const plain = stripPrefixes(value);
  if (!plain || isEmojiRuleLine(plain)) return plain;
  return `${icon} ${plain}`;
}

function listPlain(item) {
  if (typeof item === "string") {
    return stripPrefixes(item.trim().replace(/^(?:[-*+]|\d+[.)])\s+/, ""));
  }
  if (item && typeof item === "object") return stripPrefixes(item.text || "");
  return "";
}

function prefixListItem(item, marker) {
  if (item && typeof item === "object" && item.ordered) return item;
  if (typeof item === "string") {
    const nested = /^\s{2,}/.test(item);
    const next = withIcon(marker, item.trim().replace(/^(?:[-*+]|\d+[.)])\s+/, ""));
    return nested ? `  ${next}` : next;
  }
  if (item && typeof item === "object") {
    return { ...item, text: withIcon(marker, item.text) };
  }
  return item;
}

function classifyHeading(text) {
  const plain = stripPrefixes(text);
  const label = (plain.match(/^【([^】]{1,16})】/) || [])[1] || "";
  if (label) {
    const fromLabel = matchRule(label, HEADING_RULES);
    if (fromLabel) return fromLabel;
  }
  return matchRule(plain, HEADING_RULES) || "✨";
}

function classifyList(items) {
  return matchRule(items.map(listPlain).join(" "), LIST_RULES) || "•";
}

function classifyClosing(text) {
  return matchRule(stripPrefixes(text), CLOSING_RULES);
}

function countable(text) {
  return (String(text || "").match(/[\u4e00-\u9fffA-Za-z0-9]/g) || []).length;
}

function mostCommon(list) {
  const counts = new Map();
  list.forEach((item) => counts.set(item, (counts.get(item) || 0) + 1));
  let best = list[0] || "";
  let bestCount = -1;
  list.forEach((item) => {
    const count = counts.get(item) || 0;
    if (count > bestCount) {
      best = item;
      bestCount = count;
    }
  });
  return best;
}

function selectIcons(list, maxCount) {
  if (!maxCount || !list.length) return [];
  const counts = new Map();
  const first = new Map();
  list.forEach((icon, index) => {
    counts.set(icon, (counts.get(icon) || 0) + 1);
    if (!first.has(icon)) first.set(icon, index);
  });
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || first.get(left[0]) - first.get(right[0]))
    .slice(0, maxCount)
    .map(([icon]) => icon);
}

function findClosingIndex(blocks) {
  for (let index = blocks.length - 1; index >= 0; index -= 1) {
    const block = blocks[index];
    if (block.type === "divider" || block.type === "image") continue;
    if (block.type !== "paragraph") return -1;
    const plain = stripPrefixes(block.text);
    if (countable(plain) < 2 || countable(plain) > 40) return -1;
    if (!classifyClosing(plain)) return -1;
    return index;
  }
  return -1;
}

function pickRule(icons) {
  if (icons.has("✦")) return EMOJI_RULE_LINES[0];
  if (icons.has("❖")) return EMOJI_RULE_LINES[1];
  if (icons.has("•")) return EMOJI_RULE_LINES[2];
  if (icons.has("✿") || icons.has("❧")) return EMOJI_RULE_LINES[5];
  return EMOJI_RULE_LINES[3];
}

function cleanBodyIcon(block) {
  if (!block || !["paragraph", "quote", "card"].includes(block.type)) return block;
  const plain = stripPrefixes(block.text);
  if (plain === String(block.text || "").trim()) return block;
  return { ...block, text: plain };
}

export function applyEmojiTheme(document) {
  if (!document || !Array.isArray(document.blocks)) return document;
  const blocks = document.blocks.map((block) => ({ ...block }));

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    if (block.type === "paragraph" && isEmojiRuleLine(block.text)) {
      blocks[index] = { type: "divider", text: String(block.text).trim() };
    }
  }

  const headingIndexes = [];
  const headingDesired = [];
  const listIndexes = [];
  const listDesired = [];
  blocks.forEach((block, index) => {
    if (block.type === "heading" && stripPrefixes(block.text)) {
      headingIndexes.push(index);
      headingDesired.push(classifyHeading(block.text));
    }
    if (block.type === "list" && !block.ordered && Array.isArray(block.items) && block.items.length) {
      listIndexes.push(index);
      listDesired.push(classifyList(block.items));
    }
  });

  const closingIndex = findClosingIndex(blocks);
  const closingIcon = closingIndex >= 0 ? classifyClosing(blocks[closingIndex].text) : "";
  const listMarker = listIndexes.length ? (mostCommon(listDesired) || "•") : "";
  const reserved = [...new Set([listMarker, closingIcon].filter(Boolean))];
  const headingRoom = headingIndexes.length ? Math.min(3, Math.max(1, 5 - reserved.length)) : 0;
  let headingKept = selectIcons(headingDesired, headingRoom);
  if (!headingKept.length && headingIndexes.length) headingKept = ["✨"];

  let useClosing = Boolean(closingIcon);
  let chosen = [...new Set([...headingKept, ...reserved])];
  while (chosen.length > 5 && headingKept.length > 1) {
    headingKept = headingKept.slice(0, -1);
    chosen = [...new Set([...headingKept, ...reserved])];
  }
  if (chosen.length > 5 && useClosing) {
    useClosing = false;
    chosen = [...new Set([...headingKept, listMarker].filter(Boolean))];
  }

  blocks.forEach((block, index) => {
    if (index === closingIndex) return;
    blocks[index] = cleanBodyIcon(block);
  });

  const fallbackHeading = headingKept[0] || "✨";
  headingIndexes.forEach((index, slot) => {
    const want = headingDesired[slot];
    const icon = headingKept.includes(want) ? want : fallbackHeading;
    blocks[index] = { ...blocks[index], text: withIcon(icon, blocks[index].text) };
  });

  if (listMarker) {
    listIndexes.forEach((index) => {
      const items = (blocks[index].items || []).map((item) => prefixListItem(item, listMarker));
      blocks[index] = { ...blocks[index], items };
    });
  }

  if (closingIndex >= 0) {
    const current = blocks[closingIndex];
    blocks[closingIndex] = useClosing
      ? { ...current, text: withIcon(closingIcon, current.text) }
      : cleanBodyIcon(current);
  }

  if (blocks.some((block) => block.type === "divider")) {
    const rule = pickRule(new Set(chosen));
    blocks.forEach((block, index) => {
      if (block.type === "divider") blocks[index] = { type: "divider", text: rule };
    });
  }

  return { ...document, blocks };
}

export function emojiPrefixKinds(document) {
  const kinds = new Set();
  (document?.blocks || []).forEach((block) => {
    if (["heading", "paragraph", "quote", "card"].includes(block.type)) {
      const icon = leadingEmojiIcon(block.text);
      if (icon) kinds.add(icon);
    }
    if (block.type === "list" && !block.ordered) {
      (block.items || []).forEach((item) => {
        const raw = typeof item === "string" ? item.trim() : item?.text;
        const icon = leadingEmojiIcon(raw);
        if (icon) kinds.add(icon);
      });
    }
  });
  return [...kinds];
}

if (typeof globalThis !== "undefined") {
  globalThis.applyEmojiTheme = applyEmojiTheme;
  globalThis.isEmojiRuleLine = isEmojiRuleLine;
}
