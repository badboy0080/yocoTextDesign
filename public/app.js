const TEMPLATE_DEFAULTS = {
  textColor: "#3f3f3f", accentColor: "#6e8e23", highlightColor: "#d7fa5c", highlightTextColor: "#20231f",
  cardColor: "#f0f4e5", quoteColor: "#f7f8f1", cardTitleColor: "#6e8e23", pageColor: "#ffffff",
  linkColor: "#3f6f9f", codeBackground: "#edf0e5", codeColor: "#2c4030", dividerColor: "#6e8e23",
  bodyFont: "system", headingFont: "system", textAlign: "left", textIndent: 0,
  fontSize: 16, lineHeight: 1.75, letterSpacing: 0.3, paragraphSpacing: 18, contentWidth: 620,
  readingDensity: "standard", titleSize: 26, headingSize: 27, subheadingSize: 23, minorHeadingSize: 20,
  headingWeight: 800, headingLineHeight: 1.35, headingSpacingBefore: 32, headingSpacingAfter: 12,
  headingStyle: "bar", cardStyle: "border", listStyle: "dot",
  highlightStyle: "background", highlightRadius: 3, highlightPadding: 2,
  listIndent: 1.5, listItemSpacing: 6, linkUnderline: true,
  quoteTitleSize: 11, cardTitleSize: 11, cardBorderWidth: 1,
  dividerThickness: 1, dividerMargin: 28, codeFontSize: 13, codeLineHeight: 1.6, captionSize: 11,
  cardRadius: 12, cardPadding: 20, imageRadius: 12,
  showQuote: true, showDivider: true, showImage: true,
  theme: "classic", articleType: "auto", showSignature: false,
};

// 四个旧气质现在和精选主题放在同一个「主题」列表里。点某一项，套用该方向的第一套皮肤。
const MOODS = {
  minimal: {
    label: "克制高级", hint: "冷静 · 留白", headingStyle: "line", cardStyle: "outline", listStyle: "dot",
    skins: ["ink-cream", "mist-blue", "warm-paper"],
  },
  editorial: {
    label: "杂志编辑部", hint: "编号 · 层次", headingStyle: "index", cardStyle: "band", listStyle: "circle",
    skins: ["retro-green", "brick-red", "navy-ink"],
  },
  lively: {
    label: "活泼小红书", hint: "明快 · 圆润", headingStyle: "block", cardStyle: "soft", listStyle: "check",
    skins: ["orange-pop", "lemon-fresh", "berry-soda"],
  },
  deep: {
    label: "暗黑科技", hint: "深色 · 荧光", headingStyle: "bar", cardStyle: "soft", listStyle: "ghost", dark: true,
    skins: ["deep-matrix", "cyber-blue"],
  },
};

// 每套皮肤是一组完整配色（可附带少量数值偏好），字段缺失时回落到 TEMPLATE_DEFAULTS。
const SKINS = {
  "ink-cream": { label: "墨黑米白", styleVariant: "standard", mutedColor: "#8c8a84", titleColor: "#2b2a28", borderColor: "#e3e0d8",
    textColor: "#2b2a28", accentColor: "#2b2a28", highlightColor: "#e8e5dd", highlightTextColor: "#2b2a28",
    cardColor: "#f3f1ea", quoteColor: "#f7f5ef", cardTitleColor: "#2b2a28", pageColor: "#fbfaf7",
    linkColor: "#4c6b79", codeBackground: "#f1f0ea", codeColor: "#33312c", dividerColor: "#2b2a28",
    cardRadius: 2, imageRadius: 2, showDivider: true },
  "mist-blue": { label: "雾灰蓝", styleVariant: "standard", mutedColor: "#8a98a0", titleColor: "#2f3b42", borderColor: "#dde4e8",
    textColor: "#33414a", accentColor: "#5b7a8c", highlightColor: "#dfe9ee", highlightTextColor: "#26323a",
    cardColor: "#eef3f5", quoteColor: "#f4f7f9", cardTitleColor: "#5b7a8c", pageColor: "#ffffff",
    linkColor: "#3f6f9f", codeBackground: "#eaf0f3", codeColor: "#2a3942", dividerColor: "#5b7a8c",
    cardRadius: 4, imageRadius: 4 },
  "warm-paper": { label: "暖咖纸", styleVariant: "standard", mutedColor: "#9a8c79", titleColor: "#43392f", borderColor: "#e8dfd1",
    textColor: "#43392f", accentColor: "#8a6a4a", highlightColor: "#efe4d2", highlightTextColor: "#43392f",
    cardColor: "#f5ecdf", quoteColor: "#f8f2e8", cardTitleColor: "#8a6a4a", pageColor: "#fdfbf6",
    linkColor: "#7a5a3a", codeBackground: "#f3ebdd", codeColor: "#4a3d30", dividerColor: "#8a6a4a",
    cardRadius: 6, imageRadius: 6 },
  "retro-green": { label: "复古墨绿", styleVariant: "standard", mutedColor: "#7e8f84", titleColor: "#20302a", borderColor: "#d8e2d6",
    textColor: "#20302a", accentColor: "#2f5d4f", highlightColor: "#d8e6d4", highlightTextColor: "#20302a",
    cardColor: "#edf2e8", quoteColor: "#f3f6ee", cardTitleColor: "#2f5d4f", pageColor: "#fffef9",
    linkColor: "#35604e", codeBackground: "#eaf0e8", codeColor: "#25352c", dividerColor: "#2f5d4f",
    cardRadius: 2, imageRadius: 2, headingWeight: 850 },
  "brick-red": { label: "砖红杂志", styleVariant: "standard", mutedColor: "#97837a", titleColor: "#2e2622", borderColor: "#ecdccf",
    textColor: "#2e2622", accentColor: "#b5462f", highlightColor: "#f3d9cc", highlightTextColor: "#3a211a",
    cardColor: "#f9eae1", quoteColor: "#fbf1ea", cardTitleColor: "#b5462f", pageColor: "#fffdf8",
    linkColor: "#9a3b28", codeBackground: "#f4e7de", codeColor: "#5c2e22", dividerColor: "#b5462f",
    cardRadius: 2, imageRadius: 2, headingWeight: 850 },
  "navy-ink": { label: "藏蓝油墨", styleVariant: "standard", mutedColor: "#7c8699", titleColor: "#20283a", borderColor: "#dce3ee",
    textColor: "#20283a", accentColor: "#27406b", highlightColor: "#d8e0ee", highlightTextColor: "#20283a",
    cardColor: "#eaf0f8", quoteColor: "#f2f5fa", cardTitleColor: "#27406b", pageColor: "#ffffff",
    linkColor: "#27406b", codeBackground: "#e8edf5", codeColor: "#20283a", dividerColor: "#27406b",
    cardRadius: 2, imageRadius: 2, headingWeight: 850 },
  "orange-pop": { label: "橙粉活力", styleVariant: "standard", mutedColor: "#a08a82", titleColor: "#3a2a22", borderColor: "#f6e0d4",
    textColor: "#3a3230", accentColor: "#ff6a3d", highlightColor: "#ffd9c7", highlightTextColor: "#3a2a22",
    cardColor: "#fff0e8", quoteColor: "#fff6f0", cardTitleColor: "#ff6a3d", pageColor: "#fffdfb",
    linkColor: "#d94f2b", codeBackground: "#fdeee5", codeColor: "#5c3326", dividerColor: "#ff6a3d",
    cardRadius: 16, imageRadius: 16, headingWeight: 800, lineHeight: 1.8, paragraphSpacing: 20 },
  "lemon-fresh": { label: "柠檬青绿", styleVariant: "standard", mutedColor: "#849788", titleColor: "#22301c", borderColor: "#dcefd8",
    textColor: "#28332a", accentColor: "#3ea868", highlightColor: "#e4f8a8", highlightTextColor: "#22301c",
    cardColor: "#eef8e6", quoteColor: "#f5fbf0", cardTitleColor: "#35925b", pageColor: "#fcfff9",
    linkColor: "#2f8f54", codeBackground: "#eaf5e3", codeColor: "#26372a", dividerColor: "#3ea868",
    cardRadius: 18, imageRadius: 18, headingWeight: 800, lineHeight: 1.8, paragraphSpacing: 20 },
  "berry-soda": { label: "莓果汽水", styleVariant: "standard", mutedColor: "#a1859a", titleColor: "#3d2235", borderColor: "#f2d9e8",
    textColor: "#382b36", accentColor: "#d6488f", highlightColor: "#fbd7ea", highlightTextColor: "#3d2235",
    cardColor: "#fceaf4", quoteColor: "#fef3f9", cardTitleColor: "#d6488f", pageColor: "#fffafc",
    linkColor: "#b03575", codeBackground: "#fae8f2", codeColor: "#4a2740", dividerColor: "#d6488f",
    cardRadius: 18, imageRadius: 18, headingWeight: 800, lineHeight: 1.8, paragraphSpacing: 20 },
  "deep-matrix": { label: "深空荧光", styleVariant: "deep-night", mutedColor: "#6f8a74", titleColor: "#eafff0", borderColor: "#2c3d30",
    textColor: "#c7d6c2", accentColor: "#34f07a", highlightColor: "#34f07a", highlightTextColor: "#06140b",
    cardColor: "#1a241d", quoteColor: "#172019", cardTitleColor: "#34f07a", pageColor: "#121512",
    linkColor: "#5fd9a0", codeBackground: "#16201a", codeColor: "#bfe8c8", dividerColor: "#34f07a",
    cardRadius: 14, imageRadius: 14, headingWeight: 800, lineHeight: 1.9, paragraphSpacing: 22, showDivider: false },
  "cyber-blue": { label: "赛博深蓝", styleVariant: "deep-night", mutedColor: "#6c7ea0", titleColor: "#e6efff", borderColor: "#28354f",
    textColor: "#a7b8d8", accentColor: "#4da3ff", highlightColor: "#8fc4ff", highlightTextColor: "#081426",
    cardColor: "#172033", quoteColor: "#141c2c", cardTitleColor: "#6fb4ff", pageColor: "#0e1320",
    linkColor: "#6fb4ff", codeBackground: "#151d2e", codeColor: "#cfe0f7", dividerColor: "#4da3ff",
    cardRadius: 14, imageRadius: 14, headingWeight: 800, lineHeight: 1.9, paragraphSpacing: 22, showDivider: false },
};

function skinMood(skinId) {
  return Object.keys(MOODS).find((moodId) => MOODS[moodId].skins.includes(skinId)) || "minimal";
}

const DEFAULT_MOOD = "minimal";
const DEFAULT_SKIN = "ink-cream";

function buildSkinState(skinId) {
  const moodId = skinMood(skinId);
  const mood = MOODS[moodId];
  return {
    ...TEMPLATE_DEFAULTS,
    ...SKINS[skinId],
    headingStyle: mood.headingStyle,
    cardStyle: mood.cardStyle,
    listStyle: mood.listStyle,
  };
}

const state = { ...buildSkinState(DEFAULT_SKIN) };
let currentMood = DEFAULT_MOOD;
let currentSkin = DEFAULT_SKIN;
// 用户是否已手动调过样式。调过后只重拆文字、不换主题，直到点「恢复默认」。
let styleTouched = false;
// 还没有按文章选过主题，或刚恢复默认。下一次优化按文章选题，而不是随机。
let awaitingContentPick = true;
const controls = [...document.querySelectorAll("[data-key]")];
const articlePage = document.querySelector("#articlePage");
const articleBody = document.querySelector("#articleBody");
const tokenPreview = document.querySelector("#tokenPreview");
const previewStage = document.querySelector("#previewStage");
const compliancePanel = document.querySelector("#compliancePanel");
const complianceLevel = document.querySelector("#complianceLevel");
const complianceList = document.querySelector("#complianceList");
const darkPreviewToggle = document.querySelector("#darkPreviewToggle");
const lockBrandColor = document.querySelector("#lockBrandColor");
const copyFeedback = document.querySelector("#copyFeedback");
const themeGrid = document.querySelector("#themeGrid");
const articleInput = document.querySelector("#articleInput");
const aiNormalizeButton = document.querySelector("#aiNormalizeButton");
const optimizeHint = document.querySelector("#optimizeHint");
const articleStatus = document.querySelector("#articleStatus");
const trialMeter = document.querySelector("#trialMeter");
const trialBanner = document.querySelector("#trialBanner");
const trialBannerText = document.querySelector("#trialBannerText");
const waitlistForm = document.querySelector("#waitlistForm");
const waitlistEmail = document.querySelector("#waitlistEmail");
const waitlistFeedback = document.querySelector("#waitlistFeedback");
// 与 lib/trial-quota.js 的 TRIAL_LIMIT 一致。接口返回 trial.limit 后改用接口的数字。
let trialLimit = 3;
function guestTrialLimit() {
  return trialLimit;
}
const TRIAL_STORAGE_KEY = "yooco-trial";
const WAITLIST_COPY = "免费积分用完了。邀请好友，双方各再得 +5 积分。";
const UPGRADE_PROMPT = WAITLIST_COPY;
let serverTrialRemaining = null;
let serverTrialBonus = 0;
let serverTrialEnforced = false;
let serverTrialUnlimited = false;
const articleTitle = document.querySelector("#articleTitle");
const stylePane = document.querySelector("#stylePane");
const styleMount = document.querySelector("#styleMount");
let articleSource = localStorage.getItem("yooco-article-source") || "";
let articleTitleOverride = localStorage.getItem("yooco-article-title") || "";
let inferFirstLineTitle = localStorage.getItem("yooco-infer-first-line-title") !== "false";
let blockTypeOverrides = {};
let lastAiResult = null;
// 点「用示例文章试一下」后，右侧先用站内静态 HTML，不走优化接口。
let sampleStaticActive = false;
let previewSyncTimer = 0;
try { localStorage.removeItem("yooco-content-components"); } catch { /* ignore private mode */ }

function setStatus(message) {
  if (articleStatus) articleStatus.textContent = message;
}

function setFeedback(message) {
  if (!copyFeedback) return;
  copyFeedback.textContent = message || "";
  if (message) copyFeedback.title = message;
  else copyFeedback.removeAttribute("title");
}

function showOptimizeHint(message) {
  if (!optimizeHint) return;
  const text = String(message || "").trim();
  optimizeHint.textContent = text;
  optimizeHint.hidden = !text;
}

function beijingDateKey(now = Date.now()) {
  return new Date(now + 8 * 3600 * 1000).toISOString().slice(0, 10);
}

function readLocalTrialUsed() {
  try {
    const raw = JSON.parse(localStorage.getItem(TRIAL_STORAGE_KEY) || "null");
    if (raw?.date === beijingDateKey()) {
      const used = Number(raw.used);
      return Number.isFinite(used) && used > 0 ? Math.min(guestTrialLimit(), used) : 0;
    }
  } catch {
    /* ignore quota / private mode */
  }
  return 0;
}

function writeLocalTrialUsed(used) {
  try {
    localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify({
      date: beijingDateKey(),
      used: Math.max(0, Math.min(guestTrialLimit(), used)),
    }));
  } catch {
    /* ignore quota / private mode */
  }
}

function remainingTrialCount() {
  if (serverTrialUnlimited) return Number.POSITIVE_INFINITY;
  if (serverTrialRemaining !== null) return Math.max(0, serverTrialRemaining);
  return Math.max(0, guestTrialLimit() - readLocalTrialUsed());
}

function renderTrialMeter() {
  if (serverTrialUnlimited) {
    if (trialMeter) {
      trialMeter.hidden = false;
      trialMeter.textContent = "不限积分";
      trialMeter.classList.remove("is-empty");
    }
    if (trialBanner) trialBanner.hidden = true;
    if (aiNormalizeButton && !aiNormalizeButton.dataset.busy) {
      aiNormalizeButton.disabled = false;
    }
    return;
  }
  const remaining = remainingTrialCount();
  if (trialMeter) {
    trialMeter.hidden = false;
    if (remaining <= 0) trialMeter.textContent = "积分已用完";
    else if (serverTrialBonus > 0) trialMeter.textContent = `剩余 ${remaining} 积分（含邀请加成 ${serverTrialBonus}）`;
    else trialMeter.textContent = `剩余 ${remaining} 积分`;
    trialMeter.classList.toggle("is-empty", remaining <= 0);
  }
  if (trialBanner) trialBanner.hidden = remaining > 0;
  if (aiNormalizeButton && !aiNormalizeButton.dataset.busy) {
    aiNormalizeButton.disabled = remaining <= 0;
  }
}

function applyTrialFromServer(trial) {
  if (!trial || typeof trial !== "object") return;
  const credits = trial.credits && typeof trial.credits === "object" ? trial.credits : null;
  serverTrialUnlimited = credits ? credits.unlimited === true : trial.unlimited === true;
  if (serverTrialUnlimited) {
    serverTrialRemaining = null;
    serverTrialBonus = 0;
    renderTrialMeter();
    return;
  }
  const limit = credits && typeof credits.limit === "number" ? credits.limit : trial.limit;
  if (typeof limit === "number" && Number.isFinite(limit) && limit > 0) {
    trialLimit = Math.round(limit);
  }
  if (typeof trial.enforced === "boolean") serverTrialEnforced = trial.enforced;
  const bonus = credits && typeof credits.bonus === "number" ? credits.bonus : trial.bonus;
  serverTrialBonus = typeof bonus === "number" && Number.isFinite(bonus) ? Math.max(0, bonus) : 0;
  const remaining = credits && typeof credits.remaining === "number" ? credits.remaining : trial.remaining;
  if (typeof remaining === "number" && Number.isFinite(remaining)) {
    serverTrialRemaining = Math.max(0, remaining);
    const dailyRemaining = Math.max(0, serverTrialRemaining - serverTrialBonus);
    writeLocalTrialUsed(guestTrialLimit() - dailyRemaining);
  }
  renderTrialMeter();
}

function showUpgradePrompt(message) {
  const text = message || UPGRADE_PROMPT;
  setStatus(text);
  setFeedback("");
  if (trialBanner) {
    trialBanner.hidden = false;
    if (trialBannerText) trialBannerText.textContent = WAITLIST_COPY;
  }
  renderTrialMeter();
}

function validWaitlistEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function setWaitlistFeedback(message) {
  if (!waitlistFeedback) return;
  const text = message || "";
  waitlistFeedback.textContent = text;
  const saved = text === "已记下。开放订阅后通知你。";
  waitlistFeedback.classList.toggle("is-success", saved);
  if (trialBanner) trialBanner.classList.toggle("is-saved", saved);
}

if (waitlistForm) {
  waitlistForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = (waitlistEmail?.value || "").trim();
    const button = waitlistForm.querySelector("button");
    if (!validWaitlistEmail(email)) {
      setWaitlistFeedback("请填写有效的邮箱。");
      return;
    }
    if (button) button.disabled = true;
    setWaitlistFeedback("正在保存…");
    try {
      let deviceId = "";
      try { deviceId = localStorage.getItem("yooco-device-id") || ""; } catch { /* ignore */ }
      // 邮箱写入 /api/waitlist。服务端同时记漏斗事件 waitlist_email_submit，这里不再重复打点。
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, deviceId }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.ok) {
        setWaitlistFeedback(payload?.error?.message || "暂时没记下，请稍后再试。");
        return;
      }
      if (waitlistEmail) waitlistEmail.value = "";
      setWaitlistFeedback("已记下。开放订阅后通知你。");
    } catch {
      setWaitlistFeedback("暂时没记下，请稍后再试。");
    } finally {
      if (button) button.disabled = false;
    }
  });
}

