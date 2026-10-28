import { RATIO_IDS, RATIOS, FAMILIES, TEMPLATE_IDS, slotsFor, templateById, templatesInFamily, closestCanvasRatio, closestImageTemplate, imageIndexFor } from "./layout-templates.js";
import { snapToGrid, clampBlock, gridRows, clampGridN } from "./layout-grid.js";

const PRESETS = {
  exhibition: {
    title: "遇见印象派",
    subtitle: "三城真迹",
    date: "5/26–8/07",
    venue: "成都 · 博物馆",
    body: "莫奈、马奈、雷诺阿。同一展览，三种画幅。",
    credit: "网格工作坊",
  },
  nature: {
    title: "绿野之约",
    subtitle: "声动自然",
    date: "6/8–6/9",
    venue: "东滩湿地",
    body: "自然为幕，音乐为歌。",
    credit: "森林诗会",
  },
  product: {
    title: "山野召集",
    subtitle: "轻装两日",
    date: "10/24–10/25",
    venue: "城西绿道",
    body: "同一句广告，方图、竖图、横幅各摆一次。",
    credit: "Yooco",
  },
};

const PRESET_LIST = [
  { id: "exhibition", label: "展览" },
  { id: "nature", label: "自然" },
  { id: "product", label: "产品" },
];

const TEMPLATE_GROUPS = [
  { id: "text", label: "纯字" },
  { id: "image", label: "图文" },
];

const STYLES = [
  { id: "swiss", label: "瑞士纸", blurb: "浅底，左齐，常规字距", tone: "light", size: "m", align: "left", swatch: "#f7f6f2" },
  { id: "ink", label: "墨底", blurb: "深底，标题收紧", tone: "dark", size: "l", align: "left", swatch: "#141414" },
  { id: "gallery", label: "展签", blurb: "居中，字距拉开", tone: "light", size: "m", align: "center", swatch: "#f4f1ea" },
  { id: "signal", label: "信号黄", blurb: "亮底，标题更重", tone: "light", size: "l", align: "left", swatch: "#e4ef3a" },
  { id: "dusk", label: "夜蓝", blurb: "蓝底，字稍疏", tone: "dark", size: "m", align: "left", swatch: "#163a78" },
];

const STYLE_IDS = STYLES.map((item) => item.id);
const SIZE_IDS = [
  { id: "s", label: "小" },
  { id: "m", label: "中" },
  { id: "l", label: "大" },
];
const ALIGN_IDS = [
  { id: "left", label: "左对齐" },
  { id: "center", label: "居中" },
];

const LOCK_LABELS = {
  copy: "文案",
  layout: "布局",
  image: "单图",
  pages: "多页",
};

const GUIDE_KEY = "yooco-layout-guides";
const BOARD_KEY = "yooco-layout-board";

function loadGuides() {
  try {
    if (sessionStorage.getItem(GUIDE_KEY) === "0") return false;
  } catch {
    // 隐私模式读不到时，辅助线默认开着。
  }
  return true;
}

const state = {
  ratio: "3:4",
  familyId: "swiss",
  templateId: "a",
  preset: "exhibition",
  styleId: "swiss",
  size: "m",
  align: "left",
  gridN: 12,
  source: "",
  images: [], // { url, name }[]
  imagePick: 0,
  texts: { ...PRESETS.exhibition },
  fill: null, // 生成结果。预置文案不写这里，也不扣积分。
  positions: {}, // id -> { x, y } 覆盖模板坐标
  guides: loadGuides(),
  pageIndex: 0,
  pages: [],
  // 抽版式时：锁住的项不动。文案和单图默认锁住。
  // 多页默认解锁：页数少于 4 就在后面加一页并切过去；已经 4 页就重抽当前页。
  locks: { copy: true, layout: false, image: true, pages: false },
};

const MAX_PAGES = 4;

function styleById(id) {
  return STYLES.find((item) => item.id === id) || STYLES[0];
}

function copyPositions(positions) {
  const out = {};
  for (const [id, pos] of Object.entries(positions || {})) {
    if (pos && Number.isFinite(pos.x) && Number.isFinite(pos.y)) out[id] = { x: pos.x, y: pos.y };
  }
  return out;
}

function capturePage() {
  return {
    templateId: state.templateId,
    preset: state.preset,
    texts: { ...state.texts },
    positions: copyPositions(state.positions),
    imagePick: state.imagePick,
  };
}

function applyPage(page) {
  state.templateId = page.templateId;
  state.preset = page.preset || null;
  state.texts = { ...page.texts };
  state.positions = copyPositions(page.positions);
  state.imagePick = Number.isInteger(page.imagePick) ? page.imagePick : 0;
}

function commitPage() {
  if (!state.pages.length) state.pages = [capturePage()];
  state.pages[state.pageIndex] = capturePage();
}

