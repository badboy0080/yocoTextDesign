import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const app = fs.readFileSync(path.join(root, "public/app.js"), "utf8");
const themes = fs.readFileSync(path.join(root, "public/themes.js"), "utf8");
const html = fs.readFileSync(path.join(root, "public/studio.html"), "utf8");

function between(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end);
  if (from < 0 || to < 0 || to <= from) throw new Error(`找不到片段：${start}`);
  return source.slice(from, to);
}

const prelude = app.slice(0, app.indexOf("const controls"));
const clamp = between(app, "function clampClientNumber", "function normalizeTemplateParams");
const isTheme = between(app, "function isTheme()", "function applyTheme");
const vibe = between(app, "// vibe-preset:start", "// vibe-preset:end");
const applyVibe = between(app, "function applyVibe", "function pagePadForVibe");

const sandbox = { console, globalThis: null };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(`${prelude}
${clamp}
${themes}
${isTheme}
${vibe}
globalThis.scaleVibeFromBaseline = scaleVibeFromBaseline;
globalThis.themeTypographyBaseline = themeTypographyBaseline;
globalThis.pagePadForVibe = pagePadForVibe;
globalThis.reconcileVibe = reconcileVibe;
globalThis.buildThemeState = buildThemeState;
globalThis.VIBE_KEYS = VIBE_KEYS;
globalThis.VIBE_ORDER = VIBE_ORDER;
globalThis.VIBE_PRESETS = VIBE_PRESETS;
globalThis.state = state;
`, sandbox);

const failures = [];
const assert = (ok, message) => { if (!ok) failures.push(message); };
const pick = (source) => sandbox.VIBE_KEYS.reduce((picked, key) => {
  picked[key] = source[key];
  return picked;
}, {});

sandbox.state.theme = "citrus";
const citrus = sandbox.buildThemeState("citrus");
const citrusBase = pick(citrus);
const comfortable = sandbox.scaleVibeFromBaseline(citrusBase, "comfortable");
const compact = sandbox.scaleVibeFromBaseline(citrusBase, "compact");
const airy = sandbox.scaleVibeFromBaseline(citrusBase, "airy");

assert(comfortable.fontSize === citrus.fontSize, "舒适不改柠边字号");
assert(comfortable.lineHeight === citrus.lineHeight, "舒适不改柠边行高");
assert(comfortable.paragraphSpacing === citrus.paragraphSpacing, "舒适不改柠边段距");
assert(compact.fontSize < citrus.fontSize, "紧凑字号更小");
assert(compact.lineHeight < citrus.lineHeight, "紧凑行高更紧");
assert(compact.paragraphSpacing < citrus.paragraphSpacing, "紧凑段距更小");
assert(compact.contentWidth > citrus.contentWidth, "紧凑栏更宽一点");
assert(airy.fontSize > citrus.fontSize, "疏朗字号更大");
assert(airy.lineHeight > citrus.lineHeight, "疏朗行高更松");
assert(airy.paragraphSpacing > citrus.paragraphSpacing, "疏朗段距更大");
assert(airy.contentWidth < citrus.contentWidth, "疏朗栏更窄一点");
assert(compact.accentColor === undefined && airy.pageColor === undefined, "气质档不带颜色");
assert(compact.headingStyle === undefined && airy.highlightStyle === undefined, "气质档不改造型和重点样式");

const fresh = sandbox.buildThemeState("fresh");
const freshCompact = sandbox.scaleVibeFromBaseline(pick(fresh), "compact");
const freshAiry = sandbox.scaleVibeFromBaseline(pick(fresh), "airy");
assert(freshCompact.paragraphSpacing < fresh.paragraphSpacing, "清氧绿紧凑仍收段距");
assert(freshCompact.fontSize <= fresh.fontSize, "紧凑不会把字号放大");
assert(freshAiry.paragraphSpacing !== airy.paragraphSpacing, "疏朗跟着各自主题的段距走");

const padComfortable = sandbox.pagePadForVibe("comfortable");
const padCompact = sandbox.pagePadForVibe("compact");
const padAiry = sandbox.pagePadForVibe("airy");
assert(padComfortable.top === "40px" && padComfortable.x.includes("4vw") && padComfortable.bottom === "40px", "舒适的预览留白保持现在的一圈");
assert(padComfortable.copyY === 40 && padComfortable.copyX === 32, "舒适的复制留白保持 40/32");
assert(padCompact.copyY < padComfortable.copyY && padAiry.copyY > padComfortable.copyY, "复制留白随档位收放");
assert(padCompact.top === "28px" && padAiry.top === "64px", "预览上下留白随档位收放");

Object.assign(sandbox.state, citrus, { vibe: "comfortable", fontSize: 22 });
sandbox.reconcileVibe();
assert(sandbox.state.vibe === "custom", "字号被改过就不再算某一档");

assert(!applyVibe.includes("fetch(") && !applyVibe.includes("normalize"), "切换气质的函数里没有优化请求");
assert(!app.includes("瑞士大字") && !app.includes("swiss:"), "不再使用写死的瑞士大字");
assert(app.includes('input.vibe === "default"'), "旧的默认档还能读成舒适");
assert(html.includes('id="vibeChips"') && html.includes(">气质<"), "主题面板里有气质档");
assert(sandbox.VIBE_ORDER.join(",") === "compact,comfortable,airy", "顺序是紧凑、舒适、疏朗");
assert(sandbox.VIBE_PRESETS.compact.label === "紧凑", "紧凑文案");
assert(sandbox.VIBE_PRESETS.comfortable.label === "舒适", "舒适文案");
assert(sandbox.VIBE_PRESETS.airy.label === "疏朗", "疏朗文案");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("vibe preset checks ok");