async function refreshTrialFromServer() {
  try {
    const response = await fetch("/api/normalize", {
      method: "GET",
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    const payload = await response.json().catch(() => ({}));
    if (response.ok && payload?.ok) applyTrialFromServer(payload.trial);
  } catch {
    /* keep local remaining */
  } finally {
    renderTrialMeter();
  }
}

try {
  blockTypeOverrides = JSON.parse(localStorage.getItem("yooco-block-type-overrides") || "{}");
} catch {
  blockTypeOverrides = {};
}

// 参数面板放在右栏，跟随右栏独立滚动。
if (stylePane && styleMount) styleMount.appendChild(stylePane);
if (stylePane) stylePane.hidden = false;

function initParameterAccordion() {
  if (!stylePane) return;
  const groups = Array.from(stylePane.querySelectorAll("[data-accordion]"));
  groups.forEach((group) => {
    const body = group.querySelector(":scope > .group-body");
    if (body && !body.querySelector(":scope > .group-body-inner")) {
      const inner = document.createElement("div");
      inner.className = "group-body-inner";
      while (body.firstChild) inner.appendChild(body.firstChild);
      body.appendChild(inner);
    }
    const toggle = group.querySelector(":scope > .group-toggle");
    if (!toggle || toggle.dataset.bound === "1") return;
    toggle.dataset.bound = "1";
    toggle.addEventListener("click", () => {
      const willOpen = !group.classList.contains("is-open");
      const solo = !group.classList.contains("more-settings") && Boolean(group.closest(".more-settings"));
      const peers = solo
        ? Array.from(group.parentElement.querySelectorAll(":scope > [data-accordion]"))
        : [group];
      peers.forEach((other) => {
        const open = other === group && willOpen;
        other.classList.toggle("is-open", open);
        const btn = other.querySelector(":scope > .group-toggle");
        if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  });
}
initParameterAccordion();

function applySkin(skinId, { fromUser = true } = {}) {
  if (!SKINS[skinId]) return;
  currentSkin = skinId;
  currentMood = skinMood(skinId);
  Object.assign(state, buildSkinState(skinId));
  state.theme = "classic";
  const sampleSource = fromUser && isSampleTrySource();
  if (fromUser) styleTouched = true;
  syncMoodUI();
  syncControls();
  render();
  if (sampleSource) setFeedback("已按当前主题重排示例，没有调用优化。");
}

function isTheme() {
  return Boolean(state.theme && state.theme !== "classic" && THEMES[state.theme]);
}

// 切换精选主题。旧气质不走这里，点列表里的气质项会套该方向的默认皮肤。
function applyTheme(themeId, { fromUser = true, articleType } = {}) {
  if (themeId !== "classic" && !THEMES[themeId]) return;
  const previousArticleType = state.articleType;
  if (themeId === "classic") {
    Object.assign(state, buildSkinState(currentSkin));
  } else {
    Object.assign(state, buildThemeState(themeId));
  }
  // 用户此前手动指定过文章类型时，换主题不重置它（类型是对文章的判断，与主题无关）。
  if (previousArticleType && previousArticleType !== "auto") state.articleType = previousArticleType;
  if (articleType) state.articleType = articleType;
  const sampleSource = fromUser && isSampleTrySource();
  if (fromUser) styleTouched = true;
  syncMoodUI();
  syncControls();
  render();
  if (sampleSource) setFeedback("已按当前主题重排示例，没有调用优化。");
}

function syncMoodUI() {
  const onClassic = !isTheme();
  themeGrid?.querySelectorAll("[data-mood]").forEach((button) => {
    button.classList.toggle("is-active", onClassic && button.dataset.mood === currentMood);
  });
  themeGrid?.querySelectorAll("[data-theme]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.theme === state.theme);
  });
}

function renderMoodUI() {
  if (!themeGrid) return;
  const moodButtons = Object.entries(MOODS).map(([id, mood]) => {
    const primary = SKINS[mood.skins[0]]?.accentColor || "#71717a";
    return `<button type="button" class="theme-chip" data-mood="${id}" style="--theme-primary:${primary}" title="${mood.hint}"><b>${mood.label}</b></button>`;
  }).join("");
  const gemThemes = new Set(["nocturne", "citrus", "playful", "grunge", "flat", "newsprint", "bauhaus"]);
  const themeGem = `<svg class="theme-gem" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path fill="#6D28D9" d="M6 1.15 10.7 4.55 6 10.85 1.3 4.55Z"/><path fill="#F0C14A" d="M6 1.15 8.55 4.55 6 10.85 3.45 4.55Z"/><path fill="#DDD6FE" d="M3.35 4.55 6 1.15 8.65 4.55Z"/><path fill="none" stroke="#F8E7B0" stroke-linejoin="round" stroke-width=".55" d="M6 1.15 10.7 4.55 6 10.85 1.3 4.55Z"/><path fill="none" stroke="#F8E7B0" stroke-width=".4" d="M1.45 4.55h9.1"/></svg>`;
  const themeButtons = THEME_ORDER.map((id) => {
    const theme = THEMES[id];
    const gem = gemThemes.has(id) ? themeGem : "";
    return `<button type="button" class="theme-chip" data-theme="${id}" style="--theme-primary:${theme.primary}" title="${theme.fit}"><b>${theme.label}</b>${gem}</button>`;
  }).join("");
  themeGrid.innerHTML = moodButtons + themeButtons;
  themeGrid.querySelectorAll("[data-mood]").forEach((button) => {
    button.addEventListener("click", () => applySkin(MOODS[button.dataset.mood].skins[0]));
  });
  themeGrid.querySelectorAll("[data-theme]").forEach((button) => {
    button.addEventListener("click", () => applyTheme(button.dataset.theme));
  });
  syncMoodUI();
}

function paintRangeFill(control) {
  const min = Number(control.min);
  const max = Number(control.max);
  const value = Number(control.value);
  const span = max - min;
  const pct = span ? Math.min(100, Math.max(0, ((value - min) / span) * 100)) : 0;
  control.style.setProperty("--range-pct", `${pct}%`);
}

function syncControls() {
  controls.forEach((control) => {
    const key = control.dataset.key;
    if (control.type === "checkbox") control.checked = Boolean(state[key]);
    else control.value = state[key];
    if (control.type === "range") paintRangeFill(control);
  });
}

function formatValue(key, value) {
  if (["fontSize", "paragraphSpacing", "contentWidth", "titleSize", "headingSize", "subheadingSize", "minorHeadingSize", "headingSpacingBefore", "headingSpacingAfter", "quoteTitleSize", "cardTitleSize", "dividerMargin", "codeFontSize", "captionSize", "cardRadius", "cardPadding", "imageRadius"].includes(key)) return `${value}px`;
  if (["textIndent", "listIndent"].includes(key)) return `${Number(value).toFixed(2)}em`;
  if (["highlightPadding", "listItemSpacing", "cardBorderWidth", "dividerThickness", "highlightRadius"].includes(key)) return `${value}px`;
  if (["lineHeight", "headingLineHeight", "codeLineHeight"].includes(key)) return Number(value).toFixed(2);
  if (key === "headingWeight") return `${value}`;
  if (key === "letterSpacing") return `${Number(value).toFixed(1)}px`;
  return value;
}

function updateOutputs() {
  document.querySelectorAll("[data-output]").forEach((output) => {
    output.textContent = formatValue(output.dataset.output, state[output.dataset.output]);
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[character]));
}

/* 公众号行内冒烟样例（先长记号，再短记号，避免 ~~ 被 ~ 吃掉）：
~~删除~~ ++下划线++ ~波浪~ **加粗** *斜体* `代码` ==重点== [链接](https://yoooco.com)
*/
function holdInlineSlot(slots, html) {
  const token = `\u0000${slots.length}\u0000`;
  slots.push(html);
  return token;
}

function restoreInlineSlots(html, slots) {
  return String(html).replace(/\u0000(\d+)\u0000/g, (_, index) => restoreInlineSlots(slots[Number(index)] || "", slots));
}

function renderInline(text, slots) {
  let out = String(text);
  const protect = (pattern, build) => {
    out = out.replace(pattern, (...args) => holdInlineSlot(slots, build(args[1], args[2])));
  };
  protect(/`([^`\n]+)`/g, (code) => `<code class="inline-code">${code}</code>`);
  protect(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/gi, (label, href) => (
    `<a class="inline-link" href="${String(href).replace(/"/g, "%22")}" target="_blank" rel="noreferrer">${renderInline(label, slots)}</a>`
  ));
  protect(/~~([^~\n]+?)~~/g, (inner) => `<del class="inline-strike">${renderInline(inner, slots)}</del>`);
  protect(/\+\+([^+\n]+?)\+\+/g, (inner) => `<u class="inline-underline">${renderInline(inner, slots)}</u>`);
  protect(/==([^=\n]+)==/g, (inner) => `<mark class="inline-highlight">${renderInline(inner, slots)}</mark>`);
  protect(/\*\*([^*\n]+)\*\*/g, (inner) => `<strong>${renderInline(inner, slots)}</strong>`);
  protect(/__([^_\n]+)__/g, (inner) => `<strong>${renderInline(inner, slots)}</strong>`);
  protect(/\*([^*\n]+)\*/g, (inner) => `<em>${renderInline(inner, slots)}</em>`);
  protect(/~([^~\n]+?)~/g, (inner) => `<span class="inline-wavy">${renderInline(inner, slots)}</span>`);
  return out;
}

function inlineMarkdown(value) {
  const slots = [];
  const html = renderInline(escapeHtml(value), slots).replace(/\n/g, "<br />");
  return restoreInlineSlots(html, slots);
}

const EMBEDDED_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

function embeddedImageUrl(value) {
  const raw = String(value || "").trim().replace(/\s/g, "");
  const match = raw.match(/^data:image\/(png|jpeg|gif|webp);base64,([a-z0-9+/=]+)$/i);
  if (!match) return "";
  const bytes = Math.floor(match[2].length * 3 / 4);
  if (!bytes || bytes > EMBEDDED_IMAGE_MAX_BYTES) return "";
  return raw;
}

function safeImageUrl(value) {
  const embedded = embeddedImageUrl(value);
  if (embedded) return embedded;
  try {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const url = new URL(raw, window.location.href);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function safeColor(value, fallback) {
  const color = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color : fallback;
}

/** 用淡色代替 opacity，避免公众号校验/暗色模式问题 */
function colorWithAlpha(value, alpha, fallback = "#888888") {
  const hex = safeColor(value, fallback).slice(1);
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const a = Math.min(1, Math.max(0, Number(alpha) || 0));
  return `rgba(${r},${g},${b},${a})`;
}

function hexToRgb(value) {
  const hex = safeColor(value, "#000000").slice(1);
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  ];
}

function relativeLuminance(rgb) {
  const channel = (value) => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = rgb.map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** 夜间皮肤，或页面底色很暗。复制时用来垫高炭黑块，并提示公众号后台可能仍是白壳。 */
function isDarkCopyPage() {
  if (state.styleVariant === "deep-night" || state.theme === "nocturne") return true;
  return relativeLuminance(hexToRgb(safeColor(state.pageColor, "#ffffff"))) < 0.18;
}

function contrastRatio(foreground, background) {
  const light = Math.max(relativeLuminance(hexToRgb(foreground)), relativeLuminance(hexToRgb(background)));
  const dark = Math.min(relativeLuminance(hexToRgb(foreground)), relativeLuminance(hexToRgb(background)));
  return (light + 0.05) / (dark + 0.05);
}

function getComplianceReport() {
  const model = getArticleModel();
  const items = [];
  const page = safeColor(state.pageColor, "#ffffff");
  const text = safeColor(state.textColor, "#333333");
  const highlight = safeColor(state.highlightColor, safeColor(state.accentColor, "#d7fa5c"));
  const highlightText = safeColor(state.highlightTextColor, text);
  const textRatio = contrastRatio(text, page);
  if (textRatio < 3.5) {
    items.push({
      severity: "risk",
      title: `正文与底色对比偏弱（约 ${textRatio.toFixed(1)}:1）`,
      tip: "调深文字或调浅页面底色",
      rule: "#4.1.1",
    });
  }
  if (["background", "marker"].includes(state.highlightStyle || "background")) {
    const highlightRatio = contrastRatio(highlightText, highlight);
    if (highlightRatio < 3) {
      items.push({
        severity: "warn",
        title: `重点字与重点底对比偏弱（约 ${highlightRatio.toFixed(1)}:1）`,
        tip: "调整重点文字色或重点底色",
        rule: "#4.1.1",
      });
    }
  }
  if (relativeLuminance(hexToRgb(page)) < 0.18 || currentMood === "deep") {
    items.push({
      severity: "warn",
      title: "当前偏深色皮肤",
      tip: "可点「暗色预览」看读者夜间观感；平台仍可能自动改色",
      rule: "#4 Dark Mode",
    });
  }
  if (model.blocks.some((block) => block.type === "code")) {
    items.push({
      severity: "warn",
      title: "文中含代码块",
      tip: "粘贴后请核对换行；过长建议改用截图",
      rule: "P1 代码",
    });
  }
  if (model.blocks.some((block) => block.type === "image" && block.url && !isWechatHostedImage(block.url))) {
    items.push({
      severity: "risk",
      title: "含非素材库外链图",
      tip: "先上传公众号素材库，再替换链接",
      rule: "图片域名",
    });
  }
  if (model.blocks.some((block) => block.type === "image" && !block.url)) {
    items.push({
      severity: "warn",
      title: "含配图占位",
      tip: "发布前请在后台换成真实图片",
      rule: "配图",
    });
  }
  const hasRisk = items.some((item) => item.severity === "risk");
  const hasWarn = items.some((item) => item.severity === "warn");
  const level = hasRisk ? "risk" : hasWarn ? "warn" : "ok";
  if (level === "ok") {
    items.push({
      severity: "ok",
      title: "基础硬伤已规避",
      tip: "无自定义字体、固定宽、半透明序号、列表 ul/ol；仍建议本机贴公众号确认",
      rule: "P0/P1",
    });
  }
  const label = level === "ok" ? "检查通过" : level === "warn" ? "发布前检查" : "需要调整";
  return { level, label, items };
}

function updateCompliancePanel() {
  if (!compliancePanel || !complianceLevel || !complianceList) return;
  const report = getComplianceReport();
  compliancePanel.hidden = false;
  complianceLevel.dataset.level = report.level;
  complianceLevel.textContent = report.label;
  complianceList.innerHTML = report.level === "ok" ? "" : report.items.map((item, index) =>
    `<li><strong>${escapeHtml(item.title)}</strong><span class="rule">${escapeHtml(item.rule)}</span><button type="button" class="compliance-help" aria-label="处理建议：${escapeHtml(item.tip)}" aria-describedby="compliance-tip-${index}">ⓘ</button><span class="compliance-tooltip" role="tooltip" id="compliance-tip-${index}">${escapeHtml(item.tip)}</span></li>`).join("");
}

/** 给带样式的节点加上 data-no-dark，减轻夜间模式改色（仅当前节点生效） */
function applyDataNoDark(html) {
  return String(html || "").replace(/<([a-zA-Z][\w:-]*)(\s[^>]*?)?(\/?)>/g, (full, tag, attrs = "", selfClose = "") => {
    if (/^(br|img|hr)$/i.test(tag)) {
      if (/^img$/i.test(tag) && !/\bdata-no-dark\b/i.test(attrs)) return `<${tag}${attrs} data-no-dark${selfClose}>`;
      return full;
    }
    if (/\bdata-no-dark\b/i.test(attrs)) return full;
    return `<${tag}${attrs} data-no-dark${selfClose}>`;
  });
}

/** 代码块：微信常吞 white-space，改成显式换行与空格 */
function formatCodeForWechat(text) {
  return escapeHtml(String(text || ""))
    .replace(/\t/g, "    ")
    .replace(/ /g, "&nbsp;")
    .replace(/\n/g, "<br>");
}

function isWechatHostedImage(url) {
  try {
    const host = new URL(String(url || "")).hostname;
    return /(^|\.)mmbiz\.qpic\.cn$/i.test(host) || /(^|\.)qlogo\.cn$/i.test(host);
  } catch {
    return false;
  }
}

/** 从预览 DOM 读取已加载图片的原始宽高，供 data-w / data-ratio */
function getCopyImageMeta(url) {
  const target = String(url || "").trim();
  if (!target || !articleBody) return null;
  const images = [...articleBody.querySelectorAll("img")];
  const match = images.find((img) => {
    const src = img.getAttribute("src") || "";
    return src === target || img.currentSrc === target || img.src === target;
  });
  const width = Number(match?.naturalWidth || match?.getAttribute("data-w") || 0);
  const height = Number(match?.naturalHeight || 0);
  if (!width) return null;
  const ratio = height > 0 ? (height / width).toFixed(4) : "";
  return { width: Math.round(width), ratio };
}

function getFontStack(value) {
  const stacks = {
    system: "-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif",
    serif: "'Songti SC','STSong','SimSun',serif",
    modern: "'PingFang SC','Microsoft YaHei',Arial,sans-serif",
  };
  return stacks[value] || stacks.system;
}

function getHeadingSize(level) {
  if (level <= 2) return state.headingSize;
  if (level === 3) return state.subheadingSize;
  return state.minorHeadingSize;
}

function getTemplateParams() {
  return Object.keys(TEMPLATE_DEFAULTS).reduce((params, key) => {
    params[key] = state[key];
    return params;
  }, {});
}

function clampClientNumber(value, min, max, step, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  const clamped = Math.min(max, Math.max(min, numeric));
  return Number((min + Math.round((clamped - min) / step) * step).toFixed(4));
}

function normalizeTemplateParams(input, fallback = getTemplateParams()) {
  const next = { ...fallback };
  if (input && typeof input.textAlign === "string") {
    const raw = input.textAlign.trim().toLowerCase();
    if (raw === "start" || raw === "end") input = { ...input, textAlign: wechatTextAlign(raw) };
  }
  const colors = ["textColor", "accentColor", "highlightColor", "highlightTextColor", "cardColor", "quoteColor", "cardTitleColor", "pageColor", "linkColor", "codeBackground", "codeColor", "dividerColor"];
  colors.forEach((key) => { if (input?.[key] !== undefined) next[key] = safeColor(input[key], next[key]); });
  const enums = {
    bodyFont: ["system", "serif", "modern"], headingFont: ["system", "serif", "modern"],
    textAlign: ["left", "right", "center", "justify"], readingDensity: ["compact", "standard", "comfortable", "custom"],
    highlightStyle: ["background", "marker", "underline", "bold", "strikethrough", "text-underline", "wavy"],
    headingStyle: ["bar", "line", "index", "block", "poster", "panel", "oval", "atlas-editorial", "atlas-index", "atlas-quote", "atlas-pill", "atlas-vertical", "atlas-ticket", "atlas-marker", "atlas-shadow", "atlas-weight"],
    cardStyle: ["border", "outline", "soft", "band"],
    listStyle: ["dot", "circle", "ghost", "check"],
    theme: THEME_IDS,
    articleType: ARTICLE_TYPE_IDS.concat(["auto"]),
  };
  Object.entries(enums).forEach(([key, allowed]) => { if (input?.[key] !== undefined && allowed.includes(input[key])) next[key] = input[key]; });
  const ranges = {
    textIndent: [0, 2, .25], fontSize: [14, 22, 1], lineHeight: [1.35, 2.2, .05], letterSpacing: [-.5, 2, .1], paragraphSpacing: [4, 40, 2], contentWidth: [280, 680, 10],
    titleSize: [22, 36, 1], headingSize: [20, 34, 1], subheadingSize: [18, 30, 1], minorHeadingSize: [16, 26, 1], headingWeight: [500, 900, 100], headingLineHeight: [1.1, 1.7, .05], headingSpacingBefore: [8, 48, 2], headingSpacingAfter: [4, 32, 2],
    highlightRadius: [0, 12, 1], highlightPadding: [0, 8, 1], listIndent: [1, 3, .25], listItemSpacing: [0, 20, 1], quoteTitleSize: [10, 18, 1], cardTitleSize: [10, 18, 1], cardBorderWidth: [0, 4, 1], dividerThickness: [1, 4, 1], dividerMargin: [8, 48, 2], codeFontSize: [11, 18, 1], codeLineHeight: [1.2, 2, .1], captionSize: [9, 16, 1], cardRadius: [0, 24, 1], cardPadding: [12, 32, 2], imageRadius: [0, 24, 1],
  };
  Object.entries(ranges).forEach(([key, [min, max, step]]) => { if (input?.[key] !== undefined) next[key] = clampClientNumber(input[key], min, max, step, next[key]); });
  ["linkUnderline", "showQuote", "showDivider", "showImage", "showSignature"].forEach((key) => { if (typeof input?.[key] === "boolean") next[key] = input[key]; });
  ["cardStyle", "listStyle"].forEach((key) => { if (typeof input?.[key] === "string") next[key] = input[key]; });
  if (typeof input?.mood === "string") next.mood = input.mood;
  if (typeof input?.skin === "string") next.skin = input.skin;
  return next;
}

function applyReadingDensity(density) {
  const densities = {
    compact: { fontSize: 15, lineHeight: 1.58, paragraphSpacing: 12 },
    standard: { fontSize: 16, lineHeight: 1.75, paragraphSpacing: 18 },
    comfortable: { fontSize: 17, lineHeight: 1.92, paragraphSpacing: 24 },
  };
  Object.assign(state, densities[density] || densities.standard, { readingDensity: densities[density] ? density : "standard" });
}

function cleanMarkdown(value) {
  return String(value)
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function htmlToMarkdown(html) {
  const documentFromPaste = new DOMParser().parseFromString(String(html), "text/html");
  documentFromPaste.querySelectorAll("script,style,link,meta,iframe,object,embed,form,input,button,textarea,select,svg,canvas,video,audio").forEach((node) => node.remove());

  const childrenToMarkdown = (node) => Array.from(node.childNodes).map((child) => nodeToMarkdown(child)).join("");
  const nodeText = (node) => cleanMarkdown(node.textContent || "").replace(/\n+/g, " ").trim();
  const listToMarkdown = (node, ordered) => Array.from(node.children)
    .filter((child) => child.tagName?.toLowerCase() === "li")
    .map((item, index) => {
      const copy = item.cloneNode(true);
      Array.from(copy.children).filter((child) => ["ul", "ol"].includes(child.tagName?.toLowerCase())).forEach((child) => child.remove());
      const prefix = ordered ? `${index + 1}. ` : "- ";
      return `${prefix}${nodeText(copy)}`;
    })
    .filter(Boolean)
    .join("\n");

  function nodeToMarkdown(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.nodeValue || "";
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const tag = node.tagName.toLowerCase();
    const content = childrenToMarkdown(node).trim();
    if (/^h[1-6]$/.test(tag)) return `\n\n${"#".repeat(Number(tag.slice(1)))} ${nodeText(node)}\n\n`;
    if (tag === "p") return content ? `\n\n${content}\n\n` : "";
    if (tag === "br") return "\n";
    if (tag === "blockquote") {
      const quote = nodeText(node).split(/\n+/).filter(Boolean).map((line) => `> ${line}`).join("\n");
      return quote ? `\n\n${quote}\n\n` : "";
    }
    if (tag === "ul") return `\n\n${listToMarkdown(node, false)}\n\n`;
    if (tag === "ol") return `\n\n${listToMarkdown(node, true)}\n\n`;
    if (tag === "hr") return "\n\n---\n\n";
    if (tag === "img") {
      const url = safeImageUrl(node.getAttribute("data-src") || node.getAttribute("data-original") || node.getAttribute("src") || "");
      const alt = cleanMarkdown(node.getAttribute("alt") || "文章配图");
      return url ? `\n\n![${alt}](${url})\n\n` : "";
    }
    if (tag === "pre") return `\n\n\`\`\`\n${node.textContent || ""}\n\`\`\`\n\n`;
    if (["section", "article", "main", "figure", "figcaption", "div", "header", "footer"].includes(tag)) return content ? `\n\n${content}\n\n` : "";
    return content;
  }

  return cleanMarkdown(childrenToMarkdown(documentFromPaste.body));
}

function insertMarkdownAtCursor(markdown, { append = false } = {}) {
  if (!articleInput || append) {
    const base = articleSource.trim();
    const next = base ? `${base}\n\n${markdown}` : markdown;
    if (articleInput) {
      articleInput.value = next;
      articleInput.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      articleSource = next;
      persistArticleSource();
      render();
    }
    return;
  }
  const start = articleInput.selectionStart;
  const end = articleInput.selectionEnd;
  const before = articleInput.value.slice(0, start);
  const after = articleInput.value.slice(end);
  const lead = before.endsWith("\n\n") || !before ? "" : before.endsWith("\n") ? "\n" : "\n\n";
  const tail = after.startsWith("\n\n") || !after ? "" : after.startsWith("\n") ? "\n" : "\n\n";
  articleInput.setRangeText(`${lead}${markdown.trim()}${tail}`, start, end, "end");
  articleInput.dispatchEvent(new Event("input", { bubbles: true }));
}

function splitTableRow(line) {
  let raw = String(line || "").trim();
  if (raw.startsWith("|")) raw = raw.slice(1);
  if (raw.endsWith("|")) raw = raw.slice(0, -1);
  const cells = [];
  let current = "";
  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if (char === "\\" && raw[index + 1] === "|") {
      current += "|";
      index += 1;
      continue;
    }
    if (char === "|") {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

function isSeparatorRow(line) {
  const cells = splitTableRow(line);
  return cells.length >= 2 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function isPipeRow(line) {
  const trimmed = String(line || "").trim();
  if (!trimmed.includes("|") || isSeparatorRow(trimmed)) return false;
  return splitTableRow(trimmed).length >= 2;
}

function tableAlign(cell) {
  const text = String(cell || "");
  const left = text.startsWith(":");
  const right = text.endsWith(":");
  if (left && right) return "center";
  if (right) return "right";
  return "left";
}

function readPipeTable(lines, start) {
  if (start + 1 >= lines.length) return null;
  if (!isPipeRow(lines[start]) || !isSeparatorRow(lines[start + 1])) return null;
  const headers = splitTableRow(lines[start]);
  const separators = splitTableRow(lines[start + 1]);
  if (headers.length < 2 || headers.length !== separators.length) return null;
  const aligns = separators.map(tableAlign);
  const rows = [];
  let cursor = start + 2;
  while (cursor < lines.length && String(lines[cursor] || "").trim()) {
    if (!isPipeRow(lines[cursor])) break;
    const cells = splitTableRow(lines[cursor]);
    while (cells.length < headers.length) cells.push("");
    rows.push(cells.slice(0, headers.length));
    cursor += 1;
  }
  return { block: { type: "table", headers, aligns, rows }, next: cursor };
}

function listItemText(entry) {
  if (entry && typeof entry === "object") return String(entry.text || "");
  return String(entry || "");
}

function nestListItems(items) {
  const root = { depth: -1, children: [] };
  const stack = [root];
  (items || []).forEach((entry) => {
    const text = listItemText(entry);
    if (!text) return;
    let depth = entry && typeof entry === "object" ? Math.max(0, Math.min(1, Number(entry.depth) || 0)) : 0;
    if (depth > stack[stack.length - 1].depth + 1) depth = stack[stack.length - 1].depth + 1;
    while (stack.length > 1 && stack[stack.length - 1].depth >= depth) stack.pop();
    const node = {
      text,
      depth,
      ordered: Boolean(entry && typeof entry === "object" ? entry.ordered : false),
      children: [],
    };
    stack[stack.length - 1].children.push(node);
    stack.push(node);
  });
  return root.children;
}

function groupListChildren(children) {
  const groups = [];
  (children || []).forEach((child) => {
    const ordered = Boolean(child.ordered);
    const last = groups[groups.length - 1];
    if (!last || last.ordered !== ordered) groups.push({ ordered, nodes: [child] });
    else last.nodes.push(child);
  });
  return groups;
}

/* 块级冒烟：表格要有表头和 | --- | 分隔行；子列表缩进至少两个空格，中间不要空行。
| 名称 | 作用 |
| --- | ---: |
| 删除线 | ~~不再强调~~ |
- 先做这一步
  - 再做里面这一步
*/
function parseArticle(source) {
  const lines = String(source).replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let title = "";
  let paragraphLines = [];
  let listItems = [];
  let listOrdered = false;
  let listBaseIndent = 0;
  let codeLines = [];
  let codeLanguage = "";
  let inCode = false;
  let fenceKind = "";
  let fenceTitle = "";
  let fenceLines = [];

  const flushParagraph = () => {
    if (paragraphLines.length) {
      const text = paragraphLines.join("\n");
      const paragraphs = paragraphLines.length === 1 && text.length >= 96
        ? splitLongTextLine(text).split(/\n{2,}/).filter(Boolean)
        : [text];
      paragraphs.forEach((paragraph) => blocks.push({ type: "paragraph", text: paragraph }));
      paragraphLines = [];
    }
  };
  const flushList = () => {
    if (listItems.length) {
      blocks.push({ type: "list", items: listItems, ordered: listOrdered });
      listItems = [];
      listOrdered = false;
      listBaseIndent = 0;
    }
  };
  const flushCode = () => {
    blocks.push({ type: "code", language: codeLanguage, text: codeLines.join("\n") });
    codeLines = [];
    codeLanguage = "";
  };
  const flushFence = () => {
    if (fenceKind === "card") {
      const text = fenceLines.join("\n").trim();
      if (text) blocks.push({ type: "card", title: fenceTitle || "重点提示", text });
    } else if (fenceKind === "steps") {
      const items = fenceLines.map(parseStepLine).filter(Boolean).slice(0, 40);
      if (items.length) blocks.push({ type: "steps", title: fenceTitle || "操作步骤", items });
    } else if (fenceKind === "stat") {
      const items = fenceLines.map(parseStatLine).filter(Boolean).slice(0, 12);
      if (items.length) blocks.push({ type: "stat", title: fenceTitle || "关键数据", items });
    }
    fenceKind = "";
    fenceTitle = "";
    fenceLines = [];
  };

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      if (inCode) flushCode();
      else {
        flushParagraph();
        flushList();
        codeLanguage = trimmed.slice(3).trim();
      }
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      codeLines.push(line);
      continue;
    }
    if (fenceKind) {
      if (trimmed === ":::") flushFence();
      else fenceLines.push(line);
      continue;
    }
    const fence = trimmed.match(/^:::(card|steps|stat|stats)(?:\s+(.+))?$/i);
    if (fence) {
      flushParagraph();
      flushList();
      const kind = fence[1].toLowerCase();
      fenceKind = kind === "stats" ? "stat" : kind;
      fenceTitle = (fence[2] || "").trim()
        || (fenceKind === "card" ? "重点提示" : fenceKind === "steps" ? "操作步骤" : "关键数据");
      continue;
    }
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      if (level === 1 && !title) title = heading[2];
      else blocks.push({ type: "heading", level, text: heading[2] });
      continue;
    }
    const image = trimmed.match(/^!\[([^\]]*)\]\(([^)\s]*)(?:\s+"[^"]*")?\)$/);
    if (image) {
      flushParagraph();
      flushList();
      blocks.push({ type: "image", alt: image[1] || "文章配图", url: safeImageUrl(image[2]) });
      continue;
    }
    if (/^(---+|\*\*\*+)$/.test(trimmed)) {
      flushParagraph();
      flushList();
      blocks.push({ type: "divider" });
      continue;
    }
    const list = line.match(/^(\s*)([-*+]|\d+[.)])\s+(.+)$/);
    if (list) {
      flushParagraph();
      const indent = list[1].replace(/\t/g, "  ").length;
      const ordered = /^\d/.test(list[2]);
      let depth = listItems.length && indent - listBaseIndent >= 2 ? 1 : 0;
      if (depth === 0 && listItems.length && ordered !== listOrdered) flushList();
      if (!listItems.length) {
        listOrdered = ordered;
        listBaseIndent = indent;
        depth = 0;
      }
      listItems.push({ text: list[3], depth, ordered: depth === 0 ? listOrdered : ordered });
      continue;
    }
    const table = readPipeTable(lines, lineIndex);
    if (table) {
      flushParagraph();
      flushList();
      blocks.push(table.block);
      lineIndex = table.next - 1;
      continue;
    }
    if (/^>\s?/.test(trimmed)) {
      flushParagraph();
      flushList();
      const quoteText = trimmed.replace(/^>\s?/, "");
      const labeledQuote = quoteText.match(/^\*\*([^*\n]+)\*\*[：:]\s*(.+)$/);
      blocks.push({ type: "quote", title: labeledQuote?.[1] || "引用", text: labeledQuote?.[2] || quoteText });
      continue;
    }
    flushList();
    paragraphLines.push(line);
  }

  if (inCode) flushCode();
  if (fenceKind) flushFence();
  flushParagraph();
  flushList();
  return { title, hasExplicitTitle: Boolean(title), blocks };
}

const STRUCTURE_TYPE_OPTIONS = [
  ["paragraph", "正文"],
  ["lead", "开场引言"],
  ["heading", "章节标题"],
  ["quote", "重点引用"],
  ["card", "内容卡片"],
  ["divider", "内容分隔"],
];

function applyStructureOverrides(parsed) {
  const blocks = parsed.blocks.map((block, index) => {
    const requestedType = blockTypeOverrides[index] ?? blockTypeOverrides[String(index)];
    let next = block;
    if (requestedType && requestedType !== block.type) {
      if (STRUCTURE_TYPE_OPTIONS.some(([type]) => type === requestedType)) {
        if (requestedType === "divider") {
          next = { type: "divider" };
        } else if (["paragraph", "lead", "heading", "quote", "card"].includes(block.type)) {
          if (requestedType === "heading") next = { ...block, type: "heading", level: 2 };
          else if (requestedType === "quote") next = { ...block, type: "quote", title: block.title || "重点提示" };
          else if (requestedType === "card") next = { ...block, type: "card", title: block.title || "重点提示" };
          else next = { ...block, type: requestedType };
        }
      }
    }
    return { ...next, sourceIndex: index };
  });
  return { ...parsed, blocks };
}

function inferTitleFromFirstBlock(parsed) {
  const firstBlock = parsed.blocks[0];
  if (!inferFirstLineTitle || parsed.hasExplicitTitle || !firstBlock || !["paragraph", "lead"].includes(firstBlock.type)) {
    return { title: "", blocks: parsed.blocks, inferred: false };
  }
  const candidate = String(firstBlock.text || "").replace(/\s+/g, " ").trim();
  const looksLikeTitle = candidate.length >= 4
    && candidate.length <= 44
    && !/[。！？!?；;]$/.test(candidate)
    && parsed.blocks.length >= 2;
  if (!looksLikeTitle) return { title: "", blocks: parsed.blocks, inferred: false };
  return { title: candidate, blocks: parsed.blocks.slice(1), inferred: true };
}

function getBlockText(block) {
  if (block.type === "list") return (block.items || []).map((entry) => listItemText(entry)).filter(Boolean).join("；");
  if (block.type === "table") {
    const head = (block.headers || []).join(" | ");
    const body = (block.rows || []).map((row) => (row || []).join(" | ")).join("；");
    return [head, body].filter(Boolean).join("；");
  }
  if (block.type === "steps") return (block.items || []).join("；");
  if (block.type === "stat") {
    return (block.items || []).map((item) => `${item.value || ""}${item.label ? ` ${item.label}` : ""}`).join("；");
  }
  if (block.type === "image") return block.alt || "文章配图";
  if (block.type === "code") return block.text;
  return block.text || "内容分隔线";
}

function parseStatLine(line) {
  const text = String(line || "").trim()
    .replace(/^[-*+]\s+/, "")
    .replace(/^\d+[.)]\s+/, "");
  if (!text) return null;
  const parts = text.split(/\s*[|｜／/]\s+/);
  if (parts.length >= 2) {
    return { value: parts[0].trim(), label: parts.slice(1).join(" ").trim() };
  }
  const dash = text.split(/\s+[—–-]\s+/);
  if (dash.length >= 2) {
    return { value: dash[0].trim(), label: dash.slice(1).join(" ").trim() };
  }
  const spaced = text.match(/^(\S+)\s+(.+)$/);
  if (spaced) return { value: spaced[1], label: spaced[2] };
  return { value: text, label: "" };
}

function parseStepLine(line) {
  return String(line || "").trim()
    .replace(/^[-*+]\s+/, "")
    .replace(/^\d+[.)]\s+/, "")
    .trim();
}