function normalizePage(raw) {
  if (!raw || !TEMPLATE_IDS.includes(raw.templateId) || !raw.texts || typeof raw.texts !== "object") return null;
  return {
    templateId: raw.templateId,
    preset: raw.preset || null,
    texts: { ...PRESETS.exhibition, ...raw.texts },
    positions: copyPositions(raw.positions),
    imagePick: Number.isInteger(raw.imagePick) ? raw.imagePick : 0,
  };
}

function hydratePages() {
  const stored = savedBoard?.pages;
  if (Array.isArray(stored)) {
    const pages = stored.map(normalizePage).filter(Boolean).slice(0, MAX_PAGES);
    if (pages.length) {
      state.pages = pages;
      const index = Number.isInteger(savedBoard.pageIndex) ? savedBoard.pageIndex : 0;
      state.pageIndex = Math.min(pages.length - 1, Math.max(0, index));
      applyPage(state.pages[state.pageIndex]);
      return;
    }
  }
  state.pages = [capturePage()];
  state.pageIndex = 0;
}

function loadBoard() {
  try {
    const data = JSON.parse(sessionStorage.getItem(BOARD_KEY) || "null");
    if (!data || typeof data.texts !== "object") return null;
    if (!TEMPLATE_IDS.includes(data.templateId) || !RATIO_IDS.includes(data.ratio)) return null;
    if (data.styleId != null && !STYLE_IDS.includes(data.styleId)) return null;
    return data;
  } catch {
    return null;
  }
}

const savedBoard = loadBoard();
if (savedBoard) {
  state.ratio = savedBoard.ratio;
  state.templateId = savedBoard.templateId;
  state.familyId = FAMILIES.some((item) => item.id === savedBoard.familyId)
    ? savedBoard.familyId
    : (templateById(savedBoard.templateId).family || "swiss");
  state.texts = { ...PRESETS.exhibition, ...savedBoard.texts };
  state.preset = savedBoard.preset || null;
  if (STYLE_IDS.includes(savedBoard.styleId)) {
    const style = styleById(savedBoard.styleId);
    state.styleId = style.id;
    state.size = style.size;
    state.align = style.align;
  }
  if (SIZE_IDS.some((item) => item.id === savedBoard.size)) state.size = savedBoard.size;
  if (savedBoard.align === "left" || savedBoard.align === "center") state.align = savedBoard.align;
  if (savedBoard.locks && typeof savedBoard.locks === "object") {
    for (const key of ["copy", "layout", "image", "pages"]) {
      if (typeof savedBoard.locks[key] === "boolean") state.locks[key] = savedBoard.locks[key];
    }
  }
}

const ratioRow = document.querySelector("#ratioRow");
const familyRow = document.querySelector("#familyRow");
const templateGrid = document.querySelector("#templateGrid");
const presetRow = document.querySelector("#presetRow");
const canvas = document.querySelector("#canvas");
const canvasBlocks = document.querySelector("#canvasBlocks");
const emptyHint = document.querySelector("#emptyHint");
const layoutStatus = document.querySelector("#layoutStatus");
const layoutError = document.querySelector("#layoutError");
const drawLayoutButton = document.querySelector("#drawLayout");
const imageFiles = document.querySelector("#imageFiles");
const uploadImageButton = document.querySelector("#uploadImageButton");
const imageList = document.querySelector("#imageList");
const guideToggle = document.querySelector("#guideToggle");
const gridNInput = document.querySelector("#gridN");
const gridNValue = document.querySelector("#gridNValue");
const canvasGrid = document.querySelector("#canvasGrid");
const lockGrid = document.querySelector("#lockGrid");
const styleList = document.querySelector("#styleList");
const styleFold = document.querySelector("#styleFold");
const sizeRow = document.querySelector("#sizeRow");
const alignRow = document.querySelector("#alignRow");
const pagePrev = document.querySelector("#pagePrev");
const pageNext = document.querySelector("#pageNext");
const pageLabel = document.querySelector("#pageLabel");
const pageDots = document.querySelector("#pageDots");
const exportButton = document.querySelector("#exportButton");
const exportButtonBottom = document.querySelector("#exportButtonBottom");

function applyGuides() {
  canvas.classList.toggle("is-guides-off", !state.guides);
  if (guideToggle) guideToggle.checked = state.guides;
}

function rememberGuides() {
  try {
    sessionStorage.setItem(GUIDE_KEY, state.guides ? "1" : "0");
  } catch {
    // 记不住就只留在这一页的内存里。
  }
}

function saveBoard() {
  commitPage();
  try {
    sessionStorage.setItem(BOARD_KEY, JSON.stringify({
      ratio: state.ratio,
      familyId: state.familyId,
      templateId: state.templateId,
      preset: state.preset,
      texts: state.texts,
      styleId: state.styleId,
      size: state.size,
      align: state.align,
      locks: state.locks,
      pageIndex: state.pageIndex,
      pages: state.pages,
    }));
  } catch {
    // 记不住就只留在这一页。
  }
}

