import fs from "node:fs";
import vm from "node:vm";

function fail(message) {
  console.error(message);
  process.exit(1);
}

const studioCss = fs.readFileSync(new URL("../public/studio-ui.css", import.meta.url), "utf8");
const chromeCss = fs.readFileSync(new URL("../public/site-chrome.css", import.meta.url), "utf8");
const app = fs.readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../public/studio.html", import.meta.url), "utf8");
const blockStyle = fs.readFileSync(new URL("../public/block-style.js", import.meta.url), "utf8");

if (!html.includes("site-chrome.css?v=selection-popup-v1")) fail("划选弹窗样式缓存丢了");
if (!html.includes("app.js?v=island-v1")) fail("划选弹窗脚本缓存丢了");
if (!html.includes("block-style.js?v=selection-popup-v1")) fail("划选弹窗位置脚本缓存丢了");

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(blockStyle, sandbox);
const track = sandbox.YoocoBlockStyle?.selectionPopupTracksSelection;
if (typeof track !== "function") fail("缺少拖滑块时不跟选区走的判断");
if (track(true) !== false) fail("拖字号滑块时弹窗仍跟着选区走");
if (track(false) !== true) fail("松手后弹窗不再跟着选区");
if (track(0) !== true || track(1) !== false) fail("拖滑块判断不认真假以外的值");

function sliceFn(source, startMark, endMark) {
  const start = source.indexOf(startMark);
  const end = source.indexOf(endMark, start + startMark.length);
  if (start < 0 || end < 0) fail(`找不到 ${startMark}`);
  return source.slice(start, end);
}

const placeFn = sliceFn(app, "function placeBlockStylePanel()", "function syncBlockStylePanel(");
const paintFn = sliceFn(app, "function paintSelectionStyle()", "function scheduleSelectionStyle(");
for (const [name, body] of [["placeBlockStylePanel", placeFn], ["paintSelectionStyle", paintFn]]) {
  const at = body.indexOf("!track(styleSliderDrag)) return");
  if (!body.includes("selectionPopupTracksSelection") || at < 0) fail(`${name} 没有在拖滑块时停住`);
  if (name === "paintSelectionStyle" && at > body.indexOf("hideBlockStylePanel")) {
    fail("拖滑块时仍可能先拆掉弹窗");
  }
}

const syncFn = sliceFn(app, "function syncBlockStylePanel(", "function showSelectionStylePanel(");
if (!syncFn.includes("if (sizeInput && !styleSliderDrag) sizeInput.value")) {
  fail("拖动时仍把字号写回滑块");
}
if (!syncFn.includes("sizeOut.textContent = `${fontSize} px`")) fail("拖动时字号读数不更新");
const outputAt = syncFn.indexOf("sizeOut.textContent");
const outputLine = syncFn.slice(syncFn.lastIndexOf("\n", outputAt), syncFn.indexOf("\n", outputAt));
if (outputLine.includes("styleSliderDrag")) fail("字号读数被拖动状态挡住了");

const updateFn = sliceFn(app, "function updateBlockStyle(", "function resetSelectionStyleFields(");
if (!updateFn.includes("applyBlockStyleToElement")) fail("拖滑块时字号没有写到段落上");