function renderStructureEditor() {
  return;
}

function getArticleModel() {
  if (!articleSource.trim()) {
    return { title: "", blocks: [], isSample: true };
  }
  const parsed = applyStructureOverrides(parseArticle(articleSource));
  const inferred = articleTitleOverride.trim()
    ? { title: "", blocks: parsed.blocks, inferred: false }
    : inferTitleFromFirstBlock(parsed);
  return {
    ...parsed,
    title: articleTitleOverride.trim() || parsed.title || inferred.title || "",
    blocks: inferred.blocks,
    isSample: false,
  };
}

function blockIndexAttr(item, index) {
  const sourceIndex = item.sourceIndex ?? index;
  return `data-block-index="${sourceIndex}"`;
}

/** 标题可写成「中文 | ENGLISH」，供叠号双语 / 序号黑卡使用 */
function splitHeadingCaption(text) {
  const raw = String(text || "").replace(/\s+/g, " ").trim();
  const paired = raw.match(/^(.+?)\s*[|｜/／]\s*([A-Za-z][A-Za-z0-9 ._-]{1,40})$/);
  if (paired) {
    return {
      title: paired[1].replace(/#+\s*$/, "").trim(),
      sub: paired[2].trim().toUpperCase(),
    };
  }
  return {
    title: raw.replace(/#+\s*$/, "").trim(),
    sub: "",
  };
}

const ATLAS_HEADING_STYLES = ["atlas-editorial", "atlas-index", "atlas-quote", "atlas-pill", "atlas-vertical", "atlas-ticket", "atlas-marker", "atlas-shadow", "atlas-weight"];

function splitAtlasHeadingLines(text) {
  const raw = String(text || "");
  if (/[*_`\[\]]/.test(raw)) return [raw, ""];
  const punctuation = raw.match(/^(.+?[，,：:；;！？!?])\s*(.+)$/);
  if (punctuation) return [punctuation[1], punctuation[2]];
  const chars = Array.from(raw);
  if (chars.length < 4) return [raw, ""];
  const middle = Math.ceil(chars.length / 2);
  return [chars.slice(0, middle).join(""), chars.slice(middle).join("")];
}

function renderAtlasHeading(item, idx, editable, kind, parts) {
  const [first, second] = ["atlas-marker", "atlas-weight"].includes(kind)
    ? splitAtlasHeadingLines(parts.title) : [parts.title, ""];
  const main = `<span class="heading-atlas-main" contenteditable="${editable}"><span class="heading-atlas-first">${inlineMarkdown(first)}</span>${second ? `<span class="heading-atlas-second">${inlineMarkdown(second)}</span>` : ""}</span>`;
  const subText = parts.sub || ({ "atlas-editorial": "章节 / SECTION", "atlas-quote": "观点 / QUOTE", "atlas-pill": "专栏 / COLUMN", "atlas-vertical": "FIELD NOTES", "atlas-ticket": "A STORY WORTH READING" }[kind] || "");
  const sub = subText ? `<span class="heading-atlas-label${parts.sub ? " heading-atlas-sub" : ""}" contenteditable="${parts.sub ? editable : "false"}">${escapeHtml(subText)}</span>` : "";
  const number = `<span class="heading-atlas-number" aria-hidden="true" contenteditable="false"></span>`;
  const after = kind === "atlas-ticket" ? `<span class="heading-atlas-ticket-foot" aria-hidden="true" contenteditable="false">ADMIT ONE<span>VOL. 01</span></span>` : "";
  const before = kind === "atlas-index" ? `${number}` : kind === "atlas-quote" ? `<span class="heading-atlas-quote-mark" aria-hidden="true" contenteditable="false">“</span>` : "";
  return `<h3 class="section-title level-2 heading-atlas ${kind}" data-type="heading" data-level="2" ${idx} contenteditable="false">${before}${sub}${main}${after}</h3>`;
}

function renderHeadingBlock(item, index, editable) {
  const level = Math.min(6, Math.max(2, Number(item.level) || 2));
  const idx = blockIndexAttr(item, index);
  const kind = state.headingStyle || "bar";
  const parts = splitHeadingCaption(item.text);
  const sub = parts.sub || "SECTION";
  const subAttr = ` data-sub="${escapeHtml(sub)}"`;

  if (level === 2 && ATLAS_HEADING_STYLES.includes(kind)) return renderAtlasHeading(item, idx, editable, kind, parts);

  if (level === 2 && kind === "poster") {
    const shown = `${parts.title}${parts.title.endsWith("#") ? "" : "#"}`;
    return `<h3 class="section-title level-2" data-type="heading" data-level="2" ${idx}${subAttr} contenteditable="${editable}">${inlineMarkdown(shown)}</h3>`;
  }
  if (level === 2 && kind === "panel") {
    return `<h3 class="section-title level-2 heading-panel" data-type="heading" data-level="2" ${idx}${subAttr} contenteditable="false"><span class="heading-panel-body"><span class="heading-panel-main" contenteditable="${editable}">${inlineMarkdown(parts.title)}</span><span class="heading-panel-sub" contenteditable="${editable}">${escapeHtml(sub)}</span></span></h3>`;
  }
  if (level === 2 && kind === "oval") {
    return `<h3 class="section-title level-2 heading-oval" data-type="heading" data-level="2" ${idx} contenteditable="false"><span class="heading-oval-badge" aria-hidden="true"><span class="heading-oval-num"></span></span><span class="heading-oval-text" contenteditable="${editable}">${inlineMarkdown(parts.title)}</span></h3>`;
  }
  return `<h3 class="section-title level-${level}" data-type="heading" data-level="${level}" ${idx} contenteditable="${editable}">${inlineMarkdown(item.text)}</h3>`;
}

function renderListMarkup(nodes, ordered, { root = false, idx = "", editable = "true" } = {}) {
  const tag = ordered ? "ol" : "ul";
  const rootAttr = root ? ` data-type="list" ${idx}` : "";
  const body = (nodes || []).map((node) => {
    const nested = groupListChildren(node.children).map((group) => renderListMarkup(group.nodes, group.ordered, { editable })).join("");
    if (nested) {
      return `<li><span class="list-item-text" contenteditable="${editable}">${inlineMarkdown(node.text)}</span>${nested}</li>`;
    }
    return `<li contenteditable="${editable}">${inlineMarkdown(node.text)}</li>`;
  }).join("");
  return `<${tag} class="article-list" data-ordered="${ordered ? "true" : "false"}"${rootAttr}>${body}</${tag}>`;
}

function renderTableMarkup(item, idx, editable) {
  const headers = item.headers || [];
  const aligns = item.aligns || [];
  const head = headers.map((cell, cellIndex) => {
    const textAlign = aligns[cellIndex] === "center" || aligns[cellIndex] === "right" ? aligns[cellIndex] : "left";
    return `<th contenteditable="${editable}" style="text-align:${textAlign}">${inlineMarkdown(cell)}</th>`;
  }).join("");
  const body = (item.rows || []).map((row) => `<tr>${(row || []).map((cell, cellIndex) => {
    const textAlign = aligns[cellIndex] === "center" || aligns[cellIndex] === "right" ? aligns[cellIndex] : "left";
    return `<td contenteditable="${editable}" style="text-align:${textAlign}">${inlineMarkdown(cell)}</td>`;
  }).join("")}</tr>`).join("");
  return `<table class="article-table" data-type="table" ${idx}><thead><tr>${head}</tr></thead>${body ? `<tbody>${body}</tbody>` : ""}</table>`;
}

function syncPreviewEmpty(isEmpty) {
  previewStage?.classList.toggle("is-source-empty", isEmpty);
  const empty = document.querySelector("#previewEmpty");
  if (empty) empty.hidden = !isEmpty;
}

function sampleTryRecord() {
  const sample = window.YOOCO_SAMPLE_TRY;
  if (!sample || typeof sample.source !== "string" || typeof sample.html !== "string" || !sample.html.trim()) return null;
  return sample;
}

function isSampleTrySource() {
  const sample = sampleTryRecord();
  return Boolean(sample && articleSource.trim() === sample.source.trim());
}

function sampleTryCanStayStatic() {
  if (state.showSignature) return false;
  return ["bar", "line", "index", "block"].includes(state.headingStyle || "bar");
}

function paintSampleTry() {
  const sample = sampleTryRecord();
  syncPreviewEmpty(false);
  const titleText = String(sample?.title || "").trim();
  if (articleTitle) {
    articleTitle.textContent = titleText;
    articleTitle.hidden = !titleText;
    articleTitle.contentEditable = titleText ? "true" : "false";
    if (titleText) articleTitle.removeAttribute("aria-hidden");
    else articleTitle.setAttribute("aria-hidden", "true");
  }
  if (articleBody) articleBody.innerHTML = sample.html;
}

function loadSampleTry() {
  const sample = sampleTryRecord();
  if (!sample) {
    setFeedback("示例暂时打不开。");
    return;
  }
  // 只填原文并展示预制 HTML，不请求 /api/normalize，不计积分，不写历史。
  const stayStatic = sampleTryCanStayStatic();
  sampleStaticActive = stayStatic;
  if (previewSyncTimer) {
    window.clearTimeout(previewSyncTimer);
    previewSyncTimer = 0;
  }
  articleTitleOverride = "";
  blockTypeOverrides = {};
  lastAiResult = null;
  articleSource = sample.source.trim();
  if (articleInput) articleInput.value = articleSource;
  persistArticleSource();
  showOptimizeHint("");
  selectEditorView(0);
  render({ keepSample: stayStatic });
  setStatus(stayStatic
    ? "已放入示例。这是站内预制排版，没有调用优化，也不计积分。"
    : "已放入示例，并按当前样式在本地重排。没有调用优化，也不计积分。");
  setFeedback("");
}

function renderBody() {
  if (sampleStaticActive && isSampleTrySource()) {
    paintSampleTry();
    return;
  }
  sampleStaticActive = false;
  const model = getArticleModel();
  if (model.isSample) {
    if (articleBody) articleBody.innerHTML = "";
    if (articleTitle) {
      articleTitle.textContent = "";
      articleTitle.hidden = true;
      articleTitle.contentEditable = "false";
      articleTitle.setAttribute("aria-hidden", "true");
    }
    syncPreviewEmpty(true);
    return;
  }
  syncPreviewEmpty(false);
  const editable = "true";
  let parts = model.blocks.map((item, index) => {
    const idx = blockIndexAttr(item, index);
    if (item.type === "lead") return `<p class="lead" data-type="lead" ${idx} contenteditable="${editable}">${inlineMarkdown(item.text)}</p>`;
    if (item.type === "highlight" && state.styleVariant === "deep-night") return `<p class="highlight-line" data-type="highlight" ${idx} contenteditable="${editable}"><mark>${item.text}</mark></p>`;
    if (item.type === "heading") return renderHeadingBlock(item, index, editable);
    if (item.type === "quote") {
      if (state.showQuote) return `<aside class="quote-card" data-type="quote" ${idx} contenteditable="${editable}"><strong>${escapeHtml(item.title || "引用")}</strong>${inlineMarkdown(item.text)}</aside>`;
      return `<p class="plain-quote" data-type="quote" ${idx} contenteditable="${editable}">${inlineMarkdown(item.text)}</p>`;
    }
    if (item.type === "card") return `<aside class="content-card" data-type="card" ${idx} contenteditable="${editable}"><strong>${escapeHtml(item.title || "重点提示")}</strong>${inlineMarkdown(item.text)}</aside>`;
    if (item.type === "steps") {
      const title = escapeHtml(item.title || "操作步骤");
      const rows = (item.items || []).map((entry, stepIndex) =>
        `<p class="steps-item" data-step="${stepIndex + 1}" contenteditable="${editable}"><span class="steps-index" contenteditable="false">${String(stepIndex + 1).padStart(2, "0")}</span><span class="steps-text">${inlineMarkdown(entry)}</span></p>`).join("");
      return `<section class="steps-block" data-type="steps" ${idx}><strong contenteditable="${editable}">${title}</strong><div class="steps-items">${rows}</div></section>`;
    }
    if (item.type === "stat") {
      const title = escapeHtml(item.title || "关键数据");
      const cells = (item.items || []).map((entry) =>
        `<div class="stat-item"><b contenteditable="${editable}">${escapeHtml(entry.value || "")}</b><span contenteditable="${editable}">${escapeHtml(entry.label || "")}</span></div>`).join("");
      return `<section class="stat-block" data-type="stat" ${idx}><strong contenteditable="${editable}">${title}</strong><div class="stat-grid">${cells}</div></section>`;
    }
    if (item.type === "divider" && state.showDivider) return `<hr class="article-divider" data-type="divider" ${idx} />`;
    if (item.type === "image") {
      if (item.url) return `<figure class="article-image" data-type="image" data-url="${escapeHtml(item.url)}" ${idx}><img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.alt)}" loading="lazy" /><figcaption contenteditable="${editable}">${escapeHtml(item.alt || "文章配图")}</figcaption></figure>`;
      if (state.showImage) return `<div class="fake-image" data-type="image" role="img" aria-label="文章配图占位" ${idx} contenteditable="${editable}">${escapeHtml(item.alt || "文章配图占位")}</div>`;
      return `<p class="image-note" data-type="image" ${idx} contenteditable="${editable}">[图片：${escapeHtml(item.alt || "文章配图")}]</p>`;
    }
    if (item.type === "list") {
      return renderListMarkup(nestListItems(item.items), Boolean(item.ordered), { root: true, idx, editable });
    }
    if (item.type === "table") return renderTableMarkup(item, idx, editable);
    if (item.type === "code") return `<pre class="article-code" data-type="code" data-language="${escapeHtml(item.language || "code")}" ${idx}><code contenteditable="${editable}">${escapeHtml(item.text)}</code></pre>`;
    if (item.type === "paragraph") return `<p data-type="paragraph" ${idx} contenteditable="${editable}">${inlineMarkdown(item.text)}</p>`;
    return "";
  });
  // 精选主题：自动目录（取前 3 个二级标题，纯导航，不写回原文）。
  if (isTheme()) {
    const tocItems = model.blocks
      .filter((block) => block.type === "heading" && Number(block.level || 2) === 2)
      .slice(0, 3);
    if (tocItems.length >= 2) {
      const tocHtml = `<section class="toc-card" data-type="toc" contenteditable="false"><p class="toc-title">本文脉络</p><div class="toc-list">${tocItems.map((block, tocIndex) =>
        `<p><b>${String(tocIndex + 1).padStart(2, "0")}</b><span>${escapeHtml(block.text)}</span></p>`).join("")}</div></section>`;
      const leadIndex = parts.findIndex((html) => html.includes('<p class="lead"'));
      parts.splice(leadIndex >= 0 ? leadIndex + 1 : 0, 0, tocHtml);
    }
    // 可选结尾签名区（默认关；内容可编辑，但不写回原文）。
    if (state.showSignature) {
      parts.push(`<section class="signature-card" data-type="signature" contenteditable="true"><p class="signature-name">—— {{作者名}}</p></section>`);
    }
  }
  articleBody.innerHTML = parts.join("");
  const titleText = String(model.title || "").trim();
  articleTitle.textContent = titleText;
  articleTitle.hidden = !titleText;
  articleTitle.contentEditable = titleText ? "true" : "false";
  if (titleText) articleTitle.removeAttribute("aria-hidden");
  else articleTitle.setAttribute("aria-hidden", "true");
}