function applyPoster() {
  const style = styleById(state.styleId);
  canvas.dataset.family = templateById(state.templateId).family || "swiss";
  canvas.dataset.style = style.id;
  canvas.dataset.tone = style.tone;
  canvas.dataset.size = state.size;
  canvas.dataset.align = state.align;
}

function applyDrawButton() {
  const locked = state.locks.layout;
  drawLayoutButton.disabled = locked;
  drawLayoutButton.title = locked ? "布局已锁定，抽版式先不动" : "";
}

function syncLocks() {
  for (const button of lockGrid.querySelectorAll("[data-lock]")) {
    const key = button.dataset.lock;
    const on = Boolean(state.locks[key]);
    button.setAttribute("aria-pressed", on ? "true" : "false");
    button.textContent = `${LOCK_LABELS[key]} · ${on ? "锁定" : "解锁"}`;
  }
  applyDrawButton();
}

function renderPager() {
  const total = Math.max(1, state.pages.length);
  pageLabel.textContent = `第 ${state.pageIndex + 1} / ${total} 页`;
  pagePrev.disabled = state.pageIndex <= 0;
  pageNext.disabled = state.pageIndex >= state.pages.length - 1;
  pageDots.innerHTML = state.pages.map((_, index) =>
    `<button type="button" data-page="${index}" aria-pressed="${index === state.pageIndex ? "true" : "false"}">${index + 1}</button>`
  ).join("");
}

function renderChrome() {
  ratioRow.innerHTML = RATIO_IDS.map((id) => {
    const ratio = RATIOS[id];
    return `<button type="button" role="radio" class="ratio-card" aria-checked="${state.ratio === id}" data-ratio="${id}" style="--rw:${ratio.w};--rh:${ratio.h}">
      <span class="ratio-shape" aria-hidden="true"></span>
      <span class="ratio-name">${id}</span>
    </button>`;
  }).join("");
  familyRow.innerHTML = FAMILIES.map((item) =>
    `<button type="button" role="radio" aria-checked="${state.familyId === item.id}" data-family="${item.id}">${item.label}</button>`
  ).join("");
  const visible = templatesInFamily(state.familyId);
  const groups = state.familyId === "swiss"
    ? TEMPLATE_GROUPS.map((group) => ({ label: group.label, items: visible.filter((item) => item.group === group.id) })).filter((group) => group.items.length)
    : [{ label: FAMILIES.find((item) => item.id === state.familyId)?.label || "", items: visible }];
  templateGrid.innerHTML = groups.map((group) => {
    const buttons = group.items.map((item) =>
      `<button type="button" role="option" aria-selected="${state.templateId === item.id}" data-template="${item.id}">
        <strong>${item.label}</strong><span class="blurb">${item.blurb}</span>
      </button>`
    ).join("");
    const label = state.familyId === "swiss" ? `<p class="template-group-label">${group.label}</p>` : "";
    return `<div class="template-group" role="group" aria-label="${group.label}">
      ${label}
      ${buttons}
    </div>`;
  }).join("");
  presetRow.innerHTML = PRESET_LIST.map((item) =>
    `<button type="button" aria-pressed="${state.preset === item.id}" data-preset="${item.id}">${item.label}</button>`
  ).join("");
  styleList.innerHTML = STYLES.map((item) =>
    `<button type="button" role="option" aria-selected="${state.styleId === item.id}" data-style="${item.id}">
      <i class="style-swatch" style="background:${item.swatch}"></i>
      <span><strong>${item.label}</strong><small>${item.blurb}</small></span>
    </button>`
  ).join("");
  sizeRow.innerHTML = SIZE_IDS.map((item) =>
    `<button type="button" role="radio" aria-checked="${state.size === item.id}" data-size="${item.id}">${item.label}</button>`
  ).join("");
  alignRow.innerHTML = ALIGN_IDS.map((item) =>
    `<button type="button" role="radio" aria-checked="${state.align === item.id}" data-align="${item.id}">${item.label}</button>`
  ).join("");
  canvas.dataset.ratio = state.ratio;
  applyPoster();
  syncLocks();
  renderPager();
  const layoutNote = state.locks.layout ? "布局已锁定 · " : "";
  const family = FAMILIES.find((item) => item.id === state.familyId);
  layoutStatus.textContent = `${layoutNote}当前 ${family?.label || ""} · ${templateById(state.templateId).label} · ${state.ratio}`;
}

