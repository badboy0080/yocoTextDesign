import { RATIO_IDS, RATIOS, TEMPLATE_IDS, TEMPLATES, slotsFor, templateById, closestCanvasRatio, closestImageTemplate } from "./layout-templates.js";
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
  // 抽版式时：锁住的项不动。文案和单图默认锁住，这样和以前一样留下当前字和图。
  // TODO(P2): locks.pages 只给界面记住锁定或解锁。多页分页还没做，不要在这里加翻页。
  locks: { copy: true, layout: false, image: true, pages: false },
};

function styleById(id) {
  return STYLES.find((item) => item.id === id) || STYLES[0];
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
  try {
    sessionStorage.setItem(BOARD_KEY, JSON.stringify({
      ratio: state.ratio,
      templateId: state.templateId,
      preset: state.preset,
      texts: state.texts,
      styleId: state.styleId,
      size: state.size,
      align: state.align,
      locks: state.locks,
    }));
  } catch {
    // 记不住就只留在这一页。
  }
}

function applyPoster() {
  const style = styleById(state.styleId);
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

function renderChrome() {
  ratioRow.innerHTML = RATIO_IDS.map((id) =>
    `<button type="button" role="radio" aria-checked="${state.ratio === id}" data-ratio="${id}">${id}</button>`
  ).join("");
  templateGrid.innerHTML = TEMPLATE_GROUPS.map((group) => {
    const buttons = TEMPLATES.filter((item) => item.group === group.id).map((item) =>
      `<button type="button" role="option" aria-selected="${state.templateId === item.id}" data-template="${item.id}">
        <strong>${item.label}</strong><span class="blurb">${item.blurb}</span>
      </button>`
    ).join("");
    return `<div class="template-group" role="group" aria-label="${group.label}">
      <p class="template-group-label">${group.label}</p>
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
  const layoutNote = state.locks.layout ? "布局已锁定 · " : "";
  layoutStatus.textContent = `${layoutNote}当前 ${templateById(state.templateId).label} · ${state.ratio}`;
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
  if (slot.type !== "image" || !state.images.length) return null;
  const index = Math.min(Math.max(0, state.imagePick), state.images.length - 1);
  return state.images[index];
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
  const pool = TEMPLATE_IDS.filter((id) => id !== state.templateId);
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
  if (!state.locks.image && state.images.length > 1) {
    state.imagePick = (state.imagePick + 1) % state.images.length;
    imageNote = `图片换成第 ${state.imagePick + 1} 张`;
  } else if (!state.locks.image) {
    imageNote = "单图未锁，仍是这一张";
  }
  saveBoard();
  renderChrome();
  renderBlocks();
  renderGrid();
  const elapsed = Math.max(1, Math.round(performance.now() - started));
  layoutStatus.textContent = `已抽到 ${templateById(next).label} · ${state.ratio} · ${copyNote} · ${imageNote} · 用时 ${elapsed} 毫秒`;
}

drawLayoutButton.addEventListener("click", drawLayout);

lockGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-lock]");
  if (!button) return;
  const key = button.dataset.lock;
  if (!Object.prototype.hasOwnProperty.call(state.locks, key)) return;
  state.locks[key] = !state.locks[key];
  saveBoard();
  syncLocks();
  // TODO(P2): 多页只切换这句话和开关。不要在这里生成第二页。
  if (key === "pages") {
    layoutStatus.textContent = state.locks.pages
      ? "多页已锁定。分页还没做，不会翻页。"
      : "多页已解锁。分页还没做，不会翻页。";
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
  if (nextRatio !== state.ratio || nextTemplate !== state.templateId) {
    state.positions = {};
  }
  state.ratio = nextRatio;
  state.templateId = nextTemplate;
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

applyGuides();
applyPoster();
renderChrome();
renderBlocks();
renderGrid();

globalThis.state = state;
globalThis.renderBlocks = renderBlocks;