function inlineNodeToMarkdown(node) {
  if (!node) return "";
  if (node.nodeType === 3) return node.textContent || "";
  if (node.nodeType !== 1) return "";
  const tag = node.tagName;
  if (tag === "BR") return "\n";
  const inner = [...node.childNodes].map(inlineNodeToMarkdown).join("");
  if (tag === "STRONG" || tag === "B") return `**${inner}**`;
  if (tag === "EM" || tag === "I") return `*${inner}*`;
  if (tag === "MARK") return `==${inner}==`;
  if (tag === "DEL" || tag === "S" || node.classList?.contains("inline-strike")) return `~~${inner}~~`;
  if (tag === "U" || node.classList?.contains("inline-underline")) return `++${inner}++`;
  if (node.classList?.contains("inline-wavy")) return `~${inner}~`;
  if (tag === "CODE") return `\`${inner}\``;
  if (tag === "A") return `[${inner}](${node.getAttribute("href") || ""})`;
  return inner;
}

function serializeListElement(el, depth = 0) {
  const ordered = el.dataset.ordered === "true" || el.tagName === "OL";
  const items = [...el.children].filter((node) => node.tagName === "LI");
  return items.map((li, index) => {
    const nested = [...li.children].filter((node) => node.tagName === "UL" || node.tagName === "OL");
    const clone = li.cloneNode(true);
    [...clone.children].forEach((node) => {
      if (node.tagName === "UL" || node.tagName === "OL") node.remove();
    });
    const text = inlineNodeToMarkdown(clone).replace(/\u00a0/g, " ").trim();
    const indent = "  ".repeat(depth);
    const marker = ordered ? `${index + 1}.` : "-";
    const lines = [`${indent}${marker} ${text}`];
    nested.forEach((list) => {
      const child = serializeListElement(list, depth + 1);
      if (child) lines.push(child);
    });
    return lines.join("\n");
  }).join("\n");
}

function serializeTableElement(el) {
  const rows = [...el.querySelectorAll("tr")];
  if (!rows.length) return "";
  const cellsOf = (row) => [...row.children]
    .filter((cell) => cell.tagName === "TH" || cell.tagName === "TD")
    .map((cell) => inlineNodeToMarkdown(cell).replace(/\u00a0/g, " ").trim().replace(/\|/g, "\\|"));
  const header = cellsOf(rows[0]);
  if (header.length < 2) return "";
  const separator = header.map((_, index) => {
    const sample = rows[0].children[index];
    const align = sample?.style?.textAlign || "";
    if (align === "center") return ":---:";
    if (align === "right") return "---:";
    return "---";
  });
  const body = rows.slice(1).map((row) => {
    const cells = cellsOf(row);
    while (cells.length < header.length) cells.push("");
    return `| ${cells.slice(0, header.length).join(" | ")} |`;
  });
  return [`| ${header.join(" | ")} |`, `| ${separator.join(" | ")} |`, ...body].join("\n");
}

function serializePreviewToMarkdown() {
  const htmlToMd = (node) => inlineNodeToMarkdown(node).replace(/\u00a0/g, " ").trim();
  const parts = [];
  [...articleBody.children].forEach((el) => {
    const type = el.dataset.type || "";
    // 目录与签名是精选主题的派生装饰，不写回原文。
    if (type === "toc" || type === "signature") return;
    if (type === "heading") {
      const level = Math.min(6, Math.max(2, Number(el.dataset.level) || 2));
      const main = el.querySelector(".heading-panel-main, .heading-oval-text, .heading-atlas-main");
      const sub = el.querySelector(".heading-panel-sub, .heading-atlas-sub");
      let text;
      if (main) {
        text = htmlToMd(main);
        const subText = (sub ? htmlToMd(sub) : "").trim();
        if (subText) text = `${text} | ${subText}`;
      } else {
        text = htmlToMd(el).replace(/#+\s*$/, "").trim();
        const dataSub = (el.getAttribute("data-sub") || "").trim();
        if (dataSub && dataSub !== "SECTION" && state.headingStyle === "poster") {
          text = `${text} | ${dataSub}`;
        }
      }
      parts.push(`${"#".repeat(level)} ${text}`);
      return;
    }
    if (type === "quote") {
      const title = el.querySelector("strong")?.textContent.trim() || "引用";
      const clone = el.cloneNode(true);
      clone.querySelector("strong")?.remove();
      parts.push(`> **${title}**：${htmlToMd(clone)}`);
      return;
    }
    if (type === "card") {
      const title = el.querySelector("strong")?.textContent.trim() || "重点提示";
      const clone = el.cloneNode(true);
      clone.querySelector("strong")?.remove();
      parts.push(`:::card ${title}\n${htmlToMd(clone)}\n:::`);
      return;
    }
    if (type === "steps") {
      const title = el.querySelector(":scope > strong")?.textContent.trim() || "操作步骤";
      const items = [...el.querySelectorAll(".steps-item")].map((node) => {
        const textNode = node.querySelector(".steps-text");
        return htmlToMd(textNode || node);
      }).filter(Boolean);
      if (items.length) parts.push(`:::steps ${title}\n${items.map((item, index) => `${index + 1}. ${item}`).join("\n")}\n:::`);
      return;
    }
    if (type === "stat") {
      const title = el.querySelector(":scope > strong")?.textContent.trim() || "关键数据";
      const items = [...el.querySelectorAll(".stat-item")].map((node) => {
        const value = node.querySelector("b")?.textContent.trim() || "";
        const label = node.querySelector("span")?.textContent.trim() || "";
        return label ? `${value} | ${label}` : value;
      }).filter(Boolean);
      if (items.length) parts.push(`:::stat ${title}\n${items.join("\n")}\n:::`);
      return;
    }
    if (type === "divider") {
      parts.push("---");
      return;
    }
    if (type === "image") {
      const alt = el.querySelector("figcaption")?.textContent.trim() || htmlToMd(el).replace(/^\[图片：|\]$/g, "") || "文章配图";
      const url = el.dataset.url || el.querySelector("img")?.getAttribute("src") || "";
      parts.push(url ? `![${alt}](${url})` : `![${alt}]()`);
      return;
    }
    if (type === "list") {
      const markdown = serializeListElement(el);
      if (markdown) parts.push(markdown);
      return;
    }
    if (type === "table") {
      const markdown = serializeTableElement(el);
      if (markdown) parts.push(markdown);
      return;
    }
    if (type === "code") {
      const language = el.dataset.language || "";
      parts.push(`\`\`\`${language}\n${el.innerText.trim()}\n\`\`\``);
      return;
    }
    const text = htmlToMd(el);
    if (text) parts.push(text);
  });
  return parts.join("\n\n").trim();
}

function syncPreviewEdits() {
  articleTitleOverride = (articleTitle?.innerText || "").trim();
  const markdown = serializePreviewToMarkdown();
  articleSource = markdown;
  if (articleInput && document.activeElement !== articleInput) articleInput.value = markdown;
  persistArticleSource();
  setStatus("已在预览中修改文字");
}

function flushPendingPreviewEdits() {
  if (!previewSyncTimer) return;
  window.clearTimeout(previewSyncTimer);
  previewSyncTimer = 0;
  syncPreviewEdits();
}

function applyStyleVars() {
  articlePage.dataset.style = state.styleVariant || "standard";
  articlePage.style.setProperty("--text-color", state.textColor);
  articlePage.style.setProperty("--accent-color", state.accentColor);
  articlePage.style.setProperty("--card-color", state.cardColor);
  articlePage.style.setProperty("--quote-color", state.quoteColor || state.cardColor);
  articlePage.style.setProperty("--card-title-color", state.cardTitleColor || state.accentColor);
  articlePage.style.setProperty("--highlight-text-color", state.highlightTextColor || state.textColor);
  articlePage.style.setProperty("--link-color", state.linkColor || state.accentColor);
  articlePage.style.setProperty("--code-background", state.codeBackground || state.cardColor);
  articlePage.style.setProperty("--code-color", state.codeColor || state.textColor);
  articlePage.style.setProperty("--divider-color", state.dividerColor || state.accentColor);
  articlePage.style.setProperty("--muted-color", state.mutedColor || "#8e9389");
  articlePage.style.setProperty("--title-color", state.titleColor || state.textColor);
  articlePage.style.setProperty("--border-color", state.borderColor || "#dedfd8");
  articlePage.style.setProperty("--highlight-color", state.highlightColor || state.accentColor);
  articlePage.style.setProperty("--body-font", getFontStack(state.bodyFont));
  articlePage.style.setProperty("--heading-font", getFontStack(state.headingFont));
  articlePage.style.setProperty("--page-color", state.pageColor);
  articlePage.style.setProperty("--font-size", `${state.fontSize}px`);
  articlePage.style.setProperty("--line-height", state.lineHeight);
  articlePage.style.setProperty("--letter-spacing", `${state.letterSpacing}px`);
  articlePage.style.setProperty("--paragraph-spacing", `${state.paragraphSpacing}px`);
  articlePage.style.setProperty("--text-align", wechatTextAlign(state.textAlign));
  articlePage.style.setProperty("--text-indent", `${state.textIndent}em`);
  articlePage.style.setProperty("--title-size", `${state.titleSize}px`);
  articlePage.style.setProperty("--heading-size", `${state.headingSize}px`);
  articlePage.style.setProperty("--subheading-size", `${state.subheadingSize}px`);
  articlePage.style.setProperty("--minor-heading-size", `${state.minorHeadingSize}px`);
  articlePage.style.setProperty("--heading-weight", state.headingWeight);
  articlePage.style.setProperty("--heading-line-height", state.headingLineHeight);
  articlePage.style.setProperty("--heading-before", `${state.headingSpacingBefore}px`);
  articlePage.style.setProperty("--heading-after", `${state.headingSpacingAfter}px`);
  articlePage.style.setProperty("--highlight-radius", `${state.highlightRadius}px`);
  articlePage.style.setProperty("--highlight-padding", `${state.highlightPadding}px`);
  articlePage.style.setProperty("--list-indent", `${state.listIndent}em`);
  articlePage.style.setProperty("--list-item-spacing", `${state.listItemSpacing}px`);
  articlePage.style.setProperty("--quote-title-size", `${state.quoteTitleSize}px`);
  articlePage.style.setProperty("--card-title-size", `${state.cardTitleSize}px`);
  articlePage.style.setProperty("--card-border-width", `${state.cardBorderWidth}px`);
  articlePage.style.setProperty("--divider-thickness", `${state.dividerThickness}px`);
  articlePage.style.setProperty("--divider-margin", `${state.dividerMargin}px`);
  articlePage.style.setProperty("--code-font-size", `${state.codeFontSize}px`);
  articlePage.style.setProperty("--code-line-height", state.codeLineHeight);
  articlePage.style.setProperty("--caption-size", `${state.captionSize}px`);
  articlePage.dataset.highlightStyle = state.highlightStyle || "background";
  articlePage.dataset.linkUnderline = String(Boolean(state.linkUnderline));
  articlePage.style.setProperty("--card-radius", `${state.cardRadius}px`);
  articlePage.style.setProperty("--card-padding", `${state.cardPadding}px`);
  articlePage.style.setProperty("--image-radius", `${state.imageRadius}px`);
  articlePage.style.setProperty("--content-width", `${state.contentWidth}px`);
  articlePage.dataset.headingStyle = state.headingStyle || "bar";
  articlePage.dataset.cardStyle = state.cardStyle || "border";
  articlePage.dataset.listStyle = state.listStyle || "dot";
  if (isTheme()) articlePage.dataset.theme = state.theme;
  else delete articlePage.dataset.theme;
  if (isHardEdgeTheme(state.theme)) articlePage.dataset.hardEdge = "1";
  else delete articlePage.dataset.hardEdge;
  articlePage.style.backgroundColor = state.pageColor;
  previewStage?.style.setProperty("--preview-page-color", state.pageColor);
  articleBody.style.maxWidth = `${state.contentWidth}px`;
  updateOutputs();
  updateCompliancePanel();
  const currentTemplate = { type: "universal", name: isTheme()
    ? `精选主题 · ${THEMES[state.theme].label}`
    : `${MOODS[currentMood].label} · ${SKINS[currentSkin].label}`, params: getTemplateParams() };
  if (tokenPreview) tokenPreview.textContent = JSON.stringify(lastAiResult ? { ...lastAiResult, template: { ...lastAiResult.template, ...currentTemplate } } : { version: 2, template: currentTemplate }, null, 2);
  localStorage.setItem("wechat-style-lab-config", JSON.stringify(state));
  localStorage.setItem("yooco-style-mood", JSON.stringify({ mood: currentMood, skin: currentSkin }));
}

function render(options = {}) {
  if (!options.keepSample) sampleStaticActive = false;
  applyStyleVars();
  if (options.body !== false) {
    renderBody();
    renderStructureEditor();
  }
}

function applyMarksToMarkdown(text, marks) {
  let output = String(text || "").trim();
  if (!Array.isArray(marks)) return output;
  marks.forEach((mark) => {
    if (!mark?.text || !["bold", "highlight"].includes(mark.type)) return;
    const index = output.indexOf(mark.text);
    if (index < 0) return;
    const formatted = mark.type === "bold" ? `**${mark.text}**` : `==${mark.text}==`;
    output = `${output.slice(0, index)}${formatted}${output.slice(index + mark.text.length)}`;
  });
  return output;
}

function structuredDocumentToMarkdown(document) {
  if (!document || !Array.isArray(document.blocks)) return "";
  const lines = [];
  const title = String(document.title || "").trim();
  if (title) lines.push(`# ${title}`);
  document.blocks.forEach((block) => {
    const type = block?.type;
    if (type === "divider") {
      lines.push("---");
      return;
    }
    if (type === "image") {
      const url = safeImageUrl(block.url);
      const alt = String(block.alt || block.placementHint || "文章配图").replace(/[\[\]]/g, "");
      lines.push(`![${alt}](${url})`);
      return;
    }
    if (type === "list" && Array.isArray(block.items)) {
      let rootIndex = 0;
      const list = block.items.map((item) => {
        const raw = String(item ?? "");
        const nested = /^\s{2,}/.test(raw);
        const body = nested ? raw.trim().replace(/^(?:[-*+]|\d+[.)])\s+/, "") : raw.trim();
        if (!body) return "";
        if (nested) return `  - ${body}`;
        rootIndex += 1;
        return `${block.ordered ? `${rootIndex}. ` : "- "}${body}`;
      }).filter(Boolean);
      if (list.length) lines.push(list.join("\n"));
      return;
    }
    if (type === "steps" && Array.isArray(block.items)) {
      const items = block.items.map((item) => String(item || "").trim()).filter(Boolean);
      if (items.length) {
        lines.push(`:::steps ${String(block.title || "操作步骤").trim()}\n${items.map((item, index) => `${index + 1}. ${item}`).join("\n")}\n:::`);
      }
      return;
    }
    if (type === "stat" && Array.isArray(block.items)) {
      const items = block.items.map((item) => {
        if (item && typeof item === "object") {
          const value = String(item.value || "").trim();
          const label = String(item.label || "").trim();
          return label ? `${value} | ${label}` : value;
        }
        return String(item || "").trim();
      }).filter(Boolean);
      if (items.length) lines.push(`:::stat ${String(block.title || "关键数据").trim()}\n${items.join("\n")}\n:::`);
      return;
    }
    const text = applyMarksToMarkdown(block?.text, block?.marks);
    if (!text) return;
    if (type === "heading") {
      const level = Math.min(6, Math.max(2, Number(block.level) || 2));
      lines.push(`${"#".repeat(level)} ${text}`);
    } else if (type === "quote") {
      const quoteTitle = String(block.title || "引用").trim();
      lines.push(`> **${quoteTitle}**：${text}`);
    } else if (type === "card") {
      lines.push(`:::card ${String(block.title || "重点提示").trim()}\n${text}\n:::`);
    } else if (type === "code") {
      lines.push(`\`\`\`${String(block.language || "").trim()}\n${block.text}\n\`\`\``);
    } else {
      lines.push(text);
    }
  });
  return lines.join("\n\n").trim();
}

function nextNormalizeAssignment() {
  if (styleTouched) {
    const theme = THEMES[state.theme] ? state.theme : "classic";
    if (theme === "classic") return { mode: "fixed", theme, mood: currentMood, skin: currentSkin };
    return { mode: "fixed", theme };
  }
  if (awaitingContentPick) return { mode: "choose" };
  const pool = typeof THEME_IDS !== "undefined"
    ? THEME_IDS
    : ["fresh", "mono", "serene", "stub", "editorial", "nocturne", "citrus", "playful", "grunge", "flat", "newsprint", "bauhaus", "classic"];
  const theme = pool[Math.floor(Math.random() * pool.length)];
  return { mode: "fixed", theme };
}

function applyAiLook(aiParams, assignment) {
  if (styleTouched) return;
  const requested = assignment?.mode === "fixed" ? assignment.theme : "";
  const aiTheme = THEMES[aiParams.theme] ? aiParams.theme : "";
  const theme = requested && requested !== "classic" ? requested : (!requested ? aiTheme : "");
  if (theme) {
    Object.assign(state, buildThemeState(theme));
    if (aiParams.articleType && aiParams.articleType !== "auto") state.articleType = aiParams.articleType;
    return;
  }
  state.theme = "classic";
  const lockedSkin = assignment?.skin && SKINS[assignment.skin] ? assignment.skin : "";
  const aiSkin = lockedSkin || (SKINS[aiParams.skin] ? aiParams.skin : "");
  const aiMood = MOODS[assignment?.mood] ? assignment.mood : (MOODS[aiParams.mood] ? aiParams.mood : "");
  const skin = aiSkin || (aiMood ? MOODS[aiMood].skins[0] : "");
  if (skin) {
    currentSkin = skin;
    currentMood = skinMood(skin);
    Object.assign(state, buildSkinState(skin));
  }
  if (aiParams.articleType && aiParams.articleType !== "auto") state.articleType = aiParams.articleType;
  state.theme = "classic";
  state.styleVariant = SKINS[currentSkin]?.styleVariant || "standard";
  state.mutedColor = SKINS[currentSkin]?.mutedColor || state.mutedColor;
  state.titleColor = SKINS[currentSkin]?.titleColor || state.textColor;
  state.borderColor = SKINS[currentSkin]?.borderColor || "#dedfd8";
}

const NORMALIZE_ERROR_FALLBACK = "暂时无法完成优化，请稍后重试。";

function formatNormalizeError(payload) {
  const code = typeof payload?.error?.code === "string" ? payload.error.code.trim() : "";
  const message = typeof payload?.error?.message === "string" ? payload.error.message.trim() : "";
  if (code && message) return `${code}：${message}`;
  if (message) return message;
  if (code) return `${code}：${NORMALIZE_ERROR_FALLBACK}`;
  return NORMALIZE_ERROR_FALLBACK;
}

let groundAiDocumentFn = null;