function placeStyle(box) {
  return `left:${box.x}%;top:${box.y}%;width:${box.w}%;height:${box.h}%;`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function textFor(slotId) {
  if (Object.prototype.hasOwnProperty.call(state.texts, slotId)) return state.texts[slotId] || "";
  const filled = state.fill?.slots?.find((item) => item.id === slotId);
  return filled?.text || "";
}

function imageFor(slot) {
  const index = imageIndexFor(slot, state.imagePick, state.images.length);
  return index < 0 ? null : state.images[index];
}

let editingId = null;

function commitEdit(block) {
  if (!block?.classList.contains("is-editing")) return;
  const id = block.dataset.id;
  state.texts[id] = block.innerText.replace(/\u00a0/g, " ").replace(/\n+/g, "");
  block.removeEventListener("keydown", onEditKey);
  block.contentEditable = "false";
  block.classList.remove("is-editing");
  if (editingId === id) editingId = null;
  saveBoard();
}

function commitLiveEdit() {
  if (!editingId) return;
  const live = canvasBlocks.querySelector(`[data-id="${editingId}"]`);
  if (live) commitEdit(live);
}

function onEditKey(event) {
  if (event.key === "Enter") event.preventDefault();
  if (event.key === "Escape") event.currentTarget.blur();
}

function beginEdit(block) {
  if (!block || block.dataset.type === "image") return;
  commitLiveEdit();
  canvasBlocks.querySelectorAll(".is-selected").forEach((el) => el.classList.remove("is-selected"));
  editingId = block.dataset.id;
  block.contentEditable = "true";
  block.spellcheck = false;
  block.classList.add("is-editing");
  block.focus();
  const range = document.createRange();
  range.selectNodeContents(block);
  range.collapse(false);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  block.addEventListener("keydown", onEditKey);
  block.addEventListener("blur", () => commitEdit(block), { once: true });
}

function selectImage(block) {
  commitLiveEdit();
  canvasBlocks.querySelectorAll(".is-selected,.is-editing").forEach((el) => el.classList.remove("is-selected", "is-editing"));
  block.classList.add("is-selected");
  layoutStatus.textContent = "已选中图片。点「上传图片」可替换。";
}

function renderBlocks() {
  commitLiveEdit();
  const slots = slotsFor(state.templateId, state.ratio);
  canvasBlocks.innerHTML = slots.map((slot) => {
    const pos = state.positions[slot.id];
    const box = { ...slot, x: pos?.x ?? slot.x, y: pos?.y ?? slot.y };
    const isImage = slot.type === "image";
    const img = imageFor(slot);
    const text = isImage ? "" : textFor(slot.id);
    const placeholder = isImage && !img;
    const empty = !isImage && !text;
    const inner = isImage
      ? (img ? `<img alt="" src="${escapeHtml(img.url)}" />` : "")
      : escapeHtml(text);
    const classes = ["block"];
    if (placeholder) classes.push("is-placeholder");
    if (empty) classes.push("is-empty");
    return `<div class="${classes.join(" ")}" data-id="${slot.id}" data-type="${slot.type}" style="${placeStyle(box)}">${inner}</div>`;
  }).join("");
  emptyHint.hidden = true;
  const truncationNote = document.querySelector("#truncationNote");
  requestAnimationFrame(() => {
    let truncated = false;
    for (const block of canvasBlocks.querySelectorAll(".block")) {
      if (block.dataset.type === "image") continue;
      // 短副标的行盒会高出槽大约 4 像素，按 1 像素会一直显示「已截断」。超过 8 像素才当字太长。
      if (block.scrollHeight > block.clientHeight + 8 || block.scrollWidth > block.clientWidth + 8) {
        truncated = true;
        break;
      }
    }
    truncationNote.hidden = !truncated;
  });
}

let press = null;

function slotBox(id) {
  const slot = slotsFor(state.templateId, state.ratio).find((item) => item.id === id);
  const pos = state.positions[id];
  return { ...slot, x: pos?.x ?? slot.x, y: pos?.y ?? slot.y };
}

canvasBlocks.addEventListener("pointerdown", (event) => {
  const block = event.target.closest(".block");
  if (!block) return;
  if (editingId === block.dataset.id) return;
  const box = slotBox(block.dataset.id);
  const rect = canvas.getBoundingClientRect();
  press = {
    id: block.dataset.id,
    type: block.dataset.type,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    moved: false,
    offsetX: ((event.clientX - rect.left) / rect.width) * 100 - box.x,
    offsetY: ((event.clientY - rect.top) / rect.height) * 100 - box.y,
    w: box.w,
    h: box.h,
  };
  block.setPointerCapture(event.pointerId);
});

canvasBlocks.addEventListener("pointermove", (event) => {
  if (!press || event.pointerId !== press.pointerId) return;
  if (!press.moved && Math.hypot(event.clientX - press.startX, event.clientY - press.startY) < 5) return;
  press.moved = true;
  const rect = canvas.getBoundingClientRect();
  let x = ((event.clientX - rect.left) / rect.width) * 100 - press.offsetX;
  let y = ((event.clientY - rect.top) / rect.height) * 100 - press.offsetY;
  const n = clampGridN(state.gridN);
  const ratio = RATIOS[state.ratio];
  const m = gridRows(n, ratio.w, ratio.h);
  const snapped = snapToGrid(x, y, n, m);
  const clamped = clampBlock(snapped.x, snapped.y, press.w, press.h);
  state.positions[press.id] = { x: clamped.x, y: clamped.y };
  const el = canvasBlocks.querySelector(`[data-id="${press.id}"]`);
  if (el) {
    el.classList.add("is-dragging");
    el.style.left = `${clamped.x}%`;
    el.style.top = `${clamped.y}%`;
  }
});

function endPress(event) {
  if (!press || event.pointerId !== press.pointerId) return;
  const info = press;
  press = null;
  const el = canvasBlocks.querySelector(`[data-id="${info.id}"]`);
  el?.classList.remove("is-dragging");
  if (!info.moved && el) {
    if (info.type === "image") selectImage(el);
    else beginEdit(el);
  }
}
canvasBlocks.addEventListener("pointerup", endPress);
canvasBlocks.addEventListener("pointercancel", endPress);

ratioRow.addEventListener("click", (event) => {
  const button = event.target.closest("[data-ratio]");
  if (!button || button.dataset.ratio === state.ratio) return;
  commitLiveEdit();
  state.ratio = button.dataset.ratio;
  state.positions = {};
  for (const page of state.pages) page.positions = {};
  saveBoard();
  renderChrome();
  renderBlocks();
  renderGrid();
});

templateGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-template]");
  if (!button || button.dataset.template === state.templateId) return;
  commitLiveEdit();
  state.templateId = button.dataset.template;
  state.familyId = templateById(state.templateId).family || state.familyId;
  state.positions = {};
  saveBoard();
  renderChrome();
  renderBlocks();
});

