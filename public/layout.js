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
  gridN: 12,
  source: "",
  images: [], // { url, name }[]
  texts: { ...PRESETS.exhibition },
  fill: null, // 生成结果。预置文案不写这里，也不扣积分。
  positions: {}, // id -> { x, y } 覆盖模板坐标
  guides: loadGuides(),
};

function loadBoard() {
  try {
    const data = JSON.parse(sessionStorage.getItem(BOARD_KEY) || "null");
    if (!data || typeof data.texts !== "object") return null;
    if (!TEMPLATE_IDS.includes(data.templateId) || !RATIO_IDS.includes(data.ratio)) return null;
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
    }));
  } catch {
    // 记不住就只留在这一页。
  }
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
  canvas.dataset.ratio = state.ratio;
  layoutStatus.textContent = `当前 ${templateById(state.templateId).label} · ${state.ratio}`;
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

function imageFor(slot, filled) {
  if (slot.type !== "image") return null;
  if (Number.isInteger(filled?.imageIndex) && state.images[filled.imageIndex]) {
    return state.images[filled.imageIndex];
  }
  return state.images[0] || null;
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
    const filled = state.fill?.slots?.find((item) => item.id === slot.id);
    const isImage = slot.type === "image";
    const img = imageFor(slot, filled);
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

function drawLayout() {
  const started = performance.now();
  commitLiveEdit();
  const pool = TEMPLATE_IDS.filter((id) => id !== state.templateId);
  const next = pool[Math.floor(Math.random() * pool.length)];
  state.templateId = next;
  state.positions = {};
  saveBoard();
  renderChrome();
  renderBlocks();
  renderGrid();
  const elapsed = Math.max(1, Math.round(performance.now() - started));
  layoutStatus.textContent = `已抽到 ${templateById(next).label} · ${state.ratio} · 用时 ${elapsed} 毫秒`;
}

drawLayoutButton.addEventListener("click", drawLayout);

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
renderChrome();
renderBlocks();
renderGrid();

globalThis.state = state;
globalThis.renderBlocks = renderBlocks;