function fallbackGroundAiDocument(document, source) {
  if (!document || typeof document !== "object") return document;
  const compact = (value) => String(value || "").toLowerCase().replace(/[\s\u00a0\u3000「」『』“”"'‘’《》〈〉（）()【】\[\]{}：:，,。．.！!？?；;、·…—–\-_~～|/／\\#*`=+]+/g, "");
  const grounded = (candidate) => {
    const needle = compact(candidate);
    return needle.length >= 2 && compact(source).includes(needle);
  };
  const blocks = Array.isArray(document.blocks) ? document.blocks.slice() : [];
  const rawTitle = typeof document.title === "string" ? document.title.trim() : "";
  while (blocks.length && blocks[0]?.type === "heading" && !grounded(blocks[0].text)) blocks.shift();
  return { ...document, title: grounded(rawTitle) ? rawTitle : "", blocks };
}

async function groundReturnedDocument(document, source) {
  try {
    if (!groundAiDocumentFn) {
      const mod = await import("/ground-title.js");
      groundAiDocumentFn = mod.groundAiDocument;
    }
    return groundAiDocumentFn(document, source);
  } catch {
    return fallbackGroundAiDocument(document, source);
  }
}

async function applyAiNormalization(data, assignment, source) {
  const document = await groundReturnedDocument(data?.document, source);
  const markdown = structuredDocumentToMarkdown(document);
  if (!markdown) throw new Error("DeepSeek 没有返回可编辑的文章内容，请重试。");
  const aiParams = normalizeTemplateParams(data?.template?.params || data?.params || {});
  applyAiLook(aiParams, assignment);
  syncMoodUI();
  articleTitleOverride = "";
  blockTypeOverrides = {};
  lastAiResult = { ...data, document };
  if (articleInput) articleInput.value = markdown;
  else articleSource = markdown;
  syncControls();
  applyArticleSource(false);
  const blockCountFromAi = Array.isArray(document?.blocks) ? document.blocks.length : 0;
  setStatus(`已优化 ${blockCountFromAi} 个内容块`);
  setFeedback("排版已更新");
}

async function normalizeWithDeepSeek() {
  const source = (articleInput ? articleInput.value : articleSource).trim();
  if (!source) {
    showOptimizeHint("请先添加文章内容");
    return;
  }
  showOptimizeHint("");
  if (remainingTrialCount() <= 0) {
    showUpgradePrompt(UPGRADE_PROMPT);
    return;
  }
  const originalLabel = aiNormalizeButton ? aiNormalizeButton.textContent : "";
  if (aiNormalizeButton) {
    aiNormalizeButton.dataset.busy = "1";
    aiNormalizeButton.disabled = true;
    aiNormalizeButton.textContent = "优化中…";
  }
  setStatus("正在优化排版…");
  if (articleInput) applyArticleSource(false);
  else {
    trimInvalidOverrides();
    persistArticleSource();
    render();
  }
  try {
    const assignment = nextNormalizeAssignment();
    const response = await fetch("/api/normalize", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ source, assignment }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.ok) {
      const message = formatNormalizeError(payload);
      if (payload?.error?.code === "TRIAL_EXHAUSTED" || payload?.error?.remaining === 0) {
        serverTrialUnlimited = false;
        serverTrialRemaining = 0;
        serverTrialBonus = 0;
        writeLocalTrialUsed(guestTrialLimit());
        showUpgradePrompt();
        return;
      }
      if (response.status === 429) {
        if (typeof payload?.error?.bonus === "number") serverTrialBonus = Math.max(0, payload.error.bonus);
        if (typeof payload?.error?.remaining === "number") {
          serverTrialRemaining = payload.error.remaining;
          renderTrialMeter();
        }
        setStatus("本次未调用 AI。");
        setFeedback(message);
        return;
      }
      throw new Error(message);
    }
    if (payload.trial) applyTrialFromServer(payload.trial);
    else if (!serverTrialEnforced) {
      writeLocalTrialUsed(readLocalTrialUsed() + 1);
      renderTrialMeter();
    }
    await applyAiNormalization(payload.data, assignment, source);
    awaitingContentPick = false;
    try {
      if (typeof window.yoocoTrack === "function") window.yoocoTrack("optimize_ok");
    } catch {
      /* analytics must never break typesetting */
    }
    void rememberLayoutHistory(source);
  } catch (error) {
    setStatus("已套用本地排版");
    setFeedback(error instanceof Error && error.message ? error.message : NORMALIZE_ERROR_FALLBACK);
  } finally {
    if (aiNormalizeButton) {
      delete aiNormalizeButton.dataset.busy;
      aiNormalizeButton.textContent = originalLabel;
      renderTrialMeter();
    }
  }
}

/** 微信 §2.6 只认 left / right / center / justify。从左到右阅读时 start 当 left，end 当 right。 */
function wechatTextAlign(value, fallback = "left") {
  const pick = (raw) => {
    const token = String(raw ?? "").trim().toLowerCase();
    if (token === "start") return "left";
    if (token === "end") return "right";
    if (token === "left" || token === "right" || token === "center" || token === "justify") return token;
    return "";
  };
  return pick(value) || pick(fallback) || "left";
}

function stripLogicalTextAlign(html) {
  return String(html || "").replace(/text-align\s*:\s*(start|end)\b/gi, (_full, value) => (
    `text-align:${String(value).toLowerCase() === "end" ? "right" : "left"}`
  ));
}

function isHardEdgeTheme(themeId) {
  return themeId === "citrus" || themeId === "playful" || themeId === "grunge" || themeId === "newsprint" || themeId === "bauhaus";
}

function hardEdgePaperInk(themeId) {
  return themeId === "playful" || themeId === "grunge" || themeId === "bauhaus";
}

function buildCopyHtml() {
  const isDeepNight = state.styleVariant === "deep-night";
  const mutedColor = state.mutedColor || "#8e9389";
  const titleColor = state.titleColor || state.textColor;
  const highlightColor = safeColor(state.highlightColor, safeColor(state.accentColor, "#d7fa5c"));
  const highlightTextColor = safeColor(state.highlightTextColor, state.textColor);
  const highlightStyle = state.highlightStyle || "background";
  // 旧夜间皮肤仍用写死的代码色。深空青按主题参数走，深底浅绿字。
  const useRegisteredCode = !isDeepNight || state.theme === "nocturne";
  const codeBackground = useRegisteredCode ? state.codeBackground : "#202727";
  const codeColor = useRegisteredCode ? state.codeColor : "#d7e0f2";
  const highlightPlain = `padding:0;background-color:transparent;color:${highlightTextColor};font-weight:700;`;
  const highlightCss = highlightStyle === "underline"
    ? `${highlightPlain}border-bottom:3px solid ${highlightColor};`
    : highlightStyle === "bold"
      ? `padding:0;background-color:transparent;color:${highlightTextColor};font-weight:800;`
      : highlightStyle === "strikethrough"
        ? `${highlightPlain}text-decoration:line-through;text-decoration-color:${highlightColor};`
        : highlightStyle === "text-underline"
          ? `${highlightPlain}text-decoration:underline;text-underline-offset:.14em;text-decoration-color:${highlightColor};`
          : highlightStyle === "wavy"
            ? `${highlightPlain}text-decoration:underline;text-decoration-style:wavy;text-underline-offset:.16em;text-decoration-color:${highlightColor};`
            : `padding:0 ${state.highlightPadding}px;border-radius:${state.highlightRadius}px;background-color:${highlightColor};color:${highlightTextColor};font-weight:700;`;
  const linkCss = `color:${state.linkColor};${state.linkUnderline ? "text-decoration:underline;" : "text-decoration:none;"}`;
  const inlineCodeCss = `padding:0 .28em;border-radius:4px;background-color:${codeBackground};color:${codeColor};font-size:${state.codeFontSize}px;`;
  const underlineCss = highlightStyle === "underline"
    ? `padding:0;background-color:transparent;color:${highlightTextColor};font-weight:700;text-decoration:none;border-bottom:3px solid ${highlightColor};`
    : "text-decoration:underline;text-underline-offset:.14em;";
  const wavyCss = `text-decoration:underline;text-decoration-style:wavy;text-underline-offset:.16em;text-decoration-color:${state.accentColor};`;
  const copyInlineMarkdown = (value) => {
    let html = inlineMarkdown(value).replace(
      /<span class="inline-wavy">([\s\S]*?)<\/span>/g,
      `<span style="${wavyCss}">$1</span>`,
    ).replace(
      /<del class="inline-strike">([\s\S]*?)<\/del>/g,
      `<span style="text-decoration:line-through;">$1</span>`,
    ).replace(
      /<u class="inline-underline">([\s\S]*?)<\/u>/g,
      `<span style="${underlineCss}">$1</span>`,
    ).replace(
      /<mark class="inline-highlight">([\s\S]*?)<\/mark>/g,
      `<span style="${highlightCss}">$1</span>`,
    ).replace(
      /<a class="inline-link" href="([^"]+)" target="_blank" rel="noreferrer">([\s\S]*?)<\/a>/g,
      `<a href="$1" style="${linkCss}" target="_blank">$2</a>`,
    ).replace(
      /<code class="inline-code">([\s\S]*?)<\/code>/g,
      `<code style="${inlineCodeCss}">$1</code>`,
    );
    if (state.theme === "nocturne") {
      html = html.replace(/<strong>/g, `<strong style="color:${state.accentColor};font-weight:700;">`);
    }
    return html;
  };
  const model = getArticleModel();
  const headingKind = state.headingStyle || "bar";
  const cardKind = state.cardStyle || "border";
  const listKind = state.listStyle || "dot";
  let sectionCounter = 0;
  // 复制 HTML 按公众号规范：不写 font-family；宽度用 100%；不用 opacity / 过小行高藏分隔线；text-align 不用 start/end
  const softAccent = colorWithAlpha(state.accentColor, 0.55);
  const ghostAccent = colorWithAlpha(state.accentColor, 0.38);
  const bodyAlign = wechatTextAlign(state.textAlign);
  const textStyle = `margin:0 0 ${state.paragraphSpacing}px;color:${state.textColor};font-size:${state.fontSize}px;line-height:${state.lineHeight};letter-spacing:${state.letterSpacing}px;text-align:${bodyAlign};text-indent:${state.textIndent}em;`;
  const headingStyle = (level) => {
    const size = getHeadingSize(level);
    const headingInk = state.theme === "nocturne" ? titleColor : state.textColor;
    const nightItalic = isDeepNight && state.theme !== "nocturne" ? "font-style:italic;" : "";
    const base = `margin:${state.headingSpacingBefore}px 0 ${state.headingSpacingAfter}px;color:${headingInk};font-size:${size}px;line-height:${state.headingLineHeight};font-weight:${state.headingWeight};letter-spacing:-.04em;${nightItalic}`;
    let style = `${base}padding-left:12px;border-left:4px solid ${state.accentColor};`;
    if (headingKind === "line") style = `${base}padding-bottom:10px;border-bottom:1px solid ${state.accentColor};`;
    else if (headingKind === "block" && level === 2 && isHardEdgeTheme(state.theme)) {
      const ink = hardEdgePaperInk(state.theme) ? state.pageColor : titleColor;
      style = `${base}display:inline-block;max-width:100%;box-sizing:border-box;padding:6px 14px;border:2px solid ${state.borderColor};border-radius:${state.cardRadius}px;background-color:${state.accentColor};color:${ink};box-shadow:4px 4px 0 ${state.borderColor};`;
    }
    else if (headingKind === "block" && level === 2) style = `${base}display:inline-block;padding:6px 14px;border-radius:8px;background-color:${state.accentColor};color:${state.pageColor};`;
    else if (headingKind === "index" && level === 2) style = base;
    else if (headingKind === "poster" && level === 2) style = `${base}padding:0;border:0;`;
    else if (headingKind === "panel" && level === 2) style = `${base}padding:0;border:0;`;
    else if (headingKind === "oval" && level === 2) style = `${base}padding:0;border:0;`;
    else if (ATLAS_HEADING_STYLES.includes(headingKind) && level === 2) style = `${base}padding:0;border:0;overflow-wrap:anywhere;`;
    const align = headingKind === "oval" && level === 2 ? "center" : "left";
    return `${style}text-align:${align};`;
  };
  const headingPrefix = (level) => {
    if (level !== 2) return "";
    if (headingKind === "index" || headingKind === "poster" || headingKind === "panel" || headingKind === "oval") {
      sectionCounter += 1;
      const num = String(sectionCounter).padStart(2, "0");
      if (headingKind === "index") {
        const numColor = state.theme === "nocturne" ? state.accentColor : softAccent;
        return `<span style="display:inline-block;margin-right:12px;color:${numColor};font-size:1.35em;font-weight:${state.headingWeight};">${num}</span>`;
      }
      if (headingKind === "poster") {
        return `<span style="display:block;margin:0 0 6px;color:${state.textColor};font-size:1.75em;font-weight:800;line-height:1;letter-spacing:0;">${num}</span>`;
      }
      if (headingKind === "panel") {
        return `<span style="display:inline-block;margin-right:14px;color:${state.textColor};font-size:2.2em;font-weight:900;line-height:1;vertical-align:middle;">${num}</span>`;
      }
      if (headingKind === "oval") {
        return `<span style="display:inline-block;margin:0 auto 10px;padding:10px 18px;border-radius:999px;background-color:#ffe566;box-shadow:3px 2px 0 ${state.textColor};color:${state.textColor};font-size:1.45em;font-weight:900;line-height:1;transform:rotate(-12deg);">${num}</span><br/>`;
      }
    }
    return "";
  };
  const atlasCopyHeading = (item) => {
    sectionCounter += 1;
    const number = String(sectionCounter).padStart(2, "0");
    const parts = splitHeadingCaption(item.text);
    const [first, second] = ["atlas-marker", "atlas-weight"].includes(headingKind)
      ? splitAtlasHeadingLines(parts.title) : [parts.title, ""];
    const main = copyInlineMarkdown(parts.title);
    const sub = parts.sub || ({ "atlas-editorial": "章节 / SECTION", "atlas-pill": "专栏 / COLUMN", "atlas-vertical": "FIELD NOTES", "atlas-ticket": "A STORY WORTH READING" }[headingKind] || "");
    const label = escapeHtml(sub);
    const base = headingStyle(2);
    const quiet = `color:${mutedColor};font-size:11px;font-weight:600;line-height:1.6;letter-spacing:.1em;`;
    if (headingKind === "atlas-editorial") return `<h3 style="${base}font-weight:500;letter-spacing:.04em;line-height:1.48;"><span style="display:block;margin-bottom:15px;padding-bottom:10px;border-bottom:1px solid ${state.dividerColor};${quiet}">${label}</span><span style="display:block;">${main}</span></h3>`;
    if (headingKind === "atlas-index") return `<h3 style="${base}"><span style="display:inline-block;position:relative;z-index:1;margin:0 0 -8px 14px;padding:0 8px;background-color:${state.pageColor};color:${state.textColor};font-size:11px;font-weight:600;letter-spacing:.06em;">INDEX / ${number}</span><span style="display:block;padding:18px 18px 15px;border:1px solid ${state.textColor};">${main}</span>${sub ? `<span style="display:block;margin-top:8px;${quiet}">${label}</span>` : ""}</h3>`;
    if (headingKind === "atlas-quote") return `<h3 style="${base}font-weight:500;line-height:1.5;"><span style="display:block;color:${state.accentColor};font-size:72px;line-height:.8;">“</span><span style="display:block;">${main}</span><span style="display:block;margin-top:15px;padding-top:9px;border-top:1px solid ${state.dividerColor};${quiet}">${label || "观点 / QUOTE"}</span></h3>`;
    if (headingKind === "atlas-pill") return `<h3 style="${base}"><span style="display:inline-block;margin-bottom:14px;padding:4px 12px;border-radius:999px;background-color:${state.accentColor};color:${state.textColor};font-size:10px;font-weight:700;line-height:1.6;letter-spacing:.04em;">${label}</span><span style="display:block;">${main}</span></h3>`;
    if (headingKind === "atlas-vertical") return `<h3 style="${base}font-weight:500;"><span style="display:table;width:100%;table-layout:fixed;"><span style="display:table-cell;width:28px;vertical-align:top;writing-mode:vertical-rl;padding-right:8px;border-right:1px solid ${state.dividerColor};${quiet}">${label}</span><span style="display:table-cell;vertical-align:top;padding-left:18px;">${main}</span></span></h3>`;
    if (headingKind === "atlas-ticket") return `<h3 style="${base}padding:17px 18px;border:0;background-color:${state.textColor};color:${state.pageColor};font-weight:500;"><span style="display:block;margin-bottom:12px;color:${state.pageColor};font-size:10px;line-height:1.6;letter-spacing:.1em;">${label}</span><span style="display:block;">${main}</span><span style="display:block;margin-top:24px;padding-top:9px;border-top:1px dashed ${state.pageColor};color:${state.pageColor};font-size:10px;line-height:1.4;letter-spacing:.06em;">ADMIT ONE &nbsp;&nbsp; VOL. 01</span></h3>`;
    if (headingKind === "atlas-marker") return `<h3 style="${base}"><span style="display:block;">${copyInlineMarkdown(first)}</span>${second ? `<span style="display:table;padding:0 3px;box-shadow:inset 0 -.6em 0 ${highlightColor};">${copyInlineMarkdown(second)}</span>` : ""}${sub ? `<span style="display:block;margin-top:12px;${quiet}">${label}</span>` : ""}</h3>`;
    if (headingKind === "atlas-shadow") return `<h3 style="${base}font-weight:900;"><span style="display:block;padding:0 5px 5px 0;text-shadow:2px 2px 0 ${state.pageColor},4px 4px 0 ${ghostAccent};">${main}</span>${sub ? `<span style="display:block;margin-top:12px;${quiet}">${label}</span>` : ""}</h3>`;
    return `<h3 style="${base}"><span style="display:block;font-weight:900;">${copyInlineMarkdown(first)}</span>${second ? `<span style="display:block;font-weight:300;letter-spacing:.1em;">${copyInlineMarkdown(second)}</span>` : ""}${sub ? `<span style="display:block;margin-top:12px;${quiet}">${label}</span>` : ""}</h3>`;
  };
  const cardBoxStyle = (kind, bgColor) => {
    const base = `margin:18px 0 22px;color:${state.textColor};font-size:${Math.max(12, state.fontSize - 1)}px;line-height:${state.lineHeight};text-align:${bodyAlign};`;
    if (isHardEdgeTheme(state.theme)) {
      const fill = bgColor && bgColor !== "transparent" ? bgColor : state.cardColor;
      return `${base}padding:${state.cardPadding}px;border:2px solid ${state.borderColor};border-radius:${state.cardRadius}px;background-color:${fill};box-shadow:4px 4px 0 ${state.borderColor};`;
    }
    if (kind === "outline") return `${base}padding:${state.cardPadding}px;border:${state.cardBorderWidth}px solid ${state.accentColor};border-radius:${state.cardRadius}px;background-color:transparent;`;
    if (kind === "soft") {
      const edge = state.theme === "nocturne" ? `border:1px solid ${state.borderColor};` : "border:0;";
      return `${base}padding:${state.cardPadding}px;${edge}border-radius:${state.cardRadius}px;background-color:${bgColor};`;
    }
    if (kind === "band") return `${base}padding:0 0 ${state.cardPadding}px;border:0;border-radius:${state.cardRadius}px;overflow:hidden;background-color:${bgColor};`;
    return `${base}padding:${state.cardPadding}px;border:0;border-left:${Math.max(3, state.cardBorderWidth + 2)}px solid ${state.accentColor};border-radius:0 ${state.cardRadius}px ${state.cardRadius}px 0;background-color:${bgColor};`;
  };
  const cardTitleStyle = (kind, size) => {
    if (kind === "band") return `display:block;margin:0 0 12px;padding:10px ${state.cardPadding}px;background-color:${state.accentColor};color:${state.pageColor};font-size:${size}px;letter-spacing:.1em;`;
    return `display:block;margin:0 0 7px;color:${state.cardTitleColor};font-size:${size}px;font-weight:700;letter-spacing:.1em;`;
  };
  const quoteStyle = cardBoxStyle(cardKind, state.quoteColor);
  const cardStyle = cardBoxStyle(cardKind, state.cardColor);
  const quoteTitleStyle = cardTitleStyle(cardKind, state.quoteTitleSize);
  const contentCardTitleStyle = cardTitleStyle(cardKind, state.cardTitleSize);
  const titleStyle = `margin:0 0 18px;color:${titleColor};font-size:${state.titleSize}px;line-height:${state.headingLineHeight};font-weight:${state.headingWeight};letter-spacing:-.04em;text-align:left;`;
  const imageBoxStyle = isHardEdgeTheme(state.theme)
    ? `margin:22px 0 26px;padding:48px 12px;text-align:center;border:2px solid ${state.borderColor};border-radius:${state.imageRadius}px;background-color:${state.highlightColor};box-shadow:4px 4px 0 ${state.borderColor};color:${titleColor};font-size:11px;font-weight:800;letter-spacing:.13em;`
    : isDeepNight
    ? `margin:22px 0 26px;padding:48px 12px;text-align:center;border:2px solid ${state.borderColor};border-radius:${state.imageRadius}px;background-color:${state.pageColor};color:${mutedColor};font-size:11px;font-weight:800;letter-spacing:.13em;`
    : `margin:22px 0 26px;padding:48px 12px;text-align:center;border-radius:${state.imageRadius}px;background-color:${state.accentColor};color:#ffffff;font-size:11px;font-weight:800;letter-spacing:.13em;`;
  const codeStyle = isHardEdgeTheme(state.theme)
    ? `margin:22px 0 26px;padding:${state.cardPadding}px;border:2px solid ${state.borderColor};border-radius:${state.cardRadius}px;background-color:${codeBackground};color:${codeColor};box-shadow:4px 4px 0 ${state.borderColor};font-size:${state.codeFontSize}px;line-height:${state.codeLineHeight};word-wrap:break-word;text-align:left;`
    : `margin:22px 0 26px;padding:${state.cardPadding}px;border-radius:${state.cardRadius}px;background-color:${codeBackground};color:${codeColor};font-size:${state.codeFontSize}px;line-height:${state.codeLineHeight};word-wrap:break-word;text-align:left;`;
  const listBase = Math.max(1, Number(state.listIndent) || 1.5);
  // 精选主题复制版：自动目录（取前 3 个二级标题，纯派生）。
  const tocHeadings = model.blocks
    .filter((block) => block.type === "heading" && Number(block.level || 2) === 2)
    .slice(0, 3);
  const tocFrame = isHardEdgeTheme(state.theme)
    ? `border:2px solid ${state.borderColor};border-radius:${state.cardRadius}px;box-shadow:4px 4px 0 ${state.borderColor};`
    : "border:1px solid " + state.borderColor + ";border-radius:10px;";
  const tocHtmlBlock = isTheme() && tocHeadings.length >= 2
    ? `<section style="margin:0 0 30px;padding:16px 18px;${tocFrame}background-color:${state.cardColor};text-align:left;"><p style="margin:0 0 10px;color:${mutedColor};font-size:10px;font-weight:800;letter-spacing:.25em;text-align:left;">本文脉络</p>${tocHeadings.map((block, index) =>
      `<p style="margin:0 0 8px;text-align:left;"><span style="display:inline-block;min-width:24px;color:${state.accentColor};font-size:12px;font-weight:800;">${String(index + 1).padStart(2, "0")}</span><span style="color:${titleColor};font-size:13px;font-weight:600;">${escapeHtml(block.text)}</span></p>`).join("")}</section>`
    : "";
  const signatureHtmlBlock = isTheme() && state.showSignature
    ? `<section style="margin:28px 0 0;padding:20px 0 0;border-top:1px solid ${state.dividerColor};text-align:right;"><p style="margin:0;color:${titleColor};font-size:14px;font-weight:700;text-align:right;">—— {{作者名}}</p></section>`
    : "";
  // 精选主题的引导段（引言卡）内联版，与 styles.css 的 data-theme 盖层保持一致。
  const themeLeadStyle = (baseTextStyle) => {
    const t = isTheme() ? state.theme : "classic";
    const base = `${baseTextStyle}text-indent:0;`;
    if (t === "fresh") return `${base}padding:20px 22px;margin-bottom:26px;border:1.5px solid ${colorWithAlpha(state.accentColor, 0.18)};border-radius:16px;background-color:${state.cardColor};color:${titleColor};font-weight:650;`;
    if (t === "mono") return `${base}padding:0 0 18px;margin-bottom:24px;border-bottom:1px solid ${state.dividerColor};color:${titleColor};font-weight:600;`;
    if (t === "serene") return `${base.replace(/text-align\s*:\s*[^;]+;?/gi, "")}padding:34px 16px;margin:8px 0 44px;border-top:1px solid ${state.dividerColor};border-bottom:1px solid ${state.dividerColor};text-align:center;color:${titleColor};font-size:${Math.round(state.headingSize * 0.72)}px;font-weight:600;line-height:1.85;`;
    if (t === "stub") return `${base}padding:20px 22px;margin-bottom:26px;border:1.5px solid ${state.accentColor};border-radius:12px;background-color:${state.pageColor};box-shadow:0 6px 18px -8px ${colorWithAlpha(state.accentColor, 0.55)};color:${titleColor};font-weight:700;`;
    if (t === "editorial") return `${base}padding:16px 18px;margin-bottom:22px;border-left:4px solid #1e1f23;border-radius:0 6px 6px 0;background-color:${state.cardColor};color:${titleColor};font-weight:650;`;
    if (t === "nocturne") return `${base}margin-bottom:22px;color:${state.accentColor};font-weight:700;`;
    if (isHardEdgeTheme(t)) {
      const leadFill = t === "grunge" || t === "bauhaus" ? state.cardColor : t === "newsprint" ? state.quoteColor : state.highlightColor;
      return `${base}padding:16px 18px;margin-bottom:26px;border:2px solid ${state.borderColor};border-radius:${state.cardRadius}px;background-color:${leadFill};box-shadow:4px 4px 0 ${state.borderColor};color:${titleColor};font-weight:800;`;
    }
    return `${baseTextStyle}color:${state.accentColor};font-weight:750;`;
  };
  // 精选主题分隔线：票据卡用虚线装订，静山加大留白，其余沿用通用分隔线。
  const themeDividerHtml = () => {
    const t = isTheme() ? state.theme : "classic";
    if (t === "stub") return `<section style="margin:34px 0 30px;border-top:2px dashed ${state.dividerColor};text-align:left;"></section>`;
    if (t === "citrus") return `<section style="margin:32px 0 28px;border-top:2px solid ${state.borderColor};text-align:left;"></section>`;
    if (t === "serene") return `<section style="margin:56px 0;border-top:1px solid ${state.dividerColor};text-align:left;"></section>`;
    return `<section style="margin:${state.dividerMargin}px 0;border-top:${state.dividerThickness}px solid ${state.dividerColor};text-align:left;"></section>`;
  };
  let body = model.blocks.map((item) => {
    if (item.type === "lead") {
      return `<p data-yooco-lead="1" style="${themeLeadStyle(textStyle)}">${copyInlineMarkdown(item.text)}</p>`;
    }
    if (item.type === "highlight" && isDeepNight) return `<p style="${textStyle}"><span style="${highlightCss}">${copyInlineMarkdown(item.text)}</span></p>`;
    if (item.type === "heading") {
      const level = Number(item.level) || 2;
      const parts = splitHeadingCaption(item.text);
      const sub = parts.sub || "SECTION";
      if (level === 2 && ATLAS_HEADING_STYLES.includes(headingKind)) return atlasCopyHeading(item);
      if (level === 2 && headingKind === "poster") {
        const prefix = headingPrefix(level);
        const title = `${parts.title}${parts.title.endsWith("#") ? "" : "#"}`;
        return `<h3 style="${headingStyle(level)}">${prefix}<span style="display:block;margin:0 0 4px;">${copyInlineMarkdown(title)}</span><span style="display:block;color:${state.textColor};font-size:${Math.max(12, Math.round(getHeadingSize(2) * 0.42))}px;font-weight:700;letter-spacing:.12em;">${escapeHtml(sub)}</span></h3>`;
      }
      if (level === 2 && headingKind === "panel") {
        const prefix = headingPrefix(level);
        return `<h3 style="${headingStyle(level)}">${prefix}<span style="display:inline-block;vertical-align:middle;"><span style="display:inline-block;padding:6px 12px;background-color:${state.textColor};color:${state.pageColor};font-size:${Math.max(14, Math.round(getHeadingSize(2) * 0.72))}px;font-weight:800;line-height:1.25;">${copyInlineMarkdown(parts.title)}</span><br/><span style="display:inline-block;margin-top:6px;color:${state.textColor};font-size:${Math.max(11, Math.round(getHeadingSize(2) * 0.38))}px;font-weight:700;letter-spacing:.14em;">${escapeHtml(sub)}</span></span></h3>`;
      }
      if (level === 2 && headingKind === "oval") {
        return `<h3 style="${headingStyle(level)}">${headingPrefix(level)}<span style="display:block;">${copyInlineMarkdown(parts.title)}</span></h3>`;
      }
      return `<h3 style="${headingStyle(level)}">${headingPrefix(level)}${copyInlineMarkdown(item.text)}</h3>`;
    }
    if (item.type === "paragraph") return `<p style="${textStyle}">${copyInlineMarkdown(item.text)}</p>`;
    if (item.type === "quote") {
      if (state.showQuote) return `<section style="${quoteStyle}"><p style="margin:0 0 7px;padding:0;text-align:${bodyAlign};${quoteTitleStyle}">${escapeHtml(item.title || "引用")}</p><p style="margin:0;padding:${cardKind === "band" ? `0 ${state.cardPadding}px` : "0"};color:${state.textColor};text-align:${bodyAlign};">${copyInlineMarkdown(item.text)}</p></section>`;
      return `<p style="${textStyle}font-style:italic;">${copyInlineMarkdown(item.text)}</p>`;
    }
    if (item.type === "card") return `<section style="${cardStyle}"><p style="margin:0 0 7px;padding:0;text-align:${bodyAlign};${contentCardTitleStyle}">${escapeHtml(item.title || "重点提示")}</p><p style="margin:0;padding:${cardKind === "band" ? `0 ${state.cardPadding}px` : "0"};color:${state.textColor};text-align:${bodyAlign};">${copyInlineMarkdown(item.text)}</p></section>`;
    if (item.type === "steps") {
      const title = escapeHtml(item.title || "操作步骤");
      const rows = (item.items || []).map((entry, index) => {
        const n = index + 1;
        const badge = `<span style="display:inline-block;min-width:28px;margin-right:10px;color:${softAccent};font-size:${Math.round(state.fontSize * 1.15)}px;font-weight:${state.headingWeight};">${String(n).padStart(2, "0")}</span>`;
        return `<p style="margin:0 0 ${state.listItemSpacing}px;padding:0;color:${state.textColor};font-size:${state.fontSize}px;line-height:${state.lineHeight};text-align:${bodyAlign};">${badge}<span>${copyInlineMarkdown(entry)}</span></p>`;
      }).join("");
      return `<section style="${cardBoxStyle("soft", state.cardColor)}"><p style="margin:0 0 12px;padding:0;text-align:${bodyAlign};${contentCardTitleStyle}">${title}</p>${rows}</section>`;
    }
    if (item.type === "stat") {
      const title = escapeHtml(item.title || "关键数据");
      const cells = (item.items || []).map((entry) => {
        const value = escapeHtml(entry.value || "");
        const label = escapeHtml(entry.label || "");
        return `<section style="display:inline-block;width:46%;margin:6px 2% 8px 0;vertical-align:top;text-align:center;"><p style="margin:0;padding:0;color:${state.accentColor};font-size:${Math.max(22, state.headingSize - 2)}px;font-weight:${state.headingWeight};line-height:1.2;text-align:center;">${value}</p><p style="margin:4px 0 0;padding:0;color:${mutedColor};font-size:${Math.max(11, state.captionSize)}px;line-height:1.5;text-align:center;">${label}</p></section>`;
      }).join("");
      return `<section style="${cardBoxStyle("outline", state.cardColor)}"><p style="margin:0 0 12px;padding:0;text-align:${bodyAlign};${contentCardTitleStyle}">${title}</p><section style="margin:0;padding:0;text-align:left;">${cells}</section></section>`;
    }
    if (item.type === "divider" && state.showDivider) return themeDividerHtml();
    if (item.type === "image") {
      if (item.url) {
        const meta = getCopyImageMeta(item.url);
        const dataAttrs = meta
          ? ` data-w="${meta.width}"${meta.ratio ? ` data-ratio="${meta.ratio}"` : ""}`
          : "";
        return `<section style="margin:22px 0 26px;text-align:center;"><img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.alt)}"${dataAttrs} style="display:block;width:100%;max-width:100%;height:auto;margin:0 auto;border-radius:${state.imageRadius}px;" /><p style="margin:7px 0 0;color:${mutedColor};font-size:${state.captionSize}px;line-height:1.6;text-align:center;">${escapeHtml(item.alt || "文章配图")}</p></section>`;
      }
      if (state.showImage) {
        return `<section style="${imageBoxStyle}"><p style="margin:0;color:inherit;text-align:center;">${escapeHtml(item.alt || "图片待补")}</p></section>`;
      }
      return `<p style="${textStyle}color:${mutedColor};">[图片：${escapeHtml(item.alt || "待补")}]</p>`;
    }
    if (item.type === "list") {
      const marker = (ordered, index) => {
        const n = index + 1;
        if (ordered) {
          if (listKind === "circle") {
            const circleInk = state.theme === "citrus" ? titleColor : state.pageColor;
            const circleEdge = isHardEdgeTheme(state.theme) ? `border:2px solid ${state.borderColor};` : "";
            return `<span style="display:inline-block;box-sizing:border-box;width:22px;height:22px;line-height:18px;text-align:center;border-radius:50%;background-color:${state.accentColor};${circleEdge}color:${circleInk};font-size:${Math.max(11, state.fontSize - 4)}px;font-weight:800;margin-right:8px;">${n}</span>`;
          }
          if (listKind === "ghost") return `<span style="display:inline-block;min-width:30px;color:${ghostAccent};font-size:${Math.round(state.fontSize * 1.4)}px;font-weight:${state.headingWeight};vertical-align:-2px;margin-right:6px;">${String(n).padStart(2, "0")}</span>`;
          if (listKind === "check") return `<span style="color:${state.accentColor};font-weight:800;margin-right:8px;">→</span>`;
          return `<span style="color:${state.accentColor};font-weight:700;margin-right:6px;">${n}.</span>`;
        }
        if (listKind === "circle") return `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:${state.accentColor};margin:0 10px 2px 2px;vertical-align:middle;"></span>`;
        if (listKind === "ghost") return `<span style="color:${ghostAccent};margin-right:8px;">—</span>`;
        if (listKind === "check") return `<span style="color:${state.accentColor};font-weight:800;margin-right:8px;">✓</span>`;
        return `<span style="color:${state.accentColor};margin-right:6px;">•</span>`;
      };
      const itemStyleFor = (depth) => {
        const pad = depth ? (listBase + depth * 1.25).toFixed(2) : listBase;
        return `margin:0 0 ${state.listItemSpacing}px;padding-left:${pad}em;color:${state.textColor};font-size:${state.fontSize}px;line-height:${state.lineHeight};letter-spacing:${state.letterSpacing}px;text-align:left;text-indent:0;`;
      };
      const renderNodes = (nodes, ordered, depth) => (nodes || []).map((node, index) => {
        const nested = groupListChildren(node.children).map((group) => renderNodes(group.nodes, group.ordered, depth + 1)).join("");
        return `<p style="${itemStyleFor(depth)}">${marker(ordered, index)}<span>${copyInlineMarkdown(node.text)}</span></p>${nested}`;
      }).join("");
      const itemsHtml = renderNodes(nestListItems(item.items), Boolean(item.ordered), 0);
      return `<section style="margin:0 0 ${state.paragraphSpacing}px;text-align:left;">${itemsHtml}</section>`;
    }
    if (item.type === "table") {
      const border = state.dividerColor || state.borderColor || "#dedfd8";
      const tableStyle = `width:100%;border-collapse:collapse;margin:0 0 ${state.paragraphSpacing}px;color:${state.textColor};font-size:${state.fontSize}px;line-height:${state.lineHeight};text-align:left;`;
      const cellBase = `border:1px solid ${border};padding:8px 10px;line-height:${state.lineHeight};font-size:${state.fontSize}px;`;
      const headers = item.headers || [];
      const aligns = item.aligns || [];
      const alignOf = (index) => (aligns[index] === "center" || aligns[index] === "right" ? aligns[index] : "left");
      const head = headers.map((cell, index) => `<th style="${cellBase}background-color:${state.cardColor};color:${titleColor};font-weight:700;text-align:${alignOf(index)};">${copyInlineMarkdown(cell)}</th>`).join("");
      const rows = (item.rows || []).map((row) => `<tr>${(row || []).map((cell, index) => `<td style="${cellBase}background-color:${state.pageColor};color:${state.textColor};font-weight:400;text-align:${alignOf(index)};">${copyInlineMarkdown(cell)}</td>`).join("")}</tr>`).join("");
      return `<table style="${tableStyle}"><thead><tr>${head}</tr></thead>${rows ? `<tbody>${rows}</tbody>` : ""}</table>`;
    }
    if (item.type === "code") {
      return `<section style="${codeStyle}"><p style="margin:0;padding:0;color:${codeColor};font-size:${state.codeFontSize}px;line-height:${state.codeLineHeight};text-align:left;">${formatCodeForWechat(item.text)}</p></section>`;
    }
    return "";
  });
  if (tocHtmlBlock) {
    const leadIndex = body.findIndex((part) => part.includes('data-yooco-lead="1"'));
    body.splice(leadIndex >= 0 ? leadIndex + 1 : 0, 0, tocHtmlBlock);
  }
  body = body.map((part) => part.replace(' data-yooco-lead="1"', ""));
  if (signatureHtmlBlock) body.push(signatureHtmlBlock);
  const bodyHtml = body.join("");
  const titleHtml = model.title ? `<h2 style="${titleStyle}">${escapeHtml(model.title)}</h2>` : "";
  // 外层留白对齐工作室预览（.article-page 上下 40px，左右落在 24–40px）。浅色也用同一圈，避免只有深色突然变宽。
  // 深色再给最小高度，公众号后台白壳里炭黑块才不会贴边缩成一条。对齐仍写 left，不用 start/end。
  const frameStyle = isDarkCopyPage() ? "padding:40px 32px;min-height:240px;" : "padding:40px 32px;";
  let html = `<section style="width:100%;max-width:100%;margin:0;${frameStyle}background-color:${state.pageColor};color:${state.textColor};font-size:${state.fontSize}px;line-height:${state.lineHeight};text-align:left;">${titleHtml}${bodyHtml}</section>`;
  if (lockBrandColor?.checked) html = applyDataNoDark(html);
  return stripLogicalTextAlign(html);
}