presetRow.addEventListener("click", (event) => {
  const button = event.target.closest("[data-preset]");
  if (!button) return;
  const preset = PRESETS[button.dataset.preset];
  if (!preset) return;
  commitLiveEdit();
  state.preset = button.dataset.preset;
  state.texts = { ...preset };
  saveBoard();
  renderChrome();
  renderBlocks();
});

function pickOtherPreset() {
  const others = PRESET_LIST.filter((item) => PRESETS[item.id].title !== state.texts.title);
  const pool = others.length ? others : PRESET_LIST.filter((item) => item.id !== state.preset);
  const list = pool.length ? pool : PRESET_LIST;
  return list[Math.floor(Math.random() * list.length)].id;
}

function drawLayout() {
  const started = performance.now();
  commitLiveEdit();
  if (state.locks.layout) {
    layoutStatus.textContent = "布局已锁定。抽版式先不动。";
    applyDrawButton();
    return;
  }
  commitPage();
  let pageNote = "多页锁定，只动这一页";
  if (!state.locks.pages) {
    if (state.pages.length < MAX_PAGES) {
      state.pages.push(capturePage());
      state.pageIndex = state.pages.length - 1;
      applyPage(state.pages[state.pageIndex]);
      pageNote = `新加第 ${state.pageIndex + 1} 页`;
    } else {
      pageNote = "已有 4 页，重抽这一页";
    }
  }
  const familyPool = templatesInFamily(state.familyId).map((item) => item.id);
  const others = familyPool.filter((id) => id !== state.templateId);
  const pool = others.length ? others : familyPool;
  const next = pool[Math.floor(Math.random() * pool.length)];
  state.templateId = next;
  state.positions = {};
  let copyNote = "文案留着";
  if (!state.locks.copy) {
    const presetId = pickOtherPreset();
    state.preset = presetId;
    state.texts = { ...PRESETS[presetId] };
    copyNote = `文案换成${PRESET_LIST.find((item) => item.id === presetId).label}`;
  }
  let imageNote = "图片留着";
  const imageSlots = slotsFor(next, state.ratio).filter((slot) => slot.type === "image");
  if (!state.locks.image && state.images.length > 1) {
    state.imagePick = (state.imagePick + 1) % state.images.length;
    imageNote = imageSlots.length > 1
      ? `图片从第 ${state.imagePick + 1} 张排开，各槽不共用`
      : `图片换成第 ${state.imagePick + 1} 张`;
  } else if (!state.locks.image) {
    imageNote = "单图未锁，仍是这一张";
  }
  saveBoard();
  renderChrome();
  renderBlocks();
  renderGrid();
  const elapsed = Math.max(1, Math.round(performance.now() - started));
  const familyLabel = FAMILIES.find((item) => item.id === state.familyId)?.label || "";
  layoutStatus.textContent = `已抽到 ${familyLabel} · ${templateById(next).label} · ${state.ratio} · ${pageNote} · ${copyNote} · ${imageNote} · 用时 ${elapsed} 毫秒`;
}

familyRow.addEventListener("click", (event) => {
  const button = event.target.closest("[data-family]");
  if (!button || button.dataset.family === state.familyId) return;
  state.familyId = button.dataset.family;
  saveBoard();
  renderChrome();
  const family = FAMILIES.find((item) => item.id === state.familyId);
  const onCanvas = templateById(state.templateId).family === state.familyId;
  layoutStatus.textContent = onCanvas
    ? `当前族 ${family.label}。抽版式只在这一族里换。`
    : `已筛到${family.label}。抽版式会换成这一族。画布上的字还在。`;
});

drawLayoutButton.addEventListener("click", drawLayout);

lockGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-lock]");
  if (!button) return;
  const key = button.dataset.lock;
  if (!Object.prototype.hasOwnProperty.call(state.locks, key)) return;
  state.locks[key] = !state.locks[key];
  saveBoard();
  syncLocks();
  if (key === "pages") {
    layoutStatus.textContent = state.locks.pages
      ? "多页已锁定。抽版式只改当前页。"
      : "多页已解锁。抽版式会在后面加一页，最多 4 页。满了就重抽当前页。";
    return;
  }
  if (key === "layout") {
    layoutStatus.textContent = state.locks.layout
      ? "布局已锁定。抽版式先不动。"
      : "布局已解锁。可以抽版式。";
    return;
  }
  if (key === "copy") {
    layoutStatus.textContent = state.locks.copy
      ? "文案已锁定。抽版式会留下现在的字。"
      : "文案已解锁。抽版式会换成另一套预置文案。";
    return;
  }
  layoutStatus.textContent = state.locks.image
    ? "单图已锁定。换布局时仍用这一张。"
    : "单图已解锁。有多张图时，抽版式会换下一张。";
});

styleFold.addEventListener("click", () => {
  const open = styleFold.getAttribute("aria-expanded") !== "true";
  styleFold.setAttribute("aria-expanded", open ? "true" : "false");
  styleList.hidden = !open;
  styleFold.textContent = open ? "收起风格" : "展开 5 套风格";
});

styleList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-style]");
  if (!button || button.dataset.style === state.styleId) return;
  const style = styleById(button.dataset.style);
  commitLiveEdit();
  state.styleId = style.id;
  state.size = style.size;
  state.align = style.align;
  saveBoard();
  renderChrome();
  layoutStatus.textContent = `已换成${style.label}。字还在。`;
});

sizeRow.addEventListener("click", (event) => {
  const button = event.target.closest("[data-size]");
  if (!button || button.dataset.size === state.size) return;
  state.size = button.dataset.size;
  saveBoard();
  renderChrome();
  layoutStatus.textContent = `字号档已改成${SIZE_IDS.find((item) => item.id === state.size).label}。字还在。`;
});

alignRow.addEventListener("click", (event) => {
  const button = event.target.closest("[data-align]");
  if (!button || button.dataset.align === state.align) return;
  state.align = button.dataset.align;
  saveBoard();
  renderChrome();
  layoutStatus.textContent = state.align === "center" ? "已改成居中。字还在。" : "已改成左对齐。字还在。";
});

function measureImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("读不出图片尺寸"));
    img.src = url;
  });
}

function applyMatchedLayout(width, height) {
  const nextRatio = closestCanvasRatio(width, height);
  const current = templateById(state.templateId);
  const nextTemplate = current.group === "image"
    ? state.templateId
    : closestImageTemplate(width, height, nextRatio);
  if (nextRatio !== state.ratio) {
    for (const page of state.pages) page.positions = {};
  }
  if (nextRatio !== state.ratio || nextTemplate !== state.templateId) {
    state.positions = {};
  }
  state.ratio = nextRatio;
  state.templateId = nextTemplate;
  state.familyId = templateById(nextTemplate).family || state.familyId;
  saveBoard();
  renderChrome();
  renderBlocks();
  renderGrid();
  layoutStatus.textContent = `已按图片换成 ${templateById(state.templateId).label} · ${state.ratio}`;
}

let imageLoadToken = 0;

uploadImageButton.addEventListener("click", () => {
  imageFiles.value = "";
  imageFiles.click();
});

imageFiles.addEventListener("change", async () => {
  const token = ++imageLoadToken;
  for (const url of state.images.map((item) => item.url)) URL.revokeObjectURL(url);
  state.images = [];
  state.imagePick = 0;
  const files = [...(imageFiles.files || [])].slice(0, 6);
  for (const file of files) {
    state.images.push({ name: file.name, url: URL.createObjectURL(file) });
  }
  imageList.innerHTML = state.images.map((item) => `<li>${escapeHtml(item.name)}</li>`).join("");
  layoutError.hidden = true;
  if (!state.images[0]) {
    renderBlocks();
    return;
  }
  try {
    const size = await measureImage(state.images[0].url);
    if (token !== imageLoadToken) return;
    applyMatchedLayout(size.width, size.height);
  } catch {
    if (token !== imageLoadToken) return;
    const current = templateById(state.templateId);
    if (current.group !== "image") {
      state.templateId = "c";
      state.familyId = "swiss";
      state.positions = {};
    }
    renderChrome();
    renderBlocks();
    layoutError.hidden = false;
    layoutError.textContent = "这张图读不出尺寸，已放进图槽。";
  }
});

guideToggle.addEventListener("change", () => {
  state.guides = guideToggle.checked;
  rememberGuides();
  applyGuides();
});

