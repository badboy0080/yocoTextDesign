import { RATIO_IDS, RATIOS, TEMPLATES, slotsFor, templateById } from "./layout-templates.js";
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
};

const copyInput = document.querySelector("#copyInput");
const generateButton = document.querySelector("#generateButton");
const rerollButton = document.querySelector("#rerollButton");
const ratioRow = document.querySelector("#ratioRow");
const templateGrid = document.querySelector("#templateGrid");
const presetRow = document.querySelector("#presetRow");
const canvas = document.querySelector("#canvas");
const canvasBlocks = document.querySelector("#canvasBlocks");
const emptyHint = document.querySelector("#emptyHint");
const layoutStatus = document.querySelector("#layoutStatus");
const layoutError = document.querySelector("#layoutError");
const imageFiles = document.querySelector("#imageFiles");
const imageList = document.querySelector("#imageList");
const trialMeter = document.querySelector("#trialMeter");
const gridNInput = document.querySelector("#gridN");
const gridNValue = document.querySelector("#gridNValue");
const canvasGrid = document.querySelector("#canvasGrid");

function syncGenerateEnabled() {
  const ok = copyInput.value.trim().length > 0;
  generateButton.disabled = !ok;
  rerollButton.disabled = !ok || !state.fill;
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

function renderBlocks() {
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

let drag = null;

function slotBox(id) {
  const slot = slotsFor(state.templateId, state.ratio).find((item) => item.id === id);
  const pos = state.positions[id];
  return { ...slot, x: pos?.x ?? slot.x, y: pos?.y ?? slot.y };
}

canvasBlocks.addEventListener("pointerdown", (event) => {
  const block = event.target.closest(".block");
  if (!block || !state.fill) return; // 生成前不拖。预置字只是先摆上，不算生成结果。
  const id = block.dataset.id;
  const box = slotBox(id);
  const rect = canvas.getBoundingClientRect();
  drag = {
    id,
    pointerId: event.pointerId,
    offsetX: ((event.clientX - rect.left) / rect.width) * 100 - box.x,
    offsetY: ((event.clientY - rect.top) / rect.height) * 100 - box.y,
    w: box.w,
    h: box.h,
  };
  block.classList.add("is-dragging");
  block.setPointerCapture(event.pointerId);
});

canvasBlocks.addEventListener("pointermove", (event) => {
  if (!drag || event.pointerId !== drag.pointerId) return;
  const rect = canvas.getBoundingClientRect();
  let x = ((event.clientX - rect.left) / rect.width) * 100 - drag.offsetX;
  let y = ((event.clientY - rect.top) / rect.height) * 100 - drag.offsetY;
  const n = clampGridN(state.gridN);
  const ratio = RATIOS[state.ratio];
  const m = gridRows(n, ratio.w, ratio.h);
  const snapped = snapToGrid(x, y, n, m);
  const clamped = clampBlock(snapped.x, snapped.y, drag.w, drag.h);
  state.positions[drag.id] = { x: clamped.x, y: clamped.y };
  const el = canvasBlocks.querySelector(`[data-id="${drag.id}"]`);
  if (el) {
    el.style.left = `${clamped.x}%`;
    el.style.top = `${clamped.y}%`;
  }
});

function endDrag(event) {
  if (!drag || event.pointerId !== drag.pointerId) return;
  const el = canvasBlocks.querySelector(`[data-id="${drag.id}"]`);
  el?.classList.remove("is-dragging");
  drag = null;
}
canvasBlocks.addEventListener("pointerup", endDrag);
canvasBlocks.addEventListener("pointercancel", endDrag);

ratioRow.addEventListener("click", (event) => {
  const button = event.target.closest("[data-ratio]");
  if (!button || button.dataset.ratio === state.ratio) return;
  state.ratio = button.dataset.ratio;
  state.positions = {};
  renderChrome();
  renderBlocks();
  renderGrid();
});

templateGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-template]");
  if (!button || button.dataset.template === state.templateId) return;
  state.templateId = button.dataset.template;
  state.positions = {};
  syncGenerateEnabled();
  renderChrome();
  renderBlocks();
});

presetRow.addEventListener("click", (event) => {
  const button = event.target.closest("[data-preset]");
  if (!button || filling) return;
  const preset = PRESETS[button.dataset.preset];
  if (!preset) return;
  state.preset = button.dataset.preset;
  state.texts = { ...preset };
  renderChrome();
  renderBlocks();
});

copyInput.addEventListener("input", () => {
  layoutError.hidden = true;
  syncGenerateEnabled();
});

imageFiles.addEventListener("change", () => {
  for (const url of state.images.map((item) => item.url)) URL.revokeObjectURL(url);
  state.images = [];
  const files = [...(imageFiles.files || [])].slice(0, 6);
  for (const file of files) {
    state.images.push({ name: file.name, url: URL.createObjectURL(file) });
  }
  imageList.innerHTML = state.images.map((item) => `<li>${escapeHtml(item.name)}</li>`).join("");
  renderBlocks();
});

function updateCredits(credits) {
  if (!credits || !trialMeter) return;
  trialMeter.hidden = false;
  if (credits.unlimited) {
    trialMeter.textContent = "不限积分";
    trialMeter.classList.remove("is-empty");
    return;
  }
  const remaining = credits.remaining ?? 0;
  trialMeter.textContent = remaining <= 0 ? "积分已用完" : `剩余 ${remaining} 积分`;
  trialMeter.classList.toggle("is-empty", remaining <= 0);
}

let filling = false;

async function requestFill({ reroll }) {
  if (filling || !copyInput.value.trim()) return;
  if (reroll && !state.fill) return;
  filling = true;
  layoutError.hidden = true;
  layoutError.textContent = "";
  const slots = slotsFor(state.templateId, state.ratio).map(({ id, type }) => ({ id, type }));
  const payload = {
    source: copyInput.value.trim(),
    imageCount: state.images.length,
    ratio: state.ratio,
    templateId: state.templateId,
    slots,
  };
  if (reroll) payload.seed = Date.now() % 100000;
  state.source = payload.source;
  generateButton.disabled = true;
  rerollButton.disabled = true;
  layoutStatus.textContent = reroll ? "换槽重排中…" : "生成排版中…";
  try {
    const response = await fetch("/api/layout-fill", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await response.json().catch(() => null);
    if (!response.ok || !json?.ok) {
      throw new Error(json?.error?.message || "排版失败，再试一次");
    }
    state.fill = json.data;
    state.preset = null;
    for (const item of json.data?.slots || []) {
      if (item.type !== "image") state.texts[item.id] = String(item.text || "");
    }
    // 换槽重排：直接覆盖拖动结果，不弹确认。生成成功同样回到模板槽位。
    state.positions = {};
    updateCredits(json.credits || json.trial?.credits);
    renderChrome();
    renderBlocks();
    renderGrid();
    layoutStatus.textContent = reroll ? "已换槽重排" : "已生成排版";
  } catch (error) {
    const message = error instanceof TypeError || error instanceof SyntaxError
      ? "排版失败，再试一次"
      : (error?.message || "排版失败，再试一次");
    layoutError.hidden = false;
    layoutError.textContent = message;
    layoutStatus.textContent = "";
  } finally {
    filling = false;
    syncGenerateEnabled();
  }
}

generateButton.addEventListener("click", () => requestFill({ reroll: false }));
rerollButton.addEventListener("click", () => requestFill({ reroll: true }));

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

renderChrome();
renderBlocks();
renderGrid();
syncGenerateEnabled();

globalThis.state = state;
globalThis.renderBlocks = renderBlocks;