function darkCopyHint() {
  if (!isDarkCopyPage()) return "";
  const brand = lockBrandColor && !lockBrandColor.checked ? "建议勾选「保留品牌色」。" : "";
  return `后台预览区可能仍白底，以正文炭黑块为准。${brand}`;
}

function buildCopyPlain(html) {
  const model = getArticleModel();
  const blocks = model.blocks.map((item) => {
    if (item.type === "list") return (item.items || []).map((entry) => `${entry && typeof entry === "object" && entry.depth ? "  " : ""}${listItemText(entry)}`).filter((line) => line.trim()).join("\n");
    if (item.type === "table") {
      const head = (item.headers || []).join(" | ");
      const rows = (item.rows || []).map((row) => (row || []).join(" | "));
      return [head, ...rows].filter(Boolean).join("\n");
    }
    if (item.type === "steps") return [item.title, ...(item.items || [])].filter(Boolean).join("\n");
    if (item.type === "stat") return [item.title, ...(item.items || []).map((entry) => `${entry.value || ""}${entry.label ? ` ${entry.label}` : ""}`)].filter(Boolean).join("\n");
    if (item.type === "divider") return "——";
    if (item.type === "image") return [item.alt || "文章配图", item.url].filter(Boolean).join(" ");
    if (["quote", "card"].includes(item.type)) return [item.title, item.text].filter(Boolean).join("：");
    return item.text || "";
  }).filter(Boolean);
  return [model.title, ...blocks].filter(Boolean).join("\n\n") || html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function copyHtmlWithExecCommand(html, plain) {
  const safeHtml = stripLogicalTextAlign(html);
  const holder = document.createElement("section");
  holder.contentEditable = "true";
  holder.innerHTML = safeHtml;
  holder.style.cssText = "position:fixed;left:-10000px;top:0;width:640px;height:auto;opacity:0;";
  document.body.appendChild(holder);
  holder.focus();
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(holder);
  selection.removeAllRanges();
  selection.addRange(range);
  // 浏览器复制时会把没写对齐的块算成 text-align:start。这里改用我们自己的 HTML。
  const onCopy = (event) => {
    if (!event.clipboardData) return;
    event.preventDefault();
    event.clipboardData.setData("text/html", safeHtml);
    event.clipboardData.setData("text/plain", plain || "");
  };
  document.addEventListener("copy", onCopy, true);
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } finally {
    document.removeEventListener("copy", onCopy, true);
    selection.removeAllRanges();
    holder.remove();
  }
  return copied;
}

async function copyRichText() {
  if (!articleSource.trim()) {
    setFeedback("还没有可复制的排版");
    return;
  }
  flushPendingPreviewEdits();
  updateCompliancePanel();
  const report = getComplianceReport();
  const html = buildCopyHtml();
  const plain = buildCopyPlain(html);
  const tips = report.items
    .filter((item) => item.severity === "risk" || item.severity === "warn")
    .slice(0, 3)
    .map((item) => item.title);
  try {
    const copied = copyHtmlWithExecCommand(html, plain);
    if (!copied) {
      if (!window.ClipboardItem || !navigator.clipboard?.write) throw new Error("copy-unsupported");
      const safeHtml = stripLogicalTextAlign(html);
      await navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([safeHtml], { type: "text/html" }), "text/plain": new Blob([plain], { type: "text/plain" }) })]);
    }
    const darkHint = darkCopyHint();
    let copiedMessage = tips.length ? "已复制 · 发布前请检查提醒" : "已复制";
    if (darkHint) {
      copiedMessage = tips.length
        ? `已复制。${darkHint}发布前请检查提醒。`
        : `已复制。${darkHint}`;
    }
    setFeedback(copiedMessage);
    setStatus("文章已复制，可粘贴到公众号发布页。");
  } catch {
    setFeedback("复制失败，请检查剪贴板权限");
  }
  window.setTimeout(() => { setFeedback(""); }, (tips.length || isDarkCopyPage()) ? 8000 : 5000);
}

function exportConfig() {
  flushPendingPreviewEdits();
  const payload = {
    version: 3,
    updatedAt: new Date().toISOString(),
    template: { type: "universal", name: isTheme()
      ? `精选主题 · ${THEMES[state.theme].label}`
      : `${MOODS[currentMood].label} · ${SKINS[currentSkin].label}`, params: { ...getTemplateParams(), mood: currentMood, skin: currentSkin } },
    article: { source: articleSource, title: articleTitleOverride },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = articleSource ? "yooco-article-layout.json" : "wechat-style-template.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

function applyStoredParams(incoming) {
  const allowed = Object.keys(TEMPLATE_DEFAULTS);
  const normalized = normalizeTemplateParams(incoming);
  const importedTheme = THEMES[normalized.theme] ? normalized.theme : "";
  const retiredTheme = Boolean(incoming?.theme && incoming.theme !== "classic" && !THEMES[incoming.theme]);
  if (retiredTheme) {
    currentSkin = DEFAULT_SKIN;
    currentMood = DEFAULT_MOOD;
    Object.assign(state, buildSkinState(DEFAULT_SKIN));
  } else if (importedTheme) {
    Object.assign(state, buildThemeState(importedTheme));
    allowed.forEach((key) => { if (incoming[key] !== undefined) state[key] = normalized[key]; });
    state.theme = importedTheme;
  } else {
    const importedSkin = SKINS[normalized.skin] ? normalized.skin
      : SKINS[incoming?.skin] ? incoming.skin : "";
    if (importedSkin) {
      currentSkin = importedSkin;
      currentMood = skinMood(importedSkin);
      Object.assign(state, buildSkinState(importedSkin));
    }
    state.theme = "classic";
    allowed.forEach((key) => { if (incoming[key] !== undefined) state[key] = normalized[key]; });
  }
  return retiredTheme;
}

function importConfig(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(String(reader.result));
      const incoming = payload.template?.params || payload.params || payload;
      const retiredTheme = applyStoredParams(incoming);
      if (typeof payload.article?.source === "string") {
        articleSource = payload.article.source;
        articleTitleOverride = typeof payload.article.title === "string" ? payload.article.title : "";
        blockTypeOverrides = {};
        if (articleInput) articleInput.value = articleSource;
        persistArticleSource();
      }
      styleTouched = true;
      syncMoodUI();
      syncControls();
      render();
    copyFeedback.textContent = retiredTheme ? "原主题已移除，已切换为经典主题。" : "配置已导入。";
    } catch {
      copyFeedback.textContent = "配置文件无法读取，请检查 JSON 格式。";
    }
  };
  reader.readAsText(file);
}

function persistArticleSource() {
  try {
    if (articleSource) localStorage.setItem("yooco-article-source", articleSource);
    else localStorage.removeItem("yooco-article-source");
    if (articleTitleOverride) localStorage.setItem("yooco-article-title", articleTitleOverride);
    else localStorage.removeItem("yooco-article-title");
    localStorage.setItem("yooco-infer-first-line-title", String(inferFirstLineTitle));
    localStorage.setItem("yooco-block-type-overrides", JSON.stringify(blockTypeOverrides));
  } catch {
    if (copyFeedback) copyFeedback.textContent = "图片已显示。文章太大，刷新后可能丢失。";
  }
}

function trimInvalidOverrides() {
  const blockLength = parseArticle(articleSource).blocks.length;
  Object.keys(blockTypeOverrides).forEach((index) => {
    if (Number(index) >= blockLength) delete blockTypeOverrides[index];
  });
}

function applyArticleSource(showStatus = true) {
  if (articleInput) {
    const incoming = articleInput.value.trim();
    if (incoming !== articleSource) articleSource = incoming;
  }
  trimInvalidOverrides();
  persistArticleSource();
  if (articleSource) {
    const model = parseArticle(articleSource);
    setStatus(`已更新 ${model.blocks.length} 个内容块`);
    showOptimizeHint("");
  } else {
    setStatus("");
  }
  if (showStatus) setFeedback(articleSource ? "预览已更新" : "");
  render();
}

function clearArticleSource() {
  if (articleInput) articleInput.value = "";
  articleSource = "";
  articleTitleOverride = "";
  blockTypeOverrides = {};
  lastAiResult = null;
  persistArticleSource();
  setStatus("");
  setFeedback("");
  render();
}