function renderGrid() {
  const n = clampGridN(state.gridN);
  const ratio = RATIOS[state.ratio];
  const m = gridRows(n, ratio.w, ratio.h);
  const lines = [];
  for (let i = 0; i <= n; i += 1) {
    lines.push(`<span class="grid-v" style="left:${(i / n) * 100}%"></span>`);
  }
  for (let j = 0; j <= m; j += 1) {
    lines.push(`<span class="grid-h" style="top:${(j / m) * 100}%"></span>`);
  }
  canvasGrid.innerHTML = lines.join("");
  gridNInput.value = String(n);
  gridNValue.textContent = String(n);
}

gridNInput.addEventListener("input", () => {
  state.gridN = clampGridN(gridNInput.value);
  // 调 N：只更新网格线；已放置块下次拖动再按新网格吸附（不瞬间重吸，避免跳动）
  renderGrid();
});

function showPage(index) {
  if (index < 0 || index >= state.pages.length || index === state.pageIndex) return;
  commitLiveEdit();
  commitPage();
  state.pageIndex = index;
  applyPage(state.pages[index]);
  saveBoard();
  renderChrome();
  renderBlocks();
  renderGrid();
  layoutStatus.textContent = `第 ${index + 1} 页 · ${templateById(state.templateId).label}`;
}

pagePrev.addEventListener("click", () => showPage(state.pageIndex - 1));
pageNext.addEventListener("click", () => showPage(state.pageIndex + 1));
pageDots.addEventListener("click", (event) => {
  const button = event.target.closest("[data-page]");
  if (!button) return;
  showPage(Number(button.dataset.page));
});

const EXPORT_PX = {
  "3:4": [1080, 1440],
  "9:16": [1080, 1920],
  "1:1": [1080, 1080],
  "4:3": [1440, 1080],
  "16:9": [1920, 1080],
  "2:1": [1920, 960],
};

function linesFromBlock(block) {
  const lines = [];
  let line = "";
  let lastTop = null;
  const range = document.createRange();
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    for (let i = 0; i < node.textContent.length; i += 1) {
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const rect = range.getClientRects()[0];
      const ch = node.textContent[i];
      if (rect && lastTop != null && rect.top > lastTop + 1) {
        lines.push(line);
        line = "";
      }
      line += ch;
      if (rect) lastTop = rect.top;
    }
    node = walker.nextNode();
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function cssPx(value, fallback) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

const PAGE_GAP = 48;

function measureVisiblePage() {
  const canvasRect = canvas.getBoundingClientRect();
  const poster = getComputedStyle(canvas);
  const blocks = [...canvasBlocks.querySelectorAll(".block")].map((el) => {
    const cs = getComputedStyle(el);
    return {
      id: el.dataset.id,
      type: el.dataset.type,
      lines: el.dataset.type === "image" ? [] : linesFromBlock(el),
      fontSize: cssPx(cs.fontSize, 16),
      lineHeight: cssPx(cs.lineHeight, cssPx(cs.fontSize, 16) * 1.2),
      fontWeight: cs.fontWeight,
      letterSpacing: cs.letterSpacing,
      color: cs.color,
      textAlign: cs.textAlign,
      paddingLeft: cssPx(cs.paddingLeft, 8),
      paddingTop: cssPx(cs.paddingTop, 6),
    };
  });
  return {
    canvasWidth: canvasRect.width || 1,
    bg: poster.getPropertyValue("--poster-bg").trim() || "#f7f6f2",
    ink: poster.getPropertyValue("--poster-ink").trim() || "#1c1c1c",
    blocks,
    templateId: state.templateId,
    positions: copyPositions(state.positions),
    imagePick: state.imagePick,
  };
}

function withEachPage(read) {
  commitLiveEdit();
  commitPage();
  const origin = state.pageIndex;
  const shots = [];
  try {
    for (let i = 0; i < state.pages.length; i += 1) {
      state.pageIndex = i;
      applyPage(state.pages[i]);
      renderBlocks();
      canvas.offsetHeight;
      shots.push(read());
    }
  } finally {
    state.pageIndex = origin;
    applyPage(state.pages[origin]);
    renderBlocks();
    renderGrid();
  }
  return shots;
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("图转不成内嵌数据"));
    reader.readAsDataURL(blob);
  });
}

async function embeddedImageHref(img) {
  if (!img?.url) return "";
  if (img.url.startsWith("data:")) return img.url;
  try {
    const blob = await fetch(img.url).then((res) => res.blob());
    return await blobToDataUrl(blob);
  } catch {
    return "";
  }
}

function slotBoxPx(slot, positions, width, height) {
  const pos = positions[slot.id];
  return {
    x: ((pos?.x ?? slot.x) / 100) * width,
    y: ((pos?.y ?? slot.y) / 100) * height,
    w: (slot.w / 100) * width,
    h: (slot.h / 100) * height,
  };
}