const setupFn = sliceFn(app, "function setupBlockStyleUi()", "setupBlockStyleUi();");
if (!setupFn.includes('closest("input[type=\'range\']")') || !setupFn.includes("styleSliderDrag = true")) {
  fail("按下字号滑块时没有记住所按的是滑块");
}
const releaseStart = setupFn.indexOf("const releaseStylePanelHold");
const releaseEnd = setupFn.indexOf("document.addEventListener(\"pointerup\"", releaseStart);
const releaseFn = setupFn.slice(releaseStart, releaseEnd);
const clearAt = releaseFn.indexOf("styleSliderDrag = false");
const placeAt = releaseFn.indexOf("placeBlockStylePanel()");
if (clearAt < 0 || placeAt < 0 || clearAt > placeAt) fail("松手后没有先结束拖动再摆一次弹窗");
if (!setupFn.includes('addEventListener("pointercancel", releaseStylePanelHold, true)')) {
  fail("滑块拖动被打断时不会结束");
}

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function splitSelectors(selector) {
  const out = [];
  let depth = 0;
  let cur = "";
  for (const ch of selector) {
    if (ch === "(") depth += 1;
    else if (ch === ")") depth -= 1;
    if (ch === "," && depth === 0) {
      if (cur.trim()) out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function parseRules(css) {
  const text = stripComments(css);
  const rules = [];
  let i = 0;
  function skipBlock() {
    let depth = 1;
    while (i < text.length && depth) {
      if (text[i] === "{") depth += 1;
      else if (text[i] === "}") depth -= 1;
      i += 1;
    }
  }
  function readBody() {
    let body = "";
    let depth = 1;
    while (i < text.length && depth) {
      if (text[i] === "{") depth += 1;
      else if (text[i] === "}") depth -= 1;
      if (depth) body += text[i];
      i += 1;
    }
    return body;
  }
  function parseBlock(media) {
    let selector = "";
    while (i < text.length) {
      const ch = text[i];
      if (ch === "{") {
        const sel = selector.trim();
        selector = "";
        i += 1;
        if (sel.startsWith("@")) {
          if (sel.startsWith("@media") && !/max-width\s*:\s*823px/.test(sel)) parseBlock(sel);
          else skipBlock();
        } else {
          const body = readBody();
          for (const part of splitSelectors(sel)) rules.push({ selector: part, body, media });
        }
        continue;
      }
      if (ch === "}") {
        i += 1;
        return;
      }
      selector += ch;
      i += 1;
    }
  }
  parseBlock("");
  return rules;
}

function specificity(selector) {
  let text = selector.replace(/::[a-zA-Z-]+/g, "");
  text = text.replace(/:where\(([^()]*)\)/g, "");
  text = text.replace(/:not\(([^()]*)\)/g, "$1");
  text = text.replace(/:is\(([^()]*)\)/g, "$1");
  const ids = (text.match(/#[\w-]+/g) || []).length;
  const cls = (text.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+/g) || []).length;
  const stripped = text
    .replace(/#[\w-]+/g, " ")
    .replace(/\.[\w-]+/g, " ")
    .replace(/\[[^\]]+\]/g, " ")
    .replace(/:(?!:)[\w-]+(\([^)]*\))?/g, " ")
    .replace(/[+>~*,]/g, " ");
  const els = (stripped.match(/[a-zA-Z][\w-]*/g) || []).length;
  return [ids, cls, els];
}

function cmpSpec(a, b) {
  for (let i = 0; i < 3; i += 1) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

function matchCompound(compound, el) {
  const cleaned = compound.replace(/::[a-zA-Z-]+/g, "");
  const tag = cleaned.match(/^[a-zA-Z][\w-]*/);
  if (tag && tag[0].toLowerCase() !== el.tag) return false;
  for (const match of cleaned.matchAll(/\.([\w-]+)/g)) {
    if (!el.classes.has(match[1])) return false;
  }
  for (const match of cleaned.matchAll(/\[([\w-]+)(?:([~|^$*]?=)(?:"([^"]*)"|'([^']*)'|([^\]]+)))?\]/g)) {
    const name = match[1];
    const actual = el.attrs[name];
    if (actual == null) return false;
    const op = match[2];
    const expected = match[3] ?? match[4] ?? match[5];
    if (op === "=" && actual !== expected) return false;
  }
  const wantsDisabled = /:(?!not\([^)]*)\bdisabled\b/.test(cleaned) && !/:not\(\s*:disabled\s*\)/.test(cleaned);
  if (/:not\(\s*:disabled\s*\)/.test(cleaned) && el.pseudos.has("disabled")) return false;
  if (wantsDisabled && !el.pseudos.has("disabled")) return false;
  if (/:hover\b/.test(cleaned) && !el.pseudos.has("hover")) return false;
  return true;
}

function matches(selector, el, ancestors) {
  const parts = selector.trim().split(/\s+/).filter(Boolean);
  if (!parts.length || !matchCompound(parts[parts.length - 1], el)) return false;
  let cursor = ancestors.length;
  for (let i = parts.length - 2; i >= 0; i -= 1) {
    let found = -1;
    for (let a = cursor - 1; a >= 0; a -= 1) {
      if (matchCompound(parts[i], ancestors[a])) {
        found = a;
        break;
      }
    }
    if (found < 0) return false;
    cursor = found;
  }
  return true;
}

function declarations(body) {
  const out = {};
  for (const part of body.split(";")) {
    const idx = part.indexOf(":");
    if (idx < 0) continue;
    const prop = part.slice(0, idx).trim().toLowerCase();
    const value = part.slice(idx + 1).trim();
    if (prop === "color" || prop === "background-color" || prop === "background") out[prop] = value;
  }
  return out;
}

function solidColor(value) {
  const text = String(value || "").trim().toLowerCase();
  const hex = text.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!hex) return "";
  let h = hex[1];
  if (h.length === 3) h = h.split("").map((ch) => ch + ch).join("");
  return `#${h}`;
}

function channel(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = channel((n >> 16) & 255);
  const g = channel((n >> 8) & 255);
  const b = channel(n & 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const light = Math.max(luminance(a), luminance(b));
  const dark = Math.min(luminance(a), luminance(b));
  return (light + 0.05) / (dark + 0.05);
}

const rules = [...parseRules(studioCss), ...parseRules(chromeCss)].map((rule, order) => ({
  ...rule,
  order,
  spec: specificity(rule.selector),
  decl: declarations(rule.body),
}));

function paint(el, ancestors) {
  let color = "";
  let background = "";
  const hits = rules
    .filter((rule) => (rule.decl.color || rule.decl.background || rule.decl["background-color"]) && matches(rule.selector, el, ancestors))
    .sort((a, b) => cmpSpec(a.spec, b.spec) || a.order - b.order);
  for (const rule of hits) {
    if (rule.decl.color) {
      const next = solidColor(rule.decl.color);
      if (next) color = next;
    }
    const bg = solidColor(rule.decl["background-color"] || rule.decl.background);
    if (bg) background = bg;
  }
  return { color, background, hits: hits.map((rule) => rule.selector) };
}

function element(tag, classes, attrs, pseudos) {
  return { tag, classes: new Set(classes), attrs, pseudos: new Set(pseudos) };
}

function ancestorsFor(site, group) {
  return [
    element("html", [], { "data-site": site }, []),
    element("body", [], {}, []),
    element("div", ["block-style-panel"], {}, []),
    element("section", ["block-style-section"], {}, []),
    element("div", [group], {}, []),
  ];
}

const cases = [
  { name: "标重点", site: "day", group: "block-style-actions", attrs: { "data-mark-action": "add" }, pseudos: [], ink: "light" },
  { name: "标重点悬停", site: "day", group: "block-style-actions", attrs: { "data-mark-action": "add" }, pseudos: ["hover"], ink: "light" },
  { name: "标重点夜间", site: "night", group: "block-style-actions", attrs: { "data-mark-action": "add" }, pseudos: [], ink: "light" },
  { name: "标重点夜间悬停", site: "night", group: "block-style-actions", attrs: { "data-mark-action": "add" }, pseudos: ["hover"], ink: "light" },
  { name: "标重点不可用", site: "day", group: "block-style-actions", attrs: { "data-mark-action": "add" }, pseudos: ["disabled"], ink: "dark" },
  { name: "取消重点选中", site: "day", group: "block-style-actions", classes: ["is-active"], attrs: { "data-mark-action": "clear" }, pseudos: [], ink: "light" },
  { name: "取消重点选中悬停", site: "night", group: "block-style-actions", classes: ["is-active"], attrs: { "data-mark-action": "clear" }, pseudos: ["hover"], ink: "light" },
  { name: "标题级别选中", site: "night", group: "block-style-levels", classes: ["is-active"], attrs: {}, pseudos: [], ink: "light" },
  { name: "复制", site: "day", group: "block-style-actions", attrs: { "data-mark-action": "copy" }, pseudos: [], ink: "dark" },
  { name: "复制悬停", site: "night", group: "block-style-actions", attrs: { "data-mark-action": "copy" }, pseudos: ["hover"], ink: "dark" },
  { name: "取消重点未选", site: "day", group: "block-style-actions", attrs: { "data-mark-action": "clear" }, pseudos: ["disabled"], ink: "dark" },
  { name: "标题级别未选", site: "night", group: "block-style-levels", attrs: {}, pseudos: [], ink: "dark" },
  { name: "标题级别未选悬停", site: "day", group: "block-style-levels", attrs: {}, pseudos: ["hover"], ink: "dark" },
];

for (const item of cases) {
  const button = element("button", item.classes || [], item.attrs, item.pseudos);
  const painted = paint(button, ancestorsFor(item.site, item.group));
  if (!painted.color || !painted.background) {
    fail(`${item.name} 没有算出字色或底色 ${JSON.stringify(painted)}`);
  }
  const ratio = contrast(painted.color, painted.background);
  const textLight = luminance(painted.color) > luminance(painted.background);
  if (item.ink === "light" && (!textLight || ratio < 4.5)) {
    fail(`${item.name} 黑底上字不够亮 ${painted.color} / ${painted.background} 对比 ${ratio.toFixed(2)}`);
  }
  if (item.ink === "dark" && (textLight || ratio < 4.5)) {
    fail(`${item.name} 浅底上的字看不清 ${painted.color} / ${painted.background} 对比 ${ratio.toFixed(2)}`);
  }
}

console.log("selection popup checks ok");