function splitLongTextLine(line) {
  const sentenceCandidates = line.match(/[^。！？!?；;]+[。！？!?；;]?/g) || [line];
  const sentences = sentenceCandidates.flatMap((sentence) => {
    if (sentence.length <= 108) return [sentence];
    const pieces = [];
    let remaining = sentence;
    while (remaining.length > 108) {
      const windowText = remaining.slice(0, 96);
      const separator = Math.max(windowText.lastIndexOf("，"), windowText.lastIndexOf(","), windowText.lastIndexOf("、"), windowText.lastIndexOf("："), windowText.lastIndexOf(":"));
      const cutAt = separator >= 52 ? separator + 1 : 88;
      pieces.push(remaining.slice(0, cutAt));
      remaining = remaining.slice(cutAt);
    }
    if (remaining) pieces.push(remaining);
    return pieces;
  });
  const segments = [];
  let current = "";
  sentences.forEach((sentence) => {
    const candidate = `${current}${sentence}`;
    if (current && candidate.length > 96 && current.length >= 46) {
      segments.push(current.trim());
      current = sentence;
    } else {
      current = candidate;
    }
  });
  if (current.trim()) segments.push(current.trim());
  return segments.join("\n\n");
}

function autoSegmentArticle() {
  const raw = (articleInput ? articleInput.value : articleSource).trim();
  if (!raw) {
    copyFeedback.textContent = "请先粘贴文章，再使用智能分段。";
    return;
  }
  let inCode = false;
  const structured = raw.replace(/\r\n?/g, "\n").split("\n").map((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      inCode = !inCode;
      return line;
    }
    const isMarkdownBlock = /^(#{1,6}\s|>\s?|[-*+]\s+|!\[|---+$|\*\*\*+$)/.test(trimmed);
    if (inCode || isMarkdownBlock || line.length < 96) return line;
    return splitLongTextLine(line);
  }).join("\n");
  if (articleInput) articleInput.value = structured;
  else articleSource = structured;
  blockTypeOverrides = {};
  lastAiResult = null;
  applyArticleSource(false);
  copyFeedback.textContent = "已分段";
}

function clipboardImageFiles(data) {
  const allowed = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);
  const fromItems = Array.from(data?.items || [])
    .filter((item) => item.kind === "file" && allowed.has(item.type))
    .map((item) => item.getAsFile())
    .filter(Boolean);
  if (fromItems.length) return fromItems;
  return Array.from(data?.files || []).filter((file) => allowed.has(file.type));
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function handleRichTextPaste(event) {
  const data = event.clipboardData;
  const files = clipboardImageFiles(data);
  const inPreview = Boolean(articleBody?.contains(event.target));
  const html = data?.getData("text/html") || "";
  const hasHtml = Boolean(html && /<[a-z][\s\S]*>/i.test(html));
  if (inPreview && !files.length) return;
  if (!files.length && !hasHtml) return;
  event.preventDefault();
  const pieces = [];
  let markdown = "";
  if (hasHtml) {
    markdown = htmlToMarkdown(html);
    if (markdown) pieces.push(markdown);
  } else {
    const plain = (data?.getData("text/plain") || "").trim();
    if (plain) pieces.push(plain);
  }
  const htmlAlreadyHasImage = /!\[[^\]]*\]\(https?:\/\//.test(markdown);
  let pastedImage = false;
  if (!htmlAlreadyHasImage) {
    for (const file of files) {
      if (file.size > EMBEDDED_IMAGE_MAX_BYTES) {
        copyFeedback.textContent = "这张图片太大，没有贴进文章";
        continue;
      }
      const url = embeddedImageUrl(await readImageFile(file));
      if (!url) continue;
      pieces.push(`![文章配图](${url})`);
      pastedImage = true;
    }
  }
  if (!pieces.length) return;
  const append = Boolean(articleBody?.contains(event.target));
  if (append) flushPendingPreviewEdits();
  insertMarkdownAtCursor(pieces.join("\n\n"), { append });
  copyFeedback.textContent = pastedImage ? "已贴入图片" : "已转换";
}

controls.forEach((control) => {
  const updateControl = () => {
    const key = control.dataset.key;
    state[key] = control.type === "checkbox" ? control.checked : control.type === "range" ? Number(control.value) : control.value;
    if (key === "readingDensity" && state.readingDensity !== "custom") applyReadingDensity(state.readingDensity);
    else if (["fontSize", "lineHeight", "paragraphSpacing"].includes(key)) state.readingDensity = "custom";
    styleTouched = true;
    syncControls();
    render({ body: ["showQuote", "showDivider", "showImage", "showSignature", "highlightStyle", "headingStyle", "cardStyle", "listStyle", "bodyFont", "headingFont"].includes(key) });
  };
  control.addEventListener("input", updateControl);
  if (control.tagName === "SELECT") control.addEventListener("change", updateControl);
});
document.querySelector("#resetButton").addEventListener("click", () => {
  Object.assign(state, buildSkinState(DEFAULT_SKIN));
  state.theme = "classic";
  state.articleType = "auto";
  currentMood = DEFAULT_MOOD;
  currentSkin = DEFAULT_SKIN;
  styleTouched = false;
  awaitingContentPick = true;
  syncMoodUI();
  syncControls();
  render();
  setFeedback("已恢复默认");
});
document.querySelector("#copyButton").addEventListener("click", copyRichText);
document.querySelector("#exportButton").addEventListener("click", exportConfig);
document.querySelector("#importInput").addEventListener("change", (event) => importConfig(event.target.files?.[0]));
darkPreviewToggle?.addEventListener("change", () => {
  previewStage?.classList.toggle("is-dark-preview", Boolean(darkPreviewToggle.checked));
  updateCompliancePanel();
});
lockBrandColor?.addEventListener("change", () => {
  localStorage.setItem("yooco-lock-brand-color", lockBrandColor.checked ? "1" : "0");
  updateCompliancePanel();
});
if (lockBrandColor) lockBrandColor.checked = localStorage.getItem("yooco-lock-brand-color") === "1";
aiNormalizeButton?.addEventListener("click", normalizeWithDeepSeek);
document.querySelector("#sampleTryButton")?.addEventListener("click", loadSampleTry);
articleInput?.addEventListener("paste", handleRichTextPaste);
articleBody?.addEventListener("paste", handleRichTextPaste);
articleInput?.addEventListener("input", () => {
  articleTitleOverride = "";
  applyArticleSource(false);
});

const editorViewTabs = [document.querySelector("#resultViewTab"), document.querySelector("#sourceViewTab")];
function selectEditorView(index) {
  flushPendingPreviewEdits();
  const showSource = index === 1;
  if (showSource && articleInput) articleInput.value = articleSource;
  document.querySelector("#sourcePanel").hidden = !showSource;
  previewStage.hidden = showSource;
  editorViewTabs.forEach((tab, tabIndex) => {
    tab.setAttribute("aria-selected", String(tabIndex === index));
    tab.tabIndex = tabIndex === index ? 0 : -1;
  });
  scheduleHumanizeFloat();
}
editorViewTabs.forEach((tab, index) => {
  tab?.addEventListener("click", () => selectEditorView(index));
  tab?.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? 1 : 1 - index;
    selectEditorView(next);
    editorViewTabs[next].focus();
  });
});
articleTitle.addEventListener("keydown", (event) => {
  if (event.key === "Enter") event.preventDefault();
});
articleTitle.addEventListener("input", () => {
  window.clearTimeout(previewSyncTimer);
  previewSyncTimer = window.setTimeout(() => { previewSyncTimer = 0; syncPreviewEdits(); }, 200);
});
articleBody.addEventListener("input", () => {
  window.clearTimeout(previewSyncTimer);
  previewSyncTimer = window.setTimeout(() => { previewSyncTimer = 0; syncPreviewEdits(); }, 200);
});
const STRUCTURE_MENU_TYPES = new Set(["paragraph", "lead", "heading", "quote", "card", "divider"]);
let blockTypeMenu = null;
let blockTypeMenuIndex = null;

function ensureBlockTypeMenu() {
  if (blockTypeMenu) return blockTypeMenu;
  const menu = document.createElement("div");
  menu.id = "blockTypeMenu";
  menu.className = "block-type-menu";
  menu.hidden = true;
  menu.setAttribute("role", "menu");
  menu.innerHTML = [
    `<p class="block-type-menu-label">改为</p>`,
    ...STRUCTURE_TYPE_OPTIONS.map(([type, label]) =>
      `<button type="button" class="block-type-menu-item" role="menuitem" data-type="${type}">${label}</button>`),
  ].join("");
  document.body.appendChild(menu);
  menu.addEventListener("click", (event) => {
    const button = event.target.closest("[data-type]");
    if (!button || blockTypeMenuIndex == null) return;
    applyBlockTypeFromMenu(blockTypeMenuIndex, button.dataset.type);
  });
  blockTypeMenu = menu;
  return menu;
}

function hideBlockTypeMenu() {
  if (!blockTypeMenu) return;
  blockTypeMenu.hidden = true;
  blockTypeMenuIndex = null;
  articleBody?.querySelector(".is-block-menu-target")?.classList.remove("is-block-menu-target");
}

function showBlockTypeMenu(clientX, clientY, blockEl) {
  const menu = ensureBlockTypeMenu();
  const currentType = blockEl.dataset.type || "";
  blockTypeMenuIndex = Number(blockEl.dataset.blockIndex);
  articleBody.querySelectorAll(".is-block-menu-target").forEach((el) => el.classList.remove("is-block-menu-target"));
  blockEl.classList.add("is-block-menu-target");
  menu.querySelectorAll(".block-type-menu-item").forEach((button) => {
    const active = button.dataset.type === currentType;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-current", active ? "true" : "false");
  });
  menu.hidden = false;
  const pad = 8;
  const rect = menu.getBoundingClientRect();
  const left = Math.min(clientX, window.innerWidth - rect.width - pad);
  const top = Math.min(clientY, window.innerHeight - rect.height - pad);
  menu.style.left = `${Math.max(pad, left)}px`;
  menu.style.top = `${Math.max(pad, top)}px`;
}

function applyBlockTypeFromMenu(sourceIndex, type) {
  hideBlockTypeMenu();
  if (!STRUCTURE_TYPE_OPTIONS.some(([option]) => option === type)) return;
  const label = STRUCTURE_TYPE_OPTIONS.find(([option]) => option === type)?.[1] || type;
  blockTypeOverrides[sourceIndex] = type;
  persistArticleSource();
  render();
  syncPreviewEdits();
  blockTypeOverrides = {};
  persistArticleSource();
  setStatus(`已改为「${label}」`);
}

articleBody.addEventListener("contextmenu", (event) => {
  const blockEl = event.target.closest("[data-block-index][data-type]");
  if (!blockEl || !articleBody.contains(blockEl)) return;
  if (!STRUCTURE_MENU_TYPES.has(blockEl.dataset.type)) return;
  event.preventDefault();
  showBlockTypeMenu(event.clientX, event.clientY, blockEl);
});

document.addEventListener("pointerdown", (event) => {
  if (!blockTypeMenu || blockTypeMenu.hidden) return;
  if (blockTypeMenu.contains(event.target)) return;
  hideBlockTypeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") hideBlockTypeMenu();
});

previewStage?.addEventListener("scroll", hideBlockTypeMenu, { passive: true });
window.addEventListener("resize", hideBlockTypeMenu);

const saved = localStorage.getItem("wechat-style-lab-config");
if (saved) {
  try {
    const stored = JSON.parse(saved);
    const storedTheme = THEMES[stored.theme] ? stored.theme : "";
    if (stored.theme && stored.theme !== "classic" && !THEMES[stored.theme]) {
      // 已下线的精选主题不恢复旧配色；首次渲染会将默认经典主题写回本地。
      Object.assign(state, buildSkinState(DEFAULT_SKIN));
    } else if (storedTheme) {
      // 精选主题：恢复整套主题参数 + 用户微调。
      Object.assign(state, buildThemeState(storedTheme));
      Object.assign(state, normalizeTemplateParams(stored, state));
      state.theme = storedTheme;
      styleTouched = true;
    } else {
      let storedSkin = SKINS[stored.skin] ? stored.skin : "";
      if (!storedSkin) {
        try {
          const moodSaved = JSON.parse(localStorage.getItem("yooco-style-mood") || "{}");
          if (SKINS[moodSaved.skin]) storedSkin = moodSaved.skin;
        } catch { /* no mood record */ }
      }
      if (storedSkin) {
        // 新版：皮肤 + 用户微调都恢复，并视为用户已手动定调。
        currentSkin = storedSkin;
        currentMood = skinMood(storedSkin);
        Object.assign(state, buildSkinState(storedSkin));
        Object.assign(state, normalizeTemplateParams(stored, state));
        styleTouched = true;
      } else {
        // 旧版配置（无皮肤记录）：颜色作废，只保留字号等非颜色阅读偏好。
        const legacy = normalizeTemplateParams(stored, state);
        ["fontSize", "lineHeight", "letterSpacing", "paragraphSpacing", "contentWidth",
          "titleSize", "headingSize", "subheadingSize", "minorHeadingSize", "headingWeight",
          "headingLineHeight", "headingSpacingBefore", "headingSpacingAfter",
          "bodyFont", "headingFont", "textAlign", "textIndent", "readingDensity"].forEach((key) => {
          if (stored[key] !== undefined) state[key] = legacy[key];
        });
      }
      state.theme = "classic";
    }
    syncMoodUI();
  } catch { /* ignore stale local config */ }
}
if (articleInput) articleInput.value = articleSource;
if (articleSource) setStatus(`已载入上次文章：${parseArticle(articleSource).blocks.length} 个内容块`);
renderMoodUI();
syncControls();
render();

try {
  if (localStorage.getItem("yooco-auto-optimize") === "1") {
    localStorage.removeItem("yooco-auto-optimize");
    if (articleSource.trim()) {
      queueMicrotask(() => {
        normalizeWithDeepSeek();
      });
    }
  }
} catch { /* ignore */ }

renderTrialMeter();
refreshTrialFromServer();
showLocalAccount();

function historyThemeLabel() {
  if (isTheme() && THEMES[state.theme]) return THEMES[state.theme].label;
  return MOODS[currentMood]?.label || "经典";
}

function formatHistoryTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

function oneLineExcerpt(text) {
  return String(text || "").replace(/\s+/g, " ").trim().slice(0, 80);
}

async function rememberLayoutHistory(originalSource) {
  const source = (articleInput ? articleInput.value : articleSource).trim().slice(0, 40000);
  if (!source) return;
  try {
    const response = await fetch("/api/history", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        source,
        excerpt: oneLineExcerpt(originalSource),
        theme: state.theme || "classic",
        themeLabel: historyThemeLabel(),
        params: { ...getTemplateParams(), mood: currentMood, skin: currentSkin },
      }),
    });
    if (response.status === 401) return;
    if (!response.ok) setFeedback("排版好了，但这条没能记进历史。");
    else void refreshHistoryList();
  } catch {
    /* 记历史失败不能打断排版 */
  }
}

let historyUiReady = false;
let historyCurrentId = "";

function studioEmbedded() {
  return document.documentElement.classList.contains("studio-embedded");
}

function setHistoryStatus(message) {
  const status = document.querySelector("#historyStatus");
  if (status) status.textContent = message || "";
}

function setHistoryFallback(open) {
  const pop = document.querySelector("#historyPopover");
  const opener = document.querySelector("#historyOpen");
  if (pop) pop.hidden = !open;
  if (opener) opener.setAttribute("aria-expanded", open ? "true" : "false");
}

function mountHistoryForShell() {
  if (!studioEmbedded()) return;
  const rail = document.querySelector("#historyRail");
  const pop = document.querySelector("#historyPopover");
  if (rail && pop && rail.parentElement !== pop) pop.append(rail);
}

function renderHistoryMessage(text) {
  const list = document.querySelector("#historyList");
  if (!list) return;
  list.replaceChildren();
  const empty = document.createElement("li");
  empty.className = "history-empty";
  empty.textContent = text;
  list.append(empty);
}

function renderHistoryList(items) {
  const list = document.querySelector("#historyList");
  if (!list) return;
  list.replaceChildren();
  if (!items.length) {
    renderHistoryMessage("还没有排版记录。");
    return;
  }
  items.forEach((item) => {
    const row = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.id = item.id || "";
    if (item.id && item.id === historyCurrentId) button.classList.add("is-current");
    const title = document.createElement("strong");
    title.textContent = item.title || "未命名";
    const meta = document.createElement("span");
    meta.textContent = [item.themeLabel, formatHistoryTime(item.createdAt)].filter(Boolean).join(" · ");
    const excerpt = document.createElement("p");
    excerpt.textContent = item.excerpt || "";
    button.append(title, meta, excerpt);
    button.addEventListener("click", () => { void loadHistoryItem(item.id); });
    row.append(button);
    list.append(row);
  });
}

async function refreshHistoryList() {
  setHistoryStatus("正在读取…");
  try {
    const response = await fetch("/api/history", { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) {
      setHistoryStatus("");
      renderHistoryMessage("登录后可看排版历史。");
      const fallback = document.querySelector("#historyFallback");
      if (fallback) fallback.hidden = true;
      setHistoryFallback(false);
      return;
    }
    if (!response.ok || !Array.isArray(data.items)) {
      setHistoryStatus(data.message || "历史暂时读不出来。");
      return;
    }
    setHistoryStatus("");
    renderHistoryList(data.items);
  } catch {
    setHistoryStatus("历史暂时读不出来。");
  }
}

function applyHistoryRecord(item) {
  const retiredTheme = applyStoredParams(item.params || {});
  articleSource = typeof item.source === "string" ? item.source : "";
  articleTitleOverride = "";
  blockTypeOverrides = {};
  if (articleInput) articleInput.value = articleSource;
  persistArticleSource();
  styleTouched = true;
  syncMoodUI();
  syncControls();
  render();
  selectEditorView(0);
  setStatus("已载入这条历史，可以继续改。");
  setFeedback(retiredTheme ? "原主题已移除，已切换为经典主题。" : "");
}

async function loadHistoryItem(id) {
  setHistoryStatus("正在打开…");
  try {
    const response = await fetch(`/api/history/${encodeURIComponent(id)}`, { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.item?.source) {
      setHistoryStatus(data.message || "这条暂时打不开。");
      return;
    }
    applyHistoryRecord(data.item);
    historyCurrentId = id;
    document.querySelectorAll("#historyList button").forEach((button) => {
      button.classList.toggle("is-current", button.dataset.id === id);
    });
    setHistoryStatus("");
    if (studioEmbedded()) setHistoryFallback(false);
  } catch {
    setHistoryStatus("这条暂时打不开。");
  }
}

function setupHistoryUi() {
  if (historyUiReady) return;
  historyUiReady = true;
  mountHistoryForShell();
  if (!studioEmbedded()) return;
  document.querySelector("#historyOpen")?.addEventListener("click", (event) => {
    event.stopPropagation();
    const pop = document.querySelector("#historyPopover");
    const willOpen = pop?.hidden !== false;
    setHistoryFallback(willOpen);
    if (willOpen) void refreshHistoryList();
  });
  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element) || event.target.closest("#historyFallback")) return;
    setHistoryFallback(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setHistoryFallback(false);
  });
}

async function showLocalAccount() {
  const account = document.querySelector("#studioAccount");
  const login = document.querySelector("#studioLogin");
  const logout = document.querySelector("#studioLogout");
  const more = document.querySelector("#studioAccountMore");
  const popover = document.querySelector("#studioAccountPopover");
  const closeMenu = () => {
    if (!popover || !more) return;
    popover.hidden = true;
    more.setAttribute("aria-expanded", "false");
  };
  more?.addEventListener("click", (event) => {
    event.stopPropagation();
    const open = popover?.hidden !== false;
    if (popover) popover.hidden = !open;
    more.setAttribute("aria-expanded", open ? "true" : "false");
  });
  document.querySelector("#studioProfile")?.addEventListener("click", closeMenu);
  let studioLoggedIn = false;
  const goToLogin = () => {
    const url = "/login";
    try {
      if (window.top && window.top !== window) {
        window.top.location.assign(url);
        return;
      }
    } catch {
      /* 顶层打不开就在当前页走 */
    }
    location.assign(url);
  };
  const inviteModal = document.querySelector("#inviteModal");
  const inviteBody = document.querySelector("#inviteModalBody");
  const inviteCodeText = document.querySelector("#inviteCodeText");
  const inviteStatus = document.querySelector("#inviteModalStatus");
  const inviteCopy = document.querySelector("#inviteCopy");
  let inviteCode = "";
  const closeInvite = () => {
    if (!inviteModal) return;
    inviteModal.hidden = true;
  };
  const openInvite = async () => {
    closeMenu();
    if (!inviteModal || !inviteBody) return;
    inviteCode = "";
    if (inviteCopy) inviteCopy.disabled = true;
    if (inviteStatus) inviteStatus.textContent = "";
    if (inviteCodeText) inviteCodeText.textContent = "邀请码";
    inviteBody.textContent = "正在取出邀请码…";
    inviteModal.hidden = false;
    inviteModal.querySelector(".invite-modal-card")?.focus();
    try {
      const response = await fetch("/api/invite", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.code || !data?.sentence) {
        inviteBody.textContent = data?.message || "暂时取不出邀请码，请稍后再试。";
        return;
      }
      inviteCode = data.code;
      inviteBody.textContent = "";
      if (inviteCodeText) inviteCodeText.textContent = data.code;
      if (inviteCopy) inviteCopy.disabled = false;
      if (typeof window.yoocoTrack === "function") window.yoocoTrack("invite_share");
    } catch {
      inviteBody.textContent = "暂时取不出邀请码，请稍后再试。";
    }
  };
  document.querySelector("#studioGift")?.addEventListener("click", openInvite);
  document.querySelector("#trialInvite")?.addEventListener("click", async () => {
    if (!studioLoggedIn) {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = response.ok ? await response.json().catch(() => ({})) : {};
        studioLoggedIn = Boolean(data?.email);
      } catch {
        studioLoggedIn = false;
      }
    }
    if (!studioLoggedIn) {
      goToLogin();
      return;
    }
    openInvite();
  });
  document.querySelector("#inviteClose")?.addEventListener("click", closeInvite);
  inviteModal?.addEventListener("click", (event) => {
    if (event.target === inviteModal) closeInvite();
  });
  inviteCopy?.addEventListener("click", async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(`好文章值得好排版。\n一起来试：https://www.yoooco.com/\n邀请码：${inviteCode}\n好友注册成功后，双方各 +5 积分。`);
      if (inviteStatus) inviteStatus.textContent = "已复制。";
    } catch {
      if (inviteStatus) inviteStatus.textContent = "复制没成功，请手动选中邀请码。";
    }
    if (typeof window.yoocoTrack === "function") window.yoocoTrack("invite_share");
  });
  document.addEventListener("click", (event) => {
    if (popover?.hidden !== false) return;
    if (event.target instanceof Element && event.target.closest(".studio-account-menu")) return;
    closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (inviteModal && !inviteModal.hidden) closeInvite();
    else closeMenu();
  });
  logout?.addEventListener("click", async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    location.href = "/login";
  });
  if (!account) return;
  try {
    const response = await fetch("/api/auth/me");
    if (!response.ok) {
      if (login) login.hidden = false;
      return;
    }
    const data = await response.json();
    if (!data?.email) {
      if (login) login.hidden = false;
      return;
    }
    account.hidden = false;
    studioLoggedIn = true;
    if (login) login.hidden = true;
    setupHistoryUi();
    if (studioEmbedded()) {
      const fallback = document.querySelector("#historyFallback");
      if (fallback) fallback.hidden = false;
    }
    void refreshHistoryList();
    const name = document.querySelector("#studioAccountName");
    if (name) {
      name.textContent = data.name || data.email;
      name.title = data.email;
    }
    const avatar = document.querySelector("#studioAvatar");
    if (avatar) {
      const colors = ["#5c8a22", "#3d6cb5", "#c47a24", "#c45c78", "#2f8f86", "#7a52b8"];
      const sum = [...data.email].reduce((total, char) => total + char.charCodeAt(0), 0);
      avatar.style.setProperty("--avatar-color", colors[sum % colors.length]);
      avatar.innerHTML = `<svg viewBox="0 0 160 120" aria-hidden="true"><path d="M16 57C16 24 41 11 78 11C118 11 143 23 143 57C143 82 128 101 103 112C96 115 93 113 96 105C100 92 90 93 77 94C39 98 16 84 16 57Z" fill="currentColor"/><g fill="#20251F"><ellipse cx="61" cy="57" rx="7.5" ry="14"/><ellipse cx="97" cy="57" rx="7.5" ry="14"/></g></svg>`;
    }
  } catch { /* 未登录时工作台仍可试用 */ }
}