async function pageSvgGroup(shot, width, height, pageNo) {
  const scale = width / shot.canvasWidth;
  const slots = slotsFor(shot.templateId, state.ratio);
  const byId = new Map(shot.blocks.map((item) => [item.id, item]));
  const parts = [`<rect id="page-${pageNo}-background" width="${width}" height="${height}" fill="${shot.bg}"/>`];
  const savedPick = state.imagePick;
  state.imagePick = shot.imagePick;
  try {
  for (const slot of slots) {
    const box = slotBoxPx(slot, shot.positions, width, height);
    const clip = `page-${pageNo}-clip-${slot.id}`;
    const measured = byId.get(slot.id);
    parts.push(`<clipPath id="${clip}"><rect x="${box.x.toFixed(1)}" y="${box.y.toFixed(1)}" width="${box.w.toFixed(1)}" height="${box.h.toFixed(1)}"/></clipPath>`);
    if (slot.type === "image") {
      const href = await embeddedImageHref(imageFor(slot));
      const inner = href
        ? `<image href="${xmlEscape(href)}" x="${box.x.toFixed(1)}" y="${box.y.toFixed(1)}" width="${box.w.toFixed(1)}" height="${box.h.toFixed(1)}" preserveAspectRatio="xMidYMid slice"/>`
        : `<line x1="${box.x.toFixed(1)}" y1="${box.y.toFixed(1)}" x2="${(box.x + box.w).toFixed(1)}" y2="${(box.y + box.h).toFixed(1)}" stroke="${shot.ink}" stroke-width="2"/>
           <line x1="${(box.x + box.w).toFixed(1)}" y1="${box.y.toFixed(1)}" x2="${box.x.toFixed(1)}" y2="${(box.y + box.h).toFixed(1)}" stroke="${shot.ink}" stroke-width="2"/>`;
      parts.push(`<g id="page-${pageNo}-slot-${slot.id}" data-type="image">${inner}</g>`);
      continue;
    }
    const size = (measured?.fontSize || 16) * scale;
    const lineH = (measured?.lineHeight || size * 1.2) * scale;
    const padL = (measured?.paddingLeft || 8) * scale;
    const padT = (measured?.paddingTop || 6) * scale;
    const align = measured?.textAlign === "center" ? "middle" : "start";
    const x = align === "middle" ? box.x + box.w / 2 : box.x + padL;
    const y = box.y + padT + size * 0.86;
    const tracking = measured?.letterSpacing && measured.letterSpacing !== "normal"
      ? `${(cssPx(measured.letterSpacing, 0) * scale).toFixed(2)}px`
      : "0px";
    const lines = measured?.lines?.length ? measured.lines : [""];
    const tspans = lines.map((line, index) =>
      `<tspan x="${x.toFixed(1)}" dy="${index === 0 ? 0 : lineH.toFixed(1)}">${xmlEscape(line)}</tspan>`
    ).join("");
    parts.push(`<g id="page-${pageNo}-slot-${slot.id}" data-type="${slot.type}" clip-path="url(#${clip})">
      <text y="${y.toFixed(1)}" fill="${measured?.color || shot.ink}" font-family="Noto Sans SC, sans-serif" font-size="${size.toFixed(1)}" font-weight="${measured?.fontWeight || 400}" letter-spacing="${tracking}" text-anchor="${align}">${tspans}</text>
    </g>`);
  }
  return parts.join("\n");
  } finally {
    state.imagePick = savedPick;
  }
}

// 扩展点：每一页先按画布上的真实换行量好，再纵向拼进一个文件。不导出 PSD。
async function buildAllPagesSvg() {
  const [width, height] = EXPORT_PX[state.ratio] || EXPORT_PX["3:4"];
  const shots = withEachPage(measureVisiblePage);
  const totalH = shots.length * height + Math.max(0, shots.length - 1) * PAGE_GAP;
  const groups = [];
  for (let i = 0; i < shots.length; i += 1) {
    const y = i * (height + PAGE_GAP);
    const inner = await pageSvgGroup(shots[i], width, height, i + 1);
    groups.push(`<g id="page-${i + 1}" transform="translate(0 ${y})">${inner}</g>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${totalH}" viewBox="0 0 ${width} ${totalH}">
  ${groups.join("\n  ")}
</svg>`;
}

function downloadText(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

async function exportSvg() {
  commitLiveEdit();
  try {
    const svg = await buildAllPagesSvg();
    const count = state.pages.length;
    downloadText("yooco-全部页.svg", svg, "image/svg+xml");
    layoutStatus.textContent = `已下载 ${count} 页 SVG。页与页上下相接，一块一个图层。`;
    layoutError.hidden = true;
  } catch {
    layoutError.hidden = false;
    layoutError.textContent = "导出失败。";
  }
}

exportButton.addEventListener("click", exportSvg);
exportButtonBottom.addEventListener("click", exportSvg);

hydratePages();
applyGuides();
applyPoster();
renderChrome();
renderBlocks();
renderGrid();

globalThis.state = state;
globalThis.renderBlocks = renderBlocks;
globalThis.linesFromBlock = linesFromBlock;
globalThis.buildAllPagesSvg = buildAllPagesSvg;