// 工具箱。以后加工具，只往这个数组里加一项。价格要和 lib/credits.js 一致。
const STUDIO_TOOLS = [
  {
    id: "humanize",
    label: "更具有人味",
    hint: "去掉 AI 腔，读起来像人写的",
    cost: 1,
  },
];
const TOOL_MAX_CHARS = 3000;
const HUMANIZE_MIN_CHARS = 2;
let toolSession = null;
let toolRequest = 0;
let toolController = null;
let humanizeLayer = null;
let humanizeButton = null;
let humanizePick = null;
let humanizeRemembered = null;
let humanizePointerActive = false;
let humanizeFrame = 0;

function textUnits(value) {
  return Array.from(String(value || "")).length;
}

function trackTool(event) {
  try {
    if (typeof window.yoocoTrack === "function") window.yoocoTrack(event);
  } catch {
    /* 埋点不能挡住改写 */
  }
}

function studioIsLoggedIn() {
  const account = document.querySelector("#studioAccount");
  return Boolean(account && account.hidden === false);
}

function promptNeedCredits() {
  showUpgradePrompt();
  if (studioIsLoggedIn()) document.querySelector("#studioGift")?.click();
}

function showToolHint(message) {
  const hint = document.querySelector("#toolHint");
  if (!hint) return;
  const text = String(message || "").trim();
  hint.textContent = text;
  hint.hidden = !text;
}

function normalizeSelectedText(value) {
  return String(value || "").replace(/\u00a0/g, " ");
}

function selectionShowsHumanize(value) {
  return normalizeSelectedText(value).trim().length >= HUMANIZE_MIN_CHARS;
}

function selectedSourceRange() {
  if (!articleInput) return null;
  const start = articleInput.selectionStart ?? 0;
  const end = articleInput.selectionEnd ?? 0;
  if (!(end > start)) return null;
  const selected = articleInput.value.slice(start, end);
  if (!selected.trim()) return null;
  return { kind: "source", start, end, selected, value: articleInput.value };
}

function activeEditorKind() {
  const source = document.querySelector("#sourcePanel");
  if (source && source.hidden === false) return "source";
  if (previewStage && previewStage.hidden === false) return "preview";
  return null;
}

function editableHost(node) {
  const el = node?.nodeType === 1 ? node : node?.parentElement;
  return el?.closest?.("[contenteditable='true']") || null;
}

function inspectPreviewSelection() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !articleBody) return { kind: "none" };
  const range = selection.getRangeAt(0);
  if (!articleBody.contains(range.commonAncestorContainer)) return { kind: "outside" };
  if (selection.isCollapsed) return { kind: "collapsed" };
  const startHost = editableHost(range.startContainer);
  const endHost = editableHost(range.endContainer);
  if (!startHost || !articleBody.contains(startHost) || !endHost || !articleBody.contains(endHost)) return { kind: "locked" };
  const selected = normalizeSelectedText(selection.toString());
  if (!selectionShowsHumanize(selected)) return { kind: "short" };
  return {
    kind: "text",
    pick: { kind: "preview", range: range.cloneRange(), selected, start: 0, end: 0, value: "" },
  };
}

function readPreviewSelection() {
  const state = inspectPreviewSelection();
  return state.kind === "text" ? state.pick : null;
}

function rememberedPreview() {
  const pick = humanizeRemembered;
  if (!pick?.range || !pick.range.startContainer?.isConnected) return null;
  const live = normalizeSelectedText(pick.range.toString());
  if (live !== pick.selected || !selectionShowsHumanize(live)) return null;
  return pick;
}

function currentToolSelection() {
  if (activeEditorKind() === "source") return selectedSourceRange();
  return readPreviewSelection() || rememberedPreview();
}

function closeToolMenu() {
  const menu = document.querySelector("#toolMenu");
  const button = document.querySelector("#toolMenuButton");
  if (menu) menu.hidden = true;
  if (button) button.setAttribute("aria-expanded", "false");
}

function openToolMenu() {
  const menu = document.querySelector("#toolMenu");
  const button = document.querySelector("#toolMenuButton");
  if (!menu || !button) return;
  const willOpen = menu.hidden !== false;
  menu.hidden = !willOpen;
  button.setAttribute("aria-expanded", willOpen ? "true" : "false");
  if (willOpen) trackTool("tool_open");
}

function setToolError(message) {
  const node = document.querySelector("#toolCompareError");
  if (!node) return;
  const text = String(message || "").trim();
  node.textContent = text;
  node.hidden = !text;
}

function setToolBusy(busy) {
  const accept = document.querySelector("#toolAccept");
  const regen = document.querySelector("#toolRegen");
  const loading = document.querySelector("#toolCompareLoading");
  const result = document.querySelector("#toolCompareResult");
  const ready = Boolean(toolSession?.result);
  if (accept) accept.disabled = busy || !ready;
  if (regen) regen.disabled = busy;
  if (loading) loading.hidden = !busy;
  if (result) result.hidden = busy || !ready;
}

function openToolCompare(tool, picked) {
  const modal = document.querySelector("#toolCompare");
  const title = document.querySelector("#toolCompareTitle");
  const note = document.querySelector("#toolCompareNote");
  const source = document.querySelector("#toolCompareSource");
  const result = document.querySelector("#toolCompareResult");
  if (title) title.textContent = tool.label;
  if (note) note.textContent = tool.hint;
  if (source) source.textContent = picked.selected;
  if (result) result.textContent = "";
  setToolError("");
  setToolBusy(true);
  if (modal) {
    modal.hidden = false;
    modal.querySelector(".tool-compare-card")?.focus();
  }
}

function closeToolCompare() {
  const modal = document.querySelector("#toolCompare");
  if (modal) modal.hidden = true;
}

function beginTool(tool, picked) {
  showToolHint("");
  const chosen = picked || currentToolSelection();
  if (!chosen) {
    selectEditorView(1);
    showToolHint("先在原文里选中要改的段落");
    setStatus("先在原文里选中要改的段落");
    articleInput?.focus();
    return;
  }
  if (textUnits(chosen.selected) > TOOL_MAX_CHARS) {
    const message = `单次最多 ${TOOL_MAX_CHARS} 字，请少选一点。`;
    showToolHint(message);
    setStatus(message);
    return;
  }
  if (remainingTrialCount() < tool.cost) {
    promptNeedCredits();
    return;
  }
  hideHumanizeLayer();
  toolSession = {
    tool,
    kind: chosen.kind || "source",
    start: chosen.start ?? 0,
    end: chosen.end ?? 0,
    selected: chosen.selected,
    value: chosen.kind === "preview" ? "" : (chosen.value ?? articleInput?.value ?? ""),
    range: chosen.range ? chosen.range.cloneRange() : null,
    result: "",
  };
  openToolCompare(tool, chosen);
  void runTool();
}

async function runTool() {
  if (!toolSession) return;
  const requestId = ++toolRequest;
  toolController?.abort();
  const controller = new AbortController();
  toolController = controller;
  const previous = toolSession.result;
  toolSession.result = "";
  setToolError("");
  setToolBusy(true);
  const timeout = window.setTimeout(() => controller.abort(), 35000);
  trackTool("tool_run");
  try {
    const response = await fetch("/api/tools", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tool: toolSession.tool.id, text: toolSession.selected }),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (requestId !== toolRequest) return;
    if (payload?.trial) applyTrialFromServer(payload.trial);
    else if (payload?.credits) applyTrialFromServer({ credits: payload.credits, enforced: true });
    if (!response.ok || !payload?.ok || typeof payload.text !== "string") {
      toolSession.result = previous;
      const code = payload?.error?.code || "";
      const message = payload?.error?.message || "这次没改写完，请稍后再试。";
      if (code === "TRIAL_EXHAUSTED" || payload?.error?.remaining === 0) {
        serverTrialUnlimited = false;
        if (typeof payload?.credits?.remaining === "number") serverTrialRemaining = Math.max(0, payload.credits.remaining);
        else if (typeof payload?.error?.remaining === "number") serverTrialRemaining = Math.max(0, payload.error.remaining);
        else serverTrialRemaining = 0;
        renderTrialMeter();
        setToolError(message);
        promptNeedCredits();
        return;
      }
      setToolError(message);
      return;
    }
    toolSession.result = payload.text;
    const result = document.querySelector("#toolCompareResult");
    if (result) result.textContent = payload.text;
  } catch (error) {
    if (requestId !== toolRequest || !toolSession) return;
    toolSession.result = previous;
    const aborted = (error instanceof DOMException && error.name === "AbortError") || (error && error.name === "AbortError");
    setToolError(aborted ? "改写超过 30 秒还没回来，请少选一点再试。" : "暂时连不上改写服务，请稍后再试。");
  } finally {
    window.clearTimeout(timeout);
    if (requestId === toolRequest) setToolBusy(false);
  }
}

function acceptPreviewRewrite() {
  const range = toolSession.range;
  const live = range?.startContainer?.isConnected ? normalizeSelectedText(range.toString()) : "";
  if (!range || live !== toolSession.selected) {
    setToolError("原文已经变了，请重新选中。");
    return;
  }
  range.deleteContents();
  const fragment = document.createDocumentFragment();
  const lines = String(toolSession.result).replace(/\r\n?/g, "\n").split("\n");
  lines.forEach((line, index) => {
    fragment.append(document.createTextNode(line));
    if (index < lines.length - 1) fragment.append(document.createElement("br"));
  });
  const marker = document.createTextNode("");
  fragment.append(marker);
  range.insertNode(fragment);
  marker.remove();
  sampleStaticActive = false;
  humanizeRemembered = null;
  syncPreviewEdits();
  closeToolCompare();
  trackTool("tool_accept");
  setFeedback("原文和排版都已更新");
  showToolHint("");
}

function acceptToolRewrite() {
  if (!toolSession?.result) return;
  if (toolSession.kind === "preview") {
    acceptPreviewRewrite();
    return;
  }
  if (!articleInput) return;
  const { value, start, end, selected, result } = toolSession;
  const current = articleInput.value;
  let next = "";
  if (current === value) next = `${current.slice(0, start)}${result}${current.slice(end)}`;
  else {
    const at = current.indexOf(selected);
    if (at < 0) {
      setToolError("原文已经变了，请重新选中。");
      return;
    }
    next = `${current.slice(0, at)}${result}${current.slice(at + selected.length)}`;
  }
  articleInput.value = next;
  articleTitleOverride = "";
  applyArticleSource(false);
  closeToolCompare();
  trackTool("tool_accept");
  setFeedback("原文和排版都已更新");
  showToolHint("");
}

function renderToolMenu() {
  const menu = document.querySelector("#toolMenu");
  if (!menu) return;
  menu.replaceChildren();
  STUDIO_TOOLS.forEach((tool) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "tool-menu-item";
    item.setAttribute("role", "menuitem");
    const copy = document.createElement("span");
    copy.className = "tool-menu-copy";
    const title = document.createElement("span");
    title.textContent = tool.label;
    const hint = document.createElement("small");
    hint.textContent = tool.hint;
    copy.append(title, hint);
    const cost = document.createElement("span");
    cost.className = "tool-menu-cost";
    cost.textContent = `${tool.cost} 积分`;
    item.append(copy, cost);
    item.addEventListener("click", () => {
      closeToolMenu();
      beginTool(tool);
    });
    menu.append(item);
  });
}

function cancelToolRewrite() {
  toolRequest += 1;
  toolController?.abort();
  closeToolCompare();
  showToolHint("");
  void refreshTrialFromServer();
}

function humanizeDialogOpen() {
  return ["#toolCompare", "#inviteModal", "#historyPopover"].some((id) => {
    const node = document.querySelector(id);
    return node && node.hidden === false;
  });
}

function hideHumanizeLayer() {
  humanizePick = null;
  if (!humanizeLayer) return;
  humanizeLayer.hidden = true;
  humanizeLayer.querySelectorAll(".humanize-selection-frame").forEach((node) => node.remove());
}

function ensureHumanizeLayer() {
  if (humanizeLayer) return;
  humanizeLayer = document.createElement("div");
  humanizeLayer.id = "humanizeSelectionLayer";
  humanizeLayer.hidden = true;
  humanizeButton = document.createElement("button");
  humanizeButton.type = "button";
  humanizeButton.className = "humanize-float";
  humanizeButton.textContent = "去AI味";
  humanizeButton.addEventListener("mousedown", (event) => {
    event.preventDefault();
    event.stopPropagation();
  });
  humanizeButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const tool = STUDIO_TOOLS.find((item) => item.id === "humanize");
    const picked = humanizePick;
    if (!tool || !picked) return;
    closeToolMenu();
    beginTool(tool, picked);
  });
  humanizeLayer.append(humanizeButton);
  document.body.append(humanizeLayer);
}

function mergeSelectionRects(rects) {
  const items = [];
  for (const rect of rects) {
    if (!rect || rect.width < 0.5 || rect.height < 0.5) continue;
    items.push({ top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom });
  }
  items.sort((a, b) => a.top - b.top || a.left - b.left);
  const lines = [];
  items.forEach((rect) => {
    const line = lines.find((item) => rect.top < item.bottom - 1 && rect.bottom > item.top + 1);
    if (!line) {
      lines.push({ ...rect });
      return;
    }
    line.top = Math.min(line.top, rect.top);
    line.left = Math.min(line.left, rect.left);
    line.right = Math.max(line.right, rect.right);
    line.bottom = Math.max(line.bottom, rect.bottom);
  });
  return lines;
}

function clipToBox(rect, box) {
  if (!box) return null;
  const top = Math.max(rect.top, box.top + 1);
  const left = Math.max(rect.left, box.left + 1);
  const right = Math.min(rect.right, box.right - 1);
  const bottom = Math.min(rect.bottom, box.bottom - 1);
  if (right - left < 1 || bottom - top < 1) return null;
  return { top, left, right, bottom };
}

function textareaSelectionRects(textarea, start, end) {
  const style = getComputedStyle(textarea);
  const mirror = document.createElement("div");
  mirror.setAttribute("aria-hidden", "true");
  ["boxSizing", "width", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth", "borderTopStyle", "borderRightStyle", "borderBottomStyle", "borderLeftStyle", "fontStyle", "fontWeight", "fontSize", "fontFamily", "lineHeight", "letterSpacing", "wordSpacing", "textIndent", "textTransform", "textAlign", "tabSize"].forEach((prop) => {
    mirror.style[prop] = style[prop];
  });
  const scrollbar = Math.max(0, textarea.offsetWidth - textarea.clientWidth);
  if (scrollbar) mirror.style.width = `${Math.max(0, parseFloat(style.width) - scrollbar)}px`;
  mirror.style.position = "fixed";
  mirror.style.left = "0";
  mirror.style.top = "0";
  mirror.style.margin = "0";
  mirror.style.visibility = "hidden";
  mirror.style.pointerEvents = "none";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.wordWrap = "break-word";
  mirror.style.overflowWrap = "break-word";
  mirror.style.overflow = "hidden";
  mirror.style.height = "auto";
  const value = textarea.value;
  mirror.append(document.createTextNode(value.slice(0, start)));
  const span = document.createElement("span");
  span.textContent = value.slice(start, end);
  mirror.append(span, document.createTextNode(value.slice(end)));
  document.body.append(mirror);
  const mirrorRect = mirror.getBoundingClientRect();
  const raw = [...span.getClientRects()];
  mirror.remove();
  const host = textarea.getBoundingClientRect();
  const dx = host.left - textarea.scrollLeft - mirrorRect.left;
  const dy = host.top - textarea.scrollTop - mirrorRect.top;
  return raw.map((rect) => ({
    top: rect.top + dy,
    left: rect.left + dx,
    right: rect.right + dx,
    bottom: rect.bottom + dy,
  }));
}

function placeHumanizeButton(rect, box) {
  const width = humanizeButton.offsetWidth || 72;
  const height = humanizeButton.offsetHeight || 28;
  const gap = 4;
  let left = rect.right - width;
  let top = rect.top - height - gap;
  const maxLeft = window.innerWidth - width - 8;
  const maxTop = window.innerHeight - height - 8;
  if (top < 8 || (box && top < box.top + 2)) top = rect.bottom + gap;
  if (left < 8) left = rect.left;
  humanizeButton.style.left = `${Math.round(Math.max(8, Math.min(left, maxLeft)))}px`;
  humanizeButton.style.top = `${Math.round(Math.max(8, Math.min(top, maxTop)))}px`;
}

function paintHumanizeFrames(lines) {
  humanizeLayer.querySelectorAll(".humanize-selection-frame").forEach((node) => node.remove());
  const pad = 2;
  lines.forEach((rect) => {
    const frame = document.createElement("div");
    frame.className = "humanize-selection-frame";
    frame.style.left = `${rect.left - pad}px`;
    frame.style.top = `${rect.top - pad}px`;
    frame.style.width = `${rect.right - rect.left + pad * 2}px`;
    frame.style.height = `${rect.bottom - rect.top + pad * 2}px`;
    humanizeLayer.insertBefore(frame, humanizeButton);
  });
}

function paintHumanizeFloat() {
  ensureHumanizeLayer();
  if (humanizeDialogOpen()) {
    hideHumanizeLayer();
    return;
  }
  const kind = activeEditorKind();
  let pick = null;
  let rects = [];
  let box = null;
  if (kind === "preview") {
    const state = inspectPreviewSelection();
    const focused = Boolean(document.activeElement && articleBody.contains(document.activeElement));
    if (focused && state.kind === "text") humanizeRemembered = state.pick;
    else if (focused && (state.kind === "short" || state.kind === "locked")) humanizeRemembered = null;
    hideHumanizeLayer();
    return;
  }
  if (kind === "source" && articleInput && document.activeElement === articleInput) {
    const sourcePick = selectedSourceRange();
    if (sourcePick && selectionShowsHumanize(sourcePick.selected)) {
      pick = sourcePick;
      rects = textareaSelectionRects(articleInput, sourcePick.start, sourcePick.end);
      box = articleInput.getBoundingClientRect();
    }
  }
  const rawLines = mergeSelectionRects(rects);
  const lines = rawLines.map((rect) => clipToBox(rect, box)).filter(Boolean);
  if (!pick || !lines.length) {
    hideHumanizeLayer();
    return;
  }
  humanizePick = pick;
  humanizeLayer.hidden = false;
  paintHumanizeFrames(lines);
  const lastVisible = clipToBox(rawLines[rawLines.length - 1], box);
  humanizeButton.hidden = !lastVisible;
  if (lastVisible) placeHumanizeButton(lastVisible, box);
  humanizeButton.style.pointerEvents = humanizePointerActive ? "none" : "auto";
}

function scheduleHumanizeFloat() {
  if (humanizeFrame) return;
  humanizeFrame = window.requestAnimationFrame(() => {
    humanizeFrame = 0;
    paintHumanizeFloat();
  });
}

function setupHumanizeFloat() {
  ensureHumanizeLayer();
  document.addEventListener("selectionchange", scheduleHumanizeFloat);
  document.addEventListener("scroll", scheduleHumanizeFloat, true);
  window.addEventListener("resize", scheduleHumanizeFloat);
  window.addEventListener("blur", hideHumanizeLayer);
  window.addEventListener("focus", scheduleHumanizeFloat);
  articleInput?.addEventListener("scroll", scheduleHumanizeFloat, { passive: true });
  articleInput?.addEventListener("keyup", scheduleHumanizeFloat);
  articleInput?.addEventListener("mouseup", scheduleHumanizeFloat);
  articleInput?.addEventListener("blur", scheduleHumanizeFloat);
  articleBody?.addEventListener("focusout", scheduleHumanizeFloat);
  articleBody?.addEventListener("keyup", scheduleHumanizeFloat);
  articleBody?.addEventListener("input", () => {
    humanizeRemembered = null;
  });
  articleInput?.addEventListener("input", () => {
    humanizeRemembered = null;
  });
  document.addEventListener("pointerdown", (event) => {
    humanizePointerActive = true;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target === humanizeButton || humanizeButton?.contains(target)) return;
    if (target.closest(".tool-menu-wrap")) return;
    humanizeRemembered = null;
  });
  document.addEventListener("pointerup", () => {
    humanizePointerActive = false;
    scheduleHumanizeFloat();
  });
  document.addEventListener("pointercancel", () => {
    humanizePointerActive = false;
    scheduleHumanizeFloat();
  });
}

function setupStudioTools() {
  renderToolMenu();
  setupHumanizeFloat();
  document.querySelector("#toolMenuButton")?.addEventListener("click", (event) => {
    event.stopPropagation();
    openToolMenu();
  });
  document.querySelector("#toolAccept")?.addEventListener("click", acceptToolRewrite);
  document.querySelector("#toolRegen")?.addEventListener("click", () => {
    if (!toolSession) return;
    if (remainingTrialCount() < toolSession.tool.cost) {
      promptNeedCredits();
      return;
    }
    void runTool();
  });
  document.querySelector("#toolCancel")?.addEventListener("click", cancelToolRewrite);
  document.querySelector("#toolCompare")?.addEventListener("click", (event) => {
    if (event.target === document.querySelector("#toolCompare")) cancelToolRewrite();
  });
  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element) || event.target.closest(".tool-menu-wrap")) return;
    closeToolMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const modal = document.querySelector("#toolCompare");
    if (modal && modal.hidden === false) {
      event.stopPropagation();
      cancelToolRewrite();
      return;
    }
    closeToolMenu();
  });
}

setupStudioTools();
